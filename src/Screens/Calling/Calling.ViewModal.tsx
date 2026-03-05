import { useEffect, useRef, useState, useCallback } from "react";
import { Alert } from "react-native";
import {
    RTCPeerConnection,
    mediaDevices,
    RTCSessionDescription,
    RTCIceCandidate,
} from "react-native-webrtc";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import InCallManager from "react-native-incall-manager";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CallLeg = {
    callId: string;
    callDocRef: any;
    pc: any;
    remoteStream: any;
    otherUser: { uid: string; name: string; profileImage?: string } | null;
    status: "calling" | "accepted" | "onhold" | "ended";
    isRemoteDescSet: boolean;
    hasCreatedOffer: boolean;
    hasCreatedAnswer: boolean;
    pendingCandidates: any[];
    unsubDoc: (() => void) | null;
    unsubIce: (() => void) | null;
    isCaller: boolean;
};

export type MergeState = "none" | "second_calling" | "merged";

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useCallingViewModal = ({ route, navigation }: any) => {
    const { callId, isCaller, chatRoomId, chatMessageId } = route.params;

    // ── Refs shared ───────────────────────────────────────────────────────────
    const localStreamRef = useRef<any>(null);
    const timerRef = useRef<any>(null);
    const durationRef = useRef(0);
    const ringingStarted = useRef(false);
    const isAcceptedRef = useRef(false);
    const chatRoomIdRef = useRef<string | null>(chatRoomId ?? null);
    const chatMessageIdRef = useRef<string | null>(chatMessageId ?? null);

    // Two call legs: index 0 = original, index 1 = second (added) call
    const legsRef = useRef<Map<string, CallLeg>>(new Map());

    // ── State ─────────────────────────────────────────────────────────────────
    const [localStream, setLocalStream] = useState<any>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [mergeState, setMergeState] = useState<MergeState>("none");
    const [isAddingCall, setIsAddingCall] = useState(false);

    // Reactive snapshots of leg data for UI
    const [primaryLeg, setPrimaryLeg] = useState<CallLeg | null>(null);
    const [secondLeg, setSecondLeg] = useState<CallLeg | null>(null);

    // =========================================================================
    // Helpers
    // =========================================================================
    const myUid = () => auth().currentUser?.uid ?? "";

    const formatDuration = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    const iceServers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
    ];

    /** Sync a leg's mutable fields back into React state */
    const syncLegs = () => {
        const all = Array.from(legsRef.current.values());
        setPrimaryLeg(all[0] ?? null);
        setSecondLeg(all[1] ?? null);
    };

    // =========================================================================
    // Local Media
    // =========================================================================
    const setupLocalStream = async (): Promise<any> => {
        if (localStreamRef.current) return localStreamRef.current;
        try {
            const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch {
            Alert.alert("Permission", "Please allow microphone access to talk.");
            return null;
        }
    };

    const addLocalTracksToPeer = (pc: any) => {
        if (!localStreamRef.current) return;
        localStreamRef.current.getTracks().forEach((track: any) => {
            pc.addTrack(track, localStreamRef.current);
        });
    };

    // =========================================================================
    // Hold / Unhold a leg
    // Mutes all audio tracks on that leg's PC so the remote hears silence.
    // =========================================================================
    const holdLeg = (legCallId: string) => {
        const leg = legsRef.current.get(legCallId);
        if (!leg) return;
        // Pause sending audio to the held peer
        leg.pc?.getSenders?.()?.forEach((sender: any) => {
            if (sender.track?.kind === "audio") sender.track.enabled = false;
        });
        leg.status = "onhold";
        // Update Firestore so the other side can show "on hold"
        leg.callDocRef?.update({ status: "onhold" }).catch(() => { });
        syncLegs();
    };

    const unholdLeg = (legCallId: string) => {
        const leg = legsRef.current.get(legCallId);
        if (!leg) return;
        leg.pc?.getSenders?.()?.forEach((sender: any) => {
            if (sender.track?.kind === "audio") sender.track.enabled = true;
        });
        leg.status = "accepted";
        leg.callDocRef?.update({ status: "accepted" }).catch(() => { });
        syncLegs();
    };

    // =========================================================================
    // Create a Peer Connection for a leg
    // =========================================================================
    const createPCForLeg = (leg: CallLeg) => {
        const pc = new RTCPeerConnection({ iceServers }) as any;
        leg.pc = pc;

        const iceColl = leg.isCaller ? "caller_candidates" : "receiver_candidates";

        pc.onicecandidate = (event: any) => {
            if (!event.candidate) return;
            leg.callDocRef.collection(iceColl)
                .add(event.candidate.toJSON())
                .catch(() => { });
        };

        pc.ontrack = (event: any) => {
            if (event.streams?.[0]) {
                leg.remoteStream = event.streams[0];
                syncLegs();
            }
        };

        pc.onconnectionstatechange = () => {
            const s = pc.connectionState;
            if (s === "connected") startTimer();
            if (["failed", "closed", "disconnected"].includes(s)) {
                // If this is the only active leg → end everything
                const activeLeg = Array.from(legsRef.current.values())
                    .find(l => l.callId !== leg.callId && l.status !== "ended");
                if (!activeLeg) {
                    handleCleanup();
                    navigation.goBack();
                } else {
                    // Just remove this leg
                    teardownLeg(leg.callId, false);
                }
            }
        };

        pc.oniceconnectionstatechange = () => {
            const s = pc.iceConnectionState;
            if (s === "connected" || s === "completed") startTimer();
        };

        return pc;
    };

    // =========================================================================
    // Flush pending ICE candidates for a leg
    // =========================================================================
    const flushLeg = (leg: CallLeg) => {
        if (!leg.pendingCandidates.length) return;
        leg.pendingCandidates.forEach(c =>
            leg.pc?.addIceCandidate(c).catch(() => { })
        );
        leg.pendingCandidates = [];
    };

    // =========================================================================
    // Attach Firestore ICE listener for a leg
    // =========================================================================
    const attachIceListener = (leg: CallLeg): (() => void) => {
        const watchColl = leg.isCaller ? "receiver_candidates" : "caller_candidates";
        return leg.callDocRef.collection(watchColl).onSnapshot((snap: any) => {
            snap.docChanges().forEach((change: any) => {
                if (change.type !== "added") return;
                const candidate = new RTCIceCandidate(change.doc.data());
                if (leg.isRemoteDescSet) {
                    leg.pc?.addIceCandidate(candidate).catch(() => { });
                } else {
                    leg.pendingCandidates.push(candidate);
                }
            });
        });
    };

    // =========================================================================
    // Bootstrap a new call leg and attach its Firestore snapshot listener
    // =========================================================================
    const bootstrapLeg = (
        legCallId: string,
        legIsCaller: boolean,
        isSecondLeg = false,
    ): CallLeg => {
        const callDocRef = firestore().collection("calls").doc(legCallId);

        const leg: CallLeg = {
            callId: legCallId,
            callDocRef,
            pc: null,
            remoteStream: null,
            otherUser: null,
            status: "calling",
            isRemoteDescSet: false,
            hasCreatedOffer: false,
            hasCreatedAnswer: false,
            pendingCandidates: [],
            unsubDoc: null,
            unsubIce: null,
            isCaller: legIsCaller,
        };

        legsRef.current.set(legCallId, leg);
        createPCForLeg(leg);

        // ── CALLER: create offer ──────────────────────────────────────────────
        if (legIsCaller && !leg.hasCreatedOffer) {
            leg.hasCreatedOffer = true;
            (async () => {
                await setupLocalStream();
                addLocalTracksToPeer(leg.pc);
                const offer = await leg.pc.createOffer();
                await leg.pc.setLocalDescription(offer);
                await callDocRef.update({ offer, status: "calling" });
                syncLegs();
            })();
        }

        // ── Firestore doc listener ────────────────────────────────────────────
        leg.unsubDoc = callDocRef.onSnapshot(async (doc: any) => {
            const data = doc.data();
            if (!data) return;

            const currentLeg = legsRef.current.get(legCallId);
            if (!currentLeg) return;

            // Cache chat metadata from first leg
            if (!isSecondLeg) {
                if (data.chatRoomId) chatRoomIdRef.current = data.chatRoomId;
                if (data.chatMessageId) chatMessageIdRef.current = data.chatMessageId;
            }

            // Fetch other user info once
            if (!currentLeg.otherUser) {
                const otherUid = legIsCaller ? data.receiverId : data.callerId;
                if (otherUid) {
                    firestore().collection("users").doc(otherUid).get().then(d => {
                        const u = d.data();
                        if (u && legsRef.current.has(legCallId)) {
                            legsRef.current.get(legCallId)!.otherUser = {
                                uid: otherUid,
                                name: u.name ?? "Unknown",
                                profileImage: u.profileImage,
                            };
                            syncLegs();
                        }
                    });
                }
            }

            if (data.status === "ended") {
                const remaining = Array.from(legsRef.current.values())
                    .filter(l => l.callId !== legCallId && l.status !== "ended");
                teardownLeg(legCallId, false);
                if (!remaining.length) {
                    handleCleanup();
                    navigation.goBack();
                }
                return;
            }

            if (data.status === "accepted" && !isSecondLeg && !isAcceptedRef.current) {
                isAcceptedRef.current = true;
                if (legIsCaller) callDocRef.update({ isAccepted: true }).catch(() => { });
            }

            currentLeg.status = data.status;
            syncLegs();

            // ── Ringing ───────────────────────────────────────────────────────
            const me = myUid();
            const amCaller = data.callerId === me;
            if (data.status === "calling") {
                if (!ringingStarted.current) {
                    ringingStarted.current = true;
                    if (!amCaller) InCallManager?.startRingtone("_BUNDLE_", 0, "", 30);
                }
            } else {
                InCallManager?.stopRingback();
                InCallManager?.stopRingtone();
                ringingStarted.current = false;
            }

            // ── SDP: Caller sets remote answer ────────────────────────────────
            if (
                legIsCaller &&
                data.answer &&
                !currentLeg.isRemoteDescSet &&
                currentLeg.pc?.signalingState === "have-local-offer"
            ) {
                try {
                    await currentLeg.pc.setRemoteDescription(
                        new RTCSessionDescription(data.answer)
                    );
                    currentLeg.isRemoteDescSet = true;
                    flushLeg(currentLeg);
                } catch (e) { console.error(`[Leg ${legCallId}] answer error:`, e); }
            }

            // ── SDP: Receiver processes offer ─────────────────────────────────
            if (
                !legIsCaller &&
                data.offer &&
                data.status === "accepted" &&
                !currentLeg.isRemoteDescSet &&
                !currentLeg.hasCreatedAnswer
            ) {
                currentLeg.hasCreatedAnswer = true;
                try {
                    await currentLeg.pc.setRemoteDescription(
                        new RTCSessionDescription(data.offer)
                    );
                    currentLeg.isRemoteDescSet = true;
                    flushLeg(currentLeg);
                    await setupLocalStream();
                    addLocalTracksToPeer(currentLeg.pc);
                    const answer = await currentLeg.pc.createAnswer();
                    await currentLeg.pc.setLocalDescription(answer);
                    await callDocRef.update({ answer });
                } catch (e) {
                    console.error(`[Leg ${legCallId}] offer error:`, e);
                    currentLeg.hasCreatedAnswer = false;
                }
            }
        });

        // ── ICE listener ──────────────────────────────────────────────────────
        leg.unsubIce = attachIceListener(leg);

        syncLegs();
        return leg;
    };

    // =========================================================================
    // Teardown a single leg (without ending the whole call)
    // =========================================================================
    const teardownLeg = (legCallId: string, updateFirestore = true) => {
        const leg = legsRef.current.get(legCallId);
        if (!leg) return;
        leg.unsubDoc?.();
        leg.unsubIce?.();
        try { leg.pc?.close(); } catch { }
        if (updateFirestore) {
            leg.callDocRef.update({ status: "ended" }).catch(() => { });
        }
        leg.status = "ended";
        legsRef.current.delete(legCallId);
        syncLegs();
    };

    // =========================================================================
    // Timer
    // =========================================================================
    const startTimer = () => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => {
            setCallDuration(prev => {
                durationRef.current = prev + 1;
                return prev + 1;
            });
        }, 1000);
        try {
            InCallManager?.setForceSpeakerphoneOn(false);
            InCallManager?.start({ media: "audio" });
            InCallManager?.setKeepScreenOn(true);
        } catch { }
    };

    // =========================================================================
    // Full Cleanup
    // =========================================================================
    const handleCleanup = async () => {
        try {
            InCallManager?.stopRingback();
            InCallManager?.stopRingtone();
            InCallManager?.stop();
            ringingStarted.current = false;
        } catch { }

        if (chatRoomIdRef.current && chatMessageIdRef.current) {
            const statusText = isAcceptedRef.current
                ? `📞 Voice call (${formatDuration(durationRef.current)})`
                : "📞 Missed voice call";
            firestore()
                .collection("chatRooms").doc(chatRoomIdRef.current)
                .collection("messages").doc(chatMessageIdRef.current)
                .update({ text: statusText })
                .catch(() => { });
        }

        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

        legsRef.current.forEach(leg => {
            leg.unsubDoc?.();
            leg.unsubIce?.();
            try { leg.pc?.close(); } catch { }
        });
        legsRef.current.clear();

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t: any) => t.stop());
            localStreamRef.current = null;
        }

        setLocalStream(null);
        setPrimaryLeg(null);
        setSecondLeg(null);
        setMergeState("none");
    };

    // =========================================================================
    // Mount — bootstrap the first (primary) call leg
    // =========================================================================
    useEffect(() => {
        if (!callId) return;
        bootstrapLeg(callId, isCaller, false);

        let timeoutId: any;
        if (isCaller) {
            timeoutId = setTimeout(() => {
                if (!isAcceptedRef.current) endCall();
            }, 60000);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            handleCleanup();
        };
    }, []);

    // =========================================================================
    // Add Second Call
    // Called when user taps "Add" during an active call.
    //
    // Flow:
    //   1. Put the active leg on hold
    //   2. Create a brand new call document (same as ChattingScreen does)
    //   3. Bootstrap a second leg with that new callId
    //   4. The target receives a totally normal incoming call
    // =========================================================================
    const addSecondCall = useCallback(async (targetUser: any) => {
        if (isAddingCall) return;
        const me = myUid();
        if (!me) return;

        setIsAddingCall(true);
        try {
            // ── 1. Hold the first leg ────────────────────────────────────────
            const firstLeg = Array.from(legsRef.current.values())[0];
            if (firstLeg && firstLeg.status === "accepted") {
                holdLeg(firstLeg.callId);
            }

            // ── 2. Create a new call document ────────────────────────────────
            const newCallRef = firestore().collection("calls").doc();
            const newCallId = newCallRef.id;

            await newCallRef.set({
                callerId: me,
                receiverId: targetUser.id,
                status: "calling",
                type: "audio",
                createdAt: firestore.FieldValue.serverTimestamp(),
                // Link to the same chat room so history still updates
                chatRoomId: chatRoomIdRef.current,
                chatMessageId: chatMessageIdRef.current,
            });

            // ── 3. Bootstrap the second leg ──────────────────────────────────
            bootstrapLeg(newCallId, true /* we are caller */, true);
            setMergeState("second_calling");

            // ── 4. 45s timeout if second call not answered ───────────────────
            setTimeout(() => {
                const leg = legsRef.current.get(newCallId);
                if (leg && leg.status === "calling") {
                    // Abandon second call, resume first
                    teardownLeg(newCallId, true);
                    setMergeState("none");
                    if (firstLeg) unholdLeg(firstLeg.callId);
                }
            }, 45000);

        } catch (e) {
            console.error("addSecondCall error:", e);
            Alert.alert("Error", "Could not place second call.");
        } finally {
            setIsAddingCall(false);
        }
    }, [isAddingCall]);

    // =========================================================================
    // Merge Calls
    // Both legs are already connected. We simply unhold both — each peer
    // connection is independent, so all three parties hear each other because
    // this device is the bridge: audio from Leg A goes out on Leg B and vice
    // versa by re-routing the tracks.
    // =========================================================================
    const mergeCalls = useCallback(async () => {
        const legs = Array.from(legsRef.current.values());
        if (legs.length < 2) return;

        const [legA, legB] = legs;
        if (legA.status === "onhold") unholdLeg(legA.callId);
        if (legB.status === "onhold") unholdLeg(legB.callId);

        // Cross-route audio: send legB's remote audio into legA's PC senders
        // and vice versa so the two remote peers hear each other via this device.
        try {
            const streamA = legA.remoteStream;
            const streamB = legB.remoteStream;

            if (streamA && streamB) {
                // Replace legA's outbound track with legB's incoming audio
                const trackB = streamB.getAudioTracks()[0];
                legA.pc?.getSenders?.()?.forEach((sender: any) => {
                    if (sender.track?.kind === "audio" && trackB) {
                        sender.replaceTrack(trackB).catch(() => { });
                    }
                });

                // Replace legB's outbound track with legA's incoming audio
                const trackA = streamA.getAudioTracks()[0];
                legB.pc?.getSenders?.()?.forEach((sender: any) => {
                    if (sender.track?.kind === "audio" && trackA) {
                        sender.replaceTrack(trackA).catch(() => { });
                    }
                });
            }
        } catch (e) {
            console.warn("track cross-route error:", e);
        }

        // Mark both call docs as conference so the remote sides show merged UI
        legs.forEach(l => l.callDocRef.update({ isMerged: true }).catch(() => { }));

        setMergeState("merged");
        syncLegs();
    }, []);

    // =========================================================================
    // Swap to the held call (GSM-style swap)
    // =========================================================================
    const swapCalls = useCallback(() => {
        const legs = Array.from(legsRef.current.values());
        if (legs.length < 2) return;
        const [legA, legB] = legs;
        if (legA.status === "accepted") {
            holdLeg(legA.callId);
            unholdLeg(legB.callId);
        } else {
            holdLeg(legB.callId);
            unholdLeg(legA.callId);
        }
    }, []);

    // =========================================================================
    // Call Actions
    // =========================================================================
    const acceptCall = async (legCallId?: string) => {
        const id = legCallId ?? callId;
        try {
            await firestore().collection("calls").doc(id).update({ status: "accepted" });
        } catch (e) { console.error("acceptCall:", e); }
    };

    /** End a specific leg. If it is the last one, end everything. */
    const endLeg = async (legCallId: string) => {
        const remaining = Array.from(legsRef.current.values())
            .filter(l => l.callId !== legCallId);

        teardownLeg(legCallId, true);

        if (!remaining.length) {
            await handleCleanup();
            navigation.goBack();
        } else {
            // Unhold the other leg automatically
            remaining.forEach(l => {
                if (l.status === "onhold") unholdLeg(l.callId);
            });
            setMergeState("none");
        }
    };

    /** End all legs — big red button */
    const endCall = async () => {
        const legs = Array.from(legsRef.current.values());
        await Promise.all(legs.map(l => l.callDocRef.update({ status: "ended" }).catch(() => { })));
        await handleCleanup();
        navigation.goBack();
    };

    const toggleMute = () => {
        localStreamRef.current?.getAudioTracks().forEach((t: any) => {
            t.enabled = !t.enabled;
        });
        setIsMuted(m => !m);
    };

    const toggleSpeaker = () => {
        const next = !isSpeakerOn;
        InCallManager?.setForceSpeakerphoneOn(next);
        setIsSpeakerOn(next);
    };

    return {
        // Streams
        localStream,
        // Legacy single-call compat (primary leg values)
        remoteStream: primaryLeg?.remoteStream ?? null,
        callConnected: !!primaryLeg && primaryLeg.status === "accepted",
        callStatus: primaryLeg?.status ?? "calling",
        otherUserData: primaryLeg?.otherUser ?? null,
        // Duration
        callDuration,
        formattedDuration: formatDuration(callDuration),
        // UI flags
        isMuted,
        isSpeakerOn,
        mergeState,
        isAddingCall,
        // Legs (for multi-call UI)
        primaryLeg,
        secondLeg,
        // Actions
        acceptCall,
        endCall,
        endLeg,
        toggleMute,
        toggleSpeaker,
        addSecondCall,
        mergeCalls,
        swapCalls,
    };
};

export default useCallingViewModal;
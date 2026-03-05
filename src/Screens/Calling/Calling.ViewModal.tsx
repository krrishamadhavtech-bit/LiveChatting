import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
    RTCPeerConnection,
    mediaDevices,
    RTCSessionDescription,
    RTCIceCandidate
} from "react-native-webrtc";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import InCallManager from "react-native-incall-manager";

const ViewModal = ({ route, navigation }: any) => {
    const { callId, isCaller } = route.params;

    const pc = useRef<any>(null);
    const localStreamRef = useRef<any>(null);
    const callIdRef = useRef(callId);
    const isCallerRef = useRef(isCaller);

    const pendingCandidates = useRef<any[]>([]);
    const isRemoteDescSet = useRef(false);
    const hasCreatedOffer = useRef(false);
    const hasCreatedAnswer = useRef(false);

    const [localStream, setLocalStream] = useState<any>(null);
    const [remoteStream, setRemoteStream] = useState<any>(null);
    const [callConnected, setCallConnected] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callStatus, setCallStatus] = useState<string>("calling");
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [otherUserData, setOtherUserData] = useState<any>(null);

    const timerRef = useRef<any>(null);
    const ringingStarted = useRef(false);
    const durationRef = useRef(0);
    const chatRoomIdRef = useRef<string | null>(null);
    const chatMessageIdRef = useRef<string | null>(null);
    const isAcceptedRef = useRef(false);

    // =============================
    // Media Setup
    // =============================
    const setupLocalStream = async () => {
        try {
            console.log("Media: Requesting Microphone...");
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            stream.getTracks().forEach((track: any) => {
                pc.current?.addTrack(track, stream);
            });
            return stream;
        } catch (error) {
            console.error("Media Error:", error);
            Alert.alert("Permission", "Please allow microphone access to talk.");
            return null;
        }
    };

    // =============================
    // Peer Connection Setup
    // =============================
    const createPeerConnection = () => {
        console.log("WebRTC: Initializing Peer Connection...");
        pc.current = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" },
                { urls: "stun:stun3.l.google.com:19302" },
                { urls: "stun:stun4.l.google.com:19302" },
            ],
        });

        pc.current.onicecandidate = (event: any) => {
            if (event.candidate) {
                const targetColl = isCallerRef.current
                    ? "caller_candidates"
                    : "receiver_candidates";
                console.log(`WebRTC: Sending ICE to ${targetColl}`);
                firestore()
                    .collection("calls")
                    .doc(callIdRef.current)
                    .collection(targetColl)
                    .add(event.candidate.toJSON())
                    .catch((err) => console.error("ICE write error:", err));
            }
        };

        pc.current.ontrack = (event: any) => {
            console.log("WebRTC: Remote Track detected!");
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.current.onconnectionstatechange = () => {
            const state = pc.current?.connectionState;
            console.log("WebRTC: Connection State ->", state);
            if (state === "connected") {
                setCallConnected(true);
                startTimer();
            }
            if (state === "failed" || state === "closed" || state === "disconnected") {
                cleanup();
                navigation.goBack();
            }
        };

        pc.current.oniceconnectionstatechange = () => {
            const state = pc.current?.iceConnectionState;
            console.log("WebRTC: ICE State ->", state);
            if (state === "connected" || state === "completed") {
                setCallConnected(true);
                startTimer();
            }
        };
    };

    const flushPendingCandidates = () => {
        if (pendingCandidates.current.length > 0) {
            console.log(`ICE: Flushing ${pendingCandidates.current.length} queued candidates`);
            pendingCandidates.current.forEach((c) => {
                pc.current?.addIceCandidate(c).catch((e: any) => console.warn("ICE flush reject:", e));
            });
            pendingCandidates.current = [];
        }
    };

    // =============================
    // Timer & Lifecycle
    // =============================
    const startTimer = () => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => {
            setCallDuration((prev) => {
                durationRef.current = prev + 1;
                return prev + 1;
            });
        }, 1000);
        try {
            InCallManager?.setForceSpeakerphoneOn(false);
            InCallManager?.start({ media: "audio" });
            InCallManager?.setKeepScreenOn(true);
        } catch (e) { }
    };

    const cleanup = async () => {
        try {
            InCallManager?.stopRingback();
            InCallManager?.stopRingtone();
            InCallManager?.stop();
            ringingStarted.current = false;
        } catch (e) { }

        // Update Chat History
        if (chatRoomIdRef.current && chatMessageIdRef.current) {
            const finalDuration = durationRef.current;
            const statusText = isAcceptedRef.current
                ? `📞 Voice call (${formatDuration(finalDuration)})`
                : '📞 Missed voice call';

            try {
                await firestore()
                    .collection('chatRooms')
                    .doc(chatRoomIdRef.current)
                    .collection('messages')
                    .doc(chatMessageIdRef.current)
                    .update({
                        text: statusText
                    });
            } catch (e) {
                console.error("Error updating chat history:", e);
            }
        }

        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t: any) => t.stop());
            localStreamRef.current = null;
        }
        if (pc.current) { pc.current.close(); pc.current = null; }
        setLocalStream(null);
        setCallConnected(false);
        isRemoteDescSet.current = false;
        hasCreatedOffer.current = false;
        hasCreatedAnswer.current = false;
    };

    useEffect(() => {
        if (!callId) return;
        createPeerConnection();

        const callDocRef = firestore().collection("calls").doc(callId);

        // ── CALLER: Create a FRESH offer with THIS pc instance ────────────────
        // KEY FIX: Never reuse the offer from ChattingScreen — it was made by a
        // different RTCPeerConnection with a different DTLS certificate/fingerprint.
        // We overwrite it in Firestore with a new offer from this pc instance.
        if (isCaller && !hasCreatedOffer.current) {
            hasCreatedOffer.current = true;
            (async () => {
                try {
                    console.log("SDP: Caller creating fresh offer...");
                    await setupLocalStream();                          // add tracks first
                    const offer = await pc.current.createOffer();
                    await pc.current.setLocalDescription(offer);
                    await callDocRef.update({ offer, status: "calling" }); // overwrite stale offer
                    console.log("SDP: Fresh offer written to Firestore ✓");
                } catch (e) {
                    console.error("SDP: Caller offer creation failed", e);
                }
            })();
        }

        // ── Firestore snapshot listener ───────────────────────────────────────
        const unsubscribe = callDocRef.onSnapshot(async (doc) => {
            const data = doc.data();
            if (!data) return;

            setCallStatus(data.status || "calling");
            if (data.chatRoomId) chatRoomIdRef.current = data.chatRoomId;
            if (data.chatMessageId) chatMessageIdRef.current = data.chatMessageId;

            // Fetch other user data if not already fetched
            if (!otherUserData) {
                const otherUserId = isCaller ? data.receiverId : data.callerId;
                if (otherUserId) {
                    firestore().collection('users').doc(otherUserId).get().then(userDoc => {
                        const userData = userDoc.data();
                        if (userData) {
                            setOtherUserData(userData);
                        }
                    });
                }
            }

            if (data.status === "ended") {
                cleanup();
                navigation.goBack();
                return;
            }

            if (data.status === "accepted" && !isAcceptedRef.current) {
                isAcceptedRef.current = true;
                // Update Firestore to track that it was accepted (for history screen)
                if (isCaller) {
                    callDocRef.update({ isAccepted: true }).catch(() => { });
                }
            }

            // --- Ringing Logic ---
            const myUid = auth().currentUser?.uid;
            const amITheCaller = data.callerId === myUid;

            if (data.status === "calling") {
                if (!ringingStarted.current) {
                    ringingStarted.current = true;
                    if (amITheCaller) {
                        // CALLER: Silent wait or soft beep (disabled for testing)
                        console.log("Ringing: I am the CALLER. Staying quiet.");
                    } else {
                        // RECEIVER: Loud ringtone
                        console.log("Ringing: I am the RECEIVER. Starting loud ringtone.");
                        InCallManager?.startRingtone('_BUNDLE_', 0, '', 30);
                    }
                }
            } else {
                console.log("Ringing: Call state changed, stopping all tones.");
                InCallManager?.stopRingback();
                InCallManager?.stopRingtone();
                ringingStarted.current = false;
            }

            // CALLER: wait for receiver's answer
            if (
                isCaller &&
                data.answer &&
                !isRemoteDescSet.current &&
                pc.current?.signalingState === "have-local-offer"
            ) {
                console.log("SDP: Caller setting remote answer...");
                try {
                    await pc.current.setRemoteDescription(
                        new RTCSessionDescription(data.answer)
                    );
                    isRemoteDescSet.current = true;
                    flushPendingCandidates();
                    console.log("SDP: Caller handshake complete ✓");
                } catch (e) {
                    console.error("SDP: Caller setRemoteDescription failed", e);
                }
            }

            // RECEIVER: process offer once user accepts
            if (
                !isCaller &&
                data.offer &&
                data.status === "accepted" &&
                !isRemoteDescSet.current &&
                !hasCreatedAnswer.current
            ) {
                hasCreatedAnswer.current = true;
                console.log("SDP: Receiver processing offer...");
                try {
                    await pc.current.setRemoteDescription(
                        new RTCSessionDescription(data.offer)
                    );
                    isRemoteDescSet.current = true;
                    flushPendingCandidates();

                    await setupLocalStream(); // add tracks before createAnswer

                    const answer = await pc.current.createAnswer();
                    await pc.current.setLocalDescription(answer);
                    await callDocRef.update({ answer });
                    console.log("SDP: Receiver answer sent ✓");
                } catch (e) {
                    console.error("SDP: Receiver handshake failed", e);
                    hasCreatedAnswer.current = false; // allow retry
                }
            }
        });

        // --- 60s Timeout (Caller side only) ---
        let timeoutTimer: any = null;
        if (isCaller) {
            timeoutTimer = setTimeout(() => {
                if (!isAcceptedRef.current) {
                    console.log("Timeout: Call not answered in 60s. Auto-ending.");
                    endCall();
                }
            }, 60000); // 60 seconds
        }

        return () => {
            if (timeoutTimer) clearTimeout(timeoutTimer);
            unsubscribe();
            cleanup();
        };
    }, [callId, isCaller]);

    // =============================
    // ICE Candidate Listener
    // =============================
    useEffect(() => {
        if (!callId) return;

        const collToWatch = isCaller ? "receiver_candidates" : "caller_candidates";

        const unsubscribe = firestore()
            .collection("calls")
            .doc(callId)
            .collection(collToWatch)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        console.log(`ICE: Incoming from ${collToWatch}`);

                        if (isRemoteDescSet.current && pc.current?.remoteDescription) {
                            pc.current.addIceCandidate(candidate)
                                .catch((e: any) => console.warn("ICE add failed:", e));
                        } else {
                            console.log("ICE: Queuing (remote desc not ready yet)");
                            pendingCandidates.current.push(candidate);
                        }
                    }
                });
            });

        return () => unsubscribe();
    }, [callId, isCaller]);

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
    };

    const acceptCall = async () => {
        try {
            await firestore().collection("calls").doc(callId).update({ status: "accepted" });
        } catch (e) {
            console.error("acceptCall error:", e);
        }
    };

    const endCall = async () => {
        try {
            await firestore().collection("calls").doc(callId).update({ status: "ended" });
            cleanup();
            navigation.goBack();
        } catch (e) {
            navigation.goBack();
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track: any) => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleSpeaker = () => {
        const nextState = !isSpeakerOn;
        InCallManager?.setForceSpeakerphoneOn(nextState);
        setIsSpeakerOn(nextState);
    };

    return {
        remoteStream,
        localStream,
        callConnected,
        callDuration,
        formattedDuration: formatDuration(callDuration),
        callStatus,
        isMuted,
        isSpeakerOn,
        acceptCall,
        endCall,
        toggleMute,
        toggleSpeaker,
        otherUserData,
    };
};

export default ViewModal;
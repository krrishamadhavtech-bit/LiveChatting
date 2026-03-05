import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Platform,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useCallingViewModal, { CallLeg, MergeState } from './Calling.ViewModal';
import UserPickerModal from '../../components/UserPickerModal';
import { COLORS } from '../../constants/colors';
import { hp, hpx, getFontSize, fontFamily } from '../../utils/responsive';
import { styles, ctrlStyles, cardStyles } from './style';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Small reusable components ────────────────────────────────────────────────

const Avatar = ({
    uri,
    size = hpx(90),
    name,
    style,
}: {
    uri?: string;
    size?: number;
    name?: string;
    style?: any;
}) => (
    uri
        ? <Image source={{ uri }} style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />
        : <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }, style]}>
            {name
                ? <Text style={[styles.textWhite, { fontSize: size * 0.38, fontFamily: fontFamily.bold }]}>
                    {name.charAt(0).toUpperCase()}
                </Text>
                : <Icon name="person" size={size * 0.45} color={COLORS.white} />
            }
        </View>
);

const CtrlBtn = ({
    icon,
    label,
    onPress,
    active = false,
    danger = false,
    disabled = false,
    loading = false,
    size = hpx(58),
}: {
    icon: string;
    label: string;
    onPress: () => void;
    active?: boolean;
    danger?: boolean;
    disabled?: boolean;
    loading?: boolean;
    size?: number;
}) => (
    <View style={ctrlStyles.wrap}>
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                ctrlStyles.btn,
                { width: size, height: size, borderRadius: size / 2 },
                active && ctrlStyles.btnActive,
                danger && ctrlStyles.btnDanger,
                disabled && ctrlStyles.btnDisabled,
            ]}
        >
            {loading
                ? <ActivityIndicator size="small" color={COLORS.white} />
                : <Icon name={icon} size={size * 0.38} color={active ? COLORS.darkGrey : COLORS.white} />
            }
        </TouchableOpacity>
        <Text style={ctrlStyles.label}>{label}</Text>
    </View>
);


// ─── Call Card — shows one leg ────────────────────────────────────────────────
const CallCard = ({
    leg,
    isActive,
    onEnd,
    onSwap,
    showSwap,
}: {
    leg: CallLeg;
    isActive: boolean;
    onEnd: () => void;
    onSwap?: () => void;
    showSwap?: boolean;
}) => {
    const statusLabel =
        leg.status === "onhold" ? "On Hold" :
            leg.status === "accepted" ? "Connected" :
                leg.status === "calling" ? "Calling..." : "Connecting...";

    return (
        <View style={[cardStyles.card, isActive && cardStyles.cardActive]}>
            {/* Hold badge */}
            {leg.status === "onhold" && (
                <View style={cardStyles.holdBadge}>
                    <Icon name="pause" size={hpx(10)} color={COLORS.white} />
                    <Text style={cardStyles.holdText}>HOLD</Text>
                </View>
            )}

            <Avatar
                uri={leg.otherUser?.profileImage}
                name={leg.otherUser?.name}
                size={hpx(62)}
                style={[styles.mergedAvatar, isActive ? cardStyles.avatarActive : cardStyles.avatarInactive]}
            />

            <View style={cardStyles.info}>
                <Text style={cardStyles.name} numberOfLines={1}>
                    {leg.otherUser?.name ?? "Calling..."}
                </Text>
                <Text style={[
                    cardStyles.status,
                    leg.status === "onhold" && cardStyles.statusHold,
                    leg.status === "accepted" && cardStyles.statusActive,
                ]}>
                    {statusLabel}
                </Text>
            </View>

            <View style={cardStyles.actions}>
                {showSwap && onSwap && (
                    <TouchableOpacity onPress={onSwap} style={cardStyles.swapBtn}>
                        <Icon name="swap-horizontal" size={hpx(16)} color={COLORS.callPrimary} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onEnd} style={cardStyles.endLegBtn}>
                    <Icon name="call" size={hpx(18)} color={COLORS.white}
                        style={cardStyles.endLegIcon} />
                </TouchableOpacity>
            </View>
        </View>
    );
};


// ─── Main Screen ──────────────────────────────────────────────────────────────
const CallScreen = ({ route, navigation }: any) => {
    const { userName, userAvatar, isCaller } = route.params || {};

    const {
        localStream,
        remoteStream,
        callConnected,
        callStatus,
        formattedDuration,
        isMuted,
        isSpeakerOn,
        mergeState,
        isAddingCall,
        primaryLeg,
        secondLeg,
        otherUserData,
        acceptCall,
        endCall,
        endLeg,
        toggleMute,
        toggleSpeaker,
        addSecondCall,
        mergeCalls,
        swapCalls,
    } = useCallingViewModal({ route, navigation });

    const [showUserPicker, setShowUserPicker] = useState(false);

    const displayName = userName || otherUserData?.name || 'Unknown';
    const displayAvatar = userAvatar || otherUserData?.profileImage;
    const isIncoming = !isCaller && callStatus === "calling";
    const hasSecondLeg = !!secondLeg;

    const excludeUids = [
        primaryLeg?.otherUser?.uid,
        secondLeg?.otherUser?.uid,
    ].filter(Boolean) as string[];

    const handleUserPicked = async (user: any) => {
        setShowUserPicker(false);
        await addSecondCall(user);
    };

    // ── Which leg is "active" (not on hold) ───────────────────────────────────
    const activeLegId = primaryLeg?.status === "accepted"
        ? primaryLeg?.callId
        : secondLeg?.callId;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* BG blobs */}
            <View style={styles.blobTop} />
            <View style={styles.blobBottom} />

            {/* ── Header ─────────────────────────────────────────────────── */}
            <View style={styles.header}>
                {mergeState === "merged" ? (
                    <>
                        <Text style={styles.headerTitle}>Conference Call</Text>
                        <Text style={styles.headerSub}>3 participants · {formattedDuration}</Text>
                    </>
                ) : hasSecondLeg ? (
                    <>
                        <Text style={styles.headerTitle}>2 Calls</Text>
                        <Text style={styles.headerSub}>
                            {secondLeg?.status === "calling" ? "Calling second person..." : "Tap Merge to connect"}
                        </Text>
                    </>
                ) : (
                    <Text style={styles.headerTitle}>
                        {callStatus === "accepted"
                            ? formattedDuration
                            : isIncoming ? "Incoming Call" : "Calling..."}
                    </Text>
                )}
            </View>

            {/* ── Main Content ────────────────────────────────────────────── */}
            <View style={styles.mainContent}>

                {/* ── MERGED: side-by-side avatars ─────────────────────── */}
                {mergeState === "merged" && primaryLeg && secondLeg ? (
                    <View style={styles.mergedContainer}>
                        <View style={styles.mergedAvatarRow}>
                            <View style={styles.mergedAvatarItem}>
                                <Avatar
                                    uri={primaryLeg.otherUser?.profileImage}
                                    name={primaryLeg.otherUser?.name}
                                    size={hpx(88)}
                                    style={styles.mergedAvatar}
                                />
                                <Text style={styles.mergedName} numberOfLines={1}>
                                    {primaryLeg.otherUser?.name ?? "—"}
                                </Text>
                                <View style={styles.activeDot}>
                                    <Icon name="mic" size={hpx(9)} color={COLORS.white} />
                                </View>
                            </View>

                            <View style={styles.mergeLineDot}>
                                <Icon name="git-merge" size={hpx(22)} color={COLORS.callPrimary} />
                            </View>

                            <View style={styles.mergedAvatarItem}>
                                <Avatar
                                    uri={secondLeg.otherUser?.profileImage}
                                    name={secondLeg.otherUser?.name}
                                    size={hpx(88)}
                                    style={styles.mergedAvatar}
                                />
                                <Text style={styles.mergedName} numberOfLines={1}>
                                    {secondLeg.otherUser?.name ?? "—"}
                                </Text>
                                <View style={[styles.activeDot, { backgroundColor: COLORS.online }]}>
                                    <Icon name="mic" size={hpx(9)} color={COLORS.white} />
                                </View>
                            </View>
                        </View>

                        <Text style={styles.mergedTimer}>{formattedDuration}</Text>
                    </View>

                    /* ── TWO CALLS (hold + active) ─────────────────────────── */
                ) : hasSecondLeg && primaryLeg && secondLeg ? (
                    <View style={styles.twoCallsContainer}>
                        <CallCard
                            leg={primaryLeg}
                            isActive={primaryLeg.callId === activeLegId}
                            onEnd={() => endLeg(primaryLeg.callId)}
                            onSwap={swapCalls}
                            showSwap={secondLeg.status === "accepted"}
                        />
                        <View style={styles.twoCallsDivider}>
                            <View style={styles.twoCallsDividerLine} />
                        </View>
                        <CallCard
                            leg={secondLeg}
                            isActive={secondLeg.callId === activeLegId}
                            onEnd={() => endLeg(secondLeg.callId)}
                            onSwap={swapCalls}
                            showSwap={secondLeg.status === "accepted"}
                        />
                    </View>

                    /* ── SINGLE CALL ────────────────────────────────────────── */
                ) : (
                    <View style={styles.singleContainer}>
                        <View style={styles.pulseRing} />
                        <View style={styles.pulseRingOuter} />
                        <Avatar
                            uri={displayAvatar}
                            name={displayName}
                            size={hpx(130)}
                            style={styles.singleAvatar}
                        />
                        <Text style={styles.singleName}>{displayName}</Text>
                        <Text style={styles.singleStatus}>
                            {callStatus === "accepted"
                                ? formattedDuration
                                : isIncoming ? "Incoming Voice Call..." : "Connecting..."}
                        </Text>
                    </View>
                )}
            </View>

            {/* ── Controls ───────────────────────────────────────────────── */}
            <View style={styles.controlsArea}>

                {/* INCOMING: Accept / Decline */}
                {isIncoming && !hasSecondLeg ? (
                    <View style={styles.incomingRow}>
                        <View style={styles.incomingBtnCol}>
                            <TouchableOpacity onPress={endCall} style={styles.declineBtn}>
                                <Icon name="close" size={hpx(30)} color={COLORS.white} />
                            </TouchableOpacity>
                            <Text style={ctrlStyles.label}>Decline</Text>
                        </View>
                        <View style={styles.incomingBtnCol}>
                            <TouchableOpacity onPress={() => acceptCall()} style={styles.acceptBtn}>
                                <Icon name="call" size={hpx(30)} color={COLORS.white} />
                            </TouchableOpacity>
                            <Text style={ctrlStyles.label}>Accept</Text>
                        </View>
                    </View>

                ) : (

                    <View style={styles.activeControls}>

                        {/* Row 1: Mute · Speaker · Add/Merge */}
                        <View style={styles.ctrlRow}>
                            <CtrlBtn
                                icon={isMuted ? "mic-off" : "mic"}
                                label={isMuted ? "Unmute" : "Mute"}
                                onPress={toggleMute}
                                active={isMuted}
                            />
                            <CtrlBtn
                                icon={isSpeakerOn ? "volume-high" : "volume-low"}
                                label="Speaker"
                                onPress={toggleSpeaker}
                                active={isSpeakerOn}
                            />

                            {/* Merge button — shown only when both legs are answered */}
                            {hasSecondLeg && secondLeg?.status === "accepted" && mergeState !== "merged" ? (
                                <CtrlBtn
                                    icon="git-merge"
                                    label="Merge"
                                    onPress={mergeCalls}
                                />
                            ) : mergeState !== "merged" ? (
                                /* Add second call button */
                                <CtrlBtn
                                    icon="person-add"
                                    label={hasSecondLeg ? "Adding..." : "Add Call"}
                                    onPress={() => setShowUserPicker(true)}
                                    disabled={hasSecondLeg || isAddingCall}
                                    loading={isAddingCall}
                                />
                            ) : null}
                        </View>

                        {/* Row 2: Swap (only in two-call mode) */}
                        {hasSecondLeg && mergeState !== "merged" && secondLeg?.status === "accepted" && (
                            <View style={styles.ctrlRow}>
                                <CtrlBtn
                                    icon="swap-horizontal"
                                    label="Swap"
                                    onPress={swapCalls}
                                />
                            </View>
                        )}

                        {/* Row 3: End */}
                        <View style={styles.ctrlRow}>
                            <CtrlBtn
                                icon="call"
                                label="End All"
                                onPress={endCall}
                                danger
                                size={hpx(66)}
                            />
                        </View>
                    </View>
                )}
            </View>

            {/* User Picker */}
            <UserPickerModal
                visible={showUserPicker}
                onClose={() => setShowUserPicker(false)}
                onSelectUser={handleUserPicked}
                excludeUids={excludeUids}
            />
        </View>
    );
};



export default CallScreen;
import { Platform, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { fontFamily, getFontSize, hp, hpx } from '../../utils/responsive';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.callBackground },
    blobTop: { position: 'absolute', top: hpx(-80), right: hpx(-60), width: hpx(280), height: hpx(280), borderRadius: hpx(140), backgroundColor: 'rgba(99,88,255,0.16)' },
    blobBottom: { position: 'absolute', bottom: hpx(-60), left: hpx(-40), width: hpx(220), height: hpx(220), borderRadius: hpx(110), backgroundColor: 'rgba(0,210,170,0.10)' },

    header: {
        paddingTop: Platform.OS === 'ios' ? hp(6) : hp(5),
        paddingHorizontal: hp(3),
        alignItems: 'center',
        zIndex: 2,
    },
    headerTitle: { fontSize: getFontSize(20), fontFamily: fontFamily.bold, color: COLORS.white, letterSpacing: 0.3 },
    headerSub: { fontSize: getFontSize(13), color: 'rgba(255,255,255,0.5)', marginTop: hp(0.5), fontFamily: fontFamily.regular },

    mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: hp(2.5), zIndex: 1 },

    // Single call
    singleContainer: { alignItems: 'center' },
    pulseRing: { position: 'absolute', width: hpx(162), height: hpx(162), borderRadius: hpx(81), borderWidth: 1.5, borderColor: 'rgba(99,88,255,0.3)' },
    pulseRingOuter: { position: 'absolute', width: hpx(202), height: hpx(202), borderRadius: hpx(101), borderWidth: 1, borderColor: 'rgba(99,88,255,0.13)' },
    singleAvatar: { borderWidth: 3, borderColor: 'rgba(99,88,255,0.45)' },
    singleName: { fontSize: getFontSize(24), fontFamily: fontFamily.bold, color: COLORS.white, marginTop: hp(2.5), letterSpacing: 0.2 },
    singleStatus: { fontSize: getFontSize(14), color: 'rgba(255,255,255,0.45)', marginTop: hp(0.7), fontFamily: fontFamily.regular },

    // Two calls
    twoCallsContainer: { width: '100%', gap: hp(1.5) },
    twoCallsDivider: { alignItems: 'center' },
    twoCallsDividerLine: { width: 1, height: hp(1.8), backgroundColor: 'rgba(255,255,255,0.1)' },

    // Merged
    mergedContainer: { alignItems: 'center', width: '100%', gap: hp(2.5) },
    mergedAvatarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: hp(1) },
    mergedAvatarItem: { alignItems: 'center', gap: hp(1), flex: 1 },
    mergedAvatar: { borderWidth: 2, borderColor: 'rgba(99,88,255,0.45)' },
    mergedName: { color: COLORS.white, fontSize: getFontSize(13), fontFamily: fontFamily.bold, textAlign: 'center', maxWidth: '90%' },
    mergeLineDot: { width: hpx(42), height: hpx(42), borderRadius: hpx(21), backgroundColor: 'rgba(99,88,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(99,88,255,0.3)' },
    activeDot: { position: 'absolute', bottom: hpx(26), right: hpx(8), width: hpx(18), height: hpx(18), borderRadius: hpx(9), backgroundColor: COLORS.callPrimary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.callBackground },
    mergedTimer: { color: 'rgba(255,255,255,0.55)', fontSize: getFontSize(18), fontFamily: fontFamily.bold, letterSpacing: 1 },


    // Controls
    controlsArea: { paddingBottom: Platform.OS === 'ios' ? hp(5) : hp(3.5), paddingHorizontal: hp(2), zIndex: 2 },
    incomingRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingVertical: hp(2) },
    activeControls: { gap: hp(2) },
    ctrlRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },

    // Inline fix utils
    textWhite: { color: COLORS.white },
    flexCenter: { justifyContent: 'center', alignItems: 'center' },
    avatarPlaceholder: { backgroundColor: COLORS.callAvatarBg, justifyContent: 'center', alignItems: 'center' },
    incomingBtnCol: { alignItems: 'center', gap: hp(1) },
    declineBtn: {
        backgroundColor: COLORS.error,
        borderColor: COLORS.error,
        shadowColor: COLORS.error,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 8,
        width: hpx(72),
        height: hpx(72),
        borderRadius: hpx(36),
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptBtn: {
        backgroundColor: COLORS.online,
        borderColor: COLORS.online,
        shadowColor: COLORS.online,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 8,
        width: hpx(72),
        height: hpx(72),
        borderRadius: hpx(36),
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export const ctrlStyles = StyleSheet.create({
    wrap: { alignItems: 'center', gap: hp(0.6) },
    btn: { backgroundColor: 'rgba(255,255,255,0.13)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    btnActive: { backgroundColor: COLORS.white },
    btnDanger: { backgroundColor: COLORS.error, borderColor: COLORS.error, shadowColor: COLORS.error, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8 },
    btnDisabled: { opacity: 0.45 },
    label: { color: 'rgba(255,255,255,0.5)', fontSize: getFontSize(11), fontFamily: fontFamily.regular },
});

export const cardStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hp(1.5),
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: hpx(18),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        padding: hp(1.8),
        width: '100%',
    },
    cardActive: {
        borderColor: 'rgba(99,88,255,0.4)',
        backgroundColor: 'rgba(99,88,255,0.08)',
    },
    holdBadge: {
        position: 'absolute',
        top: hp(1), left: hp(1),
        flexDirection: 'row',
        alignItems: 'center',
        gap: hp(0.4),
        backgroundColor: 'rgba(255,165,0,0.75)',
        paddingHorizontal: hp(0.8), paddingVertical: hp(0.2),
        borderRadius: hpx(6),
    },
    holdText: {
        color: COLORS.white,
        fontSize: getFontSize(9),
        fontFamily: fontFamily.bold,
        letterSpacing: 0.5,
    },
    info: { flex: 1 },
    name: {
        color: COLORS.white,
        fontSize: getFontSize(15),
        fontFamily: fontFamily.bold,
    },
    status: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: getFontSize(12),
        fontFamily: fontFamily.regular,
        marginTop: hp(0.3),
    },
    statusHold: { color: COLORS.callHold },
    statusActive: { color: COLORS.online },
    actions: { flexDirection: 'row', gap: hp(1), alignItems: 'center' },
    swapBtn: {
        width: hpx(34), height: hpx(34), borderRadius: hpx(17),
        backgroundColor: 'rgba(99,88,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    endLegBtn: {
        width: hpx(34), height: hpx(34), borderRadius: hpx(17),
        backgroundColor: COLORS.error,
        justifyContent: 'center', alignItems: 'center',
    },
    endLegIcon: { transform: [{ rotate: '135deg' }] },
    avatarActive: { borderColor: COLORS.callPrimary },
    avatarInactive: { borderColor: 'rgba(255,255,255,0.15)' },
});
import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { fontFamily, getFontSize, hp, hpx } from '../../utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: hp(6),
        backgroundColor: COLORS.black,
    },

    topSection: {
        alignItems: 'center',
    },

    callingText: {
        color: COLORS.white,
        fontSize: getFontSize(16),
        fontFamily: fontFamily.regular,
        letterSpacing: 1,
    },

    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    pulseCircle: {
        position: 'absolute',
        width: hpx(110),
        height: hpx(110),
        borderRadius: 1,
        backgroundColor: COLORS.black,
    },

    avatar: {
        width: hpx(160),
        height: hpx(160),
        borderRadius: 80,
        borderWidth: 4,
        borderColor: COLORS.highlightBackground,
    },

    userName: {
        marginTop: hp(1.4),
        fontSize: getFontSize(20),
        color: COLORS.white,
        fontFamily: fontFamily.bold
    },

    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },

    iconButton: {
        width: hp(8),
        height: hp(8),
        borderRadius: 30,
        backgroundColor: COLORS.highlightBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },

    endCallButton: {
        width: hp(10),
        height: hp(10),
        borderRadius: 40,
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: COLORS.error,
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },

    acceptCallButton: {
        width: hp(10),
        height: hp(10),
        borderRadius: 40,
        backgroundColor: COLORS.online,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: COLORS.online,
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },

    activeIconButton: {
        backgroundColor: COLORS.white,
    },
});
import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 60,
        backgroundColor: COLORS.black,
    },

    topSection: {
        alignItems: 'center',
    },

    callingText: {
        color: COLORS.white,
        fontSize: 18,
        letterSpacing: 1,
    },

    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    pulseCircle: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: COLORS.black,
    },

    avatar: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 4,
        borderColor: COLORS.highlightBackground,
    },

    userName: {
        marginTop: 20,
        fontSize: 26,
        color: COLORS.white,
        fontWeight: '600',
    },

    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },

    iconButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.highlightBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },

    endCallButton: {
        width: 75,
        height: 75,
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
        width: 75,
        height: 75,
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
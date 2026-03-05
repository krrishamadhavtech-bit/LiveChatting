import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { getFontSize, hpx, wpx, fontFamily } from '../utils/responsive';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.transparentBlack,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wpx(20),
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        borderRadius: wpx(20),
        padding: wpx(20),
        elevation: 5,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontSize: getFontSize(18),
        fontFamily: fontFamily.bold,
        color: COLORS.text,
        marginBottom: hpx(10),
        textAlign: 'center',
    },
    message: {
        fontSize: getFontSize(14),
        fontFamily: fontFamily.regular,
        color: COLORS.textSecondary,
        marginBottom: hpx(25),
        textAlign: 'center',
        lineHeight: hpx(20),
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wpx(10),
    },
    button: {
        flex: 1,
        height: hpx(45),
        borderRadius: wpx(12),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
    },
    confirmText: {
        color: COLORS.white,
        fontFamily: fontFamily.bold,
        fontSize: getFontSize(14),
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontFamily: fontFamily.bold,
        fontSize: getFontSize(14),
    },
});

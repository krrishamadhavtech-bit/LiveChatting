import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { wpx, hpx, getFontSize, fontFamily } from "../../utils/responsive";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: wpx(20),
    },
    header: {
        alignItems: 'center',
        marginBottom: hpx(40),
    },
    logo: {
        width: wpx(100),
        height: hpx(100),
        marginBottom: hpx(20),
    },
    title: {
        fontSize: getFontSize(28),
        fontFamily: fontFamily.bold,
        color: COLORS.text,
        marginBottom: hpx(8),
    },
    subtitle: {
        fontSize: getFontSize(16),
        color: COLORS.textSecondary,
    },
    form: {
        backgroundColor: COLORS.white,
        borderRadius: wpx(15),
        padding: wpx(25),
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: hpx(20),
    },
    label: {
        fontSize: getFontSize(14),
        fontFamily: fontFamily.semi_bold,
        color: COLORS.text,
        marginBottom: hpx(8),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderDark,
        borderRadius: wpx(10),
        backgroundColor: COLORS.lightBackground,
        paddingHorizontal: wpx(15),
    },
    input: {
        flex: 1,
        paddingVertical: hpx(12),
        fontSize: getFontSize(16),
        color: COLORS.text,
    },
    inputIcon: {
        marginRight: wpx(10),
    },
    eyeButton: {
        padding: wpx(5),
    },

    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: hpx(25),
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: getFontSize(14),
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        borderRadius: wpx(10),
        padding: hpx(10),
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: getFontSize(18),
        fontFamily: fontFamily.semi_bold,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: hpx(25),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.borderDark,
    },
    dividerText: {
        marginHorizontal: wpx(15),
        color: COLORS.textTertiary,
        fontSize: getFontSize(14),
    },
    googleButton: {
        backgroundColor: COLORS.white,
        borderRadius: wpx(10),
        padding: hpx(10),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderDark,
        marginBottom: hpx(10),
    },
    googleButtonText: {
        color: COLORS.text,
        fontSize: getFontSize(16),
        fontFamily: fontFamily.medium,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signupText: {
        color: COLORS.textSecondary,
        fontSize: getFontSize(15),
    },
    signupLink: {
        color: COLORS.primary,
        fontSize: getFontSize(15),
        fontFamily: fontFamily.semi_bold,
    },
});
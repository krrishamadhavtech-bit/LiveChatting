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
    paddingHorizontal: wpx(6),
  },
  input: {
    flex: 1,
    fontSize: getFontSize(14),
    color: COLORS.text,
  },
  passwordHint: {
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
    marginTop: hpx(5),
  },
  eyeButton: {
    padding: wpx(5),
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hpx(25),
  },
  checkbox: {
    width: wpx(20),
    height: hpx(20),
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: wpx(4),
    marginRight: wpx(10),
  },
  termsText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: getFontSize(14),
  },
  signupButton: {
    backgroundColor: COLORS.success,
    borderRadius: wpx(10),
    padding: hpx(10),
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: getFontSize(16),
    fontFamily: fontFamily.semi_bold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hpx(10),
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: getFontSize(15),
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: getFontSize(15),
    fontFamily: fontFamily.semi_bold,
  },
});
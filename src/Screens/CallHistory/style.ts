import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { fontFamily, getFontSize, hp, wp } from "../../utils/responsive";

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { paddingBottom: hp(2), paddingTop: hp(5), borderBottomWidth: 1, borderBottomColor: COLORS.background },
    headerTitle: { fontSize: getFontSize(22), fontFamily: fontFamily.bold, color: COLORS.black, marginStart: hp(2) },
    list: { paddingHorizontal: hp(2) },
    callItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: hp(1.5),
        backgroundColor: COLORS.lightBackground,
        borderRadius: 12,
        marginBottom: hp(1),
        gap: 10
    },
    iconContainer: { flexDirection: 'row', alignItems: 'center' },
    historyIcon: { transform: [{ rotate: '135deg' }] },
    statusError: { color: COLORS.error },
    statusPrimary: { color: COLORS.primary },
    statusSecondary: { color: COLORS.secondary },
    callInfo: { flex: 1, gap: 1 },
    userName: { fontSize: getFontSize(15), fontFamily: fontFamily.bold, color: COLORS.black },
    timeText: { fontSize: getFontSize(12), fontFamily: fontFamily.regular, color: COLORS.textTertiary, },
    callButton: { padding: hp(1) },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: hp(10) },
    emptyText: { marginTop: hp(1), color: COLORS.textTertiary, fontSize: getFontSize(13) },
});
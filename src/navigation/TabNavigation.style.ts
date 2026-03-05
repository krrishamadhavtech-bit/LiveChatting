import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { fontFamily, getFontSize, hp } from '../utils/responsive';

export const styles = StyleSheet.create({
    container: { flex: 1 },
    bottomTab: {
        height: hp(8),
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.white,
        paddingBottom: hp(1),
        paddingTop: hp(1),
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabText: {
        fontSize: getFontSize(10),
        color: COLORS.textTertiary,
        marginTop: hp(0.5),
        fontFamily: fontFamily.regular
    },
    activeTabText: {
        color: COLORS.primary,
        fontFamily: fontFamily.bold
    }
});

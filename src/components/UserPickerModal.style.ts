import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { fontFamily, getFontSize, hp, hpx } from '../utils/responsive';

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.transparentBlack,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: COLORS.white,
        height: hp(75),
        borderTopLeftRadius: hpx(24),
        borderTopRightRadius: hpx(24),
        paddingBottom: hp(2),
    },
    handle: {
        alignSelf: 'center',
        width: hpx(40),
        height: hpx(4),
        borderRadius: hpx(2),
        backgroundColor: COLORS.disabled,
        marginTop: hp(1.2),
        marginBottom: hp(0.5),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: hp(2.5),
        paddingVertical: hp(1.5),
    },
    title: {
        fontSize: getFontSize(20),
        fontFamily: fontFamily.bold,
        color: COLORS.black,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
        marginHorizontal: hp(2),
        paddingHorizontal: hp(1.5),
        borderRadius: hpx(12),
        height: hp(5.5),
        marginBottom: hp(1),
    },
    searchInput: {
        flex: 1,
        marginLeft: hp(1),
        fontSize: getFontSize(14),
        color: COLORS.black,
        fontFamily: fontFamily.regular,
    },
    list: {
        paddingHorizontal: hp(1.5),
        paddingTop: hp(0.5),
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: hp(1),
        paddingVertical: hp(1.2),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarImg: {
        width: hpx(46),
        height: hpx(46),
        borderRadius: hpx(23),
    },
    avatarPlaceholder: {
        width: hpx(46),
        height: hpx(46),
        borderRadius: hpx(23),
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        color: COLORS.white,
        fontSize: getFontSize(18),
        fontFamily: fontFamily.bold,
    },
    onlineDot: {
        position: 'absolute',
        bottom: hpx(1),
        right: hpx(1),
        width: hpx(11),
        height: hpx(11),
        borderRadius: hpx(6),
        backgroundColor: COLORS.online,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    userInfo: {
        flex: 1,
        marginLeft: hp(1.5),
    },
    userName: {
        fontSize: getFontSize(15),
        fontFamily: fontFamily.bold,
        color: COLORS.black,
    },
    userStatus: {
        fontSize: getFontSize(12),
        color: COLORS.textTertiary,
        fontFamily: fontFamily.regular,
        marginTop: hp(0.2),
    },
    addBtn: {
        width: hpx(32),
        height: hpx(32),
        borderRadius: hpx(16),
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        alignItems: 'center',
        marginTop: hp(8),
        gap: hp(1.5),
    },
    emptyText: {
        color: COLORS.textTertiary,
        fontSize: getFontSize(14),
        fontFamily: fontFamily.regular,
    },
});

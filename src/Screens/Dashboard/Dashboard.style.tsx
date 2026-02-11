// Dashboard.style.ts
import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';
import { wpx, hpx, getFontSize, fontFamily } from '../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: hpx(10),
    color: COLORS.textSecondary,
    fontSize: getFontSize(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wpx(20),
    paddingVertical: hpx(15),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBackground,
  },
  headerTitle: {
    fontSize: getFontSize(24),
    fontFamily: fontFamily.bold,
    color: COLORS.black,
  },
  headerButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: wpx(15),
    paddingVertical: hpx(8),
    borderRadius: wpx(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    color: COLORS.white,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.semi_bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    marginHorizontal: wpx(20),
    marginVertical: hpx(10),
    paddingHorizontal: wpx(15),
    paddingVertical: hpx(10),
    borderRadius: wpx(25),
  },
  searchIcon: {
    fontSize: getFontSize(18),
    color: COLORS.textTertiary,
    marginRight: wpx(10),
  },
  searchInput: {
    flex: 1,
    fontSize: getFontSize(16),
    color: COLORS.black,
    padding: 0,
  },
  clearText: {
    fontSize: getFontSize(18),
    color: COLORS.textTertiary,
    padding: wpx(5),
  },
  statsContainer: {
    paddingHorizontal: wpx(20),
    paddingVertical: hpx(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBackground,
  },
  statsText: {
    fontSize: getFontSize(14),
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wpx(10),
    paddingVertical: hpx(12),
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: wpx(10),
  },
  avatarPlaceholder: {
    width: wpx(50),
    height: wpx(50),
    borderRadius: wpx(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.bold,
    color: COLORS.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wpx(13),
    height: wpx(13),
    borderRadius: wpx(6),
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hpx(5),
  },
  userName: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.semi_bold,
    color: COLORS.black,
    flex: 1,
  },
  timestamp: {
    fontSize: getFontSize(12),
    color: COLORS.textTertiary,
    marginLeft: wpx(10),
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: wpx(10),
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: wpx(12),
    minWidth: wpx(24),
    height: wpx(24),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wpx(6),
  },
  unreadCount: {
    color: COLORS.white,
    fontSize: getFontSize(12),
    fontFamily: fontFamily.bold,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.inputBackground,
    marginHorizontal: wpx(15),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hpx(100),
  },
  emptyIcon: {
    fontSize: getFontSize(60),
    color: COLORS.disabled,
  },
  emptyText: {
    fontSize: getFontSize(18),
    color: COLORS.textSecondary,
    marginTop: hpx(20),
    marginBottom: hpx(5),
  },
  emptySubtext: {
    fontSize: getFontSize(14),
    color: COLORS.textTertiary,
  },
  fab: {
    position: 'absolute',
    right: wpx(20),
    bottom: hpx(20),
    width: wpx(60),
    height: wpx(60),
    borderRadius: wpx(30),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: getFontSize(30),
    color: COLORS.white,
    fontFamily: fontFamily.bold,
  },
  // Unread Message Dot (Red Dot)
  unreadDot: {
    position: 'absolute',
    top: hpx(-2),
    right: wpx(-2),
    width: wpx(24),
    height: wpx(24),
    borderRadius: wpx(12),
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  unreadDotText: {
    color: COLORS.white,
    fontSize: getFontSize(10),
    fontFamily: fontFamily.bold,
  },

  unreadUserName: {
    fontFamily: fontFamily.bold,
    color: COLORS.black,
  },

  unreadLastMessage: {
    fontFamily: fontFamily.semi_bold,
    color: COLORS.black,
  },

  typingIndicator: {
    fontSize: getFontSize(12),
    color: COLORS.primary,
    fontStyle: 'italic',
    marginLeft: wpx(5),
  },
});
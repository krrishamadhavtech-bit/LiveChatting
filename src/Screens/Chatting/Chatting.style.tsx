import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { wpx, hpx, getFontSize, fontFamily } from "../../utils/responsive";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: wpx(15),
    paddingVertical: hpx(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: wpx(10),
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: wpx(40),
    height: wpx(40),
    borderRadius: wpx(20),
    marginRight: wpx(12),
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: getFontSize(18),
    fontFamily: fontFamily.semi_bold,
    color: COLORS.text,
  },
  headerStatus: {
    fontSize: getFontSize(14),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: wpx(15),
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: wpx(10),
  },
  messageContainer: {
    marginBottom: hpx(15),
  },
  typingIndicator: {
    padding: wpx(8),
    paddingHorizontal: wpx(12),
    borderRadius: wpx(18),
    borderBottomLeftRadius: wpx(4),
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    marginBottom: hpx(10),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  typingText: {
    fontSize: getFontSize(14),
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: wpx(8),
    borderRadius: wpx(18),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: wpx(4),
  },
  otherBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: wpx(4),
  },
  messageText: {
    fontSize: getFontSize(14),
  },
  myMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: hpx(5),
  },
  timestamp: {
    fontSize: getFontSize(8),
  },
  myTimestamp: {
    color: COLORS.overlay,
  },
  otherTimestamp: {
    color: COLORS.textTertiary,
  },
  readIcon: {
    marginLeft: wpx(4),
    fontSize: getFontSize(12),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hpx(100),
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: wpx(15),
    paddingVertical: hpx(10),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attachButton: {
    marginRight: wpx(10),
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: wpx(25),
    paddingHorizontal: wpx(15),
  },
  input: {
    flex: 1,
    fontSize: getFontSize(16),
    paddingVertical: hpx(10),
    maxHeight: hpx(100),
  },
  emojiButton: {
    marginLeft: wpx(10),
  },
  sendButton: {
    width: wpx(40),
    height: wpx(40),
    borderRadius: wpx(20),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wpx(10),
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
});
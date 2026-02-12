
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { getFontSize, hpx, wpx, fontFamily } from '../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';

interface MessageOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    onReply: () => void;
    onForward: () => void;
    onDelete: () => void;
    isMe: boolean;
}

const MessageOptionsModal: React.FC<MessageOptionsModalProps> = ({
    visible,
    onClose,
    onReply,
    onForward,
    onDelete,
    isMe
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalContainer}>
                    <View style={styles.optionsWrapper}>
                        <TouchableOpacity style={styles.option} onPress={onReply}>
                            <Icon name="arrow-undo-outline" size={22} color={COLORS.text} />
                            <Text style={styles.optionText}>Reply</Text>
                        </TouchableOpacity>

                        <View style={styles.separator} />

                        <TouchableOpacity style={styles.option} onPress={onForward}>
                            <Icon name="arrow-redo-outline" size={22} color={COLORS.text} />
                            <Text style={styles.optionText}>Forward</Text>
                        </TouchableOpacity>

                        {isMe && (
                            <>
                                <View style={styles.separator} />
                                <TouchableOpacity style={styles.option} onPress={onDelete}>
                                    <Icon name="trash-outline" size={22} color={COLORS.error} />
                                    <Text style={[styles.optionText, { color: COLORS.error }]}>Delete</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.transparentBlack,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        paddingHorizontal: wpx(15),
        paddingBottom: Platform.OS === 'ios' ? hpx(35) : hpx(25),
    },
    optionsWrapper: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        marginBottom: hpx(10),
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hpx(16),
        paddingHorizontal: wpx(20),
        justifyContent: 'flex-start',
    },
    optionText: {
        fontSize: getFontSize(16),
        fontFamily: fontFamily.medium,
        color: COLORS.text,
        marginLeft: wpx(15),
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: wpx(55),
    },
    cancelButton: {
        backgroundColor: COLORS.white,
        borderRadius: 14,
        paddingVertical: hpx(16),
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cancelText: {
        fontSize: getFontSize(16),
        fontFamily: fontFamily.bold,
        color: COLORS.primary,
    },
});

export default MessageOptionsModal;

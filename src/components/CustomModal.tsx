import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { getFontSize, hpx, wpx, fontFamily } from '../utils/responsive';

interface CustomModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = COLORS.error,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={onCancel}
                                >
                                    <Text style={styles.cancelText}>{cancelText}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: confirmColor }]}
                                    onPress={onConfirm}
                                >
                                    <Text style={styles.confirmText}>{confirmText}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
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

export default CustomModal;
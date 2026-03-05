import React from 'react';
import {
    Modal,
    Text,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
} from 'react-native';
import { styles } from './CustomModal.style';
import { COLORS } from '../constants/colors';

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

export default CustomModal;
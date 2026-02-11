import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { hpx, wpx, getFontSize, fontFamily } from '../utils/responsive';

interface User {
    id: string;
    name: string;
    avatar: string;
}

interface UserSelectionModalProps {
    visible: boolean;
    users: User[];
    onClose: () => void;
    onSelectUser: (user: User) => void;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({ visible, users, onClose, onSelectUser }) => {
    const renderItem = ({ item }: { item: User }) => (
        <TouchableOpacity style={styles.userItem} onPress={() => onSelectUser(item)}>
            <Image
                source={{ uri: item.avatar }}
                style={styles.avatar}
                defaultSource={{ uri: 'https://ui-avatars.com/api/?name=User' }}
            />
            <Text style={styles.userName}>{item.name}</Text>
            <Icon name="chevron-forward" size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Forward to...</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    {users.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No users found</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={users}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: COLORS.transparentBlack,
    },
    modalView: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '70%',
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: -2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wpx(15),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        fontSize: getFontSize(18),
        fontFamily: fontFamily.bold,
        color: COLORS.text,
    },
    closeButton: {
        padding: 5,
    },
    listContent: {
        padding: wpx(15),
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hpx(12),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatar: {
        width: wpx(40),
        height: wpx(40),
        borderRadius: wpx(20),
        marginRight: wpx(12),
        backgroundColor: COLORS.inputBackground,
    },
    userName: {
        flex: 1,
        fontSize: getFontSize(16),
        color: COLORS.text,
        fontFamily: fontFamily.medium,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textTertiary,
        fontSize: getFontSize(16),
    },
});

export default UserSelectionModal;

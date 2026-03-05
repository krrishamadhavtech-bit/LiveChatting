import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    SafeAreaView,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../constants/colors';
import { hp, hpx, getFontSize, fontFamily } from '../utils/responsive';
import { styles } from './UserPickerModal.style';

interface UserPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectUser: (user: any) => void;
    excludeUids?: string[];
}

const UserPickerModal = ({ visible, onClose, onSelectUser, excludeUids = [] }: UserPickerModalProps) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!visible) return;
        setLoading(true);

        const currentUid = auth().currentUser?.uid;
        const unsubscribe = firestore()
            .collection('users')
            .onSnapshot(snapshot => {
                const userList = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter((u: any) => u.id !== currentUid && !excludeUids.includes(u.id));
                setUsers(userList);
                setLoading(false);
            });

        return () => unsubscribe();
    }, [visible]);

    const filteredUsers = users.filter((u: any) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderUserItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => onSelectUser(item)}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                {item.profileImage
                    ? <Image source={{ uri: item.profileImage }} style={styles.avatarImg} />
                    : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarLetter}>{item.name?.charAt(0).toUpperCase()}</Text>
                        </View>
                    )
                }
                {item.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userStatus}>{item.isOnline ? 'Online' : 'Offline'}</Text>
            </View>
            <View style={styles.addBtn}>
                <Icon name="add" size={18} color={COLORS.white} />
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <SafeAreaView style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={styles.title}>Add to Call</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Icon name="close-circle" size={26} color={COLORS.disabled} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchBar}>
                        <Icon name="search-outline" size={18} color={COLORS.textTertiary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search contacts..."
                            placeholderTextColor={COLORS.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close-circle" size={16} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <View style={styles.loading}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredUsers}
                            renderItem={renderUserItem}
                            keyExtractor={(item: any) => item.id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <Icon name="people-outline" size={50} color={COLORS.disabled} />
                                    <Text style={styles.emptyText}>No contacts found</Text>
                                </View>
                            }
                        />
                    )}
                </SafeAreaView>
            </View>
        </Modal>
    );
};


export default UserPickerModal;


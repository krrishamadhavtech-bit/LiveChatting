// Dashboard.ViewModal.tsx
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { styles } from './Dashboard.style';
import { useDispatch } from 'react-redux';
import { logout as reduxLogout } from '../../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardNavigationProp, FirestoreUser } from '../../types/Dashboard.types';
import { COLORS } from '../../constants/colors';

// Update User type to include unread messages

const ViewModal = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const dispatch = useDispatch();
  const [rawUsers, setRawUsers] = useState<FirestoreUser[]>([]);
  const [chatMetaData, setChatMetaData] = useState<Record<string, any>>({});
  const [filteredUsers, setFilteredUsers] = useState<FirestoreUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const chatListenersRef = React.useRef<Record<string, () => void>>({});
  const authUser = auth().currentUser;

  useEffect(() => {
    if (!authUser) return;

    const unsubscribeUsers = firestore()
      .collection('users')
      .where('email', '!=', authUser.email)
      .onSnapshot(
        (querySnapshot) => {
          const usersList: FirestoreUser[] = [];

          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            usersList.push({
              id: doc.id,
              name: userData.name || 'Unknown',
              email: userData.email || '',
              avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`,
              isOnline: userData.isOnline || false,
              lastSeen: userData.lastSeen?.toDate() || new Date(),
              createdAt: userData.createdAt?.toDate() || new Date(),
              lastMessage: '',
              unreadCount: 0,
              isTyping: false
            });
          });

          setRawUsers(usersList);
          setLoading(false);
        },
        (error) => console.error('Error fetching users:', error)
      );

    return () => unsubscribeUsers();
  }, [authUser]);

  // 2. Manage CHAT Listeners (One per user)
  useEffect(() => {
    if (!authUser) return;

    const currentUserId = authUser.uid;

    rawUsers.forEach(user => {
      // If we already have a listener for this user, skip
      if (chatListenersRef.current[user.id]) return;

      const chatRoomId = [currentUserId, user.id].sort().join('_');

      const unsub = firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .onSnapshot(doc => {
          if (doc.exists()) {
            const data = doc.data();
            const lastMsg = data?.lastMessage || {};
            const unread = (lastMsg.senderId === user.id && !lastMsg.read) ? 1 : 0;

            setChatMetaData(prev => ({
              ...prev,
              [user.id]: {
                lastMessage: lastMsg.text || '',
                lastMessageTime: lastMsg.timestamp?.toDate() || null,
                unreadCount: unread,
              }
            }));
          } else {
            // No chat room yet
            setChatMetaData(prev => ({
              ...prev,
              [user.id]: {
                lastMessage: 'Start a conversation',
                lastMessageTime: null,
                unreadCount: 0,
              }
            }));
          }
        });

      // Store unsubscribe function
      chatListenersRef.current[user.id] = unsub;
    });

    // Cleanup listeners for removed users (optional, but good practice)
    // For simplicity in this session, we'll just cleanup on unmount

  }, [rawUsers, authUser]);

  // Clean up ALL chat listeners on unmount
  useEffect(() => {
    return () => {
      Object.values(chatListenersRef.current).forEach(unsub => unsub());
      chatListenersRef.current = {};
    };
  }, []);

  // 3. Merge Raw Users + Chat Data -> Filtered Users
  useEffect(() => {
    let merged = rawUsers.map(user => {
      const meta = chatMetaData[user.id] || {};
      return {
        ...user,
        lastMessage: meta.lastMessage || user.lastMessage,
        lastMessageTime: meta.lastMessageTime || user.lastMessageTime,
        unreadCount: meta.unreadCount || 0,
      };
    });

    // Sort
    merged.sort((a, b) => {
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0;
      const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0;
      return timeB - timeA;
    });

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      merged = merged.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    setFilteredUsers(merged);
  }, [rawUsers, chatMetaData, searchQuery]);


  // 4. Fetch Current User
  useEffect(() => {
    if (authUser?.uid) {
      firestore().collection('users').doc(authUser.uid).get().then(doc => {
        if (doc.exists()) setCurrentUser(doc.data() as any);
      });
    }
  }, [authUser]);

  // Actions
  const handleUserPress = async (user: FirestoreUser) => {
    // Optimistic update for unread count
    setChatMetaData(prev => ({
      ...prev,
      [user.id]: { ...prev[user.id], unreadCount: 0 }
    }));

    // Mark in Firestore
    if (authUser) {
      console.log('Marking messages as read for user:', user.id);
      console.log('authUser.id:', authUser.uid);
      const chatRoomId = [authUser.uid, user.id].sort().join('_');
      const batch = firestore().batch();
      const unreadDocs = await firestore().collection('chatRooms')
        .doc(chatRoomId).collection('messages')
        .where('read', '==', false).where('senderId', '==', user.id).get();

      unreadDocs.forEach(d => batch.update(d.ref, { read: true }));
      if (!unreadDocs.empty) {
        await batch.commit();
        // Update lastMessage read status too
        firestore().collection('chatRooms').doc(chatRoomId).update({ 'lastMessage.read': true }).catch(() => { });
      }
    }

    navigation.navigate('ChattingScreen', {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'
    });
  };

  const handleNewChat = () => Alert.alert('New Chat', 'Coming soon!');

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            if (authUser) {
              await firestore().collection('users').doc(authUser.uid).update({
                isOnline: false,
                lastSeen: firestore.FieldValue.serverTimestamp()
              });
            }
            await AsyncStorage.removeItem('persistedUser');
            await auth().signOut();
            dispatch(reduxLogout());
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  };

  // Helper
  const formatTime = (date: Date) => {
    // ... same format logic ...
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 60000) return 'just now';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Render Item
  const renderUserItem = ({ item }: { item: FirestoreUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
      disabled={loading}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
        {item.unreadCount > 0 && (
          <View style={styles.unreadDot}>
            <Text style={styles.unreadDotText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.userName, item.unreadCount > 0 && styles.unreadUserName]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.timestamp}>
            {item.lastMessageTime ? formatTime(item.lastMessageTime) : ''}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadLastMessage]} numberOfLines={1}>
            {item.lastMessage || item.email || 'Start a conversation'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return {
    navigation,
    users: rawUsers,
    searchQuery,
    setSearchQuery,
    filteredUsers,
    renderUserItem,
    handleNewChat,
    handleLogout,
    loading,
    setLoading: () => { },
    setUsers: () => { },
    currentUser
  };
};

export default ViewModal;
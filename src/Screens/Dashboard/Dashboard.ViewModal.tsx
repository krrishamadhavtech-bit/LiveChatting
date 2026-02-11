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
import { fontFamily } from '../../utils/responsive';
import CustomModal from '../../components/CustomModal';

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
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
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
            const otherUserTyping = data?.typingStatus?.[user.id] || false;

            setChatMetaData(prev => ({
              ...prev,
              [user.id]: {
                lastMessage: lastMsg.text || '',
                lastMessageTime: lastMsg.timestamp?.toDate() || null,
                unreadCount: unread,
                isTyping: otherUserTyping,
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
                isTyping: false,
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

  // Filter & Search
  useEffect(() => {
    const filterLocal = () => {
      let merged = rawUsers.map(user => {
        const meta = chatMetaData[user.id] || {};
        return {
          ...user,
          lastMessage: meta.lastMessage || user.lastMessage,
          lastMessageTime: meta.lastMessageTime || user.lastMessageTime,
          unreadCount: meta.unreadCount || 0,
          isTyping: meta.isTyping || false,
        };
      });

      // Sort by latest message time
      merged.sort((a, b) => {
        const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0;
        const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0;
        return timeB - timeA;
      });

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        merged = merged.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.lastMessage && u.lastMessage.toLowerCase().includes(q))
        );
      }
      setFilteredUsers(merged);
    };

    if (!searchQuery.trim()) {
      filterLocal();
      return;
    }

    const deepSearch = async () => {
      const currentUserId = authUser?.uid;
      if (!currentUserId) return;

      const matches = new Map<string, string>(); // userId -> matchingMessageText

      // 2. Deep search in messages subcollections
      const searchPromises = rawUsers.map(async (user) => {
        if (matches.has(user.id)) return;

        const chatRoomId = [currentUserId, user.id].sort().join('_');
        const msgQuery = await firestore()
          .collection('chatRooms')
          .doc(chatRoomId)
          .collection('messages')
          .where('text', '>=', searchQuery)
          .where('text', '<=', searchQuery + '\uf8ff')
          .limit(1)
          .get();

        if (!msgQuery.empty) {
          const matchedDoc = msgQuery.docs[0].data();
          matches.set(user.id, matchedDoc.text);
        }
      });

      await Promise.all(searchPromises);

      const results = rawUsers
        .filter(u => matches.has(u.id))
        .map(user => {
          const meta = chatMetaData[user.id] || {};
          const matchedMsg = matches.get(user.id);
          return {
            ...user,
            lastMessage: matchedMsg || meta.lastMessage || user.lastMessage,
            lastMessageTime: meta.lastMessageTime || user.lastMessageTime,
            unreadCount: meta.unreadCount || 0,
            isTyping: meta.isTyping || false,
          };
        })
        .sort((a, b) => {
          const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0;
          const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0;
          return timeB - timeA;
        });

      setFilteredUsers(results);
    };

    const delayDebounceFn = setTimeout(() => {
      deepSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [rawUsers, chatMetaData, searchQuery, authUser]);


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
    });
  };

  const handleNewChat = () => Alert.alert('New Chat', 'Coming soon!');

  const handleLogout = () => setLogoutModalVisible(true);

  const confirmLogout = async () => {
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
    } finally {
      setLogoutModalVisible(false);
    }
  };

  // Helper
  const formatTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    if (isYesterday) return 'Yesterday';

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
          <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadLastMessage, item.isTyping && { color: COLORS.online, fontFamily: fontFamily.bold }]} numberOfLines={1}>
            {item.isTyping ? 'typing...' : (item.lastMessage || 'Start a conversation')}
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
    currentUser,
    logoutModalVisible,
    setLogoutModalVisible,
    confirmLogout
  };
};

export default ViewModal;
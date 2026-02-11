import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    AppState,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './Chatting.style';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { Message, RouteParams } from '../../types/Chatting.types';
import { COLORS } from '../../constants/colors';

const ViewModal = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const flatListRef = useRef<any>(null);
    const params = route.params as RouteParams || {};
    const userId = params.userId || '';
    const userName = params.userName || 'Unknown User';
    const userAvatar = params.userAvatar || 'https://randomuser.me/api/portraits/men/1.jpg';
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const currentUser = auth().currentUser!;
    const currentUserId = currentUser?.uid || '';
    const [newMessage, setNewMessage] = useState('');
    const [typing, setTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const isOnlineRef = useRef(true);

    // Get chat room ID (sorted to ensure consistency)
    const getChatRoomId = () => {
        if (!currentUserId || !userId) return '';
        return [currentUserId, userId].sort().join('_');
    };

    // Update typing status in Firestore
    const updateTypingStatus = async (isTyping: boolean) => {
        if (!currentUserId || !userId) return;
        const chatRoomId = getChatRoomId();
        try {
            await firestore()
                .collection('chatRooms')
                .doc(chatRoomId)
                .set({
                    typingStatus: {
                        [currentUserId]: isTyping
                    }
                }, { merge: true });
        } catch (error) {
            console.error('Error updating typing status:', error);
        }
    };

    // Real-time messages listener & AppState handling
    useEffect(() => {
        if (!currentUserId || !userId) return;

        const chatRoomId = getChatRoomId();

        // 1. Listen for messages
        const unsubscribeMessages = firestore()
            .collection('chatRooms')
            .doc(chatRoomId)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .onSnapshot(
                (snapshot) => {
                    const messagesList: Message[] = [];
                    const unreadIdsFromOther: string[] = [];

                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        const isMe = data.senderId === currentUserId;

                        if (!isMe && !data.read) {
                            unreadIdsFromOther.push(doc.id);
                        }

                        messagesList.push({
                            id: doc.id,
                            text: data.text || '',
                            senderId: data.senderId || '',
                            senderName: data.senderName || '',
                            timestamp: data.timestamp,
                            isMe: isMe,
                            read: data.read || false,
                        });
                    });

                    setMessages(messagesList);
                    setMessagesLoading(false);

                    if (unreadIdsFromOther.length > 0) {
                        markMessagesAsRead(unreadIdsFromOther);
                    }
                },
                (error) => console.error('Error loading messages:', error)
            );

        // 2. Listen for other user's typing status
        const unsubscribeTyping = firestore()
            .collection('chatRooms')
            .doc(chatRoomId)
            .onSnapshot((doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    const otherUserTyping = data?.typingStatus?.[userId] || false;

                    // Use ref for synchronous check to avoid race conditions
                    if (isOnlineRef.current) {
                        setTyping(otherUserTyping);
                    } else {
                        setTyping(false);
                    }
                }
            });

        // 3. Listen for other user's online status
        const unsubscribeOnline = firestore()
            .collection('users')
            .doc(userId)
            .onSnapshot(doc => {
                const data = doc.data();
                const online = data?.isOnline === true;

                setIsOnline(online);
                isOnlineRef.current = online;

                // Sync typing status immediately when online status changes
                if (!online) {
                    setTyping(false);
                }
            });

        // 4. Handle App State (Background/Inactive -> Stop Typing)
        const handleAppStateChange = (nextAppState: any) => {
            if (nextAppState.match(/inactive|background/)) {
                updateTypingStatus(false);
            }
        };

        const appStateSub = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            unsubscribeMessages();
            unsubscribeTyping();
            unsubscribeOnline();
            appStateSub.remove();
            updateTypingStatus(false); // Stop typing on unmount
        };
    }, [currentUserId, userId]);


    const markMessagesAsRead = async (specificIds?: string[]) => {
        if (!currentUserId || !userId) return;

        try {
            const chatRoomId = getChatRoomId();
            let idsToMark = specificIds;

            if (!idsToMark) {
                // Fetch all unread messages from this user (the other user)
                const unreadMessages = await firestore()
                    .collection('chatRooms')
                    .doc(chatRoomId)
                    .collection('messages')
                    .where('read', '==', false)
                    .where('senderId', '==', userId)
                    .get();
                idsToMark = unreadMessages.docs.map(doc => doc.id);
            }

            if (idsToMark && idsToMark.length > 0) {
                // Batch update to mark as read
                const batch = firestore().batch();
                const messagesRef = firestore().collection('chatRooms').doc(chatRoomId).collection('messages');

                idsToMark.forEach(id => {
                    batch.update(messagesRef.doc(id), { read: true });
                });

                await batch.commit();

                // Also update chat room's lastMessage read status
                const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);
                const chatRoomDoc = await chatRoomRef.get();

                if (chatRoomDoc.exists()) {
                    const data = chatRoomDoc.data();
                    const lastMessage = data?.lastMessage;

                    // If the last message was from the other user and is still marked unread, fix it!
                    if (lastMessage && lastMessage.senderId === userId && !lastMessage.read) {
                        await chatRoomRef.update({
                            'lastMessage.read': true,
                        });
                    }
                }
                console.log('Marked', idsToMark.length, 'messages as read');
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Mark messages as read when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            console.log('Chat screen focused - marking messages as read');
            markMessagesAsRead();
            return () => { };
        }, [userId])
    );


    // MARK: Send message - FIXED
    const handleSend = async () => {
        if (!newMessage.trim() || !currentUserId || !userId) {
            console.log('Cannot send: empty message or no users');
            return;
        }

        const messageText = newMessage.trim();
        setNewMessage(''); // Clear input immediately for better UX
        updateTypingStatus(false);

        console.log('Sending message to:', userId);

        try {
            const chatRoomId = getChatRoomId();
            const timestamp = firestore.FieldValue.serverTimestamp();
            const messageId = `${Date.now()}_${currentUserId}`;

            const messageData = {
                id: messageId,
                text: messageText,
                senderId: currentUserId,
                senderName: currentUser.displayName || currentUser.email || 'User',
                timestamp: timestamp,
                read: false,
            };

            // STEP 1: Create or update chat room document FIRST
            const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);

            await chatRoomRef.set({
                participants: [currentUserId, userId].sort(),
                lastMessage: {
                    text: messageText,
                    senderId: currentUserId,
                    timestamp: timestamp,
                    read: false
                },
                lastUpdated: timestamp,
            }, { merge: true });

            // STEP 2: Add message to subcollection
            await chatRoomRef
                .collection('messages')
                .doc(messageId)
                .set(messageData);

            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally: restore newMessage if send failed
            // setNewMessage(messageText); 
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '--:--';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            return '--:--';
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.otherMessage]}>
            <View style={[styles.messageBubble, item.isMe ? styles.myBubble : styles.otherBubble]}>
                <Text style={[styles.messageText, item.isMe ? styles.myMessageText : styles.otherMessageText]}>
                    {item.text}
                </Text>
                <View style={styles.messageFooter}>
                    <Text style={[styles.timestamp, item.isMe ? styles.myTimestamp : styles.otherTimestamp]}>
                        {formatTime(item.timestamp)}
                    </Text>
                    {item.isMe && (
                        <Icon
                            name={item.read ? "checkmark-done" : "checkmark"}
                            size={16}
                            color={!item.read ? COLORS.overlay : COLORS.online}
                            style={{ marginLeft: 4 }}
                        />
                    )}
                </View>
            </View>
        </View>
    );


    return {
        messages,
        newMessage,
        setNewMessage,
        loading: false,
        typing,
        handleSend,
        updateTypingStatus,
        renderMessage,
        userName,
        userAvatar,
        isOnline,
        handleGoBack: () => navigation.goBack(),
        flatListRef,
    }
}

export default ViewModal;
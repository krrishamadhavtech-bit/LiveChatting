import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    AppState,
    LayoutAnimation,
    Platform,
    UIManager,
    Alert,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './style';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { Message, RouteParams } from '../../types/Chatting';
import { COLORS } from '../../constants/colors';

const ViewModal = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const flatListRef = useRef<any>(null);
    const params = route.params as RouteParams || {};
    const userId = params.userId || '';
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const currentUser = auth().currentUser!;
    const currentUserId = currentUser?.uid || '';
    const [newMessage, setNewMessage] = useState('');
    const [typing, setTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const isOnlineRef = useRef(true);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [myProfile, setMyProfile] = useState<any>(null);
    const [otherProfile, setOtherProfile] = useState<any>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

    const [forwardModalVisible, setForwardModalVisible] = useState(false);
    const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
    const [forwardUsers, setForwardUsers] = useState<any[]>([]);

    // Message Options Modal
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => {
        if (forwardModalVisible && currentUserId) {
            firestore()
                .collection('users')
                .where('email', '!=', currentUser.email)
                .get()
                .then(snapshot => {
                    const usersList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        name: doc.data().name || 'Unknown',
                        avatar: doc.data().avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.data().name || 'User')}&background=random`,
                    }));
                    setForwardUsers(usersList);
                })
                .catch(err => console.error('Error fetching users for forward:', err));
        }
    }, [forwardModalVisible, currentUserId]);

    const scrollToMessage = (messageId: string) => {
        const index = messages.findIndex(m => m.id === messageId);

        if (index === -1 || !flatListRef.current) return;

        flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5, // center the message
        });

        setHighlightedMessageId(messageId);

        setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setHighlightedMessageId(null);
        }, 400);
    };

    useEffect(() => {
        if (!currentUserId) return;
        return firestore().collection('users').doc(currentUserId).onSnapshot(doc => setMyProfile(doc.data()));
    }, [currentUserId]);

    useEffect(() => {
        if (!userId) return;
        return firestore().collection('users').doc(userId).onSnapshot(doc => setOtherProfile(doc.data()));
    }, [userId]);

    const userName = otherProfile?.name || 'Unknown User';
    const userAvatar = otherProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

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
            const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);
            const doc = await chatRoomRef.get();
            if (doc.exists()) {
                await chatRoomRef.update({
                    [`typingStatus.${currentUserId}`]: isTyping
                });
            }
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
                            senderName: data.senderName || data.name || 'Unknown',
                            timestamp: data.timestamp,
                            isMe: isMe,
                            read: data.read || false,
                            replyTo: data.replyTo || null,
                            forwarded: data.forwarded || false,
                            forwardedFrom: data.forwardedFrom || null,
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
            updateTypingStatus(false);
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
        const currentReply = replyingTo;
        setReplyingTo(null);
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
                senderName: myProfile?.name || 'Unknown',
                timestamp,
                read: false,
                replyTo: currentReply
                    ? {
                        id: currentReply.id,
                        text: currentReply.text,
                        senderName: currentReply.senderName,
                        senderId: currentReply.senderId,
                    }
                    : null,
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
        }
    };

    const handleDeleteMessage = (messageId: string) => {
        setMessageToDelete(messageId);
        setDeleteModalVisible(true);
    };

    const confirmDeleteMessage = async () => {
        if (!messageToDelete) return;

        try {
            const chatRoomId = getChatRoomId();
            await firestore()
                .collection('chatRooms')
                .doc(chatRoomId)
                .collection('messages')
                .doc(messageToDelete)
                .delete();

            console.log('Message deleted successfully');
        } catch (error) {
            console.error('Error deleting message:', error);
        } finally {
            setDeleteModalVisible(false);
            setMessageToDelete(null);
        }
    };

    const handleForwardMessage = async (targetUser: any) => {
        if (!forwardMessage || !currentUserId) return;

        try {
            const chatRoomId = [currentUserId, targetUser.id].sort().join('_');
            const timestamp = firestore.FieldValue.serverTimestamp();
            const messageId = `${Date.now()}_${currentUserId}`;
            const messageText = forwardMessage.text;

            const messageData = {
                id: messageId,
                text: messageText,
                senderId: currentUserId,
                senderName: myProfile?.name || 'Unknown',
                timestamp,
                read: false,
                forwarded: true, // Optional flag
                forwardedFrom: forwardMessage.senderName,
                replyTo: null,
            };

            // 1. Create/Update ChatRoom
            await firestore().collection('chatRooms').doc(chatRoomId).set({
                participants: [currentUserId, targetUser.id].sort(),
                lastMessage: {
                    text: messageText,
                    senderId: currentUserId,
                    timestamp: timestamp,
                    read: false
                },
                lastUpdated: timestamp,
            }, { merge: true });

            // 2. Add Message
            await firestore()
                .collection('chatRooms')
                .doc(chatRoomId)
                .collection('messages')
                .doc(messageId)
                .set(messageData);

            console.log('Message forwarded to', targetUser.name);
            setForwardModalVisible(false);
            setForwardMessage(null);
            setForwardMessage(null);
            // Optional: Show feedback (Toast/Alert)
            Alert.alert('Success', `Message forwarded to ${targetUser.name}`);
        } catch (error) {
            console.error('Error forwarding message:', error);
        }
    };

    const handleMessageLongPress = (item: Message) => {
        setSelectedMessage(item);
        setOptionsModalVisible(true);
    };

    const handleReplyOption = () => {
        if (selectedMessage) {
            setReplyingTo(selectedMessage);
            setOptionsModalVisible(false);
        }
    };

    const handleForwardOption = () => {
        if (selectedMessage) {
            setOptionsModalVisible(false);
            // Small delay to ensure smooth transition between modals
            setTimeout(() => openForwardModal(selectedMessage), 300);
        }
    };

    const handleDeleteOption = () => {
        if (selectedMessage) {
            setOptionsModalVisible(false);
            setTimeout(() => handleDeleteMessage(selectedMessage.id), 300);
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
        <TouchableOpacity
            style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.otherMessage]}
            onLongPress={() => handleMessageLongPress(item)}
            activeOpacity={0.9}
        >
            <View
                style={[
                    styles.messageBubble,
                    item.isMe ? styles.myBubble : styles.otherBubble,
                    item.id === highlightedMessageId && styles.highlightedMessage
                ]}
            >
                {item.forwarded && (
                    <Text style={[
                        styles.forwardedText,
                        item.isMe ? styles.myForwardedText : styles.otherForwardedText
                    ]}>
                        Forwarded
                    </Text>
                )}

                {item.replyTo && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => scrollToMessage(item.replyTo!.id)}

                    >
                        <View style={[
                            styles.replyContainer,
                            item.isMe ? styles.myReplyContainer : styles.otherReplyContainer
                        ]}>
                            <Text style={[styles.replySender, item.isMe ? styles.myReplySender : styles.otherReplySender]} numberOfLines={1}>
                                {item.replyTo.senderId === currentUserId
                                    ? 'You'
                                    : (item.replyTo.senderId === userId ? userName : (item.replyTo.senderName || 'User'))}
                            </Text>
                            <Text style={[styles.replyText, item.isMe ? styles.myReplyText : styles.otherReplyText]} numberOfLines={1}>
                                {item.replyTo.text}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
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
        </TouchableOpacity>
    );


    const openForwardModal = (msg: Message) => {
        setForwardMessage(msg);
        setForwardModalVisible(true);
    };

    return {
        messages,
        newMessage,
        setNewMessage,
        loading: false,
        typing,
        handleSend,
        updateTypingStatus,
        renderMessage,
        isOnline,
        userName,
        userAvatar,
        handleGoBack: () => navigation.goBack(),
        flatListRef,
        replyingTo,
        setReplyingTo,
        deleteModalVisible,
        setDeleteModalVisible,
        confirmDeleteMessage,
        currentUserId,
        userId,
        highlightedMessageId,
        setHighlightedMessageId,
        scrollToMessage,
        forwardModalVisible,
        setForwardModalVisible,
        forwardUsers,
        handleForwardMessage,
        openForwardModal,
        optionsModalVisible,
        setOptionsModalVisible,
        selectedMessage,
        handleReplyOption,
        handleForwardOption,
        handleDeleteOption
    }
}

export default ViewModal;
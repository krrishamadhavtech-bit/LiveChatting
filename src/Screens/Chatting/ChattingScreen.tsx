// screens/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { styles } from './Chatting.style';
import ViewModal from './Chatting.ViewModal';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import CustomModal from '../../components/CustomModal';
import UserSelectionModal from '../../components/UserSelectionModal';
import MessageOptionsModal from '../../components/MessageOptionsModal';

const ChatScreen = () => {
    const {
        messages,
        newMessage,
        setNewMessage,
        typing,
        handleSend,
        updateTypingStatus,
        renderMessage,
        userName,
        userAvatar,
        isOnline,
        handleGoBack,
        flatListRef,
        replyingTo,
        setReplyingTo,
        deleteModalVisible,
        setDeleteModalVisible,
        confirmDeleteMessage,
        currentUserId,
        userId,
        forwardModalVisible,
        setForwardModalVisible,
        forwardUsers,
        handleForwardMessage,
        optionsModalVisible,
        setOptionsModalVisible,
        selectedMessage,
        handleReplyOption,
        handleForwardOption,
        handleDeleteOption
    } = ViewModal();

    const isTypingRef = useRef(false);
    const typingTimeoutRef = useRef<any>(null);

    const handleTextChange = (text: string) => {
        setNewMessage(text);

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            updateTypingStatus(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            updateTypingStatus(false);
        }, 2000);
    };

    const renderSwipeableMessage = ({ item }: { item: any }) => {
        let swipeableRef: any = null;

        const renderLeftActions = () => {
            return (
                <View style={{ width: 60, justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name="arrow-undo" size={24} color={COLORS.primary} style={{ transform: [{ scaleX: -1 }] }} />
                </View>
            );
        };

        return (
            <Swipeable
                ref={(ref) => { swipeableRef = ref; }}
                renderLeftActions={renderLeftActions}
                onSwipeableWillOpen={() => {
                    setReplyingTo(item);
                    swipeableRef?.close();
                }}
            >
                {renderMessage({ item })}
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <Icon name="chevron-back" size={28} color={COLORS.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerInfo}>
                    <Image
                        source={{ uri: userAvatar }}
                        style={styles.headerAvatar}
                        defaultSource={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.headerName}>{userName}</Text>
                        <Text style={[styles.headerStatus, { color: typing ? COLORS.primary : isOnline ? COLORS.secondary : COLORS.textTertiary }]}>
                            {typing ? 'typing...' : isOnline ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            <GestureHandlerRootView style={{ flex: 1 }}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderSwipeableMessage}
                    keyExtractor={item => item.id}
                    style={styles.messagesList}
                    contentContainerStyle={[styles.messagesContent, { flexGrow: 1 }]}
                    showsVerticalScrollIndicator={false}
                    inverted
                    onScrollToIndexFailed={info => {
                        const wait = new Promise(resolve => setTimeout(resolve as any, 500));
                        wait.then(() => {
                            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                        });
                    }}
                    ListHeaderComponent={
                        typing ? (
                            <View style={styles.typingIndicator}>
                                <Text style={styles.typingText}>typing...</Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="chatbubbles-outline" size={80} color={COLORS.disabled} />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Start a conversation!</Text>
                        </View>
                    }
                />
            </GestureHandlerRootView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                {replyingTo && (
                    <View style={styles.inputReplyContainer}>
                        <View style={styles.replyPreviewContent}>
                            <Text style={styles.replySender} numberOfLines={1}>
                                {replyingTo.senderId === currentUserId
                                    ? 'You'
                                    : (replyingTo.senderId === userId ? userName : (replyingTo.senderName || 'User'))}
                            </Text>
                            <Text style={styles.replyText} numberOfLines={1}>
                                {replyingTo.text}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeReplyButton}
                            onPress={() => setReplyingTo(null)}
                        >
                            <Icon name="close-circle" size={20} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            placeholderTextColor={COLORS.textTertiary}
                            value={newMessage}
                            onChangeText={handleTextChange}
                            multiline
                            maxLength={500}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!newMessage.trim()}
                    >
                        <Icon name="send" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <CustomModal
                visible={deleteModalVisible}
                title="Delete Message"
                message="Are you sure you want to delete this message? This action cannot be undone."
                onConfirm={confirmDeleteMessage}
                onCancel={() => setDeleteModalVisible(false)}
                confirmText="Delete"
            />

            <UserSelectionModal
                visible={forwardModalVisible}
                users={forwardUsers}
                onClose={() => setForwardModalVisible(false)}
                onSelectUser={handleForwardMessage}
            />

            <MessageOptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                onReply={handleReplyOption}
                onForward={handleForwardOption}
                onDelete={handleDeleteOption}
                isMe={selectedMessage?.isMe || false}
            />
        </SafeAreaView>
    );
};

export default ChatScreen;
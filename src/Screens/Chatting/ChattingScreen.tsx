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
    ActivityIndicator,
} from 'react-native';
import { styles } from './Chatting.style';
import ViewModal from './Chatting.ViewModal';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatScreen = () => {
    const {
        messages,
        newMessage,
        setNewMessage,
        loading,
        typing,
        handleSend,
        updateTypingStatus, // ✅ Added
        renderMessage,
        userName,
        userAvatar,
        isOnline,
        handleGoBack,
        flatListRef,
    } = ViewModal();

    const isTypingRef = useRef(false);
    const typingTimeoutRef = useRef<any>(null);

    const handleTextChange = (text: string) => {
        setNewMessage(text);

        // Update typing status only if not already typing
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            updateTypingStatus(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to clear typing status after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            updateTypingStatus(false);
        }, 2000);
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
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                inverted
                ListEmptyComponent={
                    <View style={[styles.emptyContainer, { transform: [{ scaleY: -1 }] }]}>
                        <Icon name="chatbubbles-outline" size={80} color={COLORS.disabled} />
                        <Text style={styles.emptyText}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>Start a conversation!</Text>
                    </View>
                }
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
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
        </SafeAreaView>
    );
};



export default ChatScreen;
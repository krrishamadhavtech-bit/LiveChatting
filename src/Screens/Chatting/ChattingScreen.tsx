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
    Animated,
    Easing,
} from 'react-native';
import { styles } from './style';
import ViewModal from './Chatting.ViewModal';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import CustomModal from '../../components/CustomModal';
import UserSelectionModal from '../../components/UserSelectionModal';
import MessageOptionsModal from '../../components/MessageOptionsModal';
import { wpx, hpx, getFontSize } from '../../utils/responsive';

const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};

const AudioMessageBubble = ({
    item,
    playingState,
    playAudio,
}: {
    item: any;
    playingState: any;
    playAudio: (url: string, id: string) => void;
}) => {
    const isThisPlaying = playingState.messageId === item.id && playingState.isPlaying;
    const progressFraction =
        playingState.messageId === item.id && playingState.durationMs > 0
            ? playingState.currentMs / playingState.durationMs
            : 0;

    const displayDuration =
        playingState.messageId === item.id && playingState.durationMs > 0
            ? Math.round(playingState.durationMs / 1000)
            : item.audioDuration || 0;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={styles.audioRow}
            onPress={() => item.audioUrl && playAudio(item.audioUrl, item.id)}
        >
            <View style={[styles.audioPlayBtn, item.isMe ? styles.audioPlayBtnMe : styles.audioPlayBtnOther]}>
                <Icon
                    name={isThisPlaying ? 'pause' : 'play'}
                    size={18}
                    color={COLORS.white}
                />
            </View>

            <View style={styles.audioWaveform}>
                {/* Simple progress bar */}
                <View style={styles.audioProgressTrack}>
                    <View
                        style={[
                            styles.audioProgressFill,
                            item.isMe ? styles.audioProgressFillMe : styles.audioProgressFillOther,
                            { width: `${progressFraction * 100}%` },
                        ]}
                    />
                </View>
                <Text style={[styles.audioDuration, item.isMe ? styles.audioDurationMe : styles.audioDurationOther]}>
                    {formatDuration(displayDuration)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

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
        handleDeleteOption,
        handleCall,
        // Audio
        isRecording,
        recordingDuration,
        isUploadingAudio,
        playingState,
        handleStartRecording,
        handleStopAndSendAudio,
        handleCancelRecording,
        playAudio,
    } = ViewModal();

    const isTypingRef = useRef(false);
    const typingTimeoutRef = useRef<any>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Mic pulse animation while recording
    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [isRecording]);

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
                <View style={styles.renderSwiper}>
                    <Icon name="arrow-undo" size={24} color={COLORS.primary} style={styles.flipIcon} />
                </View>
            );
        };

        // ── Audio message bubble ────────────────────────────────────────────────
        if (item.type === 'audio') {
            return (
                <View style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.otherMessage]}>
                    <View style={[styles.messageBubble, item.isMe ? styles.myBubble : styles.otherBubble]}>
                        <AudioMessageBubble item={item} playingState={playingState} playAudio={playAudio} />
                        <View style={styles.messageFooter}>
                            <Text style={[styles.timestamp, item.isMe ? styles.myTimestamp : styles.otherTimestamp]}>
                                {item.timestamp?.toDate
                                    ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : '--:--'}
                            </Text>
                            {item.isMe && (
                                <Icon
                                    name={item.read ? 'checkmark-done' : 'checkmark'}
                                    size={16}
                                    color={!item.read ? COLORS.overlay : COLORS.online}
                                    style={styles.statusCheckmark}
                                />
                            )}
                        </View>
                    </View>
                </View>
            );
        }

        // ── Normal (text / call) message ────────────────────────────────────────
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

    // ── Recording duration label (mm:ss) ───────────────────────────────────────
    const recordingLabel = formatDuration(Math.floor(recordingDuration / 1000));

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
                        <Text style={[styles.headerStatus, typing ? styles.typingStatus : isOnline ? styles.onlineStatus : styles.offlineStatus]}>
                            {typing ? 'typing...' : isOnline ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleCall}>
                    <Icon name="call" size={25} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            <GestureHandlerRootView style={styles.headerText}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderSwipeableMessage}
                    keyExtractor={item => item.id}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
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

                {/* ── Recording bar (shown while recording) ── */}
                {isRecording && (
                    <View style={styles.recordingBar}>
                        <TouchableOpacity onPress={handleCancelRecording} style={styles.cancelRecordBtn}>
                            <Icon name="trash-outline" size={22} color={COLORS.error || '#FF4444'} />
                        </TouchableOpacity>
                        <Animated.View style={[styles.micPulse, { transform: [{ scale: pulseAnim }] }]}>
                            <Icon name="mic" size={18} color={COLORS.white} />
                        </Animated.View>
                        <Text style={styles.recordingTimer}>{recordingLabel}</Text>
                        <Text style={styles.recordingHint}>Release ✓ to send</Text>
                        <TouchableOpacity onPress={handleStopAndSendAudio} style={styles.sendRecordBtn}>
                            <Icon name="checkmark-circle" size={36} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Uploading indicator ── */}
                {isUploadingAudio && !isRecording && (
                    <View style={styles.uploadingBar}>
                        <Icon name="cloud-upload-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.uploadingText}>Sending voice message…</Text>
                    </View>
                )}

                {/* ── Normal input row (hide when recording) ── */}
                {!isRecording && (
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

                        {/* Show SEND button if there's text, else show MIC button */}
                        {newMessage.trim() ? (
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={handleSend}
                            >
                                <Icon name="send" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.micButton}
                                onPress={handleStartRecording}
                                disabled={isUploadingAudio}
                            >
                                <Icon
                                    name="mic"
                                    size={24}
                                    color={isUploadingAudio ? COLORS.disabled : COLORS.white}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
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
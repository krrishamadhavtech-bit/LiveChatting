import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './style';
import useCallingViewModal from './Calling.ViewModal';
import { COLORS } from '../../constants/colors';
import { hp } from '../../utils/responsive';

const CallScreen = ({ route, navigation }: any) => {
    const { userName, userAvatar, isCaller } = route.params || {};
    const {
        remoteStream,
        localStream,
        callConnected,
        formattedDuration,
        callStatus,
        isMuted,
        isSpeakerOn,
        acceptCall,
        endCall,
        toggleMute,
        toggleSpeaker,
        otherUserData,
    } = useCallingViewModal({ route, navigation });

    const displayUserName = userName || otherUserData?.name || 'Unknown';
    const displayUserAvatar = userAvatar || otherUserData?.profileImage;

    const isIncomingCall = !isCaller && callStatus === "calling";

    return (
        <View
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />

            {/* Top Section */}
            <View style={styles.topSection}>
                <Text style={styles.callingText}>
                    {callStatus === 'accepted' ? formattedDuration : (isIncomingCall ? "Incoming Voice Call..." : "Connecting...")}
                </Text>
            </View>

            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
                <View style={styles.pulseCircle} />
                {displayUserAvatar ? (
                    <Image source={{ uri: displayUserAvatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: COLORS.disabled, justifyContent: 'center', alignItems: 'center' }]}>
                        <Icon name="person" size={60} color={COLORS.white} />
                    </View>
                )}
                <Text style={styles.userName}>{displayUserName}</Text>
            </View>

            {/* Bottom Controls */}
            <View style={styles.controlsContainer}>
                {isIncomingCall ? (
                    <>
                        <TouchableOpacity onPress={endCall} style={styles.endCallButton}>
                            <Icon name="close" size={32} color={COLORS.white} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={acceptCall} style={styles.acceptCallButton}>
                            <Icon name="call" size={32} color={COLORS.white} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={{ width: '100%', gap: hp(3) }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>
                            <TouchableOpacity
                                onPress={toggleMute}
                                style={[styles.iconButton, isMuted && styles.activeIconButton]}
                            >
                                <Icon
                                    name={isMuted ? "mic-off" : "mic"}
                                    size={24}
                                    color={isMuted ? COLORS.black : COLORS.white}
                                />
                                <Text style={{ color: COLORS.white, fontSize: 10, marginTop: 4 }}>Mute</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={toggleSpeaker}
                                style={[styles.iconButton, isSpeakerOn && styles.activeIconButton]}
                            >
                                <Icon
                                    name={isSpeakerOn ? "volume-high" : "volume-low"}
                                    size={24}
                                    color={isSpeakerOn ? COLORS.black : COLORS.white}
                                />
                                <Text style={{ color: COLORS.white, fontSize: 10, marginTop: 4 }}>Speaker</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity onPress={endCall} style={styles.endCallButton}>
                                <Icon name="call" size={28} color={COLORS.white} style={{ transform: [{ rotate: '135deg' }] }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

export default CallScreen;
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
    } = useCallingViewModal({ route, navigation });

    const isIncomingCall = !isCaller && callStatus === "calling";

    return (
        <View
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />

            {/* Top Section */}
            <View style={styles.topSection}>
                <Text style={styles.callingText}>
                    {callConnected ? formattedDuration : (isIncomingCall ? "Incoming Voice Call..." : "Connecting...")}
                </Text>
            </View>

            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
                <View style={styles.pulseCircle} />
                <Image source={{ uri: userAvatar }} style={styles.avatar} />
                <Text style={styles.userName}>{userName}</Text>
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
                    <>
                        <TouchableOpacity
                            onPress={toggleMute}
                            style={[styles.iconButton, isMuted && styles.activeIconButton]}
                        >
                            <Icon
                                name={isMuted ? "mic-off" : "mic"}
                                size={24}
                                color={isMuted ? COLORS.black : COLORS.white}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={endCall} style={styles.endCallButton}>
                            <Icon name="call" size={28} color={COLORS.white} />
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
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

export default CallScreen;
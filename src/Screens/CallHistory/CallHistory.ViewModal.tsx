import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './style';

const ViewModal = () => {
    const [calls, setCalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();
    const currentUser = auth().currentUser;

    useEffect(() => {
        if (!currentUser) return;

        // Listen for calls where user is either caller or receiver
        const unsubscribe = firestore()
            .collection('calls')
            .where('participants', 'array-contains', currentUser.uid)
            .onSnapshot(async (snapshot) => {
                if (!snapshot) return;

                let callData = await Promise.all(snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const otherUserId = data.callerId === currentUser.uid ? data.receiverId : data.callerId;

                    // Fetch other user profile
                    const userDoc = await firestore().collection('users').doc(otherUserId).get();
                    const userData = userDoc.data();

                    return {
                        id: doc.id,
                        ...data,
                        otherUserName: userData?.name || 'Unknown',
                        isOutgoing: data.callerId === currentUser.uid,
                        timestamp: data.createdAt?.toDate() || new Date(),
                    };
                }));

                // Sort manually by time (newest first)
                callData.sort((a, b) => b.timestamp - a.timestamp);

                setCalls(callData);
                setLoading(false);
            }, (error) => {
                console.error("History Error:", error);
                setLoading(false);
            });

        return () => unsubscribe();
    }, [currentUser]);

    const handleCallAgain = (userId: string) => {
        navigation.navigate('ChattingScreen', { userId });
    };


    const renderCallItem = ({ item }: { item: any }) => (
        <View style={styles.callItem}>
            <View style={styles.iconContainer}>
                <Icon
                    name={item.isOutgoing ? "arrow-up-outline" : "arrow-down-outline"}
                    size={13}
                    style={[
                        styles.historyIcon,
                        !item.isAccepted ? styles.statusError : (item.isOutgoing ? styles.statusPrimary : styles.statusSecondary)
                    ]}
                />
            </View>

            <View style={styles.callInfo}>
                <Text style={styles.userName}>{item.otherUserName}</Text>
                <Text style={styles.timeText}>
                    {item.timestamp.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>

            <TouchableOpacity style={styles.callButton}>
                <Icon
                    name="call-outline"
                    size={17}
                    color={!item.isAccepted ? COLORS.error : (item.status === 'ended' ? COLORS.textSecondary : COLORS.online)}
                />
            </TouchableOpacity>
        </View>
    );


    return {
        renderCallItem,
        calls,
        loading,
        handleCallAgain,
    }
};


export default ViewModal;

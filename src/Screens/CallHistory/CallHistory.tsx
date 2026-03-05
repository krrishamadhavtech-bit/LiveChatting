import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './style';
import ViewModal from './CallHistory.ViewModal';

const CallHistory = () => {
    const {
        renderCallItem,
        calls,
        loading,
    } = ViewModal();

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Call History</Text>
            </View>
            <FlatList
                data={calls}
                renderItem={renderCallItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Icon name="call-outline" size={64} color={COLORS.disabled} />
                        <Text style={styles.emptyText}>No recent calls</Text>
                    </View>
                }
            />
        </View>
    );
};



export default CallHistory;

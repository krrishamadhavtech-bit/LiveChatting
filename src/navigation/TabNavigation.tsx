import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PagerView from 'react-native-pager-view';
import DashboardScreen from '../Screens/Dashboard/Dashboard';
import CallHistory from '../Screens/CallHistory/CallHistory';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';
import { styles } from './TabNavigation.style';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    const pagerRef = useRef<PagerView>(null);
    const [activeTab, setActiveTab] = useState(0);

    // Sync Bottom Tab with Pager
    const onPageSelected = (e: any) => {
        setActiveTab(e.nativeEvent.position);
    };

    const handleTabPress = (index: number) => {
        setActiveTab(index);
        pagerRef.current?.setPage(index);
    };

    return (
        <View style={styles.container}>
            {/* Pager handles the sliding screens */}
            <PagerView
                ref={pagerRef}
                style={styles.container}
                initialPage={0}
                onPageSelected={onPageSelected}
            >
                <View key="1" style={styles.container}>
                    <DashboardScreen />
                </View>
                <View key="2" style={styles.container}>
                    <CallHistory />
                </View>
            </PagerView>

            {/* Swipeable Bottom Tab Custom UI */}
            <View style={styles.bottomTab}>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => handleTabPress(0)}
                >
                    <Icon
                        name={activeTab === 0 ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                        size={22}
                        color={activeTab === 0 ? COLORS.primary : COLORS.textTertiary}
                    />
                    <Text style={[styles.tabText, activeTab === 0 ? styles.activeTabText : null]}>
                        Chats
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => handleTabPress(1)}
                >
                    <Icon
                        name={activeTab === 1 ? "call" : "call-outline"}
                        size={22}
                        color={activeTab === 1 ? COLORS.primary : COLORS.textTertiary}
                    />
                    <Text style={[styles.tabText, activeTab === 1 ? styles.activeTabText : null]}>
                        Calls
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default MainTabNavigator;


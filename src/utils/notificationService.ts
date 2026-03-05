import { Platform } from 'react-native';
import * as GlobalNavigation from './navigation';

// ─── Android: Notifee Full Screen Intent ──────────────────────────────────────
let notifee: any = null;
let AndroidImportance: any = null;
let AndroidCategory: any = null;

if (Platform.OS === 'android') {
    try {
        const notifeeModule = require('@notifee/react-native');
        notifee = notifeeModule.default;
        AndroidImportance = notifeeModule.AndroidImportance;
        AndroidCategory = notifeeModule.AndroidCategory;
    } catch (e) {
        console.warn('Notifee not available:', e);
    }
}

// ─── Show Incoming Call Notification ──────────────────────────────────────────
export async function showIncomingCallNotification(callId: string, callerName: string) {
    if (Platform.OS === 'android' && notifee) {
        try {
            const channelId = await notifee.createChannel({
                id: 'incoming_call',
                name: 'Incoming Calls',
                importance: AndroidImportance.HIGH,
                sound: 'default',
                vibration: true,
            });

            await notifee.displayNotification({
                title: '📞 Incoming Voice Call',
                body: `${callerName} is calling...`,
                android: {
                    channelId,
                    category: AndroidCategory.CALL,
                    importance: AndroidImportance.HIGH,
                    fullScreenAction: {
                        id: 'incoming_call',
                        launchActivity: 'default',
                    },
                    pressAction: {
                        id: 'default',
                        launchActivity: 'default',
                    },
                    actions: [
                        { title: '✅ Answer', pressAction: { id: 'answer', launchActivity: 'default' } },
                        { title: '❌ Decline', pressAction: { id: 'decline' } },
                    ],
                },
                data: { callId },
            });

            console.log('Android: Full Screen Intent shown for', callId);
        } catch (e) {
            console.error('Android Notification error:', e);
        }
    } else if (Platform.OS === 'ios') {
        // iOS: CallKit/callkeep is disabled — navigation is handled directly in App.tsx
        console.log('iOS: Skipping CallKit notification for', callId);
    }
}

// ─── Cancel Notification / End CallKit ────────────────────────────────────────
export async function cancelCallNotification(callId?: string) {
    if (Platform.OS === 'android' && notifee) {
        try {
            await notifee.cancelAllNotifications();
        } catch (e) { }
    } else if (Platform.OS === 'ios') {
        // iOS: CallKit/callkeep disabled — nothing to cancel
    }
}

// ─── Setup Notification Action Handlers ───────────────────────────────────────
export function setupNotificationHandlers(navigation: any) {
    if (Platform.OS === 'android' && notifee) {
        // 1. Handle background-to-foreground transitions (Foreground Events)
        notifee.onForegroundEvent(({ type, detail }: any) => {
            // EventType 2 = ACTION_PRESS
            if (detail.pressAction && (type === 2 || type === 1)) {
                const callId = detail.notification?.data?.callId as string;
                if (detail.pressAction.id === 'answer' && callId) {
                    GlobalNavigation.navigate('CallScreen', { callId, isCaller: false });
                } else if (detail.pressAction.id === 'decline' && callId) {
                    const firestore = require('@react-native-firebase/firestore').default;
                    firestore().collection('calls').doc(callId).update({ status: 'ended' });
                    cancelCallNotification(callId);
                }
            }
        });

        // 2. Handle initial notification when the app is launched from a killed state
        notifee.getInitialNotification().then((notification: any) => {
            if (notification && notification.pressAction?.id === 'answer') {
                const callId = notification.notification?.data?.callId as string;
                if (callId) {
                    // Small delay to ensure navigation is ready after boot
                    setTimeout(() => {
                        GlobalNavigation.navigate('CallScreen', { callId, isCaller: false });
                    }, 500);
                }
            }
        });
    } else if (Platform.OS === 'ios') {
        // iOS: CallKit/callkeep disabled — no notification action handlers needed
    }
}

// ─── Request Permissions ───────────────────────────────────────────────────────
export async function requestNotificationPermission() {
    if (Platform.OS === 'android' && notifee) {
        await notifee.requestPermission();
    }
    // iOS permissions are handled automatically by CallKit
}

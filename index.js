/**
 * @format
 */
import { AppRegistry, Platform } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import App from './App';
import { name as appName } from './app.json';

// --- Background Call Handler ---
// This must be at the root level so Android can handle button clicks (Answer/Decline)
// even if the app process is closed or killed.
if (Platform.OS === 'android') {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        const { notification, pressAction } = detail;
        const callId = notification?.data?.callId;

        if (type === EventType.ACTION_PRESS && callId) {
            if (pressAction.id === 'answer') {
                // If Answered, App will open because of launchActivity: 'foreground'
                // and the foreground listener picks up navigation.
                await notifee.cancelNotification(notification.id);
            } else if (pressAction.id === 'decline') {
                // If Declined, update Firestore immediately in the background
                await firestore().collection('calls').doc(callId).update({ status: 'ended' });
                await notifee.cancelNotification(notification.id);
            }
        }
    });
}

AppRegistry.registerComponent(appName, () => App);


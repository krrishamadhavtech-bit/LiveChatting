import { StyleSheet, ActivityIndicator, View, ScrollView, AppState } from 'react-native';
import StackNavigation from './src/navigation/StackNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './src/store/store';
import { restoreSession } from './src/store/authSlice';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './src/constants/colors';
import { navigationRef } from './src/utils/navigation';
import * as GlobalNavigation from './src/utils/navigation';
import { showIncomingCallNotification, cancelCallNotification, setupNotificationHandlers, requestNotificationPermission } from './src/utils/notificationService';

function AppContent() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const activeCallIds = useRef(new Set<string>());

  const isCallScreenActive = (state: any, targetCallId: string): boolean => {
    if (!state) return false;
    const route = state.routes[state.index];
    if (route.name === 'CallScreen' && route.params?.callId === targetCallId) return true;
    if (route.state) return isCallScreenActive(route.state, targetCallId);
    return false;
  };

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const unsubscribe = auth().onAuthStateChanged(async (user) => {
          if (user) {
            try {
              const savedUser = await AsyncStorage.getItem('persistedUser');
              if (savedUser) {
                dispatch(restoreSession(JSON.parse(savedUser)));
              }
            } catch (error) {
              console.error('Error restoring session:', error);
            }
          }
          setIsCheckingAuth(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth state check error:', error);
        setIsCheckingAuth(false);
      }
    };

    const unsubscribe = checkAuthState();
    return () => {
      unsubscribe?.then((fn) => fn?.());
    };
  }, [dispatch]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: any) => {
      const user = auth().currentUser;
      if (user) {
        const userRef = firestore().collection('users').doc(user.uid);

        if (nextAppState === 'active') {
          await userRef.set({
            isOnline: true,
            lastSeen: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        } else {
          await userRef.set({
            isOnline: false,
            lastSeen: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      }
    };

    if (auth().currentUser) {
      handleAppStateChange('active');
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      const user = auth().currentUser;
      if (user) {
        firestore().collection('users').doc(user.uid).update({
          isOnline: false,
          lastSeen: firestore.FieldValue.serverTimestamp(),
        }).catch(err => console.log('Error setting offline:', err));
      }
    };
  }, [isLoggedIn]);

  // --- Global Incoming Call Listener ---
  // Uses Notifee Full Screen Intent to wake up the screen even in background
  useEffect(() => {
    if (!isLoggedIn) return;

    const user = auth().currentUser;
    if (!user) return;

    // Request notification permission (Android 13+ / iOS)
    requestNotificationPermission();

    // Setup action handlers (Answer / Decline buttons on notification)
    setupNotificationHandlers(GlobalNavigation);

    console.log("Global Call Listener: Active for", user.uid);

    const unsubscribe = firestore()
      .collection('calls')
      .where('receiverId', '==', user.uid)
      .where('status', '==', 'calling')
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
          const callData = change.doc.data();
          const callId = change.doc.id;

          // incoming call detection: 
          // 1. Must be 'calling' status
          // 2. I must not be the caller
          // 3. Haven't notified for this callId in this session yet
          const isNewIncoming = callData.status === 'calling' &&
            callData.callerId !== user.uid &&
            !activeCallIds.current.has(callId);

          if (isNewIncoming) {
            activeCallIds.current.add(callId);
            console.log("Global Call Listener: New incoming call detected", callId);

            // Fetch caller details for the notification banner and screen
            let callerName = 'Unknown';
            let callerAvatar = null;
            try {
              const callerDoc = await firestore().collection('users').doc(callData.callerId).get();
              const callerData = callerDoc.data();
              callerName = callerData?.name || 'Unknown';
              callerAvatar = callerData?.profileImage || null;
            } catch (e) { }

            // Show Full Screen Intent — this wakes up the screen in background!
            await showIncomingCallNotification(callId, callerName);

            // Also navigate directly (works when app is already in foreground)
            if (GlobalNavigation.navigationRef.isReady()) {
              const state = GlobalNavigation.navigationRef.getRootState();
              if (!isCallScreenActive(state, callId)) {
                GlobalNavigation.navigate('CallScreen', {
                  callId,
                  isCaller: false,
                  userName: callerName,
                  userAvatar: callerAvatar
                });
              }
            }
          }

          if (change.type === 'modified' && callData.status !== 'calling') {
            if (activeCallIds.current.has(callId)) {
              activeCallIds.current.delete(callId);
              cancelCallNotification();
            }
          }

          if (change.type === 'removed') {
            activeCallIds.current.delete(callId);
            cancelCallNotification();
          }
        });
      }, (error) => {
        console.error("Global Call Listener Error:", error);
      });

    return () => {
      console.log("Global Call Listener: Stopped");
      unsubscribe();
    };
  }, [isLoggedIn]);

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StackNavigation />
    </NavigationContainer>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
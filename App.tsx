import { StyleSheet, ActivityIndicator, View, ScrollView, AppState } from 'react-native';
import StackNavigation from './src/navigation/StackNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './src/store/store';
import { restoreSession } from './src/store/authSlice';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './src/constants/colors';

function AppContent() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
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
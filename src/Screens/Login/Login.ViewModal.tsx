import { Alert } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUser, setError, setLoading as setReduxLoading } from '../../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password required');
      return;
    }

    setLoading(true);
    dispatch(setReduxLoading(true));
    
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );

      const uid = userCredential.user.uid;
      const userEmail = userCredential.user.email || '';

      // 🔥 Update online status
      await firestore().collection('users').doc(uid).update({
        isOnline: true,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      });

      // 💾 Save user data to AsyncStorage for persistence
      const userData = {
        uid,
        email: userEmail,
        name: userCredential.user.displayName || 'User',
      };

      await AsyncStorage.setItem('persistedUser', JSON.stringify(userData));

      // 🔴 Dispatch to Redux store
      dispatch(setUser(userData));

      navigation.navigate('DashboardScreen' as never);
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
      dispatch(setError(error.message));
    } finally {
      setLoading(false);
      dispatch(setReduxLoading(false));
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup' as never);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Enter email first');
      return;
    }

    await auth().sendPasswordResetEmail(email);
    Alert.alert('Success', 'Password reset email sent');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
    handleSignup,
    handleForgotPassword,
    showPassword,
    setShowPassword,
  };
};

export default ViewModal;

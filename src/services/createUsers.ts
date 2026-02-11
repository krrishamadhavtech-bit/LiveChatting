import firestore from '@react-native-firebase/firestore';

export const createUserIfNotExists = async (user: any) => {
  const userRef = firestore().collection('users').doc(user.uid);
  const snap = await userRef.get();

  if (!snap.exists()) {
    await userRef.set({
      name: user.displayName || 'User',
      email: user.email,
      avatar:
        user.photoURL ||
        'https://ui-avatars.com/api/?name=' + user.displayName,
      online: true,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  }
};

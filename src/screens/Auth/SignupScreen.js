// src/screens/Auth/SignupScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE_CONSOLE',
});

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSignup = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    auth().createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        // After signup, create a user document in Firestore
        firestore().collection('users').doc(userCredential.user.uid).set({
          email: userCredential.user.email,
          role: 'user', // Default role
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        Alert.alert('Signup Error', error.message);
      });
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const { user } = await auth().signInWithCredential(googleCredential);
      
      // Create user document in Firestore if it doesn't exist
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        await firestore().collection('users').doc(user.uid).set({
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      Alert.alert('Google Sign-Up Error', error.toString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {loading ? <ActivityIndicator size="large" color="#007bff" /> : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleSignIn}>
            <Text style={styles.buttonText}>Sign Up with Google</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Reusing styles from LoginScreen
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15, backgroundColor: '#fff' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', width: '100%', marginBottom: 10 },
  googleButton: { backgroundColor: '#db4437' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#007bff', marginTop: 15 },
});

export default SignupScreen;

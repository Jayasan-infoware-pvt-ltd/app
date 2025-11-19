// src/screens/Auth/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE_CONSOLE', // From Google Cloud Console
});

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = () => {
    // Special case for hardcoded owner
    if (email === 'admin' && password === 'admin0987') {
      // This is a temporary bypass. In a real app, use Firebase Auth.
      Alert.alert('Success', 'Logged in as Owner');
      // You might want to set a special user object here if not using Firebase for owner
      return;
    }

    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        Alert.alert('Login Error', error.message);
      });
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      Alert.alert('Google Sign-In Error', error.toString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {loading ? <ActivityIndicator size="large" color="#007bff" /> : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleSignIn}>
            <Text style={styles.buttonText}>Login with Google</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15, backgroundColor: '#fff' },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', width: '100%', marginBottom: 10 },
  googleButton: { backgroundColor: '#db4437' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#007bff', marginTop: 15 },
});

export default LoginScreen;

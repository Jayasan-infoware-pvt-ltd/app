// src/screens/App/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({ route }) => {
  const { user } = route.params; // Get user passed from navigator
  const [userData, setUserData] = useState({ stateName: '', departmentName: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        setUserData(userDoc.data());
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    await firestore().collection('users').doc(user.uid).update(userData);
    Alert.alert('Success', 'Profile Updated');
    setIsEditing(false);
  };

  const handleLogout = () => {
    auth().signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }} style={styles.avatar} />
        <Text style={styles.name}>{userData.displayName || user.email}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>Role: {userData.role || 'user'}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.label}>State Name</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={userData.stateName} onChangeText={text => setUserData({...userData, stateName: text})} />
        ) : (
          <Text style={styles.value}>{userData.stateName || 'Not Set'}</Text>
        )}

        <Text style={styles.label}>Department Name</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={userData.departmentName} onChangeText={text => setUserData({...userData, departmentName: text})} />
        ) : (
          <Text style={styles.value}>{userData.departmentName || 'Not Set'}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsEditing(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Icon name="logout" size={20} color="white" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  name: { fontSize: 22, fontWeight: 'bold' },
  email: { fontSize: 16, color: '#666' },
  role: { fontSize: 16, color: '#007bff', marginTop: 5 },
  detailsContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  value: { fontSize: 16, marginBottom: 15, color: '#555' },
  input: { fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 15, paddingVertical: 5 },
  buttonContainer: { marginTop: 'auto' },
  button: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 8, marginBottom: 10 },
  editButton: { backgroundColor: '#007bff' },
  saveButton: { backgroundColor: '#28a745' },
  cancelButton: { backgroundColor: '#6c757d' },
  logoutButton: { backgroundColor: '#dc3545' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default ProfileScreen;

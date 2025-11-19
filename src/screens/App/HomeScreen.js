// src/screens/App/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import TabNavigator from '../../navigation/TabNavigator';

const HomeScreen = ({ user }) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        setUserData(userDoc.data());
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: user.photoURL || 'https://via.placeholder.com/40' }} style={styles.profileImage} />
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Welcome back, {userData?.displayName || user.email}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications" size={28} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <TabNavigator user={user} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  welcomeText: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, marginLeft: 15 },
  content: { flex: 1 },
});

export default HomeScreen;

// src/screens/App/UsersScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import { firestore } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UsersScreen = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    const checkRole = async () => {
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        setUserRole(userDoc.data().role);
      }
      setLoading(false);
    };
    checkRole();
  }, [user]);

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'owner') {
      const unsubscribe = firestore().collection('users').onSnapshot(snapshot => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      });
      return () => unsubscribe();
    }
  }, [userRole]);

  if (loading) return <ActivityIndicator size="large" style={{flex: 1}} />;
  if (userRole !== 'admin' && userRole !== 'owner') {
    return <View style={styles.container}><Text>Access Denied</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Users</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Avatar.Image size={50} source={{ uri: item.photoURL || 'https://via.placeholder.com/50' }} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.displayName || item.email}</Text>
                <Text style={styles.userRole}>Role: {item.role}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#888" />
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { marginBottom: 10 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userRole: { fontSize: 14, color: '#666' },
});

export default UsersScreen;

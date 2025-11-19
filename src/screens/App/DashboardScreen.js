// src/screens/App/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { firestore } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DashboardScreen = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ totalUsers: 0, monthlySpending: 0, totalProducts: 0, userRole: 'user' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        const role = userDoc.exists ? userDoc.data().role : 'user';
        
        let totalUsers = 0;
        if (role === 'admin' || role === 'owner') {
          const usersSnapshot = await firestore().collection('users').get();
          totalUsers = usersSnapshot.size;
        }

        // This is a placeholder. Implement actual logic to calculate spending/products.
        const monthlySpending = 1250.50; 
        const totalProducts = 45;

        setData({ totalUsers, monthlySpending, totalProducts, userRole: role });
        setLoading(false);
      } catch (error) {
        console.error("Dashboard fetch error: ", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      {(data.userRole === 'admin' || data.userRole === 'owner') && (
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Icon name="people" size={30} color="#007bff" />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Total Users</Text>
              <Text style={styles.cardValue}>{data.totalUsers}</Text>
            </View>
          </View>
        </Card>
      )}
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <Icon name="account-balance-wallet" size={30} color="#28a745" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Monthly Spending</Text>
            <Text style={styles.cardValue}>${data.monthlySpending.toFixed(2)}</Text>
          </View>
        </View>
      </Card>
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <Icon name="inventory" size={30} color="#ffc107" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Total Products</Text>
            <Text style={styles.cardValue}>{data.totalProducts}</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { marginBottom: 15, elevation: 3 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  cardText: { marginLeft: 15 },
  cardTitle: { fontSize: 16, color: '#666' },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
});

export default DashboardScreen;

// src/screens/App/ExpenseScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import { firestore } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ExpenseScreen = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    const checkRole = async () => {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) setUserRole(userDoc.data().role);
    };
    checkRole();
    
    const unsubscribe = firestore().collection('expenses').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        const expensesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filteredExpenses = userRole !== 'admin' && userRole !== 'owner' 
            ? expensesList.filter(e => e.userId === user.uid)
            : expensesList;
        setExpenses(filteredExpenses);

        // Calculate monthly total for current user
        const now = new Date();
        const monthlyExpenses = expensesList
            .filter(e => e.userId === user.uid && e.createdAt.toDate().getMonth() === now.getMonth() && e.createdAt.toDate().getFullYear() === now.getFullYear())
            .reduce((sum, e) => sum + e.amount, 0);
        setMonthlyTotal(monthlyExpenses);
    });
    return () => unsubscribe();
  }, [user, userRole]);

  const addExpense = () => {
    if (!description || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    firestore().collection('expenses').add({
      description, amount: parseFloat(amount), userId: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    Alert.alert('Success', 'Expense added');
    setModalVisible(false);
    setDescription('');
    setAmount('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses</Text>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryText}>Your Monthly Total: ${monthlyTotal.toFixed(2)}</Text>
      </Card>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>
      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Avatar.Icon size={40} icon="account-balance-wallet" />
              <View style={styles.info}>
                <Text style={styles.expenseDesc}>{item.description}</Text>
                <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
                <Text style={styles.expenseUser}>{userRole === 'admin' || userRole === 'owner' ? `By: ${item.userId}` : ''}</Text>
              </View>
            </View>
          </Card>
        )}
      />
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>New Expense</Text>
          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
          <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <Button title="Submit" onPress={addExpense} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    summaryCard: { padding: 15, marginBottom: 15, backgroundColor: '#e9f7ef' },
    summaryText: { fontSize: 18, fontWeight: 'bold', color: '#28a745', textAlign: 'center' },
    addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#007bff', padding: 15, borderRadius: 8, marginBottom: 15 },
    addButtonText: { color: 'white', fontSize: 18, marginLeft: 10 },
    card: { marginBottom: 10 },
    cardContent: { flexDirection: 'row', padding: 15 },
    info: { flex: 1, marginLeft: 15 },
    expenseDesc: { fontSize: 18, fontWeight: 'bold' },
    expenseAmount: { fontSize: 16, color: '#dc3545' },
    expenseUser: { fontSize: 12, color: '#666' },
    modalView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 15, paddingHorizontal: 10 },
});

export default ExpenseScreen;

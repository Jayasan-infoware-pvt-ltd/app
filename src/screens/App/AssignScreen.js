// src/screens/App/AssignScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Card, Avatar, Button, Provider, Picker } from 'react-native-paper';
import { firestore } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AssignScreen = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    const checkRole = async () => {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) setUserRole(userDoc.data().role);
    };
    checkRole();
  }, [user]);

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'owner') {
      const unsubscribeProducts = firestore().collection('products').where('assignedTo', '==', null).onSnapshot(snapshot => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsubscribeUsers = firestore().collection('users').where('role', 'in', ['user', 'technician']).onSnapshot(snapshot => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => { unsubscribeProducts(); unsubscribeUsers(); };
    }
  }, [userRole]);

  const handleAssign = () => {
    if (!selectedProduct || !selectedUserId) {
      Alert.alert('Error', 'Please select a product and a user');
      return;
    }
    firestore().collection('products').doc(selectedProduct.id).update({
      assignedTo: selectedUserId,
      assignedAt: firestore.FieldValue.serverTimestamp(),
    }).then(() => {
      Alert.alert('Success', 'Product assigned');
      setModalVisible(false);
      setSelectedProduct(null);
      setSelectedUserId('');
    });
  };

  if (userRole !== 'admin' && userRole !== 'owner') {
    return <View style={styles.container}><Text>Access Denied</Text></View>;
  }

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.title}>Assign Products</Text>
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setSelectedProduct(item); setModalVisible(true); }}>
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <Avatar.Icon size={40} icon="inventory" />
                  <View style={styles.info}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>${item.price}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#888" />
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Assign Product</Text>
            {selectedProduct && <Text>Product: {selectedProduct.name}</Text>}
            <Picker
              selectedValue={selectedUserId}
              onValueChange={setSelectedUserId}
              enabled={!loading}
            >
              <Picker.Item label="Select a user" value="" />
              {users.map(u => <Picker.Item key={u.id} label={u.displayName || u.email} value={u.id} />)}
            </Picker>
            <Button mode="contained" onPress={handleAssign} style={{ marginTop: 20 }}>Assign</Button>
            <Button mode="outlined" onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>Cancel</Button>
          </View>
        </Modal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { marginBottom: 10 },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    info: { flex: 1, marginLeft: 15 },
    productName: { fontSize: 18, fontWeight: 'bold' },
    productPrice: { fontSize: 14, color: '#666' },
    modalView: { flex: 1, padding: 20, justifyContent: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
});

export default AssignScreen;

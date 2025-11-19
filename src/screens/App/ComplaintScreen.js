// src/screens/App/ComplaintScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import { firestore } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ComplaintScreen = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    const checkRole = async () => {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) setUserRole(userDoc.data().role);
    };
    checkRole();

    const unsubscribe = firestore().collection('complaints').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        const complaintsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Filter for regular users
        const filteredComplaints = userRole !== 'admin' && userRole !== 'owner' 
            ? complaintsList.filter(c => c.userId === user.uid)
            : complaintsList;
        setComplaints(filteredComplaints);
    });
    return () => unsubscribe();
  }, [user, userRole]);

  const submitComplaint = () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    firestore().collection('complaints').add({
      title, description, userId: user.uid, status: 'pending',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    Alert.alert('Success', 'Complaint submitted');
    setModalVisible(false);
    setTitle('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaints</Text>
      {userRole !== 'admin' && userRole !== 'owner' && (
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Icon name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Complaint</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={complaints}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Avatar.Icon size={40} icon="report-problem" />
              <View style={styles.info}>
                <Text style={styles.complaintTitle}>{item.title}</Text>
                <Text style={styles.complaintDesc}>{item.description}</Text>
                <Text style={styles.status}>Status: {item.status}</Text>
              </View>
            </View>
          </Card>
        )}
      />
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>New Complaint</Text>
          <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
          <Button title="Submit" onPress={submitComplaint} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#007bff', padding: 15, borderRadius: 8, marginBottom: 15 },
    addButtonText: { color: 'white', fontSize: 18, marginLeft: 10 },
    card: { marginBottom: 10 },
    cardContent: { flexDirection: 'row', padding: 15 },
    info: { flex: 1, marginLeft: 15 },
    complaintTitle: { fontSize: 18, fontWeight: 'bold' },
    complaintDesc: { fontSize: 14, color: '#666' },
    status: { fontSize: 12, color: '#007bff', marginTop: 5 },
    modalView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 15, paddingHorizontal: 10 },
    textArea: { height: 100, textAlignVertical: 'top' },
});

export default ComplaintScreen;

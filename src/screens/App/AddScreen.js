// src/screens/App/AddScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Alert, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { storage, firestore } from '@react-native-firebase/app';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddScreen = ({ user }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const openModal = (type) => {
    setSelectedType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    // Reset form
    setProductName('');
    setProductPrice('');
    setSerialNumber('');
    setProductImage(null);
  };

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0]) {
        setProductImage(response.assets[0]);
      }
    });
  };

  const handleSave = async () => {
    if (!productName || !productPrice || !serialNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    let imageUrl = '';
    if (productImage) {
      const reference = storage().ref(`products/${user.uid}/${Date.now()}`);
      await reference.putFile(productImage.uri);
      imageUrl = await reference.getDownloadURL();
    }

    firestore().collection('products').add({
      name: productName,
      price: parseFloat(productPrice),
      serialNumber,
      productImageUrl: imageUrl,
      userId: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
    }).then(() => {
      Alert.alert('Success', `${selectedType} added successfully`);
      closeModal();
      setLoading(false);
    }).catch(error => {
      Alert.alert('Error', error.message);
      setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Item</Text>
      <TouchableOpacity style={styles.button} onPress={() => openModal('product')}>
        <Icon name="inventory" size={24} color="white" />
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => openModal('bill')}>
        <Icon name="receipt" size={24} color="white" />
        <Text style={styles.buttonText}>Add Bill</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => openModal('challan')}>
        <Icon name="description" size={24} color="white" />
        <Text style={styles.buttonText}>Add Challan</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add {selectedType}</Text>
          <TextInput style={styles.input} placeholder="Product Name" value={productName} onChangeText={setProductName} />
          <TextInput style={styles.input} placeholder="Price" value={productPrice} onChangeText={setProductPrice} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Serial Number" value={serialNumber} onChangeText={setSerialNumber} />
          
          <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
            <Text style={styles.imageButtonText}>Select Product Image</Text>
          </TouchableOpacity>
          {productImage && <Image source={{ uri: productImage.uri }} style={styles.imagePreview} />}
          
          <View style={styles.modalButtonContainer}>
            <Button title="Cancel" onPress={closeModal} />
            <Button title="Save" onPress={handleSave} disabled={loading} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007bff', padding: 15, borderRadius: 8, marginBottom: 15 },
  buttonText: { color: 'white', fontSize: 18, marginLeft: 10 },
  modalView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 15, paddingHorizontal: 10 },
  imageButton: { backgroundColor: '#e0e0e0', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  imageButtonText: { color: '#333' },
  imagePreview: { width: '100%', height: 200, resizeMode: 'contain', marginBottom: 15 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
});

export default AddScreen;

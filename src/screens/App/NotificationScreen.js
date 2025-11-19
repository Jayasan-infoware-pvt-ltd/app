// src/screens/App/NotificationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import { firestore } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NotificationScreen = ({ route }) => {
    const { user } = route.params;
    const [notifications, setNotifications] = useState([]);
    const [userRole, setUserRole] = useState('user');

    useEffect(() => {
        const checkRole = async () => {
            const userDoc = await firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) setUserRole(userDoc.data().role);
        };
        checkRole();

        let query;
        if (userRole === 'admin' || userRole === 'owner') {
            query = firestore().collection('notifications').where('targetRole', 'array-contains', userRole);
        } else {
            query = firestore().collection('notifications').where('userId', '==', user.uid);
        }

        const unsubscribe = query.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user, userRole]);

    const markAsRead = (id) => {
        firestore().collection('notifications').doc(id).update({ read: true });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Notifications</Text>
            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => !item.read && markAsRead(item.id)}>
                        <Card style={[styles.card, !item.read && styles.unreadCard]}>
                            <View style={styles.cardContent}>
                                <Avatar.Icon size={40} icon="notifications" />
                                <View style={styles.info}>
                                    <Text style={styles.titleText}>{item.title}</Text>
                                    <Text style={styles.messageText}>{item.message}</Text>
                                </View>
                                {!item.read && <Icon name="circle" size={12} color="#007bff" />}
                            </View>
                        </Card>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { marginBottom: 10 },
    unreadCard: { borderLeftWidth: 4, borderLeftColor: '#007bff' },
    cardContent: { flexDirection: 'row', padding: 15, alignItems: 'center' },
    info: { flex: 1, marginLeft: 15 },
    titleText: { fontSize: 16, fontWeight: 'bold' },
    messageText: { fontSize: 14, color: '#666' },
});

export default NotificationScreen;

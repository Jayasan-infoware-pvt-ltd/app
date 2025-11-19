// src/navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/App/HomeScreen';
import DashboardScreen from '../screens/App/DashboardScreen';
import UsersScreen from '../screens/App/UsersScreen';
import AddScreen from '../screens/App/AddScreen';
import ComplaintScreen from '../screens/App/ComplaintScreen';
import AssignScreen from '../screens/App/AssignScreen';
import ExpenseScreen from '../screens/App/ExpenseScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = ({ user }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard': iconName = 'dashboard'; break;
            case 'Users': iconName = 'people'; break;
            case 'Add': iconName = 'add-circle'; break;
            case 'Complaint': iconName = 'report-problem'; break;
            case 'Assign': iconName = 'assignment'; break;
            case 'Expense': iconName = 'account-balance-wallet'; break;
            default: iconName = 'help';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" children={() => <DashboardScreen user={user} />} />
      <Tab.Screen name="Users" children={() => <UsersScreen user={user} />} />
      <Tab.Screen name="Add" children={() => <AddScreen user={user} />} />
      <Tab.Screen name="Complaint" children={() => <ComplaintScreen user={user} />} />
      <Tab.Screen name="Assign" children={() => <AssignScreen user={user} />} />
      <Tab.Screen name="Expense" children={() => <ExpenseScreen user={user} />} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

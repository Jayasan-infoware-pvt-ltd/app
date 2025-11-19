// src/config/firebase.js
import { initializeApp } from '@react-native-firebase/app';

// TODO: Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (!initializeApp.apps.length) {
  initializeApp(firebaseConfig);
}

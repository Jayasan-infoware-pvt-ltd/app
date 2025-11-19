// App.js
import React, { useEffect, useState, useCallback } from 'react'; // 1. Import useCallback
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import auth from '@react-native-firebase/auth';

import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // 2. Wrap the function in useCallback
  const onAuthStateChanged = useCallback(user => {
    setUser(user);
    if (initializing) setInitializing(false);
  }, [initializing]);

  useEffect(() => {
    // 3. The function is now stable, so the effect only runs once.
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [onAuthStateChanged]); // 4. Add the memoized function to the dependency array

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator user={user} />
    </NavigationContainer>
  );
}

export default App;

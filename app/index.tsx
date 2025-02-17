import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import TinderSwiper from '../components/TinderSwiper';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <TinderSwiper />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

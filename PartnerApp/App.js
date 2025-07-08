import React from 'react';
import { PartnerProvider } from './context/PartnerContext';
import AppNavigator from './navigation/Navigator';

export default function App() {
  return (
    <PartnerProvider>
      <AppNavigator />
    </PartnerProvider>
  );
}

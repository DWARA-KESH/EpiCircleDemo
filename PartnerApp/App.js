import React from 'react';
import { PartnerProvider } from './context/PartnerContext';
import AppNavigator from './navigation/Navigator';

// Root component of the application
export default function App() {
  return (
    // Wrap the entire app in PartnerProvider so all components have access to partner context
    <PartnerProvider>
      {/* This sets up navigation for the app */}
      <AppNavigator />
    </PartnerProvider>
  );
}

import React from 'react';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout/Layout';
import './index.css';

function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

export default App;
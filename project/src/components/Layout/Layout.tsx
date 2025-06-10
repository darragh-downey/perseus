import React from 'react';
import { useApp } from '../../contexts/hooks';
import Sidebar from './Sidebar';
import Header from './Header';
import HierarchySelector from './HierarchySelector';
import WriteView from '../Views/WriteView';
import CharactersView from '../Views/CharactersView';
import WorldView from '../Views/WorldView';
import NotesView from '../Views/NotesView';
import SettingsView from '../Views/SettingsView';
import { PlotView } from '../Views/PlotView';

export default function Layout() {
  const { state } = useApp();

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'write':
        return <WriteView />;
      case 'characters':
        return <CharactersView />;
      case 'world':
        return <WorldView />;
      case 'notes':
        return <NotesView />;
      case 'plot':
        return <PlotView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <WriteView />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      <div className="w-80 flex flex-col">
        <HierarchySelector />
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
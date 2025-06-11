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
import { OulipoAssistant } from '../Experimental';

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
      case 'experimental':
        return <OulipoAssistant />;
      case 'settings':
        return <SettingsView />;
      default:
        return <WriteView />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-80 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <HierarchySelector />
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden relative" role="main">
          <div className="h-full fade-in">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  );
}
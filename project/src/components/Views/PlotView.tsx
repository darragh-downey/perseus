import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { BeatSheetPlanner } from '../Plot/BeatSheetPlanner';
import { CharacterArcTracker } from '../Plot/CharacterArcTracker';
import { ThemeVisualizer } from '../Plot/ThemeVisualizer';
import { ConflictTracker } from '../Plot/ConflictTracker';

type PlotTab = 'beats' | 'arcs' | 'themes' | 'conflicts';

export const PlotView: React.FC = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<PlotTab>('beats');

  if (!state.currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">No project selected</div>
          <p className="text-sm text-gray-400">Select a project to work on plot structure</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'beats' as PlotTab,
      name: 'Beat Sheet',
      description: 'Save the Cat! structure',
      icon: '📋'
    },
    {
      id: 'arcs' as PlotTab,
      name: 'Character Arcs',
      description: 'Emotional development',
      icon: '🎭'
    },
    {
      id: 'themes' as PlotTab,
      name: 'Theme Tracker',
      description: 'Thematic elements',
      icon: '💡'
    },
    {
      id: 'conflicts' as PlotTab,
      name: 'Conflict & B-Stories',
      description: 'Stakes and subplots',
      icon: '⚔️'
    }
  ];

  const renderTabContent = () => {
    if (!state.currentProject) return null;
    
    switch (activeTab) {
      case 'beats':
        return <BeatSheetPlanner />;
      case 'arcs':
        return <CharacterArcTracker projectId={state.currentProject.id} />;
      case 'themes':
        return <ThemeVisualizer projectId={state.currentProject.id} />;
      case 'conflicts':
        return <ConflictTracker projectId={state.currentProject.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Plot Structure
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Structure your story with proven storytelling frameworks
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Project: <span className="font-medium text-gray-700 dark:text-gray-300">
                  {state.currentProject.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs text-gray-400">{tab.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Help Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            💡 <strong>Tip:</strong> Use the Save the Cat! method to ensure your story has proper pacing and structure
          </div>
          
          <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
            <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              📖 Guide
            </button>
            <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              🎯 Examples
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

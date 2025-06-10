import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import CharacterGraph from '../Characters/CharacterGraph';
import CharacterList from '../Characters/CharacterList';
import CharacterForm from '../Characters/CharacterForm';
import RelationshipForm from '../Characters/RelationshipForm';
import AIAssistant from '../Characters/AIAssistant';
import { Plus, Users, Network, Bot, BarChart3, Eye, Layers } from 'lucide-react';

type ViewMode = 'graph' | 'list' | 'ai' | 'analytics';
type FormMode = 'character' | 'relationship' | null;

export default function CharactersView() {
  const { state } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [showForm, setShowForm] = useState<FormMode>(null);

  const viewOptions = [
    { id: 'graph', label: 'Relationship Graph', icon: Network, description: 'Interactive character network' },
    { id: 'list', label: 'Character List', icon: Users, description: 'Detailed character management' },
    { id: 'analytics', label: 'Story Analytics', icon: BarChart3, description: 'Character relationship insights' },
    { id: 'ai', label: 'AI Assistant', icon: Bot, description: 'AI-powered character development' },
  ];

  const renderContent = () => {
    switch (viewMode) {
      case 'graph':
        return (
          <div className="h-full flex flex-col">
            <CharacterGraph />
          </div>
        );
      case 'list':
        return <CharacterList />;
      case 'analytics':
        return <CharacterAnalytics />;
      case 'ai':
        return <AIAssistant />;
      default:
        return null;
    }
  };

  const canAddCharacter = state.characters.length < 5 || state.settings.openaiKey || state.credits > 0;
  const canAddRelationship = state.characters.length >= 2;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
              <Network className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Character Universe
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize and manage your story's character relationships
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Action Buttons */}
            <button
              onClick={() => setShowForm('character')}
              disabled={!canAddCharacter}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                canAddCharacter
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
              title={!canAddCharacter ? 'Character limit reached. Upgrade for more characters.' : 'Add Character'}
            >
              <Plus className="w-4 h-4" />
              <span>Add Character</span>
            </button>

            <button
              onClick={() => setShowForm('relationship')}
              disabled={!canAddRelationship}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                canAddRelationship
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
              title={!canAddRelationship ? 'Need at least 2 characters to create relationships' : 'Add Relationship'}
            >
              <Plus className="w-4 h-4" />
              <span>Add Relationship</span>
            </button>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setViewMode(option.id as ViewMode)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  viewMode === option.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title={option.description}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Characters</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{state.characters.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Network className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Relationships</div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{state.relationships.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Allies</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {state.relationships.filter(r => ['ally', 'friend', 'lover', 'family'].includes(r.type.toLowerCase())).length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Layers className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div>
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">Conflicts</div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {state.relationships.filter(r => ['enemy', 'rival', 'antagonist'].includes(r.type.toLowerCase())).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Forms */}
      {showForm === 'character' && (
        <CharacterForm onClose={() => setShowForm(null)} />
      )}

      {showForm === 'relationship' && (
        <RelationshipForm onClose={() => setShowForm(null)} />
      )}
    </div>
  );
}

// Character Analytics Component
function CharacterAnalytics() {
  const { state } = useApp();

  const getCharacterConnections = () => {
    return state.characters.map(character => {
      const connections = state.relationships.filter(r => r.from === character.id || r.to === character.id);
      return {
        character,
        connectionCount: connections.length,
        strongConnections: connections.filter(r => r.strength > 70).length,
        conflicts: connections.filter(r => ['enemy', 'rival'].includes(r.type.toLowerCase())).length,
        allies: connections.filter(r => ['ally', 'friend', 'lover'].includes(r.type.toLowerCase())).length,
      };
    }).sort((a, b) => b.connectionCount - a.connectionCount);
  };

  const getRelationshipTypes = () => {
    const types: { [key: string]: number } = {};
    state.relationships.forEach(rel => {
      types[rel.type] = (types[rel.type] || 0) + 1;
    });
    return Object.entries(types).sort((a, b) => b[1] - a[1]);
  };

  const characterStats = getCharacterConnections();
  const relationshipTypes = getRelationshipTypes();

  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Story Analytics</h3>
          
          {/* Character Influence Ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Character Influence</h4>
              <div className="space-y-4">
                {characterStats.slice(0, 5).map((stat, index) => (
                  <div key={stat.character.id} className="flex items-center space-x-4">
                    <div className="text-lg font-bold text-gray-400 w-6">#{index + 1}</div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: stat.character.color || '#3b82f6' }}
                    >
                      {stat.character.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{stat.character.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {stat.connectionCount} connections • {stat.allies} allies • {stat.conflicts} conflicts
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stat.connectionCount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationship Distribution */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relationship Types</h4>
              <div className="space-y-3">
                {relationshipTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getRelationshipColor(type) }}
                      />
                      <span className="text-gray-900 dark:text-white capitalize">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: getRelationshipColor(type),
                            width: `${(count / state.relationships.length) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Story Insights */}
          <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Story Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {Math.round((state.relationships.filter(r => r.strength > 70).length / state.relationships.length) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Strong Relationships</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {state.characters.length > 0 ? Math.round(state.relationships.length / state.characters.length * 10) / 10 : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Connections per Character</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {state.relationships.filter(r => ['ally', 'friend', 'lover'].includes(r.type.toLowerCase())).length > 
                   state.relationships.filter(r => ['enemy', 'rival'].includes(r.type.toLowerCase())).length ? 'Positive' : 'Tense'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overall Story Tone</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRelationshipColor(type: string): string {
  const colors: { [key: string]: string } = {
    ally: '#10b981',
    friend: '#3b82f6',
    lover: '#ec4899',
    family: '#8b5cf6',
    enemy: '#ef4444',
    rival: '#f59e0b',
    mentor: '#06b6d4',
    neutral: '#6b7280',
  };
  return colors[type.toLowerCase()] || colors.neutral;
}
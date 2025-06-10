import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { aiService } from '../../services/ai';
import { Bot, Sparkles, Loader, Lightbulb, Users, BookOpen, Zap } from 'lucide-react';

type QueryType = 'relationship' | 'backstory' | 'story' | 'dynamics';

interface AIQuery {
  type: QueryType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  creditCost: number;
}

export default function AIAssistant() {
  const { state, dispatch } = useApp();
  const [selectedQuery, setSelectedQuery] = useState<QueryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [context, setContext] = useState('');

  const queries: AIQuery[] = [
    {
      type: 'relationship',
      title: 'Suggest Relationships',
      description: 'Get AI suggestions for character relationships',
      icon: Users,
      creditCost: 10,
    },
    {
      type: 'backstory',
      title: 'Generate Backstory',
      description: 'Create detailed character backstories',
      icon: BookOpen,
      creditCost: 25,
    },
    {
      type: 'story',
      title: 'Story Direction',
      description: 'Get suggestions for plot development',
      icon: Lightbulb,
      creditCost: 20,
    },
    {
      type: 'dynamics',
      title: 'Analyze Dynamics',
      description: 'Analyze character relationship dynamics',
      icon: Zap,
      creditCost: 30,
    },
  ];

  const canUseAI = state.freeQueriesLeft > 0 || state.settings.openaiKey || state.credits > 0;

  const handleQuery = async () => {
    if (!selectedQuery || !canUseAI) return;

    setIsLoading(true);
    setResult(null);

    try {
      let response;
      const apiKey = state.settings.openaiKey || state.settings.anthropicKey;

      switch (selectedQuery) {
        case 'relationship':
          if (!selectedCharacter) {
            alert('Please select a character first');
            return;
          }
          const character = state.characters.find(c => c.id === selectedCharacter);
          if (!character) return;
          
          response = await aiService.suggestCharacterRelationship(
            character,
            state.characters.filter(c => c.id !== selectedCharacter),
            apiKey
          );
          break;

        case 'backstory':
          if (!selectedCharacter) {
            alert('Please select a character first');
            return;
          }
          const targetCharacter = state.characters.find(c => c.id === selectedCharacter);
          if (!targetCharacter) return;
          
          response = await aiService.generateCharacterBackstory(
            targetCharacter,
            context || 'a fantasy world',
            apiKey
          );
          break;

        case 'story':
          response = await aiService.suggestStoryDirection(
            state.characters,
            state.relationships,
            context,
            apiKey
          );
          break;

        case 'dynamics':
          response = await aiService.analyzeCharacterDynamics(
            state.characters,
            state.relationships,
            apiKey
          );
          break;

        default:
          return;
      }

      if (response.success) {
        setResult(response.data);
        
        // Deduct credits or free queries
        if (!apiKey) {
          if (state.freeQueriesLeft > 0) {
            dispatch({ type: 'SET_FREE_QUERIES', payload: state.freeQueriesLeft - 1 });
          }
        } else if (response.creditsUsed && response.creditsUsed > 0) {
          dispatch({ type: 'SET_CREDITS', payload: Math.max(0, state.credits - response.creditsUsed) });
        }
      } else {
        alert(response.error || 'AI query failed');
      }
    } catch (error) {
      console.error('AI query error:', error);
      alert('Failed to process AI query');
    } finally {
      setIsLoading(false);
    }
  };

  const getCostDisplay = (query: AIQuery) => {
    if (state.settings.openaiKey || state.settings.anthropicKey) {
      return 'API Key';
    }
    if (state.freeQueriesLeft > 0) {
      return 'Free';
    }
    return `${query.creditCost} credits`;
  };

  const canAfford = (query: AIQuery) => {
    if (state.settings.openaiKey || state.settings.anthropicKey) return true;
    if (state.freeQueriesLeft > 0) return true;
    return state.credits >= query.creditCost;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Writing Assistant
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get intelligent suggestions for your story development
            </p>
          </div>
        </div>

        {/* AI Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Free Queries</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {state.freeQueriesLeft}/5
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Credits</div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {state.credits}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">API Status</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {state.settings.openaiKey || state.settings.anthropicKey ? 'Connected' : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {!canUseAI ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Bot className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              AI Assistant Unavailable
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You've used all your free queries. Add an API key or purchase credits to continue.
            </p>
            <button
              onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'settings' })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Settings
            </button>
          </div>
        ) : state.characters.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Characters Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create some characters first to use the AI assistant.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Query Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Choose an AI Assistant
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {queries.map((query) => {
                  const Icon = query.icon;
                  const affordable = canAfford(query);
                  
                  return (
                    <button
                      key={query.type}
                      onClick={() => setSelectedQuery(query.type)}
                      disabled={!affordable}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedQuery === query.type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : affordable
                          ? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          : 'border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          affordable
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        }`}>
                          {getCostDisplay(query)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {query.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {query.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Query Form */}
            {selectedQuery && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  {queries.find(q => q.type === selectedQuery)?.title}
                </h4>

                <div className="space-y-4">
                  {/* Character Selection */}
                  {(selectedQuery === 'relationship' || selectedQuery === 'backstory') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Character
                      </label>
                      <select
                        value={selectedCharacter}
                        onChange={(e) => setSelectedCharacter(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Choose a character...</option>
                        {state.characters.map(character => (
                          <option key={character.id} value={character.id}>
                            {character.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Context Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {selectedQuery === 'backstory' ? 'Story Context' : 
                       selectedQuery === 'story' ? 'Current Story Text' : 'Additional Context'}
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={3}
                      placeholder={
                        selectedQuery === 'backstory' ? 'Describe the world or setting...' :
                        selectedQuery === 'story' ? 'Paste your current story text...' :
                        'Any additional context or specific requests...'
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleQuery}
                    disabled={isLoading || !canAfford(queries.find(q => q.type === selectedQuery)!)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate AI Response</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  AI Response
                </h4>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {selectedQuery === 'relationship' && (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{result.suggestion}</p>
                      {result.alternatives && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Alternatives:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {result.alternatives.map((alt: string, index: number) => (
                              <li key={index} className="text-gray-600 dark:text-gray-400">{alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedQuery === 'backstory' && (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{result.backstory}</p>
                      {result.themes && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Key Themes:</h5>
                          <div className="flex flex-wrap gap-2">
                            {result.themes.map((theme: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedQuery === 'story' && (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{result.suggestion}</p>
                      {result.nextScenes && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Scenes:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {result.nextScenes.map((scene: string, index: number) => (
                              <li key={index} className="text-gray-600 dark:text-gray-400">{scene}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedQuery === 'dynamics' && (
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Analysis:</h5>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                            <div className="text-sm text-blue-600 dark:text-blue-400">Conflict Potential</div>
                            <div className="font-bold text-blue-700 dark:text-blue-300">{result.conflictPotential}</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                            <div className="text-sm text-green-600 dark:text-green-400">Alliance Strength</div>
                            <div className="font-bold text-green-700 dark:text-green-300">{result.allianceStrength}</div>
                          </div>
                        </div>
                      </div>
                      {result.suggestions && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Suggestions:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {result.suggestions.map((suggestion: string, index: number) => (
                              <li key={index} className="text-gray-600 dark:text-gray-400">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
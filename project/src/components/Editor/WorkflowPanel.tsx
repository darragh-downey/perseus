import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { Document } from '../../contexts/AppContext';
import { analyticsService, TextAnalytics } from '../../services/analytics';
import { 
  X, 
  Target, 
  Calendar, 
  Tag, 
  FileText, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  Circle, 
  PlayCircle,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  Users,
  Lightbulb,
  Zap,
} from 'lucide-react';

interface WorkflowPanelProps {
  document: Document;
  onDocumentUpdate: (updates: Partial<Document>) => void;
  onClose: () => void;
}

export default function WorkflowPanel({ document, onDocumentUpdate, onClose }: WorkflowPanelProps) {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'info' | 'goals' | 'notes' | 'characters'>('info');
  const [newNote, setNewNote] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ type: 'word-count', target: 1000, deadline: '' });
  const [textAnalytics, setTextAnalytics] = useState<TextAnalytics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Use analytics from Rust backend or fallback to local calculation
  const wordCount = textAnalytics?.word_count ?? (document.content.trim() ? document.content.trim().split(/\s+/).length : 0);
  const charCount = textAnalytics?.character_count ?? document.content.length;
  const readingTime = textAnalytics?.reading_time_minutes ?? Math.ceil(wordCount / 200);

  // Load text analytics from Rust backend
  useEffect(() => {
    const loadTextAnalytics = async () => {
      if (!document.content.trim()) {
        setTextAnalytics(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        const analytics = await analyticsService.analyzeText(document.content);
        setTextAnalytics(analytics);
      } catch (error) {
        console.error('Failed to analyze text:', error);
        // Fallback to local calculation
        setTextAnalytics(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const timeoutId = setTimeout(loadTextAnalytics, 500); // Debounce analysis
    return () => clearTimeout(timeoutId);
  }, [document.content]);

  const statusOptions = [
    { value: 'draft', label: 'Draft', icon: Circle, color: 'text-gray-500' },
    { value: 'in-progress', label: 'In Progress', icon: PlayCircle, color: 'text-blue-500' },
    { value: 'complete', label: 'Complete', icon: CheckCircle, color: 'text-green-500' },
  ];

  const handleStatusChange = (status: string) => {
    onDocumentUpdate({ status: status as any });
  };

  const handleTargetChange = (target: number) => {
    onDocumentUpdate({ target });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const notes = document.notes || [];
    const updatedNotes = [...notes, {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date(),
    }];
    
    onDocumentUpdate({ notes: updatedNotes });
    setNewNote('');
  };

  const handleDeleteNote = (noteId: string) => {
    const notes = document.notes || [];
    const updatedNotes = notes.filter(note => note.id !== noteId);
    onDocumentUpdate({ notes: updatedNotes });
  };

  const getProgressPercentage = () => {
    if (!document.target) return 0;
    return Math.min((wordCount / document.target) * 100, 100);
  };

  const getRelatedCharacters = () => {
    const content = document.content.toLowerCase();
    return state.characters.filter(char => 
      content.includes(char.name.toLowerCase())
    );
  };

  const tabs = [
    { id: 'info', label: 'Info', icon: FileText },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'notes', label: 'Notes', icon: Edit3 },
    { id: 'characters', label: 'Characters', icon: Users },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statusOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        document.status === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${option.color}`} />
                      <span className="text-gray-900 dark:text-white">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Statistics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="text-sm text-blue-600 dark:text-blue-400">Words</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{wordCount.toLocaleString()}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Characters</div>
                  <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{charCount.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="text-sm text-green-600 dark:text-green-400">Reading Time</div>
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">{readingTime} min</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                  <div className="text-sm text-orange-600 dark:text-orange-400">Last Updated</div>
                  <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Metadata</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  Created: {new Date(document.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  Modified: {new Date(document.updatedAt).toLocaleString()}
                </div>
                {document.groupId && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Tag className="w-4 h-4 mr-2" />
                    Group: {state.groups.find(g => g.id === document.groupId)?.name || 'Unknown'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            {/* Word Count Goal */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Word Count Goal</h4>
                <button
                  onClick={() => setShowGoalForm(!showGoalForm)}
                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {showGoalForm && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                    placeholder="Target word count"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => {
                        handleTargetChange(newGoal.target);
                        setShowGoalForm(false);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      Set Goal
                    </button>
                    <button
                      onClick={() => setShowGoalForm(false)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {document.target ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {wordCount} / {document.target} words
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.round(getProgressPercentage())}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {document.target - wordCount > 0 
                      ? `${document.target - wordCount} words remaining`
                      : 'Goal achieved! 🎉'
                    }
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Target className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No word count goal set</p>
                </div>
              )}
            </div>

            {/* Writing Streak */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Writing Progress</h4>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Keep writing!
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      You've written {wordCount} words today
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Add Note */}
            <div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this sheet..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
              >
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {(document.notes || []).map(note => (
                <div key={note.id} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-l-4 border-yellow-400">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{note.content}</p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {(!document.notes || document.notes.length === 0) && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Edit3 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No notes yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Characters in this sheet</h4>
              <button
                onClick={() => {/* Navigate to characters view */}}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Manage Characters
              </button>
            </div>

            {/* Related Characters */}
            <div className="space-y-3">
              {getRelatedCharacters().map(character => (
                <div key={character.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: character.color || '#3b82f6' }}
                  >
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {character.name}
                    </div>
                    {character.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {character.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {getRelatedCharacters().length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No characters mentioned</p>
                  <p className="text-xs mt-1">Characters will appear here when mentioned in your text</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Quick Actions
              </h5>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <Lightbulb className="w-4 h-4" />
                  <span>Get AI suggestions</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <BookOpen className="w-4 h-4" />
                  <span>View character graph</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
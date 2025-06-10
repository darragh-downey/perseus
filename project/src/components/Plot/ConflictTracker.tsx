import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { Conflict, BStory } from '../../contexts/AppContext';
import { storageService } from '../../services';

interface ConflictTrackerProps {
  projectId: string;
}

export const ConflictTracker: React.FC<ConflictTrackerProps> = ({ projectId }) => {
  const { state } = useApp();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [bStories, setBStories] = useState<BStory[]>([]);
  const [activeTab, setActiveTab] = useState<'conflicts' | 'bstories'>('conflicts');
  const [isAddingConflict, setIsAddingConflict] = useState(false);
  const [isAddingBStory, setIsAddingBStory] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [loadedConflicts, loadedBStories] = await Promise.all([
        storageService.getConflicts(projectId),
        storageService.getBStories(projectId)
      ]);
      setConflicts(loadedConflicts);
      setBStories(loadedBStories);
    } catch (error) {
      console.error('Failed to load conflict data:', error);
    }
  };

  const createConflict = async (type: 'internal' | 'external', description: string) => {
    try {
      const newConflict: Conflict = {
        id: `conflict-${Date.now()}`,
        type,
        description,
        intensity: 5,
        sceneIds: []
      };

      await storageService.saveConflict({ ...newConflict, projectId });
      setConflicts([...conflicts, newConflict]);
      setIsAddingConflict(false);
    } catch (error) {
      console.error('Failed to create conflict:', error);
    }
  };

  const createBStory = async (characterId: string, name: string, description: string) => {
    try {
      const newBStory: BStory = {
        id: `bstory-${Date.now()}`,
        characterId,
        name,
        description,
        sceneIds: [],
        thematicImpact: {}
      };

      await storageService.saveBStory({ ...newBStory, projectId });
      setBStories([...bStories, newBStory]);
      setIsAddingBStory(false);
    } catch (error) {
      console.error('Failed to create B story:', error);
    }
  };

  const updateConflictIntensity = async (conflictId: string, intensity: number) => {
    try {
      const conflict = conflicts.find(c => c.id === conflictId);
      if (!conflict) return;

      const updatedConflict = { ...conflict, intensity };
      await storageService.saveConflict({ ...updatedConflict, projectId });
      
      setConflicts(conflicts.map(c => 
        c.id === conflictId ? updatedConflict : c
      ));
    } catch (error) {
      console.error('Failed to update conflict:', error);
    }
  };

  const deleteConflict = async (conflictId: string) => {
    try {
      await storageService.deleteConflict(conflictId);
      setConflicts(conflicts.filter(c => c.id !== conflictId));
    } catch (error) {
      console.error('Failed to delete conflict:', error);
    }
  };

  const deleteBStory = async (bStoryId: string) => {
    try {
      await storageService.deleteBStory(bStoryId);
      setBStories(bStories.filter(b => b.id !== bStoryId));
    } catch (error) {
      console.error('Failed to delete B story:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conflict & B-Stories</h2>
          <p className="text-gray-600 dark:text-gray-400">Track story tensions and subplots</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('conflicts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'conflicts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Conflicts ({conflicts.length})
          </button>
          <button
            onClick={() => setActiveTab('bstories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bstories'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            B-Stories ({bStories.length})
          </button>
        </nav>
      </div>

      {/* Conflicts Tab */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Story Conflicts</h3>
            <button
              onClick={() => setIsAddingConflict(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Conflict
            </button>
          </div>

          {/* Add Conflict Form */}
          {isAddingConflict && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Conflict</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createConflict(
                  formData.get('type') as 'internal' | 'external',
                  formData.get('description') as string
                );
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Conflict Type
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="internal">Internal (Character vs. Self)</option>
                      <option value="external">External (Character vs. World)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    placeholder="Describe the conflict and what's at stake..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Conflict
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingConflict(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Conflicts List */}
          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={`p-4 rounded-lg border-2 ${
                  conflict.type === 'internal'
                    ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600'
                    : 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        conflict.type === 'internal'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200'
                      }`}>
                        {conflict.type === 'internal' ? 'Internal' : 'External'}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white mb-3">{conflict.description}</p>
                  </div>
                  
                  <button
                    onClick={() => deleteConflict(conflict.id)}
                    className="text-red-600 hover:text-red-700 text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Intensity:
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={conflict.intensity}
                    onChange={(e) => updateConflictIntensity(conflict.id, parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6">
                    {conflict.intensity}
                  </span>
                </div>
              </div>
            ))}
            
            {conflicts.length === 0 && !isAddingConflict && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No conflicts defined yet. Add your first conflict to track story tensions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* B-Stories Tab */}
      {activeTab === 'bstories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">B-Stories & Subplots</h3>
            <button
              onClick={() => setIsAddingBStory(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add B-Story
            </button>
          </div>

          {/* Add B-Story Form */}
          {isAddingBStory && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New B-Story</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createBStory(
                  formData.get('characterId') as string,
                  formData.get('name') as string,
                  formData.get('description') as string
                );
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Central Character
                    </label>
                    <select
                      name="characterId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a character...</option>
                      {state.characters.map(character => (
                        <option key={character.id} value={character.id}>
                          {character.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      B-Story Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g., Romance subplot, Mentor relationship"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    placeholder="Describe how this subplot reinforces your theme..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create B-Story
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingBStory(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* B-Stories List */}
          <div className="space-y-3">
            {bStories.map((bStory) => {
              const character = state.characters.find(c => c.id === bStory.characterId);
              return (
                <div
                  key={bStory.id}
                  className="p-4 rounded-lg border-2 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{bStory.name}</h4>
                        {character && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                            {character.name}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{bStory.description}</p>
                    </div>
                    
                    <button
                      onClick={() => deleteBStory(bStory.id)}
                      className="text-red-600 hover:text-red-700 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            
            {bStories.length === 0 && !isAddingBStory && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No B-stories defined yet. Add subplots that reinforce your main theme.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

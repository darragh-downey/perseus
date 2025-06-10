import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { Theme } from '../../contexts/AppContext';
import { storageService } from '../../services';

interface ThemeVisualizerProps {
  projectId: string;
}

export const ThemeVisualizer: React.FC<ThemeVisualizerProps> = ({ projectId }) => {
  const { state, dispatch } = useApp();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDescription, setNewThemeDescription] = useState('');
  const [isAddingTheme, setIsAddingTheme] = useState(false);

  useEffect(() => {
    loadThemes();
  }, [projectId]);

  const loadThemes = async () => {
    try {
      const loadedThemes = await storageService.getThemes(projectId);
      setThemes(loadedThemes);
      if (loadedThemes.length > 0 && !selectedTheme) {
        setSelectedTheme(loadedThemes[0]);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  };

  const createTheme = async () => {
    if (!newThemeName.trim()) return;

    try {
      const newTheme: Theme = {
        id: `theme-${Date.now()}`,
        name: newThemeName.trim(),
        description: newThemeDescription.trim(),
        sceneIds: [],
        intensity: {}
      };

      await storageService.saveTheme({ ...newTheme, projectId });
      
      const updatedThemes = [...themes, newTheme];
      setThemes(updatedThemes);
      setSelectedTheme(newTheme);
      setNewThemeName('');
      setNewThemeDescription('');
      setIsAddingTheme(false);

      // Update plot structure
      if (state.plotStructure) {
        const updatedPlotStructure = {
          ...state.plotStructure,
          themes: [...state.plotStructure.themes, newTheme]
        };
        dispatch({ type: 'SET_PLOT_STRUCTURE', payload: updatedPlotStructure });
      }
    } catch (error) {
      console.error('Failed to create theme:', error);
    }
  };

  const updateTheme = async (themeId: string, updates: Partial<Theme>) => {
    try {
      const themeToUpdate = themes.find(t => t.id === themeId);
      if (!themeToUpdate) return;

      const updatedTheme = { ...themeToUpdate, ...updates };
      await storageService.saveTheme({ ...updatedTheme, projectId });

      const updatedThemes = themes.map(t => t.id === themeId ? updatedTheme : t);
      setThemes(updatedThemes);
      
      if (selectedTheme?.id === themeId) {
        setSelectedTheme(updatedTheme);
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const deleteTheme = async (themeId: string) => {
    try {
      await storageService.deleteTheme(themeId);
      
      const updatedThemes = themes.filter(t => t.id !== themeId);
      setThemes(updatedThemes);
      
      if (selectedTheme?.id === themeId) {
        setSelectedTheme(updatedThemes.length > 0 ? updatedThemes[0] : null);
      }
    } catch (error) {
      console.error('Failed to delete theme:', error);
    }
  };

  const toggleSceneTheme = (sceneId: string, intensity: number = 5) => {
    if (!selectedTheme) return;

    const isLinked = selectedTheme.sceneIds.includes(sceneId);
    const updatedSceneIds = isLinked
      ? selectedTheme.sceneIds.filter(id => id !== sceneId)
      : [...selectedTheme.sceneIds, sceneId];

    const updatedIntensity = { ...selectedTheme.intensity };
    if (isLinked) {
      delete updatedIntensity[sceneId];
    } else {
      updatedIntensity[sceneId] = intensity;
    }

    updateTheme(selectedTheme.id, {
      sceneIds: updatedSceneIds,
      intensity: updatedIntensity
    });
  };

  const updateSceneIntensity = (sceneId: string, intensity: number) => {
    if (!selectedTheme) return;

    const updatedIntensity = {
      ...selectedTheme.intensity,
      [sceneId]: intensity
    };

    updateTheme(selectedTheme.id, { intensity: updatedIntensity });
  };

  // Mock scene data - in real app, this would come from documents/scenes
  const mockScenes = state.documents.map((doc, index) => ({
    id: doc.id,
    title: doc.title,
    percentage: Math.round((index / state.documents.length) * 100),
    wordCount: doc.content.split(' ').length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Theme Visualizer</h2>
          <p className="text-gray-600 dark:text-gray-400">Track thematic elements throughout your story</p>
        </div>
        <button
          onClick={() => setIsAddingTheme(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Theme
        </button>
      </div>

      {/* Add Theme Modal */}
      {isAddingTheme && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Theme</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme Name
              </label>
              <input
                type="text"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="e.g., Redemption, Love conquers all, Power corrupts"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newThemeDescription}
                onChange={(e) => setNewThemeDescription(e.target.value)}
                placeholder="Describe how this theme manifests in your story..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={createTheme}
              disabled={!newThemeName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Theme
            </button>
            <button
              onClick={() => {
                setIsAddingTheme(false);
                setNewThemeName('');
                setNewThemeDescription('');
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Theme Selection */}
      {themes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Theme</h3>
            {selectedTheme && (
              <button
                onClick={() => deleteTheme(selectedTheme.id)}
                className="text-red-600 hover:text-red-700 text-sm transition-colors"
              >
                Delete Theme
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Theme
              </label>
              <select
                value={selectedTheme?.id || ''}
                onChange={(e) => {
                  const theme = themes.find(t => t.id === e.target.value);
                  setSelectedTheme(theme || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTheme && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={selectedTheme.description}
                  onChange={(e) => updateTheme(selectedTheme.id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
              </div>
            )}
          </div>

          {selectedTheme && (
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {selectedTheme.sceneIds.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Scenes with theme</div>
            </div>
          )}
        </div>
      )}

      {/* Scene Theme Mapping */}
      {selectedTheme && mockScenes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Theme Mapping: {selectedTheme.name}
          </h3>

          <div className="space-y-3">
            {mockScenes.map((scene) => {
              const isLinked = selectedTheme.sceneIds.includes(scene.id);
              const intensity = selectedTheme.intensity?.[scene.id] || 5;

              return (
                <div
                  key={scene.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isLinked 
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isLinked}
                            onChange={() => toggleSceneTheme(scene.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {scene.title}
                          </span>
                        </label>
                        <div className="text-sm text-gray-500">
                          {scene.percentage}% • {scene.wordCount} words
                        </div>
                      </div>
                    </div>

                    {isLinked && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Intensity:
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={intensity}
                          onChange={(e) => updateSceneIntensity(scene.id, parseInt(e.target.value))}
                          className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6">
                          {intensity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Theme Visualization Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme Distribution</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">Bubble Chart Visualization</div>
            <p className="text-sm text-gray-400">Theme intensity across story progression</p>
            <p className="text-xs text-gray-400 mt-2">
              Each bubble represents a scene with theme presence
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {themes.length === 0 && !isAddingTheme && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">No themes defined yet</div>
          <p className="text-sm text-gray-400 mb-6">
            Create themes to track how they develop throughout your story
          </p>
          <button
            onClick={() => setIsAddingTheme(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Theme
          </button>
        </div>
      )}
    </div>
  );
};

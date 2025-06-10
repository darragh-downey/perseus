import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { Moon, Sun, Download, Save, Sparkles, Monitor } from 'lucide-react';
import { storageService } from '../../services';
import { getTauriInfo } from '../../services/tauriStorage';

export default function Header() {
  const { state, dispatch } = useApp();
  const [tauriInfo, setTauriInfo] = useState<{ isTauri: boolean; version?: string }>({ isTauri: false });

  useEffect(() => {
    getTauriInfo().then(setTauriInfo);
  }, []);

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
    storageService.saveSettings({ ...state.settings, theme: newTheme });
  };

  const handleSave = async () => {
    if (!state.currentProject || !state.currentDocument) return;

    try {
      await storageService.saveDocument({
        ...state.currentDocument,
        projectId: state.currentProject.id,
        updatedAt: new Date(),
      });
      
      // Show success feedback (you could add a toast notification here)
      console.log('Document saved successfully');
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const handleExport = async () => {
    if (!state.currentProject) return;

    try {
      const data = await storageService.exportProjectData(state.currentProject.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.currentProject.name.replace(/\s+/g, '_')}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
    }
  };

  const getViewTitle = () => {
    switch (state.currentView) {
      case 'write':
        return state.currentDocument?.title || 'Write';
      case 'characters':
        return 'Characters';
      case 'notes':
        return 'Notes';
      case 'settings':
        return 'Settings';
      default:
        return 'Ulysses';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getViewTitle()}
          </h1>
          {state.currentDocument && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(state.currentDocument.updatedAt).toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Tauri Status */}
          {tauriInfo.isTauri && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Desktop App {tauriInfo.version ? `v${tauriInfo.version}` : ''}
              </span>
            </div>
          )}

          {/* AI Status */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              AI Ready
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleSave}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Save"
            >
              <Save className="w-5 h-5" />
            </button>

            <button
              onClick={handleExport}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Export Project"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {state.theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { storageService } from '../../services/storage';
import { 
  Key, 
  CreditCard, 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun, 
  Save,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

export default function SettingsView() {
  const { state, dispatch } = useApp();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [formData, setFormData] = useState({
    openaiKey: state.settings.openaiKey || '',
    anthropicKey: state.settings.anthropicKey || '',
    autoSave: state.settings.autoSave,
  });

  const handleSaveSettings = async () => {
    try {
      const newSettings = {
        ...state.settings,
        ...formData,
        theme: state.theme,
      };

      await storageService.saveSettings(newSettings);
      dispatch({ type: 'UPDATE_SETTINGS', payload: formData });
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleExportData = async () => {
    if (!state.currentProject) return;

    try {
      const data = await storageService.exportProjectData(state.currentProject.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.currentProject.name.replace(/\s+/g, '_')}_backup.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.project || !data.documents || !data.characters) {
          alert('Invalid backup file format');
          return;
        }

        // Import data (this would need more sophisticated handling in a real app)
        alert('Import functionality would be implemented here');
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('Failed to import data');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    try {
      // Clear all projects and data
      for (const project of state.projects) {
        await storageService.deleteProject(project.id);
      }
      
      // Reset state
      dispatch({ type: 'SET_PROJECTS', payload: [] });
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
      dispatch({ type: 'SET_DOCUMENTS', payload: [] });
      dispatch({ type: 'SET_CHARACTERS', payload: [] });
      dispatch({ type: 'SET_RELATIONSHIPS', payload: [] });
      dispatch({ type: 'SET_NOTES', payload: [] });
      
      alert('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data');
    }
  };

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const creditPackages = [
    { credits: 500, price: 5, bonus: 0 },
    { credits: 1100, price: 10, bonus: 100 },
    { credits: 2500, price: 20, bonus: 500 },
  ];

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your Ulysses experience and manage your data.
          </p>
        </div>

        {/* AI Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Configuration</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your own AI API keys for unlimited queries
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">Free Queries</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {state.freeQueriesLeft} of 5 remaining today
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {state.freeQueriesLeft}/5
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={formData.openaiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, openaiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pr-10 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Get your API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                >
                  OpenAI Platform <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Anthropic API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys ? 'text' : 'password'}
                  value={formData.anthropicKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, anthropicKey: e.target.value }))}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 pr-10 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Get your API key from{' '}
                <a 
                  href="https://console.anthropic.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                >
                  Anthropic Console <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Credits</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Purchase credits for premium AI features
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <div className="font-medium text-green-900 dark:text-green-100">Current Balance</div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Available for AI queries
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {state.credits}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditPackages.map((pkg, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {pkg.credits.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    credits
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="text-xs text-green-600 dark:text-green-400 mb-2">
                      +{pkg.bonus} bonus credits
                    </div>
                  )}
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    ${pkg.price}
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Theme</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Choose your preferred color scheme
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {state.theme === 'light' ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Auto-save</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically save changes as you type
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoSave}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoSave: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">Export Data</span>
            </button>

            <label className="flex items-center justify-center space-x-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-900 dark:text-white">Import Data</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>

            <button
              onClick={handleClearData}
              className="flex items-center justify-center space-x-2 p-4 border border-red-200 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-600 dark:text-red-400">Clear All Data</span>
            </button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Export your data regularly to prevent loss. The clear data action cannot be undone.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About Ulysses</h2>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong className="text-gray-900 dark:text-white">Version:</strong> 1.0.0 MVP
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Description:</strong> 
              A smart writing assistant designed for fiction writers, offering AI-powered character relationship graphing and distraction-free writing.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Features:</strong> 
              Markdown editor, character visualization, AI assistance, local storage, and export capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
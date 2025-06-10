import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { X, Plus, Trash2, Sparkles, Cog, Users, Zap, Globe, BookOpen } from 'lucide-react';
import { storageService } from '../../services/storage';

interface WorldRuleFormProps {
  onClose: () => void;
  ruleId?: string;
}

export default function WorldRuleForm({ onClose, ruleId }: WorldRuleFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    category: 'magic' as const,
    title: '',
    description: '',
    examples: [] as string[],
    limitations: [] as string[],
  });
  const [newExample, setNewExample] = useState('');
  const [newLimitation, setNewLimitation] = useState('');

  const isEditing = !!ruleId;
  const existingRule = isEditing ? state.worldRules.find(r => r.id === ruleId) : null;

  useEffect(() => {
    if (existingRule) {
      setFormData({
        category: existingRule.category,
        title: existingRule.title,
        description: existingRule.description,
        examples: [...(existingRule.examples || [])],
        limitations: [...(existingRule.limitations || [])],
      });
    }
  }, [existingRule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) return;
    if (!state.currentProject) return;

    try {
      const ruleData = {
        id: ruleId || Date.now().toString(),
        category: formData.category,
        title: formData.title.trim(),
        description: formData.description.trim(),
        examples: formData.examples.filter(ex => ex.trim()),
        limitations: formData.limitations.filter(lim => lim.trim()),
      };

      await storageService.saveWorldRule({
        ...ruleData,
        projectId: state.currentProject.id,
      });

      if (isEditing) {
        dispatch({ type: 'UPDATE_WORLD_RULE', payload: ruleData });
      } else {
        dispatch({ type: 'ADD_WORLD_RULE', payload: ruleData });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save rule:', error);
    }
  };

  const handleAddExample = () => {
    if (!newExample.trim()) return;
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, newExample.trim()],
    }));
    setNewExample('');
  };

  const handleRemoveExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const handleAddLimitation = () => {
    if (!newLimitation.trim()) return;
    setFormData(prev => ({
      ...prev,
      limitations: [...prev.limitations, newLimitation.trim()],
    }));
    setNewLimitation('');
  };

  const handleRemoveLimitation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      limitations: prev.limitations.filter((_, i) => i !== index),
    }));
  };

  const ruleCategories = [
    { value: 'magic', label: 'Magic', icon: Sparkles, description: 'Magical systems, spells, and supernatural forces' },
    { value: 'technology', label: 'Technology', icon: Cog, description: 'Technological capabilities and limitations' },
    { value: 'society', label: 'Society', icon: Users, description: 'Social structures, laws, and customs' },
    { value: 'physics', label: 'Physics', icon: Zap, description: 'Physical laws and natural phenomena' },
    { value: 'culture', label: 'Culture', icon: Globe, description: 'Cultural norms, traditions, and beliefs' },
    { value: 'other', label: 'Other', icon: BookOpen, description: 'Other world-building rules' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit World Rule' : 'Add World Rule'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ruleCategories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value as any }))}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 text-left transition-all ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {category.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {category.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rule Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Magic requires physical components"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Explain how this rule works in your world..."
              required
            />
          </div>

          {/* Examples */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Examples
            </label>
            
            {/* Existing Examples */}
            {formData.examples.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.examples.map((example, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
                  >
                    <div className="text-sm text-green-700 dark:text-green-300 flex-1">
                      <span className="font-medium">Example {index + 1}:</span>
                      <span className="ml-1">{example}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(index)}
                      className="text-red-500 hover:text-red-700 p-1 ml-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Example */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                placeholder="Add an example..."
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExample())}
              />
              <button
                type="button"
                onClick={handleAddExample}
                disabled={!newExample.trim()}
                className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Limitations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Limitations
            </label>
            
            {/* Existing Limitations */}
            {formData.limitations.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.limitations.map((limitation, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between bg-red-50 dark:bg-red-900/20 rounded-lg p-3"
                  >
                    <div className="text-sm text-red-700 dark:text-red-300 flex-1">
                      <span className="font-medium">Limitation {index + 1}:</span>
                      <span className="ml-1">{limitation}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLimitation(index)}
                      className="text-red-500 hover:text-red-700 p-1 ml-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Limitation */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newLimitation}
                onChange={(e) => setNewLimitation(e.target.value)}
                placeholder="Add a limitation..."
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLimitation())}
              />
              <button
                type="button"
                onClick={handleAddLimitation}
                disabled={!newLimitation.trim()}
                className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              {isEditing ? 'Update' : 'Create'} Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
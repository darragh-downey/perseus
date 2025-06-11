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
        category: existingRule.category as any,
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
        category: formData.category as any,
        title: formData.title.trim(),
        description: formData.description.trim(),
        examples: formData.examples.filter(ex => ex.trim()),
        limitations: formData.limitations.filter(lim => lim.trim()),
        bookId: state.currentBook?.id || '',
        projectId: state.currentProject.id,
        workspaceId: state.currentWorkspace?.id || '',
      };

      await storageService.saveWorldRule(ruleData);

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-surface-dark rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit World Rule' : 'Add World Rule'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3">
              Category <span className="text-accent-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ruleCategories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value as any }))}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                      formData.category === category.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                        : 'border-border-light dark:border-border-dark hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-text-primary dark:text-text-primary-dark">
                        {category.label}
                      </div>
                      <div className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
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
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Rule Title <span className="text-accent-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input-primary w-full"
              placeholder="e.g., Magic requires physical components"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Description <span className="text-accent-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="input-primary w-full resize-none"
              placeholder="Explain how this rule works in your world..."
              required
            />
          </div>

          {/* Examples */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Examples
            </label>
            
            {/* Existing Examples */}
            {formData.examples.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.examples.map((example, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between bg-success-50 dark:bg-success-900/20 rounded-lg p-3 border border-success-200 dark:border-success-800"
                  >
                    <div className="text-sm text-success-700 dark:text-success-300 flex-1">
                      <span className="font-medium">Example {index + 1}:</span>
                      <span className="ml-1">{example}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(index)}
                      className="text-danger-500 hover:text-danger-700 p-1 ml-2 rounded transition-colors"
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
                className="input-secondary flex-1 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExample())}
              />
              <button
                type="button"
                onClick={handleAddExample}
                disabled={!newExample.trim()}
                className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Limitations */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Limitations
            </label>
            
            {/* Existing Limitations */}
            {formData.limitations.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.limitations.map((limitation, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between bg-warning-50 dark:bg-warning-900/20 rounded-lg p-3 border border-warning-200 dark:border-warning-800"
                  >
                    <div className="text-sm text-warning-700 dark:text-warning-300 flex-1">
                      <span className="font-medium">Limitation {index + 1}:</span>
                      <span className="ml-1">{limitation}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLimitation(index)}
                      className="text-danger-500 hover:text-danger-700 p-1 ml-2 rounded transition-colors"
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
                className="input-secondary flex-1 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLimitation())}
              />
              <button
                type="button"
                onClick={handleAddLimitation}
                disabled={!newLimitation.trim()}
                className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border-light dark:border-border-dark">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {isEditing ? 'Update' : 'Create'} Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
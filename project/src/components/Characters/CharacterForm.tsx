import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { X, Plus, Trash2, Palette } from 'lucide-react';
import { storageService } from '../../services/storage';

interface CharacterFormProps {
  onClose: () => void;
  characterId?: string;
}

export default function CharacterForm({ onClose, characterId }: CharacterFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    traits: {} as Record<string, any>,
  });
  const [newTrait, setNewTrait] = useState({ key: '', value: '' });

  const isEditing = !!characterId;
  const existingCharacter = isEditing ? state.characters.find(c => c.id === characterId) : null;

  useEffect(() => {
    if (existingCharacter) {
      setFormData({
        name: existingCharacter.name,
        description: existingCharacter.description || '',
        color: existingCharacter.color || '#3b82f6',
        traits: { ...existingCharacter.traits },
      });
    }
  }, [existingCharacter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    if (!state.currentProject) return;

    try {
      const characterData = {
        id: characterId || Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        traits: formData.traits,
      };

      await storageService.saveCharacter({
        ...characterData,
        projectId: state.currentProject.id,
      });

      if (isEditing) {
        dispatch({ type: 'UPDATE_CHARACTER', payload: characterData });
      } else {
        dispatch({ type: 'ADD_CHARACTER', payload: characterData });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  const handleAddTrait = () => {
    if (!newTrait.key.trim() || !newTrait.value.trim()) return;

    setFormData(prev => ({
      ...prev,
      traits: {
        ...prev.traits,
        [newTrait.key.trim()]: newTrait.value.trim(),
      },
    }));

    setNewTrait({ key: '', value: '' });
  };

  const handleRemoveTrait = (key: string) => {
    setFormData(prev => {
      const newTraits = { ...prev.traits };
      delete newTraits[key];
      return { ...prev, traits: newTraits };
    });
  };

  const colorOptions = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Character' : 'Add Character'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Character name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief description of the character"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Color
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? 'border-gray-900 dark:border-white scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-8 h-8 rounded border-none cursor-pointer"
              />
            </div>
          </div>

          {/* Traits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Traits
            </label>
            
            {/* Existing Traits */}
            {Object.entries(formData.traits).length > 0 && (
              <div className="space-y-2 mb-3">
                {Object.entries(formData.traits).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2"
                  >
                    <div className="text-sm">
                      <span className="font-medium text-blue-700 dark:text-blue-300">{key}:</span>
                      <span className="text-blue-600 dark:text-blue-400 ml-1">{String(value)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTrait(key)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Trait */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTrait.key}
                onChange={(e) => setNewTrait(prev => ({ ...prev, key: e.target.value }))}
                placeholder="Trait name"
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newTrait.value}
                onChange={(e) => setNewTrait(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Value"
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTrait}
                disabled={!newTrait.key.trim() || !newTrait.value.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {isEditing ? 'Update' : 'Create'} Character
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
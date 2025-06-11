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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Character' : 'Add Character'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input input-primary w-full"
              placeholder="Character name"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="textarea w-full"
              placeholder="Brief description of the character"
            />
          </div>

          {/* Color */}
          <div className="form-group">
            <label className="form-label">
              <Palette className="w-4 h-4 inline mr-2" />
              Color
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                      formData.color === color
                        ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-blue-500/50'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Traits */}
          <div className="form-group">
            <label className="form-label">
              Character Traits
            </label>
            
            {/* Existing Traits */}
            {Object.entries(formData.traits).length > 0 && (
              <div className="space-y-2 mb-3">
                {Object.entries(formData.traits).map(([key, value]) => (
                  <div
                    key={key}
                    className="card-sm bg-blue-50 dark:bg-blue-900/20 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium text-blue-700 dark:text-blue-300">{key}:</span>
                        <span className="text-blue-600 dark:text-blue-400 ml-1">{String(value)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrait(key)}
                        className="btn btn-ghost btn-sm p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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
                className="input input-secondary flex-1"
              />
              <input
                type="text"
                value={newTrait.value}
                onChange={(e) => setNewTrait(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Value"
                className="input input-secondary flex-1"
              />
              <button
                type="button"
                onClick={handleAddTrait}
                disabled={!newTrait.key.trim() || !newTrait.value.trim()}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditing ? 'Update' : 'Create'} Character
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
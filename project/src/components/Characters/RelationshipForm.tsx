import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { X, Heart, Sword, Users, Crown, Shield, Zap } from 'lucide-react';
import { storageService } from '../../services/storage';

interface RelationshipFormProps {
  onClose: () => void;
}

export default function RelationshipForm({ onClose }: RelationshipFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    type: '',
    description: '',
    strength: 50,
  });

  const relationshipTypes = [
    { id: 'ally', label: 'Ally', icon: Shield, color: '#10b981' },
    { id: 'friend', label: 'Friend', icon: Users, color: '#3b82f6' },
    { id: 'lover', label: 'Lover', icon: Heart, color: '#ec4899' },
    { id: 'family', label: 'Family', icon: Users, color: '#8b5cf6' },
    { id: 'enemy', label: 'Enemy', icon: Sword, color: '#ef4444' },
    { id: 'rival', label: 'Rival', icon: Zap, color: '#f59e0b' },
    { id: 'mentor', label: 'Mentor', icon: Crown, color: '#06b6d4' },
    { id: 'neutral', label: 'Neutral', icon: Users, color: '#6b7280' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to || !formData.type) return;
    if (formData.from === formData.to) return;
    if (!state.currentProject) return;

    // Check if relationship already exists
    const existingRelationship = state.relationships.find(
      rel => (rel.from === formData.from && rel.to === formData.to) ||
             (rel.from === formData.to && rel.to === formData.from)
    );

    if (existingRelationship) {
      alert('A relationship between these characters already exists.');
      return;
    }

    try {
      const relationshipData = {
        id: Date.now().toString(),
        from: formData.from,
        to: formData.to,
        type: formData.type,
        description: formData.description.trim(),
        strength: formData.strength,
      };

      await storageService.saveRelationship({
        ...relationshipData,
        projectId: state.currentProject.id,
      });

      dispatch({ type: 'ADD_RELATIONSHIP', payload: relationshipData });
      onClose();
    } catch (error) {
      console.error('Failed to save relationship:', error);
    }
  };

  const getCharacterName = (id: string) => {
    return state.characters.find(c => c.id === id)?.name || '';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Moderate';
    if (strength < 75) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return 'text-red-600 dark:text-red-400';
    if (strength < 50) return 'text-yellow-600 dark:text-yellow-400';
    if (strength < 75) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Relationship
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
          {/* Character Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                From Character *
              </label>
              <select
                value={formData.from}
                onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                className="input input-primary w-full"
                required
              >
                <option value="">Select character</option>
                {state.characters.map(character => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                To Character *
              </label>
              <select
                value={formData.to}
                onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                className="input input-primary w-full"
                required
              >
                <option value="">Select character</option>
                {state.characters
                  .filter(character => character.id !== formData.from)
                  .map(character => (
                    <option key={character.id} value={character.id}>
                      {character.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Relationship Preview */}
          {formData.from && formData.to && (
            <div className="card-sm bg-blue-50 dark:bg-blue-900/20 p-4 animate-slide-up">
              <div className="text-sm text-blue-700 dark:text-blue-300 text-center">
                <span className="font-medium">{getCharacterName(formData.from)}</span>
                <span className="mx-3 text-lg">→</span>
                <span className="font-medium">{getCharacterName(formData.to)}</span>
              </div>
            </div>
          )}

          {/* Relationship Type */}
          <div className="form-group">
            <label className="form-label">
              Relationship Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {relationshipTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      formData.type === type.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: type.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strength */}
          <div className="form-group">
            <label className="form-label">
              Relationship Strength: {formData.strength}% 
              <span className={`ml-2 text-sm font-medium ${getStrengthColor(formData.strength)}`}>
                ({getStrengthLabel(formData.strength)})
              </span>
            </label>
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.strength}
                onChange={(e) => setFormData(prev => ({ ...prev, strength: parseInt(e.target.value) }))}
                className="slider w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Weak</span>
                <span>Moderate</span>
                <span>Strong</span>
                <span>Very Strong</span>
              </div>
            </div>
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
              placeholder="Describe the nature of this relationship..."
            />
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
              disabled={!formData.from || !formData.to || !formData.type}
              className="btn btn-primary"
            >
              Create Relationship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
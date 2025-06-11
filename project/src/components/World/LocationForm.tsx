import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { X, Plus, Trash2, Palette, MapPin, Link } from 'lucide-react';
import { storageService } from '../../services/storage';

interface LocationFormProps {
  onClose: () => void;
  locationId?: string;
}

export default function LocationForm({ onClose, locationId }: LocationFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    type: 'city' as const,
    description: '',
    color: '#3b82f6',
    properties: {} as Record<string, any>,
    connections: [] as string[],
  });
  const [newProperty, setNewProperty] = useState({ key: '', value: '' });

  const isEditing = !!locationId;
  const existingLocation = isEditing ? state.locations.find(l => l.id === locationId) : null;

  useEffect(() => {
    if (existingLocation) {
      setFormData({
        name: existingLocation.name,
        type: existingLocation.type as any,
        description: existingLocation.description || '',
        color: existingLocation.color || '#3b82f6',
        properties: { ...existingLocation.properties },
        connections: [...existingLocation.connections],
      });
    }
  }, [existingLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    if (!state.currentProject) return;

    try {
      const locationData = {
        id: locationId || Date.now().toString(),
        name: formData.name.trim(),
        type: formData.type as any,
        description: formData.description.trim(),
        color: formData.color,
        properties: formData.properties,
        connections: formData.connections,
        bookId: state.currentBook?.id || '',
        projectId: state.currentProject.id,
        workspaceId: state.currentWorkspace?.id || '',
      };

      await storageService.saveLocation(locationData);

      if (isEditing) {
        dispatch({ type: 'UPDATE_LOCATION', payload: locationData });
      } else {
        dispatch({ type: 'ADD_LOCATION', payload: locationData });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  const handleAddProperty = () => {
    if (!newProperty.key.trim() || !newProperty.value.trim()) return;

    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [newProperty.key.trim()]: newProperty.value.trim(),
      },
    }));

    setNewProperty({ key: '', value: '' });
  };

  const handleRemoveProperty = (key: string) => {
    setFormData(prev => {
      const newProperties = { ...prev.properties };
      delete newProperties[key];
      return { ...prev, properties: newProperties };
    });
  };

  const handleToggleConnection = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      connections: prev.connections.includes(locationId)
        ? prev.connections.filter(id => id !== locationId)
        : [...prev.connections, locationId],
    }));
  };

  const locationTypes = [
    { value: 'city', label: 'City', icon: '🏙️' },
    { value: 'building', label: 'Building', icon: '🏢' },
    { value: 'region', label: 'Region', icon: '🗺️' },
    { value: 'landmark', label: 'Landmark', icon: '🏛️' },
    { value: 'natural', label: 'Natural', icon: '🌲' },
    { value: 'other', label: 'Other', icon: '📍' },
  ];

  const colorOptions = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  const availableLocations = state.locations.filter(l => l.id !== locationId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-surface-dark rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Location' : 'Add Location'}
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
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                Name <span className="text-accent-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-primary w-full"
                placeholder="Location name"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                Type <span className="text-accent-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="input-primary w-full"
                required
              >
                {locationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="input-primary w-full resize-none"
              placeholder="Describe this location..."
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Color
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-105 ${
                      formData.color === color
                        ? 'border-text-primary dark:border-text-primary-dark scale-110 shadow-lg'
                        : 'border-border-light dark:border-border-dark'
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

          {/* Properties */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Properties
            </label>
            
            {/* Existing Properties */}
            {Object.entries(formData.properties).length > 0 && (
              <div className="space-y-2 mb-3">
                {Object.entries(formData.properties).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-success-50 dark:bg-success-900/20 rounded-lg p-3 border border-success-200 dark:border-success-800"
                  >
                    <div className="text-sm">
                      <span className="font-medium text-success-700 dark:text-success-300">{key}:</span>
                      <span className="text-success-600 dark:text-success-400 ml-1">{String(value)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProperty(key)}
                      className="text-danger-500 hover:text-danger-700 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Property */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newProperty.key}
                onChange={(e) => setNewProperty(prev => ({ ...prev, key: e.target.value }))}
                placeholder="Property name"
                className="input-secondary flex-1 text-sm"
              />
              <input
                type="text"
                value={newProperty.value}
                onChange={(e) => setNewProperty(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Value"
                className="input-secondary flex-1 text-sm"
              />
              <button
                type="button"
                onClick={handleAddProperty}
                disabled={!newProperty.key.trim() || !newProperty.value.trim()}
                className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Connections */}
          {availableLocations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                <Link className="w-4 h-4 inline mr-1" />
                Connected Locations
              </label>
              <div className="max-h-40 overflow-y-auto border border-border-light dark:border-border-dark rounded-lg p-3 bg-surface-light dark:bg-surface-dark">
                <div className="space-y-2">
                  {availableLocations.map(location => (
                    <label
                      key={location.id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-surface-light dark:hover:bg-surface-dark p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.connections.includes(location.id)}
                        onChange={() => handleToggleConnection(location.id)}
                        className="rounded border-border-light text-primary-600 focus:ring-primary-500"
                      />
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs shadow-sm"
                        style={{ backgroundColor: location.color || '#3b82f6' }}
                      >
                        <MapPin className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-text-primary dark:text-text-primary-dark font-medium">{location.name}</span>
                      <span className="badge badge-secondary text-xs capitalize">
                        {location.type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2">
                {formData.connections.length} location{formData.connections.length !== 1 ? 's' : ''} connected
              </div>
            </div>
          )}

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
              {isEditing ? 'Update' : 'Create'} Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
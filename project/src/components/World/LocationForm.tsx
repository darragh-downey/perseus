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
        type: existingLocation.type,
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
        type: formData.type,
        description: formData.description.trim(),
        color: formData.color,
        properties: formData.properties,
        connections: formData.connections,
      };

      await storageService.saveLocation({
        ...locationData,
        projectId: state.currentProject.id,
      });

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Location' : 'Add Location'}
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
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Location name"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe this location..."
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

          {/* Properties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Properties
            </label>
            
            {/* Existing Properties */}
            {Object.entries(formData.properties).length > 0 && (
              <div className="space-y-2 mb-3">
                {Object.entries(formData.properties).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg p-2"
                  >
                    <div className="text-sm">
                      <span className="font-medium text-green-700 dark:text-green-300">{key}:</span>
                      <span className="text-green-600 dark:text-green-400 ml-1">{String(value)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProperty(key)}
                      className="text-red-500 hover:text-red-700 p-1"
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
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newProperty.value}
                onChange={(e) => setNewProperty(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Value"
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddProperty}
                disabled={!newProperty.key.trim() || !newProperty.value.trim()}
                className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Connections */}
          {availableLocations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Link className="w-4 h-4 inline mr-1" />
                Connected Locations
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="space-y-2">
                  {availableLocations.map(location => (
                    <label
                      key={location.id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.connections.includes(location.id)}
                        onChange={() => handleToggleConnection(location.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: location.color || '#3b82f6' }}
                      >
                        <MapPin className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{location.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({location.type})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.connections.length} location{formData.connections.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}

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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              {isEditing ? 'Update' : 'Create'} Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
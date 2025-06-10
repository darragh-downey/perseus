import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { X, Calendar, MapPin, Users, Star } from 'lucide-react';
import { storageService } from '../../services/storage';

interface EventFormProps {
  onClose: () => void;
  eventId?: string;
}

export default function EventForm({ onClose, eventId }: EventFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    type: 'historical' as const,
    locationIds: [] as string[],
    characterIds: [] as string[],
    importance: 5,
    consequences: '',
  });

  const isEditing = !!eventId;
  const existingEvent = isEditing ? state.worldEvents.find(e => e.id === eventId) : null;

  useEffect(() => {
    if (existingEvent) {
      setFormData({
        name: existingEvent.name,
        description: existingEvent.description || '',
        date: existingEvent.date,
        type: existingEvent.type,
        locationIds: [...existingEvent.locationIds],
        characterIds: [...existingEvent.characterIds],
        importance: existingEvent.importance,
        consequences: existingEvent.consequences || '',
      });
    }
  }, [existingEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.date.trim()) return;
    if (!state.currentProject) return;

    try {
      const eventData = {
        id: eventId || Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: formData.date.trim(),
        type: formData.type,
        locationIds: formData.locationIds,
        characterIds: formData.characterIds,
        importance: formData.importance,
        consequences: formData.consequences.trim(),
      };

      await storageService.saveWorldEvent({
        ...eventData,
        projectId: state.currentProject.id,
      });

      if (isEditing) {
        dispatch({ type: 'UPDATE_WORLD_EVENT', payload: eventData });
      } else {
        dispatch({ type: 'ADD_WORLD_EVENT', payload: eventData });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleToggleLocation = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      locationIds: prev.locationIds.includes(locationId)
        ? prev.locationIds.filter(id => id !== locationId)
        : [...prev.locationIds, locationId],
    }));
  };

  const handleToggleCharacter = (characterId: string) => {
    setFormData(prev => ({
      ...prev,
      characterIds: prev.characterIds.includes(characterId)
        ? prev.characterIds.filter(id => id !== characterId)
        : [...prev.characterIds, characterId],
    }));
  };

  const eventTypes = [
    { value: 'historical', label: 'Historical', icon: '📜' },
    { value: 'political', label: 'Political', icon: '⚔️' },
    { value: 'natural', label: 'Natural', icon: '🌋' },
    { value: 'cultural', label: 'Cultural', icon: '🎭' },
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'other', label: 'Other', icon: '📅' },
  ];

  const getImportanceLabel = (importance: number) => {
    if (importance <= 2) return 'Minor';
    if (importance <= 4) return 'Moderate';
    if (importance <= 6) return 'Significant';
    if (importance <= 8) return 'Major';
    return 'World-changing';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Event' : 'Add Event'}
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
                Event Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event name"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Year 1247, Age of Dragons"
                required
              />
            </div>
          </div>

          {/* Type and Importance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Importance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Star className="w-4 h-4 inline mr-1" />
                Importance: {formData.importance}/10 ({getImportanceLabel(formData.importance)})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.importance}
                onChange={(e) => setFormData(prev => ({ ...prev, importance: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Minor</span>
                <span>Moderate</span>
                <span>Significant</span>
                <span>Major</span>
                <span>World-changing</span>
              </div>
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
              placeholder="Describe what happened during this event..."
            />
          </div>

          {/* Locations */}
          {state.locations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Related Locations
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2">
                  {state.locations.map(location => (
                    <label
                      key={location.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.locationIds.includes(location.id)}
                        onChange={() => handleToggleLocation(location.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white truncate">{location.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Characters */}
          {state.characters.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Involved Characters
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2">
                  {state.characters.map(character => (
                    <label
                      key={character.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.characterIds.includes(character.id)}
                        onChange={() => handleToggleCharacter(character.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white truncate">{character.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Consequences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Consequences
            </label>
            <textarea
              value={formData.consequences}
              onChange={(e) => setFormData(prev => ({ ...prev, consequences: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What were the long-term effects of this event?"
            />
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
              {isEditing ? 'Update' : 'Create'} Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
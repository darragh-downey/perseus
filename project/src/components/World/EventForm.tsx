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
        type: existingEvent.type as any,
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
        type: formData.type as any,
        locationIds: formData.locationIds,
        characterIds: formData.characterIds,
        importance: formData.importance,
        consequences: formData.consequences.trim(),
        bookId: state.currentBook?.id || '',
        projectId: state.currentProject.id,
        workspaceId: state.currentWorkspace?.id || '',
      };

      await storageService.saveWorldEvent(eventData);

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-surface-dark rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Event' : 'Add Event'}
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
                Event Name <span className="text-accent-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-primary w-full"
                placeholder="Event name"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date <span className="text-accent-500">*</span>
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="input-primary w-full"
                placeholder="e.g., Year 1247, Age of Dragons"
                required
              />
            </div>
          </div>

          {/* Type and Importance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                Event Type <span className="text-accent-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="input-primary w-full"
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
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                <Star className="w-4 h-4 inline mr-1" />
                Importance: {formData.importance}/10 
                <span className="badge badge-primary ml-2">
                  {getImportanceLabel(formData.importance)}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.importance}
                onChange={(e) => setFormData(prev => ({ ...prev, importance: parseInt(e.target.value) }))}
                className="w-full h-2 bg-surface-light dark:bg-surface-dark rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
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
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="input-primary w-full resize-none"
              placeholder="Describe what happened during this event..."
            />
          </div>

          {/* Locations */}
          {state.locations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Related Locations
              </label>
              <div className="max-h-32 overflow-y-auto border border-border-light dark:border-border-dark rounded-lg p-3 bg-surface-light dark:bg-surface-dark">
                <div className="grid grid-cols-2 gap-2">
                  {state.locations.map(location => (
                    <label
                      key={location.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-surface-light dark:hover:bg-surface-dark p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.locationIds.includes(location.id)}
                        onChange={() => handleToggleLocation(location.id)}
                        className="rounded border-border-light text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-text-primary dark:text-text-primary-dark truncate font-medium">{location.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2">
                {formData.locationIds.length} location{formData.locationIds.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}

          {/* Characters */}
          {state.characters.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Involved Characters
              </label>
              <div className="max-h-32 overflow-y-auto border border-border-light dark:border-border-dark rounded-lg p-3 bg-surface-light dark:bg-surface-dark">
                <div className="grid grid-cols-2 gap-2">
                  {state.characters.map(character => (
                    <label
                      key={character.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-surface-light dark:hover:bg-surface-dark p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.characterIds.includes(character.id)}
                        onChange={() => handleToggleCharacter(character.id)}
                        className="rounded border-border-light text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-text-primary dark:text-text-primary-dark truncate font-medium">{character.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2">
                {formData.characterIds.length} character{formData.characterIds.length !== 1 ? 's' : ''} involved
              </div>
            </div>
          )}

          {/* Consequences */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Consequences
            </label>
            <textarea
              value={formData.consequences}
              onChange={(e) => setFormData(prev => ({ ...prev, consequences: e.target.value }))}
              rows={3}
              className="input-primary w-full resize-none"
              placeholder="What were the long-term effects of this event?"
            />
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
              {isEditing ? 'Update' : 'Create'} Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
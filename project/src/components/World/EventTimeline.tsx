import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { Calendar, MapPin, Users, Star, Edit2, Trash2, Filter, Search } from 'lucide-react';
import { storageService } from '../../services/storage';

export default function EventTimeline() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'historical' | 'political' | 'natural' | 'cultural' | 'personal' | 'other'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'importance' | 'name'>('date');

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await storageService.deleteWorldEvent(eventId);
      dispatch({ type: 'DELETE_WORLD_EVENT', payload: eventId });
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const getEventLocations = (event: any) => {
    return event.locationIds
      .map((id: string) => state.locations.find(l => l.id === id)?.name)
      .filter(Boolean);
  };

  const getEventCharacters = (event: any) => {
    return event.characterIds
      .map((id: string) => state.characters.find(c => c.id === id)?.name)
      .filter(Boolean);
  };

  const filteredEvents = state.worldEvents
    .filter(event => {
      // Search filter
      const matchesSearch = !searchQuery || 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      if (!matchesSearch) return false;

      // Type filter
      if (filterBy !== 'all' && event.type !== filterBy) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'importance':
          return b.importance - a.importance;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
        default:
          return a.date.localeCompare(b.date);
      }
    });

  const eventTypeColors = {
    historical: '#8b5cf6',
    political: '#ef4444',
    natural: '#84cc16',
    cultural: '#f59e0b',
    personal: '#ec4899',
    other: '#6b7280',
  };

  const getTypeColor = (type: string) => {
    return eventTypeColors[type as keyof typeof eventTypeColors] || eventTypeColors.other;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      historical: '📜',
      political: '⚔️',
      natural: '🌋',
      cultural: '🎭',
      personal: '👤',
      other: '📅',
    };
    return icons[type as keyof typeof icons] || icons.other;
  };

  const getImportanceStars = (importance: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < importance / 2 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  if (state.worldEvents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Calendar className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Events Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first historical event to start building your world's timeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="historical">Historical</option>
              <option value="political">Political</option>
              <option value="natural">Natural</option>
              <option value="cultural">Cultural</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="importance">Sort by Importance</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filterBy !== 'all' ? 'No events match your filters' : 'No events found'}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
            
            <div className="space-y-8">
              {filteredEvents.map((event, index) => {
                const locations = getEventLocations(event);
                const characters = getEventCharacters(event);
                
                return (
                  <div key={event.id} className="relative flex items-start space-x-6">
                    {/* Timeline Dot */}
                    <div
                      className="relative z-10 w-4 h-4 rounded-full border-4 border-white dark:border-gray-800 flex-shrink-0"
                      style={{ backgroundColor: getTypeColor(event.type) }}
                    />
                    
                    {/* Event Card */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                            style={{ backgroundColor: getTypeColor(event.type) }}
                          >
                            {getTypeIcon(event.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {event.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="capitalize">{event.type}</span>
                              <span>•</span>
                              <span>{event.date}</span>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                {getImportanceStars(event.importance)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {/* Edit event */}}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      {/* Locations and Characters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Locations */}
                        {locations.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Locations</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {locations.map(location => (
                                <span
                                  key={location}
                                  className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full"
                                >
                                  {location}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Characters */}
                        {characters.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Characters</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {characters.map(character => (
                                <span
                                  key={character}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                                >
                                  {character}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Consequences */}
                      {event.consequences && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                            Consequences
                          </div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {event.consequences}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
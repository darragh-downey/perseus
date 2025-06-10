import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { Edit2, Trash2, MapPin, Search, Filter, Plus, Link } from 'lucide-react';
import { storageService } from '../../services/storage';

export default function LocationList() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'city' | 'building' | 'region' | 'landmark' | 'natural' | 'other'>('all');
  const [editingLocation, setEditingLocation] = useState<string | null>(null);

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location? This will also remove all connections to it.')) {
      return;
    }

    try {
      await storageService.deleteLocation(locationId);
      dispatch({ type: 'DELETE_LOCATION', payload: locationId });
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  const getLocationConnections = (locationId: string) => {
    const location = state.locations.find(l => l.id === locationId);
    return location ? location.connections.length : 0;
  };

  const getConnectedLocationNames = (locationId: string) => {
    const location = state.locations.find(l => l.id === locationId);
    if (!location) return [];
    
    return location.connections
      .map(connId => state.locations.find(l => l.id === connId)?.name)
      .filter(Boolean) as string[];
  };

  const filteredLocations = state.locations
    .filter(location => {
      // Search filter
      const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      if (!matchesSearch) return false;

      // Type filter
      if (filterBy !== 'all' && location.type !== filterBy) return false;

      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const locationTypeColors = {
    city: '#3b82f6',
    building: '#10b981',
    region: '#f59e0b',
    landmark: '#ef4444',
    natural: '#84cc16',
    other: '#6b7280',
  };

  const getTypeColor = (type: string) => {
    return locationTypeColors[type as keyof typeof locationTypeColors] || locationTypeColors.other;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      city: '🏙️',
      building: '🏢',
      region: '🗺️',
      landmark: '🏛️',
      natural: '🌲',
      other: '📍',
    };
    return icons[type as keyof typeof icons] || icons.other;
  };

  if (state.locations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <MapPin className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Locations Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first location to start building your story world.
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
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="city">Cities</option>
              <option value="building">Buildings</option>
              <option value="region">Regions</option>
              <option value="landmark">Landmarks</option>
              <option value="natural">Natural</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filterBy !== 'all' ? 'No locations match your filters' : 'No locations found'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLocations.map((location) => {
              const connections = getLocationConnections(location.id);
              const connectedNames = getConnectedLocationNames(location.id);
              
              return (
                <div
                  key={location.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: location.color || getTypeColor(location.type) }}
                      >
                        {getTypeIcon(location.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {location.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{location.type}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Link className="w-3 h-3" />
                            <span>{connections} connection{connections !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingLocation(location.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                        title="Edit Location"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                        title="Delete Location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {location.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {location.description}
                    </p>
                  )}

                  {/* Properties */}
                  {Object.keys(location.properties).length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Properties</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(location.properties).slice(0, 3).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                        {Object.keys(location.properties).length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            +{Object.keys(location.properties).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Connected Locations */}
                  {connectedNames.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Connected To</div>
                      <div className="space-y-1">
                        {connectedNames.slice(0, 2).map((name) => (
                          <div
                            key={name}
                            className="flex items-center text-xs"
                          >
                            <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-gray-600 dark:text-gray-300 truncate">
                              {name}
                            </span>
                          </div>
                        ))}
                        {connectedNames.length > 2 && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            +{connectedNames.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
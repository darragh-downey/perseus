import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import LocationMap from '../World/LocationMap';
import LocationList from '../World/LocationList';
import LocationForm from '../World/LocationForm';
import EventTimeline from '../World/EventTimeline';
import EventForm from '../World/EventForm';
import WorldRules from '../World/WorldRules';
import WorldRuleForm from '../World/WorldRuleForm';
import { 
  Plus, 
  Map, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Globe, 
  Layers,
  Clock,
  Scroll,
  Sparkles,
  Eye,
  BarChart3,
} from 'lucide-react';

type ViewMode = 'map' | 'locations' | 'timeline' | 'rules' | 'analytics';
type FormMode = 'location' | 'event' | 'rule' | null;

export default function WorldView() {
  const { state } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [showForm, setShowForm] = useState<FormMode>(null);

  const viewOptions = [
    { id: 'map', label: 'World Map', icon: Map, description: 'Interactive location map' },
    { id: 'locations', label: 'Locations', icon: MapPin, description: 'Manage all locations' },
    { id: 'timeline', label: 'Timeline', icon: Calendar, description: 'Historical events' },
    { id: 'rules', label: 'World Rules', icon: BookOpen, description: 'Magic, physics, society' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'World building insights' },
  ];

  const renderContent = () => {
    switch (viewMode) {
      case 'map':
        return <LocationMap />;
      case 'locations':
        return <LocationList />;
      case 'timeline':
        return <EventTimeline />;
      case 'rules':
        return <WorldRules />;
      case 'analytics':
        return <WorldAnalytics />;
      default:
        return null;
    }
  };

  const getActionButton = () => {
    switch (viewMode) {
      case 'map':
      case 'locations':
        return {
          label: 'Add Location',
          icon: Plus,
          action: () => setShowForm('location'),
          color: 'bg-green-600 hover:bg-green-700',
        };
      case 'timeline':
        return {
          label: 'Add Event',
          icon: Plus,
          action: () => setShowForm('event'),
          color: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'rules':
        return {
          label: 'Add Rule',
          icon: Plus,
          action: () => setShowForm('rule'),
          color: 'bg-purple-600 hover:bg-purple-700',
        };
      default:
        return null;
    }
  };

  const actionButton = getActionButton();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                World Building
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage your story's world, locations, and history
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {actionButton && (
              <button
                onClick={actionButton.action}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white shadow-sm ${actionButton.color}`}
              >
                <actionButton.icon className="w-4 h-4" />
                <span>{actionButton.label}</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setViewMode(option.id as ViewMode)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  viewMode === option.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title={option.description}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Locations</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{state.locations.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Events</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{state.worldEvents.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Scroll className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Rules</div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{state.worldRules.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Layers className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Connections</div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {state.locations.reduce((total, loc) => total + loc.connections.length, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Forms */}
      {showForm === 'location' && (
        <LocationForm onClose={() => setShowForm(null)} />
      )}

      {showForm === 'event' && (
        <EventForm onClose={() => setShowForm(null)} />
      )}

      {showForm === 'rule' && (
        <WorldRuleForm onClose={() => setShowForm(null)} />
      )}
    </div>
  );
}

// World Analytics Component
function WorldAnalytics() {
  const { state } = useApp();

  const getLocationsByType = () => {
    const types: { [key: string]: number } = {};
    state.locations.forEach(loc => {
      types[loc.type] = (types[loc.type] || 0) + 1;
    });
    return Object.entries(types).sort((a, b) => b[1] - a[1]);
  };

  const getEventsByType = () => {
    const types: { [key: string]: number } = {};
    state.worldEvents.forEach(event => {
      types[event.type] = (types[event.type] || 0) + 1;
    });
    return Object.entries(types).sort((a, b) => b[1] - a[1]);
  };

  const getRulesByCategory = () => {
    const categories: { [key: string]: number } = {};
    state.worldRules.forEach(rule => {
      categories[rule.category] = (categories[rule.category] || 0) + 1;
    });
    return Object.entries(categories).sort((a, b) => b[1] - a[1]);
  };

  const getMostConnectedLocations = () => {
    return state.locations
      .map(loc => ({
        location: loc,
        connectionCount: loc.connections.length,
      }))
      .sort((a, b) => b.connectionCount - a.connectionCount)
      .slice(0, 5);
  };

  const locationTypes = getLocationsByType();
  const eventTypes = getEventsByType();
  const ruleCategories = getRulesByCategory();
  const connectedLocations = getMostConnectedLocations();

  const getTypeColor = (type: string, category: 'location' | 'event' | 'rule') => {
    const colors = {
      location: {
        city: '#3b82f6',
        building: '#10b981',
        region: '#f59e0b',
        landmark: '#ef4444',
        natural: '#84cc16',
        other: '#6b7280',
      },
      event: {
        historical: '#8b5cf6',
        political: '#ef4444',
        natural: '#84cc16',
        cultural: '#f59e0b',
        personal: '#ec4899',
        other: '#6b7280',
      },
      rule: {
        magic: '#8b5cf6',
        technology: '#06b6d4',
        society: '#f59e0b',
        physics: '#10b981',
        culture: '#ec4899',
        other: '#6b7280',
      },
    };
    return colors[category][type as keyof typeof colors[typeof category]] || '#6b7280';
  };

  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">World Building Analytics</h3>
          
          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Location Types */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Location Types</h4>
              <div className="space-y-3">
                {locationTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getTypeColor(type, 'location') }}
                      />
                      <span className="text-gray-900 dark:text-white capitalize">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: getTypeColor(type, 'location'),
                            width: `${(count / state.locations.length) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Types */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Event Types</h4>
              <div className="space-y-3">
                {eventTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getTypeColor(type, 'event') }}
                      />
                      <span className="text-gray-900 dark:text-white capitalize">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: getTypeColor(type, 'event'),
                            width: `${(count / state.worldEvents.length) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rule Categories */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Rule Categories</h4>
              <div className="space-y-3">
                {ruleCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getTypeColor(category, 'rule') }}
                      />
                      <span className="text-gray-900 dark:text-white capitalize">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: getTypeColor(category, 'rule'),
                            width: `${(count / state.worldRules.length) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Most Connected Locations */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Most Connected Locations</h4>
            <div className="space-y-4">
              {connectedLocations.map((item, index) => (
                <div key={item.location.id} className="flex items-center space-x-4">
                  <div className="text-lg font-bold text-gray-400 w-6">#{index + 1}</div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: item.location.color || getTypeColor(item.location.type, 'location') }}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{item.location.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {item.location.type} • {item.connectionCount} connections
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{item.connectionCount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* World Insights */}
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">World Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {state.locations.length > 0 ? Math.round(state.locations.reduce((total, loc) => total + loc.connections.length, 0) / state.locations.length * 10) / 10 : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Connections per Location</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {state.worldEvents.filter(e => e.importance >= 8).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Major Historical Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {Math.round((state.worldRules.length / Math.max(state.locations.length, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">World Consistency Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
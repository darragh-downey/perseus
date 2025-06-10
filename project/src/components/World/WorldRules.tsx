import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { BookOpen, Edit2, Trash2, Search, Filter, Sparkles, Cog, Users, Zap, Globe, Plus } from 'lucide-react';
import { storageService } from '../../services/storage';

export default function WorldRules() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'magic' | 'technology' | 'society' | 'physics' | 'culture' | 'other'>('all');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      await storageService.deleteWorldRule(ruleId);
      dispatch({ type: 'DELETE_WORLD_RULE', payload: ruleId });
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const filteredRules = state.worldRules
    .filter(rule => {
      // Search filter
      const matchesSearch = !searchQuery || 
        rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Category filter
      if (filterBy !== 'all' && rule.category !== filterBy) return false;

      return true;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const ruleCategories = [
    { value: 'magic', label: 'Magic', icon: Sparkles, color: '#8b5cf6' },
    { value: 'technology', label: 'Technology', icon: Cog, color: '#06b6d4' },
    { value: 'society', label: 'Society', icon: Users, color: '#f59e0b' },
    { value: 'physics', label: 'Physics', icon: Zap, color: '#10b981' },
    { value: 'culture', label: 'Culture', icon: Globe, color: '#ec4899' },
    { value: 'other', label: 'Other', icon: BookOpen, color: '#6b7280' },
  ];

  const getCategoryInfo = (category: string) => {
    return ruleCategories.find(cat => cat.value === category) || ruleCategories[ruleCategories.length - 1];
  };

  const groupedRules = ruleCategories.reduce((acc, category) => {
    acc[category.value] = filteredRules.filter(rule => rule.category === category.value);
    return acc;
  }, {} as Record<string, typeof filteredRules>);

  if (state.worldRules.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <BookOpen className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No World Rules Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Define the rules that govern your fictional world - magic systems, technology, society, and more.
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
              placeholder="Search rules..."
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
              <option value="all">All Categories</option>
              {ruleCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredRules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filterBy !== 'all' ? 'No rules match your filters' : 'No rules found'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {ruleCategories.map(category => {
              const categoryRules = groupedRules[category.value];
              if (categoryRules.length === 0) return null;

              const Icon = category.icon;

              return (
                <div key={category.value}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.label}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({categoryRules.length})
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryRules.map(rule => (
                      <div
                        key={rule.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {rule.title}
                              </h4>
                              <span
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: category.color }}
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                {category.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={() => {/* Edit rule */}}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                                title="Edit Rule"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                                title="Delete Rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                            {rule.description}
                          </p>

                          {/* Examples */}
                          {rule.examples && rule.examples.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Examples
                              </div>
                              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                {rule.examples.slice(0, 2).map((example, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-gray-400 mr-1">•</span>
                                    <span>{example}</span>
                                  </li>
                                ))}
                                {rule.examples.length > 2 && (
                                  <li className="text-gray-400">
                                    +{rule.examples.length - 2} more examples
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Limitations */}
                          {rule.limitations && rule.limitations.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Limitations
                              </div>
                              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                {rule.limitations.slice(0, 2).map((limitation, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-red-400 mr-1">•</span>
                                    <span>{limitation}</span>
                                  </li>
                                ))}
                                {rule.limitations.length > 2 && (
                                  <li className="text-gray-400">
                                    +{rule.limitations.length - 2} more limitations
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Expand Button */}
                          {((rule.examples && rule.examples.length > 2) || 
                            (rule.limitations && rule.limitations.length > 2)) && (
                            <button
                              onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                              className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {expandedRule === rule.id ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </div>

                        {/* Expanded Content */}
                        {expandedRule === rule.id && (
                          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600 pt-3">
                            {rule.examples && rule.examples.length > 2 && (
                              <div className="mb-3">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  All Examples
                                </div>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                  {rule.examples.slice(2).map((example, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-gray-400 mr-1">•</span>
                                      <span>{example}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {rule.limitations && rule.limitations.length > 2 && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  All Limitations
                                </div>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                  {rule.limitations.slice(2).map((limitation, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-red-400 mr-1">•</span>
                                      <span>{limitation}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
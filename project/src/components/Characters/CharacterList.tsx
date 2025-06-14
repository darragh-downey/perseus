import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { Edit2, Trash2, User, Search, Filter } from 'lucide-react';
import { storageService } from '../../services/storage';

export default function CharacterList() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'hasRelationships' | 'noRelationships'>('all');
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character? This will also remove all their relationships.')) {
      return;
    }

    try {
      await storageService.deleteCharacter(characterId);
      
      // Delete associated relationships
      const relatedRelationships = state.relationships.filter(
        rel => rel.from === characterId || rel.to === characterId
      );
      
      for (const rel of relatedRelationships) {
        await storageService.deleteRelationship(rel.id);
      }
      
      dispatch({ type: 'DELETE_CHARACTER', payload: characterId });
    } catch (error) {
      console.error('Failed to delete character:', error);
    }
  };

  const getCharacterRelationships = (characterId: string) => {
    return state.relationships.filter(
      rel => rel.from === characterId || rel.to === characterId
    );
  };

  const filteredCharacters = state.characters
    .filter(character => {
      // Search filter
      const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (character.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      if (!matchesSearch) return false;

      // Relationship filter
      const relationships = getCharacterRelationships(character.id);
      switch (filterBy) {
        case 'hasRelationships':
          return relationships.length > 0;
        case 'noRelationships':
          return relationships.length === 0;
        default:
          return true;
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (state.characters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <User className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Characters Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first character to start building your story world.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 animate-fade-in">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-primary w-full pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="input input-secondary"
            >
              <option value="all">All Characters</option>
              <option value="hasRelationships">With Relationships</option>
              <option value="noRelationships">Without Relationships</option>
            </select>
          </div>
        </div>
      </div>

      {/* Character List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filterBy !== 'all' ? 'No characters match your filters' : 'No characters found'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCharacters.map((character) => {
              const relationships = getCharacterRelationships(character.id);
              
              return (
                <div
                  key={character.id}
                  className="card-interactive group p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: character.color || '#3b82f6' }}
                      >
                        {character.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {character.name}
                        </h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingCharacter(character.id)}
                        className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 p-1"
                        title="Edit Character"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCharacter(character.id)}
                        className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700"
                        title="Delete Character"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {character.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {character.description}
                    </p>
                  )}

                  {/* Traits */}
                  {Object.keys(character.traits).length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Traits</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(character.traits).slice(0, 3).map(([key, value]) => (
                          <span
                            key={key}
                            className="badge badge-secondary text-xs"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                        {Object.keys(character.traits).length > 3 && (
                          <span className="badge badge-secondary text-xs">
                            +{Object.keys(character.traits).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Relationships */}
                  {relationships.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Relationships</div>
                      <div className="space-y-1">
                        {relationships.slice(0, 2).map((rel) => {
                          const otherCharacterId = rel.from === character.id ? rel.to : rel.from;
                          const otherCharacter = state.characters.find(c => c.id === otherCharacterId);
                          
                          return (
                            <div
                              key={rel.id}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="text-gray-600 dark:text-gray-300 truncate">
                                {otherCharacter?.name}
                              </span>
                              <span className="badge badge-primary text-xs ml-2">
                                {rel.type}
                              </span>
                            </div>
                          );
                        })}
                        {relationships.length > 2 && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            +{relationships.length - 2} more
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
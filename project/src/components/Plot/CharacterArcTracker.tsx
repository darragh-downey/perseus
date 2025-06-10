import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { Character, CharacterArcPoint } from '../../contexts/AppContext';
import { storageService } from '../../services';

// Emotional dimensions for character development
const EMOTIONAL_DIMENSIONS = [
  'Confidence',
  'Fear',
  'Hope',
  'Courage',
  'Selflessness',
  'Trust',
  'Determination',
  'Wisdom'
];

// Key beats for character development
const CHARACTER_BEATS = [
  { name: 'Opening Image', percentage: 0 },
  { name: 'Catalyst', percentage: 10 },
  { name: 'Break into Two', percentage: 20 },
  { name: 'Midpoint', percentage: 50 },
  { name: 'All Is Lost', percentage: 75 },
  { name: 'Final Image', percentage: 100 }
];

interface CharacterArcTrackerProps {
  projectId: string;
}

export const CharacterArcTracker: React.FC<CharacterArcTrackerProps> = ({ projectId }) => {
  const { state, dispatch } = useApp();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [arcData, setArcData] = useState<Record<string, CharacterArcPoint>>({});

  useEffect(() => {
    if (state.characters.length > 0 && !selectedCharacter) {
      setSelectedCharacter(state.characters[0]);
    }
  }, [state.characters, selectedCharacter]);

  useEffect(() => {
    if (selectedCharacter) {
      loadCharacterArc();
    }
  }, [selectedCharacter]);

  const loadCharacterArc = () => {
    if (!selectedCharacter?.arc) return;

    const arcMap: Record<string, CharacterArcPoint> = {};
    selectedCharacter.arc.forEach(point => {
      arcMap[point.beatId] = point;
    });
    setArcData(arcMap);
  };

  const updateArcPoint = (beatId: string, emotionalState: Record<string, number>, notes?: string) => {
    const newArcData = {
      ...arcData,
      [beatId]: {
        beatId,
        emotionalState,
        notes
      }
    };
    setArcData(newArcData);
  };

  const saveCharacterArc = async () => {
    if (!selectedCharacter) return;

    try {
      const arcPoints = Object.values(arcData);
      const updatedCharacter = {
        ...selectedCharacter,
        arc: arcPoints
      };

      await storageService.saveCharacter({ ...updatedCharacter, projectId });
      dispatch({ type: 'UPDATE_CHARACTER', payload: updatedCharacter });
    } catch (error) {
      console.error('Failed to save character arc:', error);
    }
  };

  const updateWantNeed = async (field: 'want' | 'need', value: string) => {
    if (!selectedCharacter) return;

    try {
      const updatedCharacter = {
        ...selectedCharacter,
        [field]: value
      };

      await storageService.saveCharacter({ ...updatedCharacter, projectId });
      dispatch({ type: 'UPDATE_CHARACTER', payload: updatedCharacter });
      setSelectedCharacter(updatedCharacter);
    } catch (error) {
      console.error(`Failed to update character ${field}:`, error);
    }
  };

  const getArcCompletion = () => {
    const totalBeats = CHARACTER_BEATS.length;
    const completedBeats = CHARACTER_BEATS.filter(beat => 
      arcData[`beat-${beat.name.toLowerCase().replace(/\s+/g, '-')}`]
    ).length;
    return Math.round((completedBeats / totalBeats) * 100);
  };

  const generateRadarData = (beatId: string) => {
    const arcPoint = arcData[beatId];
    if (!arcPoint) return EMOTIONAL_DIMENSIONS.map(() => 0);
    
    return EMOTIONAL_DIMENSIONS.map(dimension => 
      arcPoint.emotionalState[dimension] || 0
    );
  };

  if (!selectedCharacter) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">No characters found</div>
          <p className="text-sm text-gray-400">Create characters in the Characters tab to track their arcs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Character Arc Tracker</h2>
          <p className="text-gray-600 dark:text-gray-400">Track emotional growth across story beats</p>
        </div>
        <button
          onClick={saveCharacterArc}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Arc
        </button>
      </div>

      {/* Character Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Character
            </label>
            <select
              value={selectedCharacter.id}
              onChange={(e) => {
                const character = state.characters.find(c => c.id === e.target.value);
                setSelectedCharacter(character || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {state.characters.map(character => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Want (External Goal)
            </label>
            <input
              type="text"
              value={selectedCharacter.want || ''}
              onChange={(e) => updateWantNeed('want', e.target.value)}
              placeholder="What does the character want?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Need (Internal Lesson)
            </label>
            <input
              type="text"
              value={selectedCharacter.need || ''}
              onChange={(e) => updateWantNeed('need', e.target.value)}
              placeholder="What does the character need to learn?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{getArcCompletion()}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Arc Development Complete</div>
        </div>
      </div>

      {/* Emotional Arc Tracking */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emotional Development</h3>
        
        <div className="space-y-6">
          {CHARACTER_BEATS.map((beat, index) => {
            const beatId = `beat-${beat.name.toLowerCase().replace(/\s+/g, '-')}`;
            const arcPoint = arcData[beatId];
            
            return (
              <div key={beatId} className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {beat.name} ({beat.percentage}%)
                    </h4>
                  </div>
                </div>

                {/* Emotional Sliders */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {EMOTIONAL_DIMENSIONS.map((dimension) => (
                    <div key={dimension}>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {dimension}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={arcPoint?.emotionalState[dimension] || 0}
                        onChange={(e) => {
                          const newEmotionalState = {
                            ...arcPoint?.emotionalState,
                            [dimension]: parseInt(e.target.value)
                          };
                          updateArcPoint(beatId, newEmotionalState, arcPoint?.notes);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <div className="text-center text-xs text-gray-500 mt-1">
                        {arcPoint?.emotionalState[dimension] || 0}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <textarea
                  placeholder={`Notes about ${selectedCharacter.name}'s state at ${beat.name}...`}
                  value={arcPoint?.notes || ''}
                  onChange={(e) => {
                    updateArcPoint(
                      beatId,
                      arcPoint?.emotionalState || {},
                      e.target.value
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                  rows={2}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Arc Visualization Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Character Growth Visualization</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">Radar Chart Visualization</div>
            <p className="text-sm text-gray-400">Character emotional growth across story beats</p>
          </div>
        </div>
      </div>
    </div>
  );
};

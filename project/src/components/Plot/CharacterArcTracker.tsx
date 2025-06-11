import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { Character, CharacterArcPoint } from '../../contexts/AppContext';
import { storageService } from '../../services';
import { RadarChart } from './visualizations/RadarChart';
import { User, TrendingUp, Heart, Activity } from 'lucide-react';

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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Character Arc Tracker</h2>
            <p className="text-indigo-50">Track emotional growth across story beats</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Activity className="w-5 h-5" />
              <span className="font-medium">{getArcCompletion()}% Complete</span>
            </div>
            <button
              onClick={saveCharacterArc}
              className="btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Heart className="w-4 h-4 mr-2" />
              Save Arc
            </button>
          </div>
        </div>
      </div>

      {/* Character Selection */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Character
            </label>
            <select
              value={selectedCharacter.id}
              onChange={(e) => {
                const character = state.characters.find(c => c.id === e.target.value);
                setSelectedCharacter(character || null);
              }}
              className="input-primary"
            >
              {state.characters.map(character => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Want (External Goal)
            </label>
            <input
              type="text"
              value={selectedCharacter.want || ''}
              onChange={(e) => updateWantNeed('want', e.target.value)}
              placeholder="What does the character want?"
              className="input-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Need (Internal Lesson)
            </label>
            <input
              type="text"
              value={selectedCharacter.need || ''}
              onChange={(e) => updateWantNeed('need', e.target.value)}
              placeholder="What does the character need to learn?"
              className="input-primary"
            />
          </div>
        </div>
      </div>

      {/* Emotional Arc Tracking */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Emotional Development</h3>
        
        <div className="space-y-6">
          {CHARACTER_BEATS.map((beat, index) => {
            const beatId = `beat-${beat.name.toLowerCase().replace(/\s+/g, '-')}`;
            const arcPoint = arcData[beatId];
            
            return (
              <div key={beatId} className="border-2 border-border-light dark:border-border-dark rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-text-primary">
                      {beat.name} ({beat.percentage}%)
                    </h4>
                  </div>
                </div>

                {/* Emotional Sliders */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {EMOTIONAL_DIMENSIONS.map((dimension) => (
                    <div key={dimension}>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
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
                        className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer dark:bg-surface-dark"
                      />
                      <div className="text-center text-xs text-text-secondary mt-1">
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
                  className="input-primary text-sm resize-none"
                  rows={2}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Arc Visualization Placeholder */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Character Growth Visualization</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-border-light dark:border-border-dark rounded-lg">
          <div className="text-center">
            <div className="text-text-secondary mb-2">Radar Chart Visualization</div>
            <p className="text-sm text-text-secondary">Character emotional growth across story beats</p>
          </div>
        </div>
      </div>
    </div>
  );
};

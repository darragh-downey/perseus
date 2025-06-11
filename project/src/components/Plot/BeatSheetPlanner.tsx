import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { Beat, PlotStructure } from '../../contexts/AppContext';
import { storageService } from '../../services';
import { generateDefaultBeatSheet, getGenreTemplate, genreTemplates } from '../../utils/plotStructure';
import { BeatTimeline } from './visualizations/BeatTimeline';
import { BookOpen } from 'lucide-react';

export const BeatSheetPlanner: React.FC = () => {
  const { state, dispatch } = useApp();
  const [targetWordCount, setTargetWordCount] = useState(80000);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<keyof typeof genreTemplates | 'default'>('default');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (!state.currentProject) {
          console.error('No current project');
          return;
        }

        const plotStructure = await storageService.getPlotStructure(state.currentProject.id);
        
        if (plotStructure) {
          setTargetWordCount(plotStructure.targetWordCount);
          setBeats(plotStructure.beats);
          dispatch({ type: 'SET_PLOT_STRUCTURE', payload: plotStructure });
        } else {
          // Initialize with default Save the Cat! beats
          const defaultStructure = generateDefaultBeatSheet(state.currentProject.id, targetWordCount);
          setBeats(defaultStructure.beats);
        }
      } catch (error) {
        console.error('Failed to load plot structure:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [state.currentProject, dispatch, targetWordCount]);

  const handleGenreChange = (genre: keyof typeof genreTemplates | 'default') => {
    setSelectedGenre(genre);
    if (!state.currentProject) return;
    
    if (genre === 'default') {
      const defaultStructure = generateDefaultBeatSheet(state.currentProject.id, targetWordCount);
      setBeats(defaultStructure.beats);
    } else {
      const genreStructure = getGenreTemplate(genre, state.currentProject.id, targetWordCount);
      setBeats(genreStructure.beats);
    }
  };

  const handleTargetWordCountChange = (newCount: number) => {
    setTargetWordCount(newCount);
    
    // Recalculate word counts for all beats
    const updatedBeats = beats.map(beat => ({
      ...beat,
      wordCount: Math.round((newCount * beat.percentage) / 100)
    }));
    setBeats(updatedBeats);
  };

  const handleBeatUpdate = (beatId: string, updates: Partial<Beat>) => {
    const updatedBeats = beats.map(beat =>
      beat.id === beatId ? { ...beat, ...updates } : beat
    );
    setBeats(updatedBeats);
  };

  const savePlotStructure = async () => {
    try {
      if (!state.currentBook || !state.currentProject || !state.currentWorkspace) {
        console.error('Missing current book, project, or workspace');
        return;
      }

      const plotStructure: PlotStructure = {
        id: state.plotStructure?.id || `plot-${state.currentBook.id}`,
        bookId: state.currentBook.id,
        projectId: state.currentProject.id,
        workspaceId: state.currentWorkspace.id,
        targetWordCount,
        beats,
        themes: state.plotStructure?.themes || [],
        conflicts: state.plotStructure?.conflicts || [],
        bStories: state.plotStructure?.bStories || [],
        createdAt: state.plotStructure?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await storageService.savePlotStructure(plotStructure);
      dispatch({ type: 'SET_PLOT_STRUCTURE', payload: plotStructure });
    } catch (error) {
      console.error('Failed to save plot structure:', error);
    }
  };

  const getActColor = (percentage: number) => {
    if (percentage <= 20) return 'bg-blue-100 border-blue-300';
    if (percentage <= 80) return 'bg-green-100 border-green-300';
    return 'bg-red-100 border-red-300';
  };

  const getActLabel = (percentage: number) => {
    if (percentage <= 20) return 'Act I';
    if (percentage <= 80) return 'Act II';
    return 'Act III';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading plot structure...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Beat Sheet Planner</h2>
              <p className="text-indigo-100">Structure your story using the Save the Cat! method</p>
            </div>
          </div>
          <button
            onClick={savePlotStructure}
            className="btn-primary bg-white text-indigo-600 hover:bg-gray-100"
          >
            Save Structure
          </button>
        </div>
      </div>

      {/* Target Word Count & Genre Selection */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Target Word Count
            </label>
            <input
              type="number"
              value={targetWordCount}
              onChange={(e) => handleTargetWordCountChange(parseInt(e.target.value) || 0)}
              className="input-primary w-full"
              min="1000"
              step="1000"
            />
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
              Total words for your completed manuscript
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              Story Structure Template
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => handleGenreChange(e.target.value as keyof typeof genreTemplates | 'default')}
              className="input-primary w-full"
            >
              <option value="default">Save the Cat! (Universal)</option>
              {Object.keys(genreTemplates).map(genre => (
                <option key={genre} value={genre}>
                  {genreTemplates[genre as keyof typeof genreTemplates].name}
                </option>
              ))}
            </select>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
              Choose a structure template for your genre
            </p>
          </div>
        </div>
      </div>

      {/* Beat Timeline */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">Story Timeline</h3>
        
        <div className="space-y-4">
          {beats.map((beat) => (
            <div
              key={beat.id}
              className={`p-4 rounded-lg border-2 ${getActColor(beat.percentage)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                      {getActLabel(beat.percentage)}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {beat.name}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {beat.percentage}% • ~{beat.wordCount?.toLocaleString()} words
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {beat.description}
                  </p>
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={beat.isCompleted}
                    onChange={(e) => handleBeatUpdate(beat.id, { isCompleted: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Complete</span>
                </label>
              </div>
              
              <textarea
                placeholder={`Describe your ${beat.name.toLowerCase()}...`}
                value={beat.content || ''}
                onChange={(e) => handleBeatUpdate(beat.id, { content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Overview</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {beats.filter(b => b.percentage <= 20 && b.isCompleted).length}/
              {beats.filter(b => b.percentage <= 20).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Act I Complete</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {beats.filter(b => b.percentage > 20 && b.percentage <= 80 && b.isCompleted).length}/
              {beats.filter(b => b.percentage > 20 && b.percentage <= 80).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Act II Complete</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {beats.filter(b => b.percentage > 80 && b.isCompleted).length}/
              {beats.filter(b => b.percentage > 80).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Act III Complete</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round((beats.filter(b => b.isCompleted).length / beats.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 via-green-500 to-red-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${(beats.filter(b => b.isCompleted).length / beats.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <BeatTimeline 
        beats={beats}
        targetWordCount={targetWordCount}
        onBeatClick={(beat) => {
          // Scroll to beat in the timeline
          const element = document.getElementById(`beat-${beat.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
};

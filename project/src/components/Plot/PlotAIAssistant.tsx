import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { aiService } from '../../services';
import { Sparkles, MessageSquare, Lightbulb, TrendingUp, BookOpen, Bot, Wand2, Brain } from 'lucide-react';

interface AISuggestion {
  type: 'beat' | 'theme' | 'conflict' | 'arc';
  title: string;
  content: string;
  actionable: boolean;
}

export const PlotAIAssistant: React.FC = () => {
  const { state } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [selectedBeatId, setSelectedBeatId] = useState<string>('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<'beat' | 'theme' | 'conflict' | 'arc'>('beat');

  const getBeatSuggestion = async () => {
    if (!selectedBeatId || !state.plotStructure) return;
    
    setIsLoading(true);
    try {
      const beat = state.plotStructure.beats.find(b => b.id === selectedBeatId);
      if (!beat) return;

      const response = await aiService.suggestBeatContent(
        beat,
        state.characters,
        state.plotStructure.themes || [],
        state.plotStructure.beats.filter(b => b.percentage < beat.percentage)
      );

      if (response.success && response.data) {
        const newSuggestions: AISuggestion[] = [
          {
            type: 'beat',
            title: `${beat.name} Content Suggestion`,
            content: response.data.content,
            actionable: true
          },
          ...response.data.sceneIdeas.map((idea: string) => ({
            type: 'beat' as const,
            title: 'Scene Idea',
            content: idea,
            actionable: true
          }))
        ];
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Failed to get beat suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeThemes = async () => {
    if (!state.plotStructure?.themes) return;
    
    setIsLoading(true);
    try {
      const response = await aiService.analyzeThemeCoherence(
        state.plotStructure.themes,
        state.plotStructure.beats,
        state.characters
      );

      if (response.success && response.data) {
        const themeAnalysis = response.data.themeAnalysis;
        const newSuggestions: AISuggestion[] = [
          {
            type: 'theme',
            title: `Overall Theme Coherence: ${response.data.overallCoherence}%`,
            content: response.data.recommendations.join(' '),
            actionable: true
          },
          ...themeAnalysis.map((analysis: any) => ({
            type: 'theme' as const,
            title: `${analysis.theme} Theme Analysis`,
            content: `Coverage: ${analysis.coverage}%. ${analysis.suggestions.join(' ')}`,
            actionable: true
          }))
        ];
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Failed to analyze themes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeConflicts = async () => {
    if (!state.plotStructure?.conflicts) return;
    
    setIsLoading(true);
    try {
      const response = await aiService.suggestConflictEscalation(
        state.plotStructure.conflicts,
        state.plotStructure.beats,
        state.characters
      );

      if (response.success && response.data) {
        const escalationPlan = response.data.escalationPlan;
        const newSuggestions: AISuggestion[] = [
          {
            type: 'conflict',
            title: 'Conflict Escalation Strategy',
            content: response.data.overallArc,
            actionable: false
          },
          ...escalationPlan.map((plan: any) => ({
            type: 'conflict' as const,
            title: `${plan.type} Conflict Escalation`,
            content: `Current intensity: ${plan.currentIntensity}/10. Peak at: ${plan.peakMoment}. Resolution: ${plan.resolution}`,
            actionable: true
          }))
        ];
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Failed to analyze conflicts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCharacterArc = async () => {
    if (!selectedCharacterId || !state.plotStructure) return;
    
    setIsLoading(true);
    try {
      const character = state.characters.find(c => c.id === selectedCharacterId);
      if (!character) return;

      const response = await aiService.generateCharacterArcSuggestions(
        character,
        state.plotStructure.beats,
        state.plotStructure.themes || []
      );

      if (response.success && response.data) {
        const arcData = response.data;
        const newSuggestions: AISuggestion[] = [
          {
            type: 'arc',
            title: `${character.name} Character Arc`,
            content: `Want: ${arcData.overallArc.want}. Need: ${arcData.overallArc.need}. Transformation: ${arcData.overallArc.transformation}`,
            actionable: true
          },
          ...arcData.arcSuggestions.slice(0, 3).map((suggestion: any) => ({
            type: 'arc' as const,
            title: `${suggestion.beatName} Character Moment`,
            content: `${suggestion.keyMoment}. ${suggestion.growthOpportunity}`,
            actionable: true
          }))
        ];
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Failed to analyze character arc:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = () => {
    switch (analysisType) {
      case 'beat':
        getBeatSuggestion();
        break;
      case 'theme':
        analyzeThemes();
        break;
      case 'conflict':
        analyzeConflicts();
        break;
      case 'arc':
        analyzeCharacterArc();
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'beat': return <BookOpen className="w-4 h-4" />;
      case 'theme': return <Lightbulb className="w-4 h-4" />;
      case 'conflict': return <TrendingUp className="w-4 h-4" />;
      case 'arc': return <MessageSquare className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  if (!state.plotStructure) {
    return (
      <div className="card text-center">
        <Sparkles className="w-12 h-12 text-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          AI Plot Assistant
        </h3>
        <p className="text-text-secondary mb-4">
          Create a plot structure first to get AI-powered suggestions and analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Plot AI Assistant</h2>
            <p className="text-purple-50">Get intelligent suggestions for your story structure</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <Bot className="w-5 h-5" />
            <span className="font-medium">AI-Powered</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            AI Analysis Tools
          </h3>
        </div>

        {/* Analysis Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { type: 'beat', label: 'Beat Content', icon: BookOpen },
            { type: 'theme', label: 'Theme Analysis', icon: Lightbulb },
            { type: 'conflict', label: 'Conflict Arc', icon: TrendingUp },
            { type: 'arc', label: 'Character Arc', icon: MessageSquare }
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setAnalysisType(type as any)}
              className={`p-3 rounded-lg border-2 transition-all ${
                analysisType === type
                  ? 'border-primary bg-primary-light text-primary-dark'
                  : 'border-border-light dark:border-border-dark hover:border-primary/50'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{label}</div>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          {analysisType === 'beat' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Select Beat to Analyze
              </label>
              <select
                value={selectedBeatId}
                onChange={(e) => setSelectedBeatId(e.target.value)}
                className="input-primary"
              >
                <option value="">Choose a beat...</option>
                {state.plotStructure.beats.map(beat => (
                  <option key={beat.id} value={beat.id}>
                    {beat.name} ({beat.percentage}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {analysisType === 'arc' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Select Character to Analyze
              </label>
              <select
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
                className="input-primary"
              >
                <option value="">Choose a character...</option>
                {state.characters.map(character => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={runAnalysis}
            disabled={isLoading || (analysisType === 'beat' && !selectedBeatId) || (analysisType === 'arc' && !selectedCharacterId)}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Get AI Suggestions
              </>
            )}
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-text-primary">AI Suggestions</h4>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-text-primary mb-2">
                      {suggestion.title}
                    </h5>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {suggestion.content}
                    </p>
                    {suggestion.actionable && (
                      <button className="mt-3 text-primary hover:text-primary-hover text-sm font-medium hover:underline">
                        Apply Suggestion
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-3 bg-primary-light rounded-lg border border-primary/30">
          <p className="text-sm text-primary-dark">
            💡 <strong>Tip:</strong> AI suggestions are based on proven storytelling principles. 
            Use them as inspiration and adapt them to fit your unique story.
          </p>
        </div>
      </div>
    </div>
  );
};

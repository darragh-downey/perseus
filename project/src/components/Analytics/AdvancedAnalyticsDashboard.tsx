import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { analyticsService, AdvancedTextAnalytics, ResearchAnalytics, WritingSuggestion } from '../../services/analytics';
import { 
  BarChart3, 
  Brain, 
  BookOpen, 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Target,
  Lightbulb,
  Activity,
  PieChart,
  LineChart,
  Gauge,
  Eye
} from 'lucide-react';

interface AdvancedAnalyticsDashboardProps {
  documentId?: string;
}

export default function AdvancedAnalyticsDashboard({ documentId }: AdvancedAnalyticsDashboardProps) {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'writing' | 'collaboration' | 'insights'>('overview');
  const [textAnalytics, setTextAnalytics] = useState<AdvancedTextAnalytics | null>(null);
  const [researchAnalytics, setResearchAnalytics] = useState<ResearchAnalytics | null>(null);
  const [writingSuggestions, setWritingSuggestions] = useState<WritingSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [narrativePatterns, setNarrativePatterns] = useState<any>(null);

  // Get current document content
  const currentDocument = documentId 
    ? state.documents.find(d => d.id === documentId)
    : state.documents[0]; // Default to first document

  useEffect(() => {
    if (currentDocument?.content) {
      loadAnalytics();
    }
  }, [currentDocument]);

  const loadAnalytics = async () => {
    if (!currentDocument?.content.trim()) return;
    
    setIsLoading(true);
    try {
      // Load advanced text analytics
      const textAnalysis = await analyticsService.analyzeAdvancedText(
        currentDocument.content, 
        state.characters
      );
      setTextAnalytics(textAnalysis);

      // Load research analytics (mock data for now)
      const mockResearchItems = [
        {
          id: '1',
          title: 'Historical Context Research',
          source: 'Academic Journal',
          content: 'Historical background information...',
          tags: ['historical', 'background'],
          reliability_score: 8,
          date_added: '2025-06-01',
          related_characters: [],
          related_locations: []
        }
      ];
      
      const mockFactChecks = [
        {
          id: '1',
          statement: 'Historical fact about the period',
          verification_status: 'verified' as const,
          sources: ['source1'],
          confidence_score: 0.9,
          related_research_ids: ['1']
        }
      ];

      const researchAnalysis = await analyticsService.analyzeResearch(mockResearchItems, mockFactChecks);
      setResearchAnalytics(researchAnalysis);

      // Generate writing suggestions
      const suggestions = await analyticsService.generateWritingSuggestions(
        currentDocument.content,
        'literary',
        ['pacing', 'clarity', 'emotion', 'voice']
      );
      setWritingSuggestions(suggestions.suggestions);

      // Detect narrative patterns
      const patterns = await analyticsService.detectNarrativePatterns(
        currentDocument.content,
        'story_structure'
      );
      setNarrativePatterns(patterns);

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'writing', label: 'Writing Quality', icon: Brain },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Sentiment Score</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {textAnalytics ? (textAnalytics.sentiment_analysis.overall_sentiment * 100).toFixed(0) : '0'}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Style Consistency</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {textAnalytics ? (textAnalytics.style_analysis.author_voice_consistency * 100).toFixed(0) : '0'}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Vocabulary Richness</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {textAnalytics ? (textAnalytics.linguistic_complexity.vocabulary_diversity * 100).toFixed(0) : '0'}%
              </p>
            </div>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Pacing Score</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {textAnalytics?.narrative_structure.pacing_analysis.overall_pace === 'fast' ? '85' :
                 textAnalytics?.narrative_structure.pacing_analysis.overall_pace === 'medium' ? '65' : '45'}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Narrative Structure Visualization */}
      {textAnalytics && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Narrative Structure</h3>
          
          {/* Tension Curve */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tension Curve</h4>
            <div className="relative h-32 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <svg className="w-full h-full" viewBox="0 0 400 100">
                {textAnalytics.narrative_structure.tension_curve.map((tension, index) => {
                  const x = (index / (textAnalytics.narrative_structure.tension_curve.length - 1)) * 380 + 10;
                  const y = (1 - tension) * 80 + 10;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#3b82f6"
                      className="transition-all duration-300 hover:r-4"
                    />
                  );
                })}
                <path
                  d={`M ${textAnalytics.narrative_structure.tension_curve.map((tension, index) => {
                    const x = (index / (textAnalytics.narrative_structure.tension_curve.length - 1)) * 380 + 10;
                    const y = (1 - tension) * 80 + 10;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
              </svg>
            </div>
          </div>

          {/* Story Beats */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Detected Story Beats</h4>
            <div className="space-y-2">
              {textAnalytics.narrative_structure.story_beats.map((beat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {beat.beat_type.replace('_', ' ')}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{beat.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {(beat.position * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Strength: {(beat.strength * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderResearch = () => (
    <div className="space-y-6">
      {researchAnalytics && (
        <>
          {/* Research Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Research Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {researchAnalytics.total_research_items}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Verification Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {researchAnalytics.fact_verification_rate.toFixed(0)}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Source Diversity</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {researchAnalytics.source_diversity_score.toFixed(0)}%
                  </p>
                </div>
                <PieChart className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Research Gaps */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Research Gaps</h3>
            <div className="space-y-3">
              {researchAnalytics.research_gaps.map((gap, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-gray-900 dark:text-white">{gap}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderWritingQuality = () => (
    <div className="space-y-6">
      {/* Writing Suggestions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Writing Suggestions</h3>
        <div className="space-y-4">
          {writingSuggestions.map((suggestion, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              suggestion.priority === 'high' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                : suggestion.priority === 'medium'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      suggestion.priority === 'high' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    }`}>
                      {suggestion.priority.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {suggestion.category}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">{suggestion.issue}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{suggestion.suggestion}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 italic">{suggestion.example}</p>
                </div>
                <Target className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Linguistic Complexity */}
      {textAnalytics && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Linguistic Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Complexity Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Sentence Length</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {textAnalytics.linguistic_complexity.avg_sentence_length.toFixed(1)} words
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Vocabulary Diversity</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(textAnalytics.linguistic_complexity.vocabulary_diversity * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rare Words</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {textAnalytics.linguistic_complexity.rare_words_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Passive Voice</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {textAnalytics.linguistic_complexity.passive_voice_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Style Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dialogue Percentage</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {textAnalytics.style_analysis.dialogue_style.dialogue_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tense Consistency</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(textAnalytics.style_analysis.tense_consistency.consistency_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">POV Consistency</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(textAnalytics.style_analysis.pov_consistency.consistency_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Primary Tense</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {textAnalytics.style_analysis.tense_consistency.primary_tense}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      {/* AI-Powered Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Narrative Pattern Analysis</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Based on the story structure analysis, your narrative follows a classic three-act structure with clear progression.
            </p>
            {narrativePatterns?.acts && (
              <div className="space-y-2">
                {narrativePatterns.acts.map((act: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Act {act.act}</span>
                    <span className="text-xs text-gray-500">{(act.start * 100).toFixed(0)}% - {(act.end * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Character Development Opportunities</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Consider adding more internal conflict for character depth</li>
              <li>• Character relationships could benefit from more complexity</li>
              <li>• Explore backstory elements to enhance motivation clarity</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Plot Enhancement Suggestions</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• The middle section could benefit from increased tension</li>
              <li>• Consider adding subplot elements to enrich the narrative</li>
              <li>• Stakes could be raised for greater emotional impact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-text-secondary">Analyzing content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Advanced Analytics</h1>
            <p className="text-blue-50">
              Deep insights powered by AI and advanced text analysis
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Gauge className="w-5 h-5" />
              <span className="font-medium">AI-Powered</span>
            </div>
            <button
              onClick={loadAnalytics}
              disabled={isLoading}
              className="btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50"
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'research' && renderResearch()}
        {activeTab === 'writing' && renderWritingQuality()}
        {activeTab === 'insights' && renderInsights()}
        {activeTab === 'collaboration' && (
          <div className="card text-center">
            <Users className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Collaboration Analytics</h3>
            <p className="text-text-secondary">
              Collaboration features will be available when working with team members.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

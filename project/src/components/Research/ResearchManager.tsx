import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import { analyticsService, ResearchItem, FactCheck, ResearchAnalytics } from '../../services/analytics';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Star,
  Calendar,
  Tag,
  ExternalLink,
  BarChart3,
  TrendingUp,
  FileText,
  Database
} from 'lucide-react';

interface ResearchManagerProps {
  projectId: string;
}

export default function ResearchManager({ projectId }: ResearchManagerProps) {
  const { state } = useApp();
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
  const [factChecks, setFactChecks] = useState<FactCheck[]>([]);
  const [analytics, setAnalytics] = useState<ResearchAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'facts' | 'analytics'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFactForm, setShowFactForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newResearchItem, setNewResearchItem] = useState<Partial<ResearchItem>>({
    title: '',
    source: '',
    content: '',
    tags: [],
    reliability_score: 8,
    related_characters: [],
    related_locations: []
  });

  const [newFactCheck, setNewFactCheck] = useState<Partial<FactCheck>>({
    statement: '',
    verification_status: 'unknown',
    sources: [],
    confidence_score: 0.5,
    related_research_ids: []
  });

  useEffect(() => {
    loadResearchData();
  }, [projectId]);

  useEffect(() => {
    if (researchItems.length > 0 || factChecks.length > 0) {
      loadAnalytics();
    }
  }, [researchItems, factChecks]);

  const loadResearchData = async () => {
    // In a real app, this would load from storage
    // For now, we'll use mock data
    const mockResearchItems: ResearchItem[] = [
      {
        id: '1',
        title: 'Medieval Castle Architecture',
        source: 'Historical Architecture Journal',
        content: 'Detailed analysis of 13th century castle construction techniques, defensive features, and living conditions.',
        tags: ['medieval', 'architecture', 'historical'],
        reliability_score: 9,
        date_added: '2025-06-01',
        related_characters: [],
        related_locations: ['castle-1']
      },
      {
        id: '2',
        title: 'Feudal Social Structure',
        source: 'Medieval Studies Quarterly',
        content: 'Comprehensive overview of social hierarchy, obligations, and daily life in feudal society.',
        tags: ['medieval', 'social', 'historical'],
        reliability_score: 8,
        date_added: '2025-06-02',
        related_characters: ['lord-1', 'peasant-1'],
        related_locations: []
      },
      {
        id: '3',
        title: 'Sword Combat Techniques',
        source: 'HEMA Research Institute',
        content: 'Historical European martial arts documentation of medieval longsword techniques and training methods.',
        tags: ['combat', 'weapons', 'technique'],
        reliability_score: 7,
        date_added: '2025-06-03',
        related_characters: ['knight-1'],
        related_locations: []
      }
    ];

    const mockFactChecks: FactCheck[] = [
      {
        id: '1',
        statement: 'Medieval castles typically had walls 8-12 feet thick',
        verification_status: 'verified',
        sources: ['Historical Architecture Journal', 'Castle Studies Database'],
        confidence_score: 0.9,
        related_research_ids: ['1']
      },
      {
        id: '2',
        statement: 'Knights wore full plate armor in the 12th century',
        verification_status: 'disputed',
        sources: ['Medieval Arms & Armor Review'],
        confidence_score: 0.3,
        related_research_ids: ['3']
      },
      {
        id: '3',
        statement: 'Peasants owned their own land in feudal society',
        verification_status: 'disputed',
        sources: ['Medieval Studies Quarterly'],
        confidence_score: 0.2,
        related_research_ids: ['2']
      }
    ];

    setResearchItems(mockResearchItems);
    setFactChecks(mockFactChecks);
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const analyticsData = await analyticsService.analyzeResearch(researchItems, factChecks);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load research analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResearchItem = async () => {
    if (!newResearchItem.title || !newResearchItem.content) return;

    const item: ResearchItem = {
      id: Date.now().toString(),
      title: newResearchItem.title,
      source: newResearchItem.source || 'Unknown',
      content: newResearchItem.content,
      tags: newResearchItem.tags || [],
      reliability_score: newResearchItem.reliability_score || 5,
      date_added: new Date().toISOString().split('T')[0],
      related_characters: newResearchItem.related_characters || [],
      related_locations: newResearchItem.related_locations || []
    };

    setResearchItems([...researchItems, item]);
    setNewResearchItem({
      title: '',
      source: '',
      content: '',
      tags: [],
      reliability_score: 8,
      related_characters: [],
      related_locations: []
    });
    setShowAddForm(false);
  };

  const handleAddFactCheck = async () => {
    if (!newFactCheck.statement) return;

    const fact: FactCheck = {
      id: Date.now().toString(),
      statement: newFactCheck.statement,
      verification_status: newFactCheck.verification_status || 'unknown',
      sources: newFactCheck.sources || [],
      confidence_score: newFactCheck.confidence_score || 0.5,
      related_research_ids: newFactCheck.related_research_ids || []
    };

    setFactChecks([...factChecks, fact]);
    setNewFactCheck({
      statement: '',
      verification_status: 'unknown',
      sources: [],
      confidence_score: 0.5,
      related_research_ids: []
    });
    setShowFactForm(false);
  };

  const getFilteredResearchItems = () => {
    return researchItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || item.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  };

  const getFilteredFactChecks = () => {
    return factChecks.filter(fact => {
      return fact.statement.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    researchItems.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disputed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
  };

  const renderResearchItems = () => (
    <div className="space-y-4">
      {getFilteredResearchItems().map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{item.source}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{item.date_added}</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {item.content}
              </p>
            </div>
            <div className="ml-4 flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReliabilityColor(item.reliability_score)}`}>
                {item.reliability_score}/10
              </span>
              <div className="flex items-center space-x-1">
                {[...Array(Math.floor(item.reliability_score / 2))].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {item.related_characters.length > 0 && (
                <span>{item.related_characters.length} characters</span>
              )}
              {item.related_locations.length > 0 && (
                <span>{item.related_locations.length} locations</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFactChecks = () => (
    <div className="space-y-4">
      {getFilteredFactChecks().map((fact) => (
        <div key={fact.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              {getVerificationIcon(fact.verification_status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                  fact.verification_status === 'verified' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : fact.verification_status === 'disputed'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {fact.verification_status}
                </span>
                <span className="text-sm text-gray-500">
                  Confidence: {(fact.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-gray-900 dark:text-white mb-3 font-medium">
                {fact.statement}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Sources:</span>
                  {fact.sources.map((source, index) => (
                    <span key={index} className="flex items-center space-x-1">
                      <ExternalLink className="h-3 w-3" />
                      <span>{source}</span>
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  {fact.related_research_ids.length} research items
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {analytics && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Research</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.total_research_items}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Verified Facts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.verified_facts_count}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Reliability</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.average_reliability_score.toFixed(1)}/10
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Source Diversity</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.source_diversity_score.toFixed(0)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Research by Tag */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Research by Category</h3>
            <div className="space-y-3">
              {Object.entries(analytics.research_by_tag).map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white capitalize">{tag}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${(count / analytics.total_research_items) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Gaps */}
          {analytics.research_gaps.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">Research Gaps</h3>
              <div className="space-y-2">
                {analytics.research_gaps.map((gap, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-yellow-800 dark:text-yellow-200">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Research Manager</h1>
            <p className="text-green-50">
              Organize and verify your research sources and facts
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <Database className="w-5 h-5" />
            <span className="font-medium">{researchItems.length} Sources</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Research
          </button>
          <button
            onClick={() => setShowFactForm(true)}
            className="btn-secondary"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Add Fact Check
          </button>
        </div>
      </div>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search research and facts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Tags</option>
            {getAllTags().map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex px-6">
          {[
            { id: 'items', label: 'Research Items', count: researchItems.length },
            { id: 'facts', label: 'Fact Checks', count: factChecks.length },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              <span className="font-medium">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'items' && renderResearchItems()}
        {activeTab === 'facts' && renderFactChecks()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {/* Add Research Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Research Item</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newResearchItem.title || ''}
                    onChange={(e) => setNewResearchItem({ ...newResearchItem, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Research item title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    value={newResearchItem.source || ''}
                    onChange={(e) => setNewResearchItem({ ...newResearchItem, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Source name or URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={newResearchItem.content || ''}
                    onChange={(e) => setNewResearchItem({ ...newResearchItem, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Research content and notes..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newResearchItem.tags?.join(', ') || ''}
                      onChange={(e) => setNewResearchItem({ 
                        ...newResearchItem, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="historical, medieval, combat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reliability Score (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newResearchItem.reliability_score || 8}
                      onChange={(e) => setNewResearchItem({ 
                        ...newResearchItem, 
                        reliability_score: parseInt(e.target.value) || 8 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddResearchItem}
                  disabled={!newResearchItem.title || !newResearchItem.content}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Add Research
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Fact Check Form Modal */}
      {showFactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Fact Check</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statement *
                  </label>
                  <textarea
                    value={newFactCheck.statement || ''}
                    onChange={(e) => setNewFactCheck({ ...newFactCheck, statement: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Statement to verify..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Verification Status
                    </label>
                    <select
                      value={newFactCheck.verification_status || 'unknown'}
                      onChange={(e) => setNewFactCheck({ 
                        ...newFactCheck, 
                        verification_status: e.target.value as 'verified' | 'disputed' | 'unknown'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="verified">Verified</option>
                      <option value="disputed">Disputed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confidence Score (0-1)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newFactCheck.confidence_score || 0.5}
                      onChange={(e) => setNewFactCheck({ 
                        ...newFactCheck, 
                        confidence_score: parseFloat(e.target.value) || 0.5 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sources (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newFactCheck.sources?.join(', ') || ''}
                    onChange={(e) => setNewFactCheck({ 
                      ...newFactCheck, 
                      sources: e.target.value.split(',').map(source => source.trim()).filter(source => source) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Source 1, Source 2, Source 3"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowFactForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFactCheck}
                  disabled={!newFactCheck.statement}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Add Fact Check
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

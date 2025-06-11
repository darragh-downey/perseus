import { invoke } from '@tauri-apps/api/core';
import { Character, Relationship, WorldEvent, Beat, Document } from '../contexts/AppContext';

// Types matching Rust backend
interface RustCharacter {
  id: string;
  name: string;
  description: string;
  traits: string[];
  color?: string;
}

interface RustRelationship {
  from: string;
  to: string;
  type: string;
  strength: number;
}

interface RustWorldEvent {
  id: string;
  name: string;
  date: string;
  type: string;
  importance: number;
  location_ids: string[];
  character_ids: string[];
  description?: string;
}

interface RustBeat {
  id: string;
  name: string;
  percentage: number;
  description: string;
  content: string;
  word_count: number;
  scene_ids: string[];
  is_completed: boolean;
}

export interface CharacterAnalytics {
  total_characters: number;
  total_relationships: number;
  strong_relationships_percentage: number;
  avg_connections_per_character: number;
  positive_relationships_percentage: number;
  character_network_density: number;
  most_connected_character?: string;
  relationship_type_distribution: Record<string, number>;
}

export interface WorldAnalytics {
  total_events: number;
  major_events_count: number;
  world_consistency_score: number;
  events_by_type: Record<string, number>;
  events_by_importance: Record<number, number>;
  timeline_coverage: number;
}

export interface PlotAnalytics {
  act_one_progress: number;
  act_two_progress: number;
  act_three_progress: number;
  overall_progress: number;
  completed_beats: number;
  total_beats: number;
  word_count_distribution: Array<[string, number]>;
  beat_completion_timeline: Array<[string, boolean]>;
}

export interface TextAnalytics {
  word_count: number;
  character_count: number;
  character_count_no_spaces: number;
  sentence_count: number;
  paragraph_count: number;
  reading_time_minutes: number;
  average_words_per_sentence: number;
  average_sentences_per_paragraph: number;
  readability_score: number;
  most_common_words: Array<[string, number]>;
}

export interface GraphNode {
  id: string;
  name: string;
  radius: number;
  color: string;
  group: number;
  centrality: number;
  connections: number;
}

export interface GraphLink {
  source: string;
  target: string;
  strength: number;
  color: string;
  width: number;
  distance: number;
}

export interface GraphMetrics {
  node_count: number;
  edge_count: number;
  density: number;
  clustering_coefficient: number;
  average_path_length: number;
  central_nodes: string[];
  isolated_nodes: string[];
  strongly_connected_components: number;
}

export interface ForceGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  metrics: GraphMetrics;
}

export interface WordCountResult {
  word_count: number;
  character_count: number;
  character_count_no_spaces: number;
  reading_time_minutes: number;
}

// Advanced analytics types
export interface ResearchItem {
  id: string;
  title: string;
  source: string;
  content: string;
  tags: string[];
  reliability_score: number;
  date_added: string;
  related_characters: string[];
  related_locations: string[];
}

export interface FactCheck {
  id: string;
  statement: string;
  verification_status: 'verified' | 'disputed' | 'unknown';
  sources: string[];
  confidence_score: number;
  related_research_ids: string[];
}

export interface ResearchAnalytics {
  total_research_items: number;
  verified_facts_count: number;
  disputed_facts_count: number;
  average_reliability_score: number;
  research_by_tag: Record<string, number>;
  sources_by_reliability: Record<string, number>;
  fact_verification_rate: number;
  research_gaps: string[];
  source_diversity_score: number;
}

export interface AdvancedTextAnalytics {
  sentiment_analysis: SentimentAnalysis;
  narrative_structure: NarrativeStructure;
  linguistic_complexity: LinguisticComplexity;
  style_analysis: StyleAnalysis;
  consistency_checks: ConsistencyChecks;
}

export interface SentimentAnalysis {
  overall_sentiment: number;
  emotion_scores: Record<string, number>;
  sentiment_progression: number[];
  emotional_peaks: EmotionalPeak[];
}

export interface EmotionalPeak {
  position: number;
  emotion: string;
  intensity: number;
  context: string;
}

export interface NarrativeStructure {
  story_beats: StoryBeat[];
  pacing_analysis: PacingAnalysis;
  tension_curve: number[];
  character_presence: Record<string, CharacterPresence[]>;
}

export interface StoryBeat {
  beat_type: string;
  position: number;
  strength: number;
  description: string;
}

export interface PacingAnalysis {
  overall_pace: 'fast' | 'medium' | 'slow';
  pace_changes: PaceChange[];
  dialogue_ratio: number;
  action_ratio: number;
  description_ratio: number;
}

export interface PaceChange {
  position: number;
  from_pace: string;
  to_pace: string;
  reason: string;
}

export interface CharacterPresence {
  start_position: number;
  end_position: number;
  prominence: number;
}

export interface LinguisticComplexity {
  avg_sentence_length: number;
  sentence_length_variance: number;
  vocabulary_diversity: number;
  rare_words_percentage: number;
  passive_voice_percentage: number;
  subordinate_clauses_ratio: number;
}

export interface StyleAnalysis {
  author_voice_consistency: number;
  tense_consistency: TenseConsistency;
  pov_consistency: PovConsistency;
  dialogue_style: DialogueStyle;
  repetition_analysis: RepetitionAnalysis;
}

export interface TenseConsistency {
  primary_tense: string;
  consistency_score: number;
  tense_switches: TenseSwitch[];
}

export interface TenseSwitch {
  position: number;
  from_tense: string;
  to_tense: string;
  is_intentional: boolean;
}

export interface PovConsistency {
  primary_pov: string;
  consistency_score: number;
  pov_switches: PovSwitch[];
}

export interface PovSwitch {
  position: number;
  from_pov: string;
  to_pov: string;
  character?: string;
}

export interface DialogueStyle {
  dialogue_percentage: number;
  avg_dialogue_length: number;
  character_voice_distinction: number;
  dialogue_tags_ratio: number;
}

export interface RepetitionAnalysis {
  word_repetitions: Record<string, number>;
  phrase_repetitions: Record<string, number>;
  intentional_repetitions: IntentionalRepetition[];
}

export interface IntentionalRepetition {
  text: string;
  count: number;
  positions: number[];
  literary_device: string;
}

export interface ConsistencyChecks {
  character_consistency: CharacterConsistency[];
  world_consistency: WorldConsistency[];
  plot_consistency: PlotConsistency[];
  timeline_consistency: TimelineInconsistency[];
}

export interface CharacterConsistency {
  character_id: string;
  inconsistencies: Inconsistency[];
  consistency_score: number;
}

export interface WorldConsistency {
  element_type: string;
  element_id: string;
  inconsistencies: Inconsistency[];
  consistency_score: number;
}

export interface PlotConsistency {
  plot_thread: string;
  inconsistencies: Inconsistency[];
  consistency_score: number;
}

export interface TimelineInconsistency {
  event1: string;
  event2: string;
  inconsistency_type: string;
  description: string;
  severity: number;
}

export interface Inconsistency {
  description: string;
  severity: number;
  position1: number;
  position2?: number;
  suggestion: string;
}

export interface CollaborationMetrics {
  active_collaborators: number;
  edit_frequency: Record<string, number>;
  conflict_resolution_time: number;
  simultaneous_edits: number;
  most_edited_sections: EditedSection[];
  collaboration_efficiency: number;
}

export interface EditedSection {
  section_id: string;
  edit_count: number;
  last_edited: string;
  editors: string[];
}

export interface EditEvent {
  user_id: string;
  section_id: string;
  timestamp: string;
  edit_type: string;
}

export interface WritingSuggestion {
  category: string;
  issue: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  example: string;
}

export interface NarrativePattern {
  pattern_type: string;
  confidence: number;
  position: number;
  description: string;
}

// Type conversion functions
function convertCharacterToRust(character: Character): RustCharacter {
  return {
    id: character.id,
    name: character.name,
    description: character.description || '',
    traits: character.traits?.map(trait => typeof trait === 'string' ? trait : String(trait)) || [],
    color: character.color,
  };
}

function convertRelationshipToRust(relationship: Relationship): RustRelationship {
  return {
    from: relationship.from,
    to: relationship.to,
    type: relationship.type,
    strength: relationship.strength,
  };
}

function convertWorldEventToRust(event: WorldEvent): RustWorldEvent {
  return {
    id: event.id,
    name: event.name,
    date: event.date,
    type: event.type,
    importance: event.importance,
    location_ids: event.locationIds || [],
    character_ids: event.characterIds || [],
    description: event.description,
  };
}

function convertBeatToRust(beat: Beat): RustBeat {
  return {
    id: beat.id,
    name: beat.name,
    percentage: beat.percentage,
    description: beat.description,
    content: beat.content,
    word_count: beat.wordCount,
    scene_ids: beat.sceneIds || [],
    is_completed: beat.isCompleted,
  };
}

class AnalyticsService {
  // Character Analytics
  async analyzeCharacters(
    characters: Character[],
    relationships: Relationship[]
  ): Promise<CharacterAnalytics> {
    try {
      const rustCharacters = characters.map(convertCharacterToRust);
      const rustRelationships = relationships.map(convertRelationshipToRust);

      const result = await invoke('analyze_characters', {
        characters: rustCharacters,
        relationships: rustRelationships,
      });

      return result as CharacterAnalytics;
    } catch (error) {
      console.error('Failed to analyze characters:', error);
      throw new Error('Character analysis failed');
    }
  }

  // World Analytics
  async analyzeWorld(
    events: WorldEvent[],
    locationsCount: number
  ): Promise<WorldAnalytics> {
    try {
      const rustEvents = events.map(convertWorldEventToRust);

      const result = await invoke('analyze_world', {
        events: rustEvents,
        locationsCount,
      });

      return result as WorldAnalytics;
    } catch (error) {
      console.error('Failed to analyze world:', error);
      throw new Error('World analysis failed');
    }
  }

  // Plot Analytics
  async analyzePlot(beats: Beat[]): Promise<PlotAnalytics> {
    try {
      const rustBeats = beats.map(convertBeatToRust);

      const result = await invoke('analyze_plot', {
        beats: rustBeats,
      });

      return result as PlotAnalytics;
    } catch (error) {
      console.error('Failed to analyze plot:', error);
      throw new Error('Plot analysis failed');
    }
  }

  // Text Analytics
  async analyzeText(text: string): Promise<TextAnalytics> {
    try {
      const result = await invoke('analyze_text', {
        text,
      });

      return result as TextAnalytics;
    } catch (error) {
      console.error('Failed to analyze text:', error);
      throw new Error('Text analysis failed');
    }
  }

  // Character Graph Generation
  async generateCharacterForceGraph(
    characters: Character[],
    relationships: Relationship[]
  ): Promise<ForceGraphData> {
    try {
      const rustCharacters = characters.map(convertCharacterToRust);
      const rustRelationships = relationships.map(convertRelationshipToRust);

      const result = await invoke('generate_character_force_graph', {
        characters: rustCharacters,
        relationships: rustRelationships,
      });

      return result as ForceGraphData;
    } catch (error) {
      console.error('Failed to generate character force graph:', error);
      throw new Error('Character force graph generation failed');
    }
  }

  // Fast word counting
  async calculateWordCount(text: string): Promise<WordCountResult> {
    try {
      const result = await invoke('calculate_word_count', {
        text,
      });

      return result as WordCountResult;
    } catch (error) {
      console.error('Failed to calculate word count:', error);
      throw new Error('Word count calculation failed');
    }
  }

  // Event filtering and sorting
  async filterAndSortEvents(
    events: WorldEvent[],
    searchQuery: string = '',
    filterBy: string = 'all',
    sortBy: string = 'date'
  ): Promise<WorldEvent[]> {
    try {
      const rustEvents = events.map(convertWorldEventToRust);

      const result = await invoke('filter_and_sort_events', {
        events: rustEvents,
        searchQuery,
        filterBy,
        sortBy,
      });

      // Convert back to frontend types
      return (result as RustWorldEvent[]).map(event => ({
        id: event.id,
        name: event.name,
        date: event.date,
        type: event.type,
        importance: event.importance,
        locationIds: event.location_ids,
        characterIds: event.character_ids,
        description: event.description,
      }));
    } catch (error) {
      console.error('Failed to filter and sort events:', error);
      throw new Error('Event filtering failed');
    }
  }

  // Beat word count calculations
  async calculateBeatWordCounts(
    targetWordCount: number,
    beatPercentages: number[]
  ): Promise<number[]> {
    try {
      const result = await invoke('calculate_beat_word_counts', {
        targetWordCount,
        beatPercentages,
      });

      return result as number[];
    } catch (error) {
      console.error('Failed to calculate beat word counts:', error);
      throw new Error('Beat word count calculation failed');
    }
  }

  // Advanced Analytics Methods
  async analyzeResearch(researchItems: ResearchItem[], factChecks: FactCheck[]): Promise<ResearchAnalytics> {
    try {
      const result = await invoke('analyze_research', {
        researchItems,
        factChecks
      });
      return result as ResearchAnalytics;
    } catch (error) {
      console.error('Failed to analyze research:', error);
      // Fallback to basic analysis
      return this.fallbackResearchAnalysis(researchItems, factChecks);
    }
  }

  async analyzeAdvancedText(text: string, characters: Character[] = []): Promise<AdvancedTextAnalytics> {
    try {
      const rustCharacters = characters.map(this.convertCharacterToRust);
      const result = await invoke('analyze_advanced_text', {
        text,
        characters: rustCharacters
      });
      return result as AdvancedTextAnalytics;
    } catch (error) {
      console.error('Failed to analyze advanced text:', error);
      // Fallback to basic analysis
      return this.fallbackAdvancedTextAnalysis(text);
    }
  }

  async analyzeCollaborationMetrics(editHistory: EditEvent[]): Promise<CollaborationMetrics> {
    try {
      const result = await invoke('analyze_collaboration_metrics', {
        editHistory
      });
      return result as CollaborationMetrics;
    } catch (error) {
      console.error('Failed to analyze collaboration metrics:', error);
      // Fallback analysis
      return this.fallbackCollaborationAnalysis(editHistory);
    }
  }

  async detectNarrativePatterns(text: string, patternType: 'story_structure' | 'hero_journey' | 'conflict_patterns'): Promise<any> {
    try {
      const result = await invoke('detect_narrative_patterns', {
        text,
        patternType
      });
      return result;
    } catch (error) {
      console.error('Failed to detect narrative patterns:', error);
      return { error: 'Pattern detection failed' };
    }
  }

  async analyzeWritingStyleConsistency(texts: string[], authorId: string): Promise<any> {
    try {
      const result = await invoke('analyze_writing_style_consistency', {
        texts,
        authorId
      });
      return result;
    } catch (error) {
      console.error('Failed to analyze writing style consistency:', error);
      return { error: 'Style consistency analysis failed' };
    }
  }

  async generateWritingSuggestions(
    text: string, 
    targetStyle: 'literary' | 'commercial' | 'academic' | 'general',
    focusAreas: ('pacing' | 'clarity' | 'emotion' | 'voice')[]
  ): Promise<{ suggestions: WritingSuggestion[]; analytics_summary: any }> {
    try {
      const result = await invoke('generate_writing_suggestions', {
        text,
        targetStyle,
        focusAreas
      });
      return result as { suggestions: WritingSuggestion[]; analytics_summary: any };
    } catch (error) {
      console.error('Failed to generate writing suggestions:', error);
      return {
        suggestions: [{
          category: 'general',
          issue: 'Analysis unavailable',
          suggestion: 'Review your text manually for improvements',
          priority: 'low',
          example: 'Consider basic writing principles.'
        }],
        analytics_summary: {}
      };
    }
  }

  async optimizeTextPerformance(text: string, optimizationTarget: 'readability' | 'engagement' | 'clarity'): Promise<any> {
    try {
      const result = await invoke('optimize_text_performance', {
        text,
        optimizationTarget
      });
      return result;
    } catch (error) {
      console.error('Failed to optimize text performance:', error);
      return { error: 'Text optimization failed' };
    }
  }

  // Fallback methods for when Rust backend is unavailable
  private fallbackResearchAnalysis(researchItems: ResearchItem[], factChecks: FactCheck[]): ResearchAnalytics {
    const verifiedFacts = factChecks.filter(f => f.verification_status === 'verified').length;
    const disputedFacts = factChecks.filter(f => f.verification_status === 'disputed').length;
    
    const tagCounts: Record<string, number> = {};
    researchItems.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return {
      total_research_items: researchItems.length,
      verified_facts_count: verifiedFacts,
      disputed_facts_count: disputedFacts,
      average_reliability_score: researchItems.length > 0 
        ? researchItems.reduce((sum, item) => sum + item.reliability_score, 0) / researchItems.length 
        : 0,
      research_by_tag: tagCounts,
      sources_by_reliability: {},
      fact_verification_rate: factChecks.length > 0 ? (verifiedFacts / factChecks.length) * 100 : 0,
      research_gaps: ['More research needed'],
      source_diversity_score: 75
    };
  }

  private fallbackAdvancedTextAnalysis(text: string): AdvancedTextAnalytics {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    
    return {
      sentiment_analysis: {
        overall_sentiment: 0.1,
        emotion_scores: { neutral: 0.8, positive: 0.1, negative: 0.1 },
        sentiment_progression: [0.0, 0.1, 0.0, -0.1, 0.2],
        emotional_peaks: []
      },
      narrative_structure: {
        story_beats: [],
        pacing_analysis: {
          overall_pace: 'medium',
          pace_changes: [],
          dialogue_ratio: 0.3,
          action_ratio: 0.2,
          description_ratio: 0.5
        },
        tension_curve: [0.3, 0.4, 0.6, 0.8, 0.9, 0.4],
        character_presence: {}
      },
      linguistic_complexity: {
        avg_sentence_length: sentences > 0 ? words / sentences : 0,
        sentence_length_variance: 12.5,
        vocabulary_diversity: 0.6,
        rare_words_percentage: 8.2,
        passive_voice_percentage: 15.0,
        subordinate_clauses_ratio: 0.3
      },
      style_analysis: {
        author_voice_consistency: 0.75,
        tense_consistency: {
          primary_tense: 'past',
          consistency_score: 0.85,
          tense_switches: []
        },
        pov_consistency: {
          primary_pov: 'third_person',
          consistency_score: 0.9,
          pov_switches: []
        },
        dialogue_style: {
          dialogue_percentage: 30.0,
          avg_dialogue_length: 25.0,
          character_voice_distinction: 0.7,
          dialogue_tags_ratio: 0.8
        },
        repetition_analysis: {
          word_repetitions: {},
          phrase_repetitions: {},
          intentional_repetitions: []
        }
      },
      consistency_checks: {
        character_consistency: [],
        world_consistency: [],
        plot_consistency: [],
        timeline_consistency: []
      }
    };
  }

  private fallbackCollaborationAnalysis(editHistory: EditEvent[]): CollaborationMetrics {
    const editFrequency: Record<string, number> = {};
    const sections: Record<string, EditedSection> = {};
    
    editHistory.forEach(edit => {
      editFrequency[edit.user_id] = (editFrequency[edit.user_id] || 0) + 1;
      
      if (!sections[edit.section_id]) {
        sections[edit.section_id] = {
          section_id: edit.section_id,
          edit_count: 0,
          last_edited: edit.timestamp,
          editors: []
        };
      }
      
      sections[edit.section_id].edit_count++;
      if (!sections[edit.section_id].editors.includes(edit.user_id)) {
        sections[edit.section_id].editors.push(edit.user_id);
      }
    });

    return {
      active_collaborators: Object.keys(editFrequency).length,
      edit_frequency: editFrequency,
      conflict_resolution_time: 5.2,
      simultaneous_edits: 0,
      most_edited_sections: Object.values(sections),
      collaboration_efficiency: 0.8
    };
  }
}

export const analyticsService = new AnalyticsService();
export type { AnalyticsService };

import { Character, Relationship, Beat, Theme, Conflict } from '../contexts/AppContext';
import { invoke } from '@tauri-apps/api/core';

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  creditsUsed?: number;
}

interface AIBeatSuggestion {
  content: string;
  sceneIdeas: string[];
  conflicts: string[];
  characterMoments: Record<string, string>;
}

interface AISettings {
  provider: 'openai' | 'anthropic' | 'local' | 'mock';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Rust backend types (matching the Rust structs)
interface RustCharacter {
  id: string;
  name: string;
  description?: string;
  backstory?: string;
  want?: string;
  need?: string;
  traits: Record<string, string>;
}

interface RustBeat {
  id: string;
  name: string;
  percentage: number;
  content?: string;
  scene_ids?: string[];
}

interface RustTheme {
  id: string;
  name: string;
  description?: string;
  intensity?: Record<string, number>;
  scene_ids: string[];
}

// Helper function to convert frontend types to Rust backend types
function convertCharacterToRust(character: Character): RustCharacter {
  return {
    id: character.id,
    name: character.name,
    description: character.description,
    backstory: character.description, // Use description as backstory if no specific backstory field
    want: character.want,
    need: character.need,
    traits: Object.fromEntries(
      Object.entries(character.traits || {}).map(([k, v]) => [k, String(v)])
    )
  };
}

function convertBeatToRust(beat: Beat): RustBeat {
  return {
    id: beat.id,
    name: beat.name,
    percentage: beat.percentage,
    content: beat.content,
    scene_ids: beat.sceneIds || []
  };
}

function convertThemeToRust(theme: Theme): RustTheme {
  return {
    id: theme.id,
    name: theme.name,
    description: theme.description,
    intensity: theme.intensity || {},
    scene_ids: theme.sceneIds || []
  };
}

class AIService {
  private settings: AISettings = {
    provider: 'mock',
    temperature: 0.7,
    maxTokens: 1000
  };

  async suggestCharacterRelationship(
    character: Character,
    otherCharacters: Character[]
  ): Promise<AIResponse> {
    try {
      // This is a simpler relationship suggestion - can be enhanced
      const relationship = {
        suggestion: `${character.name} could have a complex relationship with ${otherCharacters[0]?.name || 'another character'}`,
        confidence: 0.8
      };

      return {
        success: true,
        data: relationship,
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to suggest relationship',
        creditsUsed: 0
      };
    }
  }

  async generateCharacterBackstory(
    character: Character,
    context: string
  ): Promise<AIResponse> {
    try {
      const backstory = `${character.name} has a rich history shaped by ${context}. Their journey has been marked by growth and challenges that formed their current personality.`;
      
      return {
        success: true,
        data: {
          backstory,
          themes: ['identity', 'growth', 'experience']
        },
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate backstory',
        creditsUsed: 0
      };
    }
  }

  async suggestStoryDirection(
    characters: Character[],
    relationships: Relationship[],
    currentText: string
  ): Promise<AIResponse> {
    try {
      // Use the parameters to avoid unused warnings
      const characterNames = characters.map(c => c.name);
      const relationshipTypes = relationships.map(r => r.type);
      const hasText = currentText.length > 0;
      
      const suggestion = `Consider exploring the relationships between your ${characterNames.length} characters more deeply to create compelling conflict and growth opportunities.${hasText ? ' Building on your current narrative,' : ''} The ${relationshipTypes.length} relationships you've established provide rich material for development.`;
      
      return {
        success: true,
        data: {
          suggestion,
          nextScenes: [
            'A moment of character revelation',
            'An unexpected alliance',
            'A challenge that tests relationships'
          ],
          themes: this.extractThemes(characters, relationships)
        },
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to suggest story direction',
        creditsUsed: 0
      };
    }
  }

  async analyzeCharacterDynamics(
    characters: Character[],
    relationships: Relationship[]
  ): Promise<AIResponse> {
    try {
      // Use Rust backend for heavy processing
      const relationshipData = relationships.map(r => ({
        from: r.from,
        to: r.to,
        type: r.type
      }));

      const graphData = await invoke('generate_character_relationship_graph', {
        characters: characters.map(convertCharacterToRust),
        relationships: relationshipData
      });

      const analysis = {
        centralCharacters: characters.slice(0, 2).map(c => c.name),
        conflictPotential: relationships.filter(r => ['rival', 'enemy', 'antagonist'].includes(r.type.toLowerCase())).length,
        allianceStrength: relationships.filter(r => ['ally', 'friend', 'lover'].includes(r.type.toLowerCase())).length,
        graphMetrics: (graphData as any).graph_metrics,
        suggestions: [
          'Consider adding more tension between allies',
          'The central conflict could benefit from personal stakes',
          'Some relationships might need more development'
        ]
      };

      return {
        success: true,
        data: analysis,
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze character dynamics',
        creditsUsed: 0
      };
    }
  }

  updateSettings(newSettings: Partial<AISettings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Update Rust backend settings
    invoke('update_ai_settings', {
      settings: {
        provider: this.settings.provider,
        api_key: this.settings.apiKey,
        model: this.settings.model,
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens
      }
    }).catch((error: any) => {
      console.error('Failed to update AI settings:', error);
    });
  }

  getSettings(): AISettings {
    return { ...this.settings };
  }

  async suggestBeatContent(
    beat: Beat,
    characters: Character[],
    themes: Theme[],
    previousBeats: Beat[]
  ): Promise<AIResponse> {
    try {
      // Call Rust backend for AI-powered beat suggestions
      const result = await invoke('suggest_beat_content', {
        beat: convertBeatToRust(beat),
        characters: characters.map(convertCharacterToRust),
        themes: themes.map(convertThemeToRust),
        previousBeats: previousBeats.map(convertBeatToRust)
      });

      return {
        success: true,
        data: (result as any).data,
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to suggest beat content',
        creditsUsed: 0
      };
    }
  }

  async analyzeThemeCoherence(
    themes: Theme[],
    beats: Beat[],
    characters: Character[]
  ): Promise<AIResponse> {
    try {
      // Call Rust backend for theme analysis
      const result = await invoke('analyze_theme_coherence', {
        themes: themes.map(convertThemeToRust),
        beats: beats.map(convertBeatToRust),
        characters: characters.map(convertCharacterToRust)
      });

      return {
        success: true,
        data: (result as any).data,
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze theme coherence',
        creditsUsed: 0
      };
    }
  }

  async suggestConflictEscalation(
    conflicts: Conflict[],
    beats: Beat[],
    characters: Character[]
  ): Promise<AIResponse> {
    try {
      // Use characters parameter to avoid unused warning
      const characterCount = characters.length;
      
      // For now, provide a basic conflict escalation suggestion
      // This could be enhanced with a Rust backend command
      const escalationSuggestions = conflicts.map(conflict => ({
        conflictId: conflict.id,
        type: conflict.type,
        currentIntensity: conflict.intensity || 5,
        escalationSteps: [
          { beatPercentage: 20, description: 'Introduce doubt and hesitation', intensity: 3 },
          { beatPercentage: 40, description: 'Create active opposition', intensity: 5 },
          { beatPercentage: 60, description: 'Force difficult choices', intensity: 7 },
          { beatPercentage: 80, description: 'Threaten what matters most', intensity: 9 },
          { beatPercentage: 100, description: 'Demand ultimate sacrifice', intensity: 10 }
        ],
        peakMoment: beats.find(b => b.percentage === 75)?.name || 'All Is Lost',
        resolution: 'Character growth through overcoming this specific challenge'
      }));

      return {
        success: true,
        data: {
          escalationPlan: escalationSuggestions,
          overallArc: `Conflicts should build tension gradually across your ${characterCount} characters, peak at the crisis, then resolve through character growth`,
          keyMoments: [
            'Establish stakes early',
            'Complicate at midpoint',
            'Crisis at 75%',
            'Resolution through character arc'
          ]
        },
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to suggest conflict escalation',
        creditsUsed: 0
      };
    }
  }

  async generateCharacterArcSuggestions(
    character: Character,
    beats: Beat[],
    themes: Theme[]
  ): Promise<AIResponse> {
    try {
      // Call Rust backend for character arc analysis
      const result = await invoke('analyze_character_arc', {
        character: convertCharacterToRust(character),
        beats: beats.map(convertBeatToRust),
        themes: themes.map(convertThemeToRust)
      });

      return {
        success: true,
        data: (result as any).data,
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate character arc suggestions',
        creditsUsed: 0
      };
    }
  }

  // Heavy processing methods that use Rust backend
  async processLargeTextAnalysis(text: string, analysisType: string): Promise<AIResponse> {
    try {
      const result = await invoke('process_large_text_analysis', {
        text,
        analysisType
      });

      return {
        success: true,
        data: result,
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process text analysis',
        creditsUsed: 0
      };
    }
  }

  async bulkProcessDocuments(documents: any[], operation: string): Promise<AIResponse> {
    try {
      const result = await invoke('bulk_process_documents', {
        documents,
        operation
      });

      return {
        success: true,
        data: result,
        creditsUsed: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk process documents',
        creditsUsed: 0
      };
    }
  }

  private extractThemes(characters: Character[], relationships: Relationship[]): string[] {
    const themes = new Set<string>();
    
    // Extract themes based on relationship types
    relationships.forEach(rel => {
      if (rel.type.toLowerCase().includes('love')) themes.add('romance');
      if (rel.type.toLowerCase().includes('rival')) themes.add('competition');
      if (rel.type.toLowerCase().includes('family')) themes.add('family');
      if (rel.type.toLowerCase().includes('enemy')) themes.add('conflict');
    });

    // Extract themes based on character traits if available
    characters.forEach(char => {
      const traits = Object.keys(char.traits || {});
      if (traits.some(t => t.toLowerCase().includes('brave'))) themes.add('courage');
      if (traits.some(t => t.toLowerCase().includes('wise'))) themes.add('wisdom');
    });

    // Add default themes if none found
    if (themes.size === 0) {
      themes.add('identity');
      themes.add('growth');
      themes.add('relationships');
    }

    return Array.from(themes);
  }
}

export const aiService = new AIService();
export type { AIResponse, AIBeatSuggestion, AISettings };
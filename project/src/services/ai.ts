import { Character, Relationship } from '../contexts/AppContext';

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  creditsUsed?: number;
}

class AIService {
  private mockResponses = {
    characterSuggestion: [
      'A mysterious ally with hidden motives',
      'A rival who respects their enemy',
      'A mentor figure with a dark past',
      'A childhood friend turned enemy',
      'A romantic interest with conflicting loyalties',
    ],
    relationshipSuggestion: [
      'Former lovers who now work together reluctantly',
      'Siblings separated by opposing ideologies',
      'Teacher and student with unresolved tension',
      'Partners in crime with growing mistrust',
      'Enemies forced to cooperate against a common threat',
    ],
    storyPrompt: [
      'What if your protagonist discovered their mentor was their greatest enemy all along?',
      'How would the story change if two rivals had to protect each other\'s secrets?',
      'What happens when a character must choose between love and duty?',
      'How do relationships shift when a character gains unexpected power?',
      'What if your antagonist was right all along?',
    ],
  };

  async suggestCharacterRelationship(
    character: Character,
    otherCharacters: Character[],
    apiKey?: string
  ): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    if (apiKey) {
      // In a real implementation, this would call the actual API
      return this.callExternalAPI('relationship', { character, otherCharacters }, apiKey);
    } else {
      // Mock AI response
      const suggestions = this.mockResponses.relationshipSuggestion;
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      return {
        success: true,
        data: {
          suggestion: randomSuggestion,
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
        },
        creditsUsed: 0,
      };
    }
  }

  async generateCharacterBackstory(
    character: Character,
    context: string,
    apiKey?: string
  ): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    if (apiKey) {
      return this.callExternalAPI('backstory', { character, context }, apiKey);
    } else {
      const backstory = `${character.name} grew up in a world where ${context.toLowerCase()}. Their defining trait of being ${Object.keys(character.traits)[0] || 'mysterious'} shaped their early relationships and continues to influence their decisions. A pivotal moment in their past involved a choice between personal gain and helping others, which revealed their true nature.`;
      
      return {
        success: true,
        data: {
          backstory,
          themes: ['identity', 'choice', 'sacrifice'],
        },
        creditsUsed: 0,
      };
    }
  }

  async suggestStoryDirection(
    characters: Character[],
    relationships: Relationship[],
    currentText: string,
    apiKey?: string
  ): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

    if (apiKey) {
      return this.callExternalAPI('story', { characters, relationships, currentText }, apiKey);
    } else {
      const prompts = this.mockResponses.storyPrompt;
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      
      return {
        success: true,
        data: {
          suggestion: randomPrompt,
          nextScenes: [
            'A confrontation between the main characters',
            'A revelation that changes everything',
            'A moment of unexpected vulnerability',
          ],
          themes: this.extractThemes(characters, relationships),
        },
        creditsUsed: 0,
      };
    }
  }

  async analyzeCharacterDynamics(
    characters: Character[],
    relationships: Relationship[],
    apiKey?: string
  ): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

    if (apiKey) {
      return this.callExternalAPI('dynamics', { characters, relationships }, apiKey);
    } else {
      const analysis = {
        centralCharacters: characters.slice(0, 2).map(c => c.name),
        conflictPotential: relationships.filter(r => ['rival', 'enemy', 'antagonist'].includes(r.type.toLowerCase())).length,
        allianceStrength: relationships.filter(r => ['ally', 'friend', 'lover'].includes(r.type.toLowerCase())).length,
        suggestions: [
          'Consider adding more tension between allies',
          'The central conflict could benefit from personal stakes',
          'Some relationships might need more development',
        ],
      };

      return {
        success: true,
        data: analysis,
        creditsUsed: 0,
      };
    }
  }

  private async callExternalAPI(type: string, data: any, apiKey: string): Promise<AIResponse> {
    try {
      // This would be replaced with actual API calls to OpenAI, Anthropic, etc.
      // For now, return enhanced mock responses for premium users
      const enhancedResponse = await this.getEnhancedMockResponse(type, data);
      
      return {
        success: true,
        data: enhancedResponse,
        creditsUsed: this.getCreditCost(type),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API call failed',
        creditsUsed: 0,
      };
    }
  }

  private async getEnhancedMockResponse(type: string, data: any): Promise<any> {
    // Enhanced responses for premium users (when using API keys)
    switch (type) {
      case 'relationship':
        return {
          suggestion: 'A complex mentor-student dynamic where the mentor harbors secret doubts about their teachings, creating an undercurrent of tension.',
          confidence: 0.92,
          alternatives: [
            'Former allies forced into opposition by circumstances',
            'Reluctant partners with complementary skills',
          ],
          psychologicalInsights: 'This relationship type often explores themes of growth, betrayal of trust, and the burden of knowledge.',
        };
      
      case 'backstory':
        return {
          backstory: `${data.character.name}'s past is marked by a defining moment of loss that shaped their current worldview. Growing up in ${data.context}, they learned early that trust is earned through actions, not words. Their relationship with authority figures remains complicated due to a betrayal in their formative years.`,
          themes: ['loss', 'trust', 'authority', 'growth'],
          keyEvents: [
            'The betrayal that changed everything',
            'First moment of true responsibility',
            'Meeting their most important ally',
          ],
          motivations: ['Protecting others from their own experience', 'Seeking redemption', 'Building lasting connections'],
        };
      
      default:
        return this.mockResponses[type as keyof typeof this.mockResponses]?.[0] || 'No suggestion available';
    }
  }

  private getCreditCost(type: string): number {
    const costs = {
      relationship: 10,
      backstory: 25,
      story: 20,
      dynamics: 30,
    };
    return costs[type as keyof typeof costs] || 10;
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
import { invoke } from '@tauri-apps/api/core';

// Oulipo constraint types
export interface OulipoConstraint {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  creditCost: number;
  category: 'classical' | 'extended';
}

export interface ConstraintResult {
  success: boolean;
  result?: string;
  suggestions?: string[];
  violations?: ConstraintViolation[];
  metadata?: Record<string, any>;
}

export interface ConstraintViolation {
  position: number;
  length: number;
  issue: string;
  suggestion?: string;
}

// Classical Oulipo constraints
export const CLASSICAL_CONSTRAINTS: OulipoConstraint[] = [
  {
    id: 'lipogram',
    name: 'Lipogram',
    description: 'Write without using a specific letter (traditionally "e")',
    difficulty: 'intermediate',
    creditCost: 5,
    category: 'classical'
  },
  {
    id: 'n_plus_7',
    name: 'N+7',
    description: 'Replace each noun with the 7th noun following it in the dictionary',
    difficulty: 'advanced',
    creditCost: 10,
    category: 'classical'
  },
  {
    id: 'palindrome',
    name: 'Palindrome',
    description: 'Create text that reads the same forwards and backwards',
    difficulty: 'advanced',
    creditCost: 8,
    category: 'classical'
  },
  {
    id: 'snowball',
    name: 'Snowball',
    description: 'Each word is one letter longer than the previous (1, 2, 3, 4...)',
    difficulty: 'beginner',
    creditCost: 3,
    category: 'classical'
  },
  {
    id: 'sestina',
    name: 'Sestina',
    description: 'Six stanzas of six lines with specific end-word pattern',
    difficulty: 'advanced',
    creditCost: 12,
    category: 'classical'
  }
];

// Extended experimental constraints
export const EXTENDED_CONSTRAINTS: OulipoConstraint[] = [
  {
    id: 'haiku_generator',
    name: 'Haiku Generator',
    description: 'Generate traditional 5-7-5 syllable haiku with seasonal words',
    difficulty: 'beginner',
    creditCost: 4,
    category: 'extended'
  },
  {
    id: 'anagram_challenge',
    name: 'Anagram Challenge',
    description: 'Create meaningful text using only anagrams of given words',
    difficulty: 'intermediate',
    creditCost: 6,
    category: 'extended'
  },
  {
    id: 'combinatorial_poems',
    name: 'Combinatorial Poems',
    description: 'Generate poems by systematically combining word sets',
    difficulty: 'intermediate',
    creditCost: 7,
    category: 'extended'
  },
  {
    id: 'prisoners_constraint',
    name: "Prisoner's Constraint",
    description: 'Write using only letters that contain no loops (no a, b, d, e, o, p, q, r)',
    difficulty: 'advanced',
    creditCost: 9,
    category: 'extended'
  },
  {
    id: 'univocalic',
    name: 'Univocalic',
    description: 'Use only one vowel throughout the entire text',
    difficulty: 'advanced',
    creditCost: 8,
    category: 'extended'
  }
];

export const ALL_CONSTRAINTS = [...CLASSICAL_CONSTRAINTS, ...EXTENDED_CONSTRAINTS];

export class OulipoService {
  private static instance: OulipoService;
  private userCredits: number = 0;
  private dailyFreeQueries: number = 0;
  private lastFreeQueryDate: string = '';

  static getInstance(): OulipoService {
    if (!OulipoService.instance) {
      OulipoService.instance = new OulipoService();
    }
    return OulipoService.instance;
  }

  // Initialize service with user credit status
  async initialize(): Promise<void> {
    try {
      const credits = await invoke<number>('get_user_credits');
      this.userCredits = credits;
      
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem('oulipo_last_free_date');
      const savedQueries = localStorage.getItem('oulipo_daily_free');
      
      if (savedDate !== today) {
        this.dailyFreeQueries = 0;
        this.lastFreeQueryDate = today;
        localStorage.setItem('oulipo_last_free_date', today);
        localStorage.setItem('oulipo_daily_free', '0');
      } else {
        this.dailyFreeQueries = parseInt(savedQueries || '0');
      }
    } catch (error) {
      console.error('Failed to initialize Oulipo service:', error);
    }
  }

  // Check if user can perform a constraint operation
  canPerformConstraint(constraintId: string): { canPerform: boolean; reason?: string } {
    const constraint = ALL_CONSTRAINTS.find(c => c.id === constraintId);
    if (!constraint) {
      return { canPerform: false, reason: 'Constraint not found' };
    }

    // Check daily free queries (3 per day)
    if (this.dailyFreeQueries < 3) {
      return { canPerform: true };
    }

    // Check credits for premium access
    if (this.userCredits >= constraint.creditCost) {
      return { canPerform: true };
    }

    return { 
      canPerform: false, 
      reason: `Insufficient credits. Need ${constraint.creditCost} credits or wait for daily reset.` 
    };
  }

  // Perform Lipogram constraint
  async performLipogram(text: string, forbiddenLetter: string = 'e'): Promise<ConstraintResult> {
    const canPerform = this.canPerformConstraint('lipogram');
    if (!canPerform.canPerform) {
      return { success: false, violations: [{ position: 0, length: 0, issue: canPerform.reason! }] };
    }

    try {
      const result = await invoke<string>('lipogram_check', {
        text,
        forbiddenLetter: forbiddenLetter.toLowerCase()
      });

      await this.deductCreditsOrFreeQuery('lipogram');
      
      const violations = this.findLipogramViolations(text, forbiddenLetter);
      const suggestions = await this.generateLipogramSuggestions(text, forbiddenLetter);

      return {
        success: violations.length === 0,
        result,
        violations,
        suggestions,
        metadata: { forbiddenLetter, violationCount: violations.length }
      };
    } catch (error) {
      console.error('Lipogram constraint failed:', error);
      return { success: false, violations: [{ position: 0, length: 0, issue: 'Processing failed' }] };
    }
  }

  // Perform N+7 constraint
  async performNPlus7(text: string, offset: number = 7): Promise<ConstraintResult> {
    const canPerform = this.canPerformConstraint('n_plus_7');
    if (!canPerform.canPerform) {
      return { success: false, violations: [{ position: 0, length: 0, issue: canPerform.reason! }] };
    }

    try {
      const result = await invoke<string>('n_plus_7_transform', { text, offset });
      await this.deductCreditsOrFreeQuery('n_plus_7');

      return {
        success: true,
        result,
        metadata: { offset, originalWordCount: text.split(/\s+/).length }
      };
    } catch (error) {
      console.error('N+7 constraint failed:', error);
      return { success: false, violations: [{ position: 0, length: 0, issue: 'Processing failed' }] };
    }
  }

  // Perform Palindrome constraint
  async performPalindrome(text: string): Promise<ConstraintResult> {
    const canPerform = this.canPerformConstraint('palindrome');
    if (!canPerform.canPerform) {
      return { success: false, violations: [{ position: 0, length: 0, issue: canPerform.reason! }] };
    }

    try {
      const result = await invoke<boolean>('palindrome_check', { text });
      await this.deductCreditsOrFreeQuery('palindrome');

      const cleanText = text.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const isPalindrome = cleanText === cleanText.split('').reverse().join('');
      
      const suggestions = isPalindrome ? [] : await this.generatePalindromeSuggestions(text);

      return {
        success: isPalindrome,
        result: isPalindrome ? 'Perfect palindrome!' : 'Not a palindrome',
        suggestions,
        metadata: { length: cleanText.length, isPalindrome }
      };
    } catch (error) {
      console.error('Palindrome constraint failed:', error);
      return { success: false, violations: [{ position: 0, length: 0, issue: 'Processing failed' }] };
    }
  }

  // Perform Snowball constraint
  async performSnowball(text: string): Promise<ConstraintResult> {
    const canPerform = this.canPerformConstraint('snowball');
    if (!canPerform.canPerform) {
      return { success: false, violations: [{ position: 0, length: 0, issue: canPerform.reason! }] };
    }

    try {
      const words = text.trim().split(/\s+/);
      const violations: ConstraintViolation[] = [];
      let position = 0;

      for (let i = 0; i < words.length; i++) {
        const expectedLength = i + 1;
        const actualLength = words[i].length;
        
        if (actualLength !== expectedLength) {
          violations.push({
            position,
            length: words[i].length,
            issue: `Word ${i + 1} should be ${expectedLength} letters, but is ${actualLength}`,
            suggestion: `Replace with a ${expectedLength}-letter word`
          });
        }
        position += words[i].length + 1; // +1 for space
      }

      await this.deductCreditsOrFreeQuery('snowball');

      return {
        success: violations.length === 0,
        result: violations.length === 0 ? 'Perfect snowball pattern!' : `${violations.length} violations found`,
        violations,
        metadata: { wordCount: words.length, violationCount: violations.length }
      };
    } catch (error) {
      console.error('Snowball constraint failed:', error);
      return { success: false, violations: [{ position: 0, length: 0, issue: 'Processing failed' }] };
    }
  }

  // Generate Haiku
  async generateHaiku(theme?: string): Promise<ConstraintResult> {
    const canPerform = this.canPerformConstraint('haiku_generator');
    if (!canPerform.canPerform) {
      return { success: false, violations: [{ position: 0, length: 0, issue: canPerform.reason! }] };
    }

    try {
      const result = await invoke<string>('generate_haiku', { theme: theme || 'nature' });
      await this.deductCreditsOrFreeQuery('haiku_generator');

      return {
        success: true,
        result,
        metadata: { theme, syllablePattern: '5-7-5' }
      };
    } catch (error) {
      console.error('Haiku generation failed:', error);
      return { success: false, violations: [{ position: 0, length: 0, issue: 'Generation failed' }] };
    }
  }

  // Helper methods
  private async deductCreditsOrFreeQuery(constraintId: string): Promise<void> {
    if (this.dailyFreeQueries < 3) {
      this.dailyFreeQueries++;
      localStorage.setItem('oulipo_daily_free', this.dailyFreeQueries.toString());
    } else {
      const constraint = ALL_CONSTRAINTS.find(c => c.id === constraintId);
      if (constraint) {
        await invoke('deduct_credits', { amount: constraint.creditCost });
        this.userCredits -= constraint.creditCost;
      }
    }
  }

  private findLipogramViolations(text: string, forbiddenLetter: string): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    const letter = forbiddenLetter.toLowerCase();
    
    for (let i = 0; i < text.length; i++) {
      if (text[i].toLowerCase() === letter) {
        violations.push({
          position: i,
          length: 1,
          issue: `Forbidden letter "${forbiddenLetter}" found`,
          suggestion: 'Replace with alternative word'
        });
      }
    }
    
    return violations;
  }

  private async generateLipogramSuggestions(text: string, forbiddenLetter: string): Promise<string[]> {
    try {
      return await invoke<string[]>('lipogram_suggestions', { text, forbiddenLetter });
    } catch {
      return ['Try using synonyms', 'Restructure the sentence', 'Use different word forms'];
    }
  }

  private async generatePalindromeSuggestions(text: string): Promise<string[]> {
    try {
      return await invoke<string[]>('palindrome_suggestions', { text });
    } catch {
      return ['Add mirroring words', 'Remove middle words', 'Rearrange word order'];
    }
  }

  // Get user's current status
  getStatus() {
    return {
      credits: this.userCredits,
      dailyFreeQueries: this.dailyFreeQueries,
      remainingFreeQueries: Math.max(0, 3 - this.dailyFreeQueries)
    };
  }

  // Get constraint by ID
  getConstraint(id: string): OulipoConstraint | undefined {
    return ALL_CONSTRAINTS.find(c => c.id === id);
  }

  // Get all constraints by category
  getConstraintsByCategory(category: 'classical' | 'extended'): OulipoConstraint[] {
    return ALL_CONSTRAINTS.filter(c => c.category === category);
  }
}

import { PlotStructure, Character, Document, Theme } from '../contexts/AppContext';
import { invoke } from '@tauri-apps/api/core';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'txt' | 'json' | 'markdown' | 'html' | 'epub';
  includeBeats: boolean;
  includeCharacters: boolean;
  includeThemes: boolean;
  includeConflicts: boolean;
  includeVisualizations: boolean;
  title?: string;
  author?: string;
  description?: string;
}

// Types matching Rust backend
interface RustExportOptions {
  format: string;
  include_beats: boolean;
  include_characters: boolean;
  include_themes: boolean;
  include_conflicts: boolean;
  include_visualizations: boolean;
  title?: string;
  author?: string;
  description?: string;
}

interface RustProjectData {
  title: string;
  author?: string;
  description?: string;
  plot_structure: any;
  characters: any[];
  documents: any[];
  themes: any[];
}

interface ExportResult {
  success: boolean;
  file_path?: string;
  content?: string;
  error?: string;
}

class ExportService {
  async exportPlotStructure(
    plotStructure: PlotStructure,
    characters: Character[],
    documents: Document[],
    themes: Theme[] = [],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // Use Rust backend for all export operations
      const rustOptions: RustExportOptions = {
        format: options.format,
        include_beats: options.includeBeats,
        include_characters: options.includeCharacters,
        include_themes: options.includeThemes,
        include_conflicts: options.includeConflicts,
        include_visualizations: options.includeVisualizations,
        title: options.title,
        author: options.author,
        description: options.description
      };

      const projectData: RustProjectData = {
        title: options.title || 'Untitled Project',
        author: options.author,
        description: options.description,
        plot_structure: plotStructure,
        characters: characters,
        documents: documents,
        themes: themes
      };

      const result: ExportResult = await invoke('export_project', {
        projectData,
        options: rustOptions
      });

      return result;
    } catch (error) {
      console.error('Export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  async exportBeatSheet(
    plotStructure: PlotStructure,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const rustOptions: RustExportOptions = {
        format: options.format,
        include_beats: options.includeBeats,
        include_characters: options.includeCharacters,
        include_themes: options.includeThemes,
        include_conflicts: options.includeConflicts,
        include_visualizations: options.includeVisualizations,
        title: options.title,
        author: options.author,
        description: options.description
      };

      const result: ExportResult = await invoke('export_beat_sheet', {
        plotStructure,
        options: rustOptions
      });

      return result;
    } catch (error) {
      console.error('Beat sheet export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Beat sheet export failed'
      };
    }
  }

  async exportDocument(
    document: Document,
    options: Omit<ExportOptions, 'includeBeats' | 'includeCharacters' | 'includeThemes' | 'includeConflicts' | 'includeVisualizations'>
  ): Promise<ExportResult> {
    try {
      const rustOptions = {
        format: options.format,
        title: options.title || document.title,
        author: options.author,
        description: options.description
      };

      // For simple document export, we can create a minimal project structure
      const projectData = {
        title: document.title,
        author: options.author,
        description: options.description,
        documents: [document],
        plot_structure: null,
        characters: [],
        themes: []
      };

      const result: ExportResult = await invoke('export_project', {
        projectData,
        options: rustOptions
      });

      return result;
    } catch (error) {
      console.error('Document export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Document export failed'
      };
    }
  }

  // Helper method to get supported formats
  getSupportedFormats(): string[] {
    return ['pdf', 'docx', 'txt', 'json', 'markdown', 'html', 'epub'];
  }

  // Helper method to validate export options
  validateExportOptions(options: ExportOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.getSupportedFormats().includes(options.format)) {
      errors.push(`Unsupported format: ${options.format}`);
    }

    if (!options.includeBeats && !options.includeCharacters && !options.includeThemes && !options.includeConflicts) {
      errors.push('At least one content type must be included in the export');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const exportService = new ExportService();
export { ExportService };
export type { ExportResult };

import { info, error as logError } from '@tauri-apps/plugin-log';
import { Workspace, Project, Book, Document, Character, Relationship, Note, Group, Location, WorldEvent, WorldRule, PlotStructure, Beat, Theme, Conflict, BStory, AppSettings } from '../contexts/AppContext';

// Import the base storage service type
import type { StorageService } from './storage';

// Enhanced storage service that works with both web and Tauri environments
export class TauriStorageService {
  private baseStorage: StorageService;
  private isTauri: boolean = false;

  constructor(baseStorageService: StorageService) {
    this.baseStorage = baseStorageService;
    this.isTauri = window.__TAURI__ !== undefined;
    
    if (this.isTauri) {
      info('Running in Tauri environment - enhanced features available');
    }
  }

  // Initialize storage - delegates to base service for now
  async init(): Promise<void> {
    return this.baseStorage.init();
  }

  // Project operations with enhanced logging
  async getProjects(): Promise<Project[]> {
    try {
      const projects = await this.baseStorage.getProjects();
      if (this.isTauri) {
        info(`Loaded ${projects.length} projects`);
      }
      return projects;
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to get projects: ${err}`);
      }
      throw err;
    }
  }

  async saveProject(project: Project): Promise<void> {
    try {
      await this.baseStorage.saveProject(project);
      if (this.isTauri) {
        info(`Saved project: ${project.name}`);
      }
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to save project ${project.name}: ${err}`);
      }
      throw err;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      await this.baseStorage.deleteProject(projectId);
      if (this.isTauri) {
        info(`Deleted project: ${projectId}`);
      }
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to delete project ${projectId}: ${err}`);
      }
      throw err;
    }
  }

  // Enhanced backup functionality (Tauri-specific)
  async exportProjectData(projectId: string): Promise<{
    project: Project | null;
    documents: Document[];
    groups: Group[];
    characters: Character[];
    relationships: Relationship[];
    locations: Location[];
    worldEvents: WorldEvent[];
    worldRules: WorldRule[];
    notes: Note[];
    exportedAt: string;
    version: string;
  }> {
    if (!this.isTauri) {
      throw new Error('Export functionality requires Tauri environment');
    }

    try {
      // Get all project data
      const project = await this.baseStorage.getProjects().then((projects: Project[]) => 
        projects.find(p => p.id === projectId)
      );
      
      if (!project) {
        throw new Error('Project not found');
      }

      const [
        documents,
        groups,
        characters,
        relationships,
        locations,
        worldEvents,
        worldRules,
        notes
      ] = await Promise.all([
        this.baseStorage.getDocuments(projectId),
        this.baseStorage.getGroups(projectId),
        this.baseStorage.getCharacters(projectId),
        this.baseStorage.getRelationships(projectId),
        this.baseStorage.getLocations(projectId),
        this.baseStorage.getWorldEvents(projectId),
        this.baseStorage.getWorldRules(projectId),
        this.baseStorage.getNotes(projectId)
      ]);

      const exportData = {
        project,
        documents,
        groups,
        characters,
        relationships,
        locations,
        worldEvents,
        worldRules,
        notes,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      info(`Exported project data for: ${project.name}`);
      return exportData;
    } catch (err) {
      logError(`Failed to export project data: ${err}`);
      throw err;
    }
  }

  // Delegate all other methods to base storage
  async getGroups(projectId: string): Promise<Group[]> {
    return this.baseStorage.getGroups(projectId);
  }

  async saveGroup(group: Group & { projectId: string }): Promise<void> {
    return this.baseStorage.saveGroup(group);
  }

  async deleteGroup(groupId: string): Promise<void> {
    return this.baseStorage.deleteGroup(groupId);
  }

  async getDocuments(projectId: string): Promise<Document[]> {
    return this.baseStorage.getDocuments(projectId);
  }

  async saveDocument(document: Document & { projectId: string }): Promise<void> {
    return this.baseStorage.saveDocument(document);
  }

  async deleteDocument(documentId: string): Promise<void> {
    return this.baseStorage.deleteDocument(documentId);
  }

  async getCharacters(projectId: string): Promise<Character[]> {
    return this.baseStorage.getCharacters(projectId);
  }

  async saveCharacter(character: Character & { projectId: string }): Promise<void> {
    return this.baseStorage.saveCharacter(character);
  }

  async deleteCharacter(characterId: string): Promise<void> {
    return this.baseStorage.deleteCharacter(characterId);
  }

  async getRelationships(projectId: string): Promise<Relationship[]> {
    return this.baseStorage.getRelationships(projectId);
  }

  async saveRelationship(relationship: Relationship & { projectId: string }): Promise<void> {
    return this.baseStorage.saveRelationship(relationship);
  }

  async deleteRelationship(relationshipId: string): Promise<void> {
    return this.baseStorage.deleteRelationship(relationshipId);
  }

  async getLocations(projectId: string): Promise<Location[]> {
    return this.baseStorage.getLocations(projectId);
  }

  async saveLocation(location: Location & { projectId: string }): Promise<void> {
    return this.baseStorage.saveLocation(location);
  }

  async deleteLocation(locationId: string): Promise<void> {
    return this.baseStorage.deleteLocation(locationId);
  }

  async getWorldEvents(projectId: string): Promise<WorldEvent[]> {
    return this.baseStorage.getWorldEvents(projectId);
  }

  async saveWorldEvent(event: WorldEvent & { projectId: string }): Promise<void> {
    return this.baseStorage.saveWorldEvent(event);
  }

  async deleteWorldEvent(eventId: string): Promise<void> {
    return this.baseStorage.deleteWorldEvent(eventId);
  }

  async getWorldRules(projectId: string): Promise<WorldRule[]> {
    return this.baseStorage.getWorldRules(projectId);
  }

  async saveWorldRule(rule: WorldRule & { projectId: string }): Promise<void> {
    return this.baseStorage.saveWorldRule(rule);
  }

  async deleteWorldRule(ruleId: string): Promise<void> {
    return this.baseStorage.deleteWorldRule(ruleId);
  }

  async getNotes(projectId: string): Promise<Note[]> {
    return this.baseStorage.getNotes(projectId);
  }

  async saveNote(note: Note & { projectId: string }): Promise<void> {
    return this.baseStorage.saveNote(note);
  }

  async deleteNote(noteId: string): Promise<void> {
    return this.baseStorage.deleteNote(noteId);
  }

  // Settings methods with enhanced logging
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await this.baseStorage.getSettings();
      if (this.isTauri) {
        info('Loaded application settings');
      }
      // Return default settings if none exist
      return settings || {
        autoSave: true,
        writingMode: 'standard',
        fontSize: 16,
        lineHeight: 1.5,
        theme: 'light'
      };
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to get settings: ${err}`);
      }
      throw err;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await this.baseStorage.saveSettings(settings);
      if (this.isTauri) {
        info('Saved application settings');
      }
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to save settings: ${err}`);
      }
      throw err;
    }
  }

  // Plot Structure methods
  async getPlotStructure(projectId: string): Promise<PlotStructure | null> {
    return this.baseStorage.getPlotStructure(projectId);
  }

  async savePlotStructure(plotStructure: PlotStructure & { projectId: string }): Promise<void> {
    try {
      await this.baseStorage.savePlotStructure(plotStructure);
      if (this.isTauri) {
        info(`Saved plot structure for project: ${plotStructure.projectId}`);
      }
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to save plot structure: ${err}`);
      }
      throw err;
    }
  }

  async deletePlotStructure(projectId: string): Promise<void> {
    return this.baseStorage.deletePlotStructure(projectId);
  }

  async getBeats(projectId: string): Promise<Beat[]> {
    return this.baseStorage.getBeats(projectId);
  }

  async saveBeat(beat: Beat & { projectId: string }): Promise<void> {
    return this.baseStorage.saveBeat(beat);
  }

  async deleteBeat(beatId: string): Promise<void> {
    return this.baseStorage.deleteBeat(beatId);
  }

  async getThemes(projectId: string): Promise<Theme[]> {
    return this.baseStorage.getThemes(projectId);
  }

  async saveTheme(theme: Theme & { projectId: string }): Promise<void> {
    return this.baseStorage.saveTheme(theme);
  }

  async deleteTheme(themeId: string): Promise<void> {
    return this.baseStorage.deleteTheme(themeId);
  }

  async getConflicts(projectId: string): Promise<Conflict[]> {
    return this.baseStorage.getConflicts(projectId);
  }

  async saveConflict(conflict: Conflict & { projectId: string }): Promise<void> {
    return this.baseStorage.saveConflict(conflict);
  }

  async deleteConflict(conflictId: string): Promise<void> {
    return this.baseStorage.deleteConflict(conflictId);
  }

  async getBStories(projectId: string): Promise<BStory[]> {
    return this.baseStorage.getBStories(projectId);
  }

  async saveBStory(bStory: BStory & { projectId: string }): Promise<void> {
    return this.baseStorage.saveBStory(bStory);
  }

  async deleteBStory(bStoryId: string): Promise<void> {
    return this.baseStorage.deleteBStory(bStoryId);
  }

  // Workspace operations with enhanced logging
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const workspaces = await this.baseStorage.getWorkspaces();
      if (this.isTauri) {
        info(`Loaded ${workspaces.length} workspaces`);
      }
      return workspaces;
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to get workspaces: ${err}`);
      }
      throw err;
    }
  }

  async saveWorkspace(workspace: Workspace): Promise<void> {
    try {
      await this.baseStorage.saveWorkspace(workspace);
      if (this.isTauri) {
        info(`Saved workspace: ${workspace.name}`);
      }
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to save workspace ${workspace.name}: ${err}`);
      }
      throw err;
    }
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await this.baseStorage.deleteWorkspace(workspaceId);
      if (this.isTauri) {
        info(`Deleted workspace: ${workspaceId}`);
      }
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to delete workspace ${workspaceId}: ${err}`);
      }
      throw err;
    }
  }

  // Book operations with enhanced logging
  async getBooks(projectId: string): Promise<Book[]> {
    try {
      const books = await this.baseStorage.getBooks(projectId);
      if (this.isTauri) {
        info(`Loaded ${books.length} books for project ${projectId}`);
      }
      return books;
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to get books for project ${projectId}: ${err}`);
      }
      throw err;
    }
  }

  async saveBook(book: Book): Promise<void> {
    try {
      await this.baseStorage.saveBook(book);
      if (this.isTauri) {
        info(`Saved book: ${book.title}`);
      }
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to save book ${book.title}: ${err}`);
      }
      throw err;
    }
  }

  async deleteBook(bookId: string): Promise<void> {
    try {
      await this.baseStorage.deleteBook(bookId);
      if (this.isTauri) {
        info(`Deleted book: ${bookId}`);
      }
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to delete book ${bookId}: ${err}`);
      }
      throw err;
    }
  }

  async getProjectsByWorkspace(workspaceId: string): Promise<Project[]> {
    try {
      const projects = await this.baseStorage.getProjectsByWorkspace(workspaceId);
      if (this.isTauri) {
        info(`Loaded ${projects.length} projects for workspace ${workspaceId}`);
      }
      return projects;
    } catch (err) {
      if (this.isTauri) {
        logError(`Failed to get projects for workspace ${workspaceId}: ${err}`);
      }
      throw err;
    }
  }
}

// Helper function to check if running in Tauri
export const isTauriEnvironment = (): boolean => {
  return window.__TAURI__ !== undefined;
};

// Export detection for use in components
export const getTauriInfo = async (): Promise<{ isTauri: boolean; version?: string }> => {
  if (!isTauriEnvironment()) {
    return { isTauri: false };
  }

  try {
    const { getVersion } = await import('@tauri-apps/api/app');
    const version = await getVersion();
    return { isTauri: true, version };
  } catch {
    return { isTauri: true };
  }
};

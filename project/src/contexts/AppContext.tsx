import React, { createContext, useReducer, useEffect } from 'react';
import { storageService } from '../services';

export interface Character {
  id: string;
  bookId: string;
  projectId: string;
  workspaceId: string;
  name: string;
  traits: Record<string, string | number | boolean>;
  description?: string;
  color?: string;
  // Enhanced for character arc tracking
  want?: string; // External goal
  need?: string; // Internal lesson/growth
  arc?: CharacterArcPoint[];
  // Series-wide character (shared across books in project)
  isSeriesCharacter?: boolean;
}

export interface Relationship {
  id: string;
  bookId: string;
  projectId: string;
  workspaceId: string;
  from: string;
  to: string;
  type: string;
  description?: string;
  strength: number;
}

export interface Location {
  id: string;
  bookId: string;
  projectId: string;
  workspaceId: string;
  name: string;
  type: 'city' | 'building' | 'region' | 'landmark' | 'natural' | 'other';
  description?: string;
  parentId?: string; // For hierarchical locations
  coordinates?: { x: number; y: number };
  color?: string;
  properties: Record<string, unknown>;
  connections: string[]; // IDs of connected locations
  // Series-wide location (shared across books in project)
  isSeriesLocation?: boolean;
}

export interface WorldEvent {
  id: string;
  bookId: string;
  projectId: string;
  workspaceId: string;
  name: string;
  description?: string;
  date: string; // Can be fictional date
  type: 'historical' | 'political' | 'natural' | 'cultural' | 'personal' | 'other';
  locationIds: string[];
  characterIds: string[];
  importance: number; // 1-10 scale
  consequences?: string;
  // Series-wide event (affects multiple books)
  isSeriesEvent?: boolean;
}

export interface WorldRule {
  id: string;
  bookId: string;
  projectId: string;
  workspaceId: string;
  category: 'magic' | 'technology' | 'society' | 'physics' | 'culture' | 'other';
  title: string;
  description: string;
  examples?: string[];
  limitations?: string[];
  // Series-wide rule (applies across books in project)
  isSeriesRule?: boolean;
}

export interface DocumentNote {
  id: string;
  content: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  bookId: string;
  projectId: string;
  workspaceId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  groupId?: string;
  order?: number;
  status?: 'draft' | 'in-progress' | 'complete';
  target?: number; // word count target
  notes?: DocumentNote[];
  tags?: string[];
  deadline?: Date;
}

export interface Group {
  id: string;
  bookId: string;
  projectId: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
  order: number;
  isExpanded: boolean;
  type: 'folder' | 'filter';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Hierarchical structure: Workspace → Project → Book
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    defaultWordTarget?: number;
    autoBackup?: boolean;
    writingGoals?: {
      dailyWords?: number;
      weeklyWords?: number;
    };
  };
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: 'series' | 'standalone' | 'collection';
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    shareCharacters?: boolean; // Share characters across books in series
    shareWorldBuilding?: boolean; // Share world elements across books
    seriesOrder?: string[]; // Array of book IDs in order
  };
}

export interface Book {
  id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  subtitle?: string;
  description?: string;
  genre?: string;
  status: 'planning' | 'writing' | 'editing' | 'complete' | 'published';
  targetWordCount?: number;
  currentWordCount?: number;
  seriesOrder?: number; // Position in series (if applicable)
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    useSeriesCharacters?: boolean;
    useSeriesWorld?: boolean;
  };
}

// New plot structure interfaces
export interface Beat {
  id: string;
  name: string;
  percentage: number;
  description: string;
  content?: string;
  wordCount?: number;
  sceneIds?: string[];
  isCompleted: boolean;
}

export interface CharacterArcPoint {
  beatId: string;
  emotionalState: Record<string, number>; // e.g., { confidence: 7, fear: 3, hope: 8 }
  notes?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  sceneIds: string[]; // Scenes where theme appears
  intensity?: Record<string, number>; // Scene ID -> intensity level
}

export interface Conflict {
  id: string;
  type: 'internal' | 'external';
  description: string;
  intensity: number; // 1-10 scale
  beatId?: string;
  sceneIds: string[];
}

export interface BStory {
  id: string;
  characterId: string;
  name: string;
  description: string;
  sceneIds: string[];
  thematicImpact?: Record<string, number>; // Scene ID -> impact level
}

export interface PlotStructure {
  id: string;
  bookId: string;
  projectId: string;
  workspaceId: string;
  targetWordCount: number;
  beats: Beat[];
  themes: Theme[];
  conflicts: Conflict[];
  bStories: BStory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  openaiKey?: string;
  anthropicKey?: string;
  autoSave: boolean;
  writingMode?: 'focus' | 'standard' | 'typewriter';
  fontSize?: number;
  lineHeight?: number;
  theme?: 'light' | 'dark';
}

export interface AppState {
  // Hierarchical structure
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  currentProject: Project | null;
  projects: Project[]; // Projects in current workspace
  currentBook: Book | null;
  books: Book[]; // Books in current project
  
  // Book-specific content
  documents: Document[]; // Documents in current book
  groups: Group[]; // Groups in current book
  characters: Character[]; // Characters in current book/project (based on settings)
  relationships: Relationship[]; // Relationships in current book/project
  locations: Location[]; // Locations in current book/project
  worldEvents: WorldEvent[]; // Events in current book/project
  worldRules: WorldRule[]; // Rules in current book/project
  notes: Note[]; // Notes in current book
  plotStructure: PlotStructure | null; // Plot structure for current book
  
  // UI state
  currentDocument: Document | null;
  currentView: 'write' | 'characters' | 'world' | 'notes' | 'plot' | 'settings';
  theme: 'light' | 'dark';
  credits: number;
  freeQueriesLeft: number;
  settings: AppSettings;
}

type AppAction =
  // Workspace actions
  | { type: 'SET_CURRENT_WORKSPACE'; payload: Workspace | null }
  | { type: 'SET_WORKSPACES'; payload: Workspace[] }
  | { type: 'ADD_WORKSPACE'; payload: Workspace }
  | { type: 'UPDATE_WORKSPACE'; payload: Workspace }
  | { type: 'DELETE_WORKSPACE'; payload: string }
  
  // Project actions  
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  
  // Book actions
  | { type: 'SET_CURRENT_BOOK'; payload: Book | null }
  | { type: 'SET_BOOKS'; payload: Book[] }
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'DELETE_BOOK'; payload: string }
  
  // Content actions (unchanged but now book-scoped)
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'SET_CURRENT_DOCUMENT'; payload: Document | null }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'DELETE_GROUP'; payload: string }
  | { type: 'TOGGLE_GROUP_EXPANSION'; payload: string }
  | { type: 'SET_CHARACTERS'; payload: Character[] }
  | { type: 'ADD_CHARACTER'; payload: Character }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'DELETE_CHARACTER'; payload: string }
  | { type: 'SET_RELATIONSHIPS'; payload: Relationship[] }
  | { type: 'ADD_RELATIONSHIP'; payload: Relationship }
  | { type: 'UPDATE_RELATIONSHIP'; payload: Relationship }
  | { type: 'DELETE_RELATIONSHIP'; payload: string }
  | { type: 'SET_LOCATIONS'; payload: Location[] }
  | { type: 'ADD_LOCATION'; payload: Location }
  | { type: 'UPDATE_LOCATION'; payload: Location }
  | { type: 'DELETE_LOCATION'; payload: string }
  | { type: 'SET_WORLD_EVENTS'; payload: WorldEvent[] }
  | { type: 'ADD_WORLD_EVENT'; payload: WorldEvent }
  | { type: 'UPDATE_WORLD_EVENT'; payload: WorldEvent }
  | { type: 'DELETE_WORLD_EVENT'; payload: string }
  | { type: 'SET_WORLD_RULES'; payload: WorldRule[] }
  | { type: 'ADD_WORLD_RULE'; payload: WorldRule }
  | { type: 'UPDATE_WORLD_RULE'; payload: WorldRule }
  | { type: 'DELETE_WORLD_RULE'; payload: string }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_PLOT_STRUCTURE'; payload: PlotStructure | null }
  | { type: 'UPDATE_PLOT_STRUCTURE'; payload: Partial<PlotStructure> }
  | { type: 'ADD_BEAT'; payload: Beat }
  | { type: 'UPDATE_BEAT'; payload: Beat }
  | { type: 'DELETE_BEAT'; payload: string }
  | { type: 'ADD_THEME'; payload: Theme }
  | { type: 'UPDATE_THEME'; payload: Theme }
  | { type: 'DELETE_THEME'; payload: string }
  | { type: 'ADD_CONFLICT'; payload: Conflict }
  | { type: 'UPDATE_CONFLICT'; payload: Conflict }
  | { type: 'DELETE_CONFLICT'; payload: string }
  | { type: 'ADD_B_STORY'; payload: BStory }
  | { type: 'UPDATE_B_STORY'; payload: BStory }
  | { type: 'DELETE_B_STORY'; payload: string }
  | { type: 'SET_CURRENT_VIEW'; payload: 'write' | 'characters' | 'world' | 'notes' | 'plot' | 'settings' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_CREDITS'; payload: number }
  | { type: 'SET_FREE_QUERIES'; payload: number }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> };

const initialState: AppState = {
  // Hierarchical structure
  currentWorkspace: null,
  workspaces: [],
  currentProject: null,
  projects: [],
  currentBook: null,
  books: [],
  
  // Book-specific content
  documents: [],
  groups: [],
  characters: [],
  relationships: [],
  locations: [],
  worldEvents: [],
  worldRules: [],
  notes: [],
  plotStructure: null,
  
  // UI state
  currentDocument: null,
  currentView: 'write',
  theme: 'dark',
  credits: 0,
  freeQueriesLeft: 5,
  settings: {
    autoSave: true,
    writingMode: 'standard',
    fontSize: 16,
    lineHeight: 1.7,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Workspace actions
    case 'SET_CURRENT_WORKSPACE':
      return { ...state, currentWorkspace: action.payload };
    case 'SET_WORKSPACES':
      return { ...state, workspaces: action.payload };
    case 'ADD_WORKSPACE':
      return { ...state, workspaces: [...state.workspaces, action.payload] };
    case 'UPDATE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.map(w => w.id === action.payload.id ? action.payload : w),
        currentWorkspace: state.currentWorkspace?.id === action.payload.id ? action.payload : state.currentWorkspace,
      };
    case 'DELETE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.filter(w => w.id !== action.payload),
        currentWorkspace: state.currentWorkspace?.id === action.payload ? null : state.currentWorkspace,
      };
    
    // Project actions
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p),
        currentProject: state.currentProject?.id === action.payload.id ? action.payload : state.currentProject,
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject,
      };
    
    // Book actions
    case 'SET_CURRENT_BOOK':
      return { ...state, currentBook: action.payload };
    case 'SET_BOOKS':
      return { ...state, books: action.payload };
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    case 'UPDATE_BOOK':
      return {
        ...state,
        books: state.books.map(b => b.id === action.payload.id ? action.payload : b),
        currentBook: state.currentBook?.id === action.payload.id ? action.payload : state.currentBook,
      };
    case 'DELETE_BOOK':
      return {
        ...state,
        books: state.books.filter(b => b.id !== action.payload),
        currentBook: state.currentBook?.id === action.payload ? null : state.currentBook,
      };
    
    // Content actions (unchanged but now book-scoped)
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] };
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(d => d.id === action.payload.id ? action.payload : d),
        currentDocument: state.currentDocument?.id === action.payload.id ? action.payload : state.currentDocument,
      };
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(d => d.id !== action.payload),
        currentDocument: state.currentDocument?.id === action.payload ? null : state.currentDocument,
      };
    case 'SET_CURRENT_DOCUMENT':
      return { ...state, currentDocument: action.payload };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };
    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map(g => g.id === action.payload.id ? action.payload : g),
      };
    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter(g => g.id !== action.payload),
        documents: state.documents.map(d => d.groupId === action.payload ? { ...d, groupId: undefined } : d),
      };
    case 'TOGGLE_GROUP_EXPANSION':
      return {
        ...state,
        groups: state.groups.map(g => 
          g.id === action.payload ? { ...g, isExpanded: !g.isExpanded } : g
        ),
      };
    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload };
    case 'ADD_CHARACTER':
      return { ...state, characters: [...state.characters, action.payload] };
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(c => c.id === action.payload.id ? action.payload : c),
      };
    case 'DELETE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(c => c.id !== action.payload),
        relationships: state.relationships.filter(r => r.from !== action.payload && r.to !== action.payload),
      };
    case 'SET_RELATIONSHIPS':
      return { ...state, relationships: action.payload };
    case 'ADD_RELATIONSHIP':
      return { ...state, relationships: [...state.relationships, action.payload] };
    case 'UPDATE_RELATIONSHIP':
      return {
        ...state,
        relationships: state.relationships.map(r => r.id === action.payload.id ? action.payload : r),
      };
    case 'DELETE_RELATIONSHIP':
      return {
        ...state,
        relationships: state.relationships.filter(r => r.id !== action.payload),
      };
    case 'SET_LOCATIONS':
      return { ...state, locations: action.payload };
    case 'ADD_LOCATION':
      return { ...state, locations: [...state.locations, action.payload] };
    case 'UPDATE_LOCATION':
      return {
        ...state,
        locations: state.locations.map(l => l.id === action.payload.id ? action.payload : l),
      };
    case 'DELETE_LOCATION':
      return {
        ...state,
        locations: state.locations.filter(l => l.id !== action.payload),
        worldEvents: state.worldEvents.map(e => ({
          ...e,
          locationIds: e.locationIds.filter(id => id !== action.payload)
        })),
      };
    case 'SET_WORLD_EVENTS':
      return { ...state, worldEvents: action.payload };
    case 'ADD_WORLD_EVENT':
      return { ...state, worldEvents: [...state.worldEvents, action.payload] };
    case 'UPDATE_WORLD_EVENT':
      return {
        ...state,
        worldEvents: state.worldEvents.map(e => e.id === action.payload.id ? action.payload : e),
      };
    case 'DELETE_WORLD_EVENT':
      return {
        ...state,
        worldEvents: state.worldEvents.filter(e => e.id !== action.payload),
      };
    case 'SET_WORLD_RULES':
      return { ...state, worldRules: action.payload };
    case 'ADD_WORLD_RULE':
      return { ...state, worldRules: [...state.worldRules, action.payload] };
    case 'UPDATE_WORLD_RULE':
      return {
        ...state,
        worldRules: state.worldRules.map(r => r.id === action.payload.id ? action.payload : r),
      };
    case 'DELETE_WORLD_RULE':
      return {
        ...state,
        worldRules: state.worldRules.filter(r => r.id !== action.payload),
      };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload),
      };
    
    // Plot structure actions
    case 'SET_PLOT_STRUCTURE':
      return { ...state, plotStructure: action.payload };
    case 'UPDATE_PLOT_STRUCTURE':
      return {
        ...state,
        plotStructure: state.plotStructure ? { ...state.plotStructure, ...action.payload } : null,
      };
    case 'ADD_BEAT':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? { ...state.plotStructure, beats: [...state.plotStructure.beats, action.payload] }
          : null,
      };
    case 'UPDATE_BEAT':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? {
              ...state.plotStructure,
              beats: state.plotStructure.beats.map(b => b.id === action.payload.id ? action.payload : b),
            }
          : null,
      };
    case 'DELETE_BEAT':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? {
              ...state.plotStructure,
              beats: state.plotStructure.beats.filter(b => b.id !== action.payload),
            }
          : null,
      };
    case 'ADD_THEME':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? { ...state.plotStructure, themes: [...state.plotStructure.themes, action.payload] }
          : null,
      };
    case 'UPDATE_THEME':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? {
              ...state.plotStructure,
              themes: state.plotStructure.themes.map(t => t.id === action.payload.id ? action.payload : t),
            }
          : null,
      };
    case 'DELETE_THEME':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? {
              ...state.plotStructure,
              themes: state.plotStructure.themes.filter(t => t.id !== action.payload),
            }
          : null,
      };
    case 'ADD_CONFLICT':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? { ...state.plotStructure, conflicts: [...state.plotStructure.conflicts, action.payload] }
          : null,
      };
    case 'UPDATE_CONFLICT':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? {
              ...state.plotStructure,
              conflicts: state.plotStructure.conflicts.map(c => c.id === action.payload.id ? action.payload : c),
            }
          : null,
      };
    case 'DELETE_CONFLICT':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? {
              ...state.plotStructure,
              conflicts: state.plotStructure.conflicts.filter(c => c.id !== action.payload),
            }
          : null,
      };
    case 'ADD_B_STORY':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? { ...state.plotStructure, bStories: [...state.plotStructure.bStories, action.payload] }
          : null,
      };
    case 'UPDATE_B_STORY':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? {
              ...state.plotStructure,
              bStories: state.plotStructure.bStories.map(b => b.id === action.payload.id ? action.payload : b),
            }
          : null,
      };
    case 'DELETE_B_STORY':
      return {
        ...state,
        plotStructure: state.plotStructure
          ? {
              ...state.plotStructure,
              bStories: state.plotStructure.bStories.filter(b => b.id !== action.payload),
            }
          : null,
      };
      
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_CREDITS':
      return { ...state, credits: action.payload };
    case 'SET_FREE_QUERIES':
      return { ...state, freeQueriesLeft: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export { AppContext };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load initial data from storage
    const loadData = async () => {
      try {
        const [workspaces, settings] = await Promise.all([
          storageService.getWorkspaces(),
          storageService.getSettings(),
        ]);
        
        if (settings) {
          dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
          if (settings.theme) {
            dispatch({ type: 'SET_THEME', payload: settings.theme });
          }
        }

        // Handle workspaces
        if (workspaces.length > 0) {
          // Load existing workspaces and their hierarchy
          dispatch({ type: 'SET_WORKSPACES', payload: workspaces });
          const currentWorkspace = workspaces[0];
          dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: currentWorkspace });
          
          // Load projects for the current workspace
          const allProjects = await storageService.getProjects();
          const workspaceProjects = allProjects.filter(p => p.workspaceId === currentWorkspace.id);
          dispatch({ type: 'SET_PROJECTS', payload: workspaceProjects });
          
          if (workspaceProjects.length > 0) {
            const currentProject = workspaceProjects[0];
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: currentProject });
            
            // Load books for the current project
            const books = await storageService.getBooks(currentProject.id);
            dispatch({ type: 'SET_BOOKS', payload: books });
            
            if (books.length > 0) {
              dispatch({ type: 'SET_CURRENT_BOOK', payload: books[0] });
            }
          }
        } else {
          // Create default hierarchy when no workspaces exist
          const defaultWorkspace: Workspace = {
            id: 'workspace-1',
            name: 'My Writing Workspace',
            description: 'Welcome to Ulysses - Your AI-powered writing companion',
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
              defaultWordTarget: 1000,
              autoBackup: true,
              writingGoals: {
                dailyWords: 500,
                weeklyWords: 3500,
              },
            },
          };

          const defaultProject: Project = {
            id: 'project-1',
            workspaceId: defaultWorkspace.id,
            name: 'My First Story',
            description: 'Your first writing project',
            type: 'standalone',
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
              shareCharacters: false,
              shareWorldBuilding: false,
              seriesOrder: [],
            },
          };

          const defaultBook: Book = {
            id: 'book-1',
            projectId: defaultProject.id,
            workspaceId: defaultWorkspace.id,
            title: 'Untitled Book',
            status: 'planning',
            targetWordCount: 80000,
            currentWordCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
              useSeriesCharacters: false,
              useSeriesWorld: false,
            },
          };
          
          // For now, we'll create the hierarchical structure but only save the project
          // Storage methods for workspace and book will be added later
          await storageService.saveProject(defaultProject);
          
          dispatch({ type: 'SET_WORKSPACES', payload: [defaultWorkspace] });
          dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: defaultWorkspace });
          dispatch({ type: 'ADD_PROJECT', payload: defaultProject });
          dispatch({ type: 'SET_CURRENT_PROJECT', payload: defaultProject });
          dispatch({ type: 'ADD_BOOK', payload: defaultBook });
          dispatch({ type: 'SET_CURRENT_BOOK', payload: defaultBook });

          // Create default groups
          const defaultGroups: Group[] = [
            {
              id: 'inbox',
              bookId: defaultBook.id,
              projectId: defaultProject.id,
              workspaceId: defaultWorkspace.id,
              name: 'Inbox',
              type: 'filter',
              order: 0,
              isExpanded: true,
            },
            {
              id: 'drafts',
              bookId: defaultBook.id,
              projectId: defaultProject.id,
              workspaceId: defaultWorkspace.id,
              name: 'Drafts',
              type: 'folder',
              order: 1,
              isExpanded: true,
            },
            {
              id: 'chapters',
              bookId: defaultBook.id,
              projectId: defaultProject.id,
              workspaceId: defaultWorkspace.id,
              name: 'Chapters',
              type: 'folder',
              order: 2,
              isExpanded: true,
            },
            {
              id: 'research',
              bookId: defaultBook.id,
              projectId: defaultProject.id,
              workspaceId: defaultWorkspace.id,
              name: 'Research',
              type: 'folder',
              order: 3,
              isExpanded: false,
            },
            {
              id: 'characters',
              bookId: defaultBook.id,
              projectId: defaultProject.id,
              workspaceId: defaultWorkspace.id,
              name: 'Character Notes',
              type: 'folder',
              order: 4,
              isExpanded: false,
            },
          ];
          
          for (const group of defaultGroups) {
            await storageService.saveGroup(group);
          }
          dispatch({ type: 'SET_GROUPS', payload: defaultGroups });

          // Create a welcome document
          const welcomeDoc: Document = {
            id: 'welcome',
            bookId: defaultBook.id,
            projectId: defaultProject.id,
            workspaceId: defaultWorkspace.id,
            title: 'Welcome to Ulysses',
            content: `# Welcome to Ulysses

Your AI-powered writing companion for fiction writers.

## Getting Started

1. **Write freely** - Use this distraction-free editor to focus on your story
2. **Organize with sheets** - Create and organize your writing in sheets and groups
3. **Develop characters** - Use the Characters section to build rich character profiles
4. **Build your world** - Create locations, events, and rules in the World Building section
5. **Visualize relationships** - See how your characters connect with AI-powered relationship graphs
6. **Take notes** - Capture research and ideas in the Notes section

## AI Features

- **Character relationship suggestions** - Get AI help building character dynamics
- **Story direction guidance** - Receive suggestions for plot development
- **Character backstory generation** - Create rich character histories
- **Relationship analysis** - Understand the dynamics between your characters
- **World building assistance** - Get help creating consistent fictional worlds

Start writing your story and let Ulysses help you bring your characters and world to life!`,
            createdAt: new Date(),
            updatedAt: new Date(),
            groupId: 'drafts',
            status: 'draft',
            target: 500,
          };

          await storageService.saveDocument(welcomeDoc);
          dispatch({ type: 'ADD_DOCUMENT', payload: welcomeDoc });
          dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: welcomeDoc });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  useEffect(() => {
    // Load project-specific data when current project changes
    if (state.currentProject) {
      const loadProjectData = async () => {
        try {
          const [documents, groups, characters, relationships, locations, worldEvents, worldRules, notes] = await Promise.all([
            storageService.getDocuments(state.currentProject!.id),
            storageService.getGroups(state.currentProject!.id),
            storageService.getCharacters(state.currentProject!.id),
            storageService.getRelationships(state.currentProject!.id),
            storageService.getLocations(state.currentProject!.id),
            storageService.getWorldEvents(state.currentProject!.id),
            storageService.getWorldRules(state.currentProject!.id),
            storageService.getNotes(state.currentProject!.id),
          ]);

          dispatch({ type: 'SET_DOCUMENTS', payload: documents });
          dispatch({ type: 'SET_GROUPS', payload: groups });
          dispatch({ type: 'SET_CHARACTERS', payload: characters });
          dispatch({ type: 'SET_RELATIONSHIPS', payload: relationships });
          dispatch({ type: 'SET_LOCATIONS', payload: locations });
          dispatch({ type: 'SET_WORLD_EVENTS', payload: worldEvents });
          dispatch({ type: 'SET_WORLD_RULES', payload: worldRules });
          dispatch({ type: 'SET_NOTES', payload: notes });

          if (documents.length > 0 && !state.currentDocument) {
            dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: documents[0] });
          }
        } catch (error) {
          console.error('Failed to load project data:', error);
        }
      };

      loadProjectData();
    }
  }, [state.currentProject, state.currentDocument]);

  useEffect(() => {
    // Load projects when workspace changes
    if (state.currentWorkspace) {
      const loadWorkspaceProjects = async () => {
        try {
          const allProjects = await storageService.getProjects();
          const workspaceProjects = allProjects.filter(p => p.workspaceId === state.currentWorkspace!.id);
          dispatch({ type: 'SET_PROJECTS', payload: workspaceProjects });
          
          // Set first project as current if exists
          if (workspaceProjects.length > 0) {
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: workspaceProjects[0] });
          } else {
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
          }
        } catch (error) {
          console.error('Failed to load workspace projects:', error);
        }
      };
      
      loadWorkspaceProjects();
    }
  }, [state.currentWorkspace]);

  useEffect(() => {
    // Load books when project changes
    if (state.currentProject) {
      const loadProjectBooks = async () => {
        try {
          const books = await storageService.getBooks(state.currentProject!.id);
          dispatch({ type: 'SET_BOOKS', payload: books });
          
          // Set first book as current if exists
          if (books.length > 0) {
            dispatch({ type: 'SET_CURRENT_BOOK', payload: books[0] });
          } else {
            dispatch({ type: 'SET_CURRENT_BOOK', payload: null });
          }
        } catch (error) {
          console.error('Failed to load project books:', error);
        }
      };
      
      loadProjectBooks();
    }
  }, [state.currentProject]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
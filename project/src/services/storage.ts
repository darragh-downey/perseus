import { Workspace, Project, Book, Document, Character, Relationship, Note, Group, Location, WorldEvent, WorldRule, PlotStructure, Beat, Theme, Conflict, BStory, AppSettings } from '../contexts/AppContext';

class StorageService {
  private dbName = 'UlyssesDB';
  private version = 5; // Incremented for hierarchical structure support
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for hierarchical structure
        if (!db.objectStoreNames.contains('workspaces')) {
          db.createObjectStore('workspaces', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('books')) {
          const bookStore = db.createObjectStore('books', { keyPath: 'id' });
          bookStore.createIndex('projectId', 'projectId', { unique: false });
          bookStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('projectId', 'projectId', { unique: false });
          docStore.createIndex('bookId', 'bookId', { unique: false });
          docStore.createIndex('workspaceId', 'workspaceId', { unique: false });
          docStore.createIndex('groupId', 'groupId', { unique: false });
        }
        if (!db.objectStoreNames.contains('groups')) {
          const groupStore = db.createObjectStore('groups', { keyPath: 'id' });
          groupStore.createIndex('projectId', 'projectId', { unique: false });
          groupStore.createIndex('bookId', 'bookId', { unique: false });
          groupStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('characters')) {
          const charStore = db.createObjectStore('characters', { keyPath: 'id' });
          charStore.createIndex('projectId', 'projectId', { unique: false });
          charStore.createIndex('bookId', 'bookId', { unique: false });
          charStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('relationships')) {
          const relStore = db.createObjectStore('relationships', { keyPath: 'id' });
          relStore.createIndex('projectId', 'projectId', { unique: false });
          relStore.createIndex('bookId', 'bookId', { unique: false });
          relStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('locations')) {
          const locStore = db.createObjectStore('locations', { keyPath: 'id' });
          locStore.createIndex('projectId', 'projectId', { unique: false });
          locStore.createIndex('bookId', 'bookId', { unique: false });
          locStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('worldEvents')) {
          const eventStore = db.createObjectStore('worldEvents', { keyPath: 'id' });
          eventStore.createIndex('projectId', 'projectId', { unique: false });
          eventStore.createIndex('bookId', 'bookId', { unique: false });
          eventStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('worldRules')) {
          const ruleStore = db.createObjectStore('worldRules', { keyPath: 'id' });
          ruleStore.createIndex('projectId', 'projectId', { unique: false });
          ruleStore.createIndex('bookId', 'bookId', { unique: false });
          ruleStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('notes')) {
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
          noteStore.createIndex('projectId', 'projectId', { unique: false });
          noteStore.createIndex('bookId', 'bookId', { unique: false });
          noteStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('plotStructures')) {
          const plotStore = db.createObjectStore('plotStructures', { keyPath: 'id' });
          plotStore.createIndex('projectId', 'projectId', { unique: false });
          plotStore.createIndex('bookId', 'bookId', { unique: false });
          plotStore.createIndex('workspaceId', 'workspaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('beats')) {
          const beatStore = db.createObjectStore('beats', { keyPath: 'id' });
          beatStore.createIndex('projectId', 'projectId', { unique: false });
        }
        if (!db.objectStoreNames.contains('themes')) {
          const themeStore = db.createObjectStore('themes', { keyPath: 'id' });
          themeStore.createIndex('projectId', 'projectId', { unique: false });
        }
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id' });
          conflictStore.createIndex('projectId', 'projectId', { unique: false });
        }
        if (!db.objectStoreNames.contains('bStories')) {
          const bStoryStore = db.createObjectStore('bStories', { keyPath: 'id' });
          bStoryStore.createIndex('projectId', 'projectId', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveProject(project: Project): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.put(project);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['projects', 'documents', 'groups', 'characters', 'relationships', 'locations', 'worldEvents', 'worldRules', 'notes', 'plotStructures', 'beats', 'themes', 'conflicts', 'bStories'], 'readwrite');
      
      // Delete project
      transaction.objectStore('projects').delete(projectId);
      
      // Delete related data
      const stores = ['documents', 'groups', 'characters', 'relationships', 'locations', 'worldEvents', 'worldRules', 'notes', 'plotStructures', 'beats', 'themes', 'conflicts', 'bStories'];
      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const index = store.index('projectId');
        const request = index.openCursor(IDBKeyRange.only(projectId));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Groups
  async getGroups(projectId: string): Promise<Group[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['groups'], 'readonly');
      const store = transaction.objectStore('groups');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveGroup(group: Group & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['groups'], 'readwrite');
      const store = transaction.objectStore('groups');
      const request = store.put(group);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteGroup(groupId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['groups'], 'readwrite');
      const store = transaction.objectStore('groups');
      const request = store.delete(groupId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Documents
  async getDocuments(projectId: string): Promise<Document[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveDocument(document: Document & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      const request = store.put(document);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDocument(documentId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      const request = store.delete(documentId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Characters
  async getCharacters(projectId: string): Promise<Character[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveCharacter(character: Character & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['characters'], 'readwrite');
      const store = transaction.objectStore('characters');
      const request = store.put(character);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCharacter(characterId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['characters'], 'readwrite');
      const store = transaction.objectStore('characters');
      const request = store.delete(characterId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Relationships
  async getRelationships(projectId: string): Promise<Relationship[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['relationships'], 'readonly');
      const store = transaction.objectStore('relationships');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveRelationship(relationship: Relationship & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['relationships'], 'readwrite');
      const store = transaction.objectStore('relationships');
      const request = store.put(relationship);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRelationship(relationshipId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['relationships'], 'readwrite');
      const store = transaction.objectStore('relationships');
      const request = store.delete(relationshipId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Locations
  async getLocations(projectId: string): Promise<Location[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['locations'], 'readonly');
      const store = transaction.objectStore('locations');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveLocation(location: Location & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['locations'], 'readwrite');
      const store = transaction.objectStore('locations');
      const request = store.put(location);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteLocation(locationId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['locations'], 'readwrite');
      const store = transaction.objectStore('locations');
      const request = store.delete(locationId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // World Events
  async getWorldEvents(projectId: string): Promise<WorldEvent[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['worldEvents'], 'readonly');
      const store = transaction.objectStore('worldEvents');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveWorldEvent(event: WorldEvent & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['worldEvents'], 'readwrite');
      const store = transaction.objectStore('worldEvents');
      const request = store.put(event);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteWorldEvent(eventId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['worldEvents'], 'readwrite');
      const store = transaction.objectStore('worldEvents');
      const request = store.delete(eventId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // World Rules
  async getWorldRules(projectId: string): Promise<WorldRule[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['worldRules'], 'readonly');
      const store = transaction.objectStore('worldRules');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveWorldRule(rule: WorldRule & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['worldRules'], 'readwrite');
      const store = transaction.objectStore('worldRules');
      const request = store.put(rule);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteWorldRule(ruleId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['worldRules'], 'readwrite');
      const store = transaction.objectStore('worldRules');
      const request = store.delete(ruleId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Notes
  async getNotes(projectId: string): Promise<Note[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveNote(note: Note & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      const request = store.put(note);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      const request = store.delete(noteId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Settings
  async getSettings(): Promise<AppSettings | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('app');

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Remove the 'key' property and return the settings
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { key, ...settings } = result;
          resolve(settings as AppSettings);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key: 'app', ...settings });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Plot Structure methods
  async getPlotStructure(projectId: string): Promise<PlotStructure | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['plotStructures'], 'readonly');
      const store = transaction.objectStore('plotStructures');
      const index = store.index('projectId');
      const request = index.get(projectId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async savePlotStructure(plotStructure: PlotStructure & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['plotStructures'], 'readwrite');
      const store = transaction.objectStore('plotStructures');
      const request = store.put(plotStructure);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deletePlotStructure(projectId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['plotStructures'], 'readwrite');
      const store = transaction.objectStore('plotStructures');
      const index = store.index('projectId');
      const request = index.getKey(projectId);

      request.onsuccess = () => {
        if (request.result) {
          const deleteRequest = store.delete(request.result);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Beat methods
  async getBeats(projectId: string): Promise<Beat[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['beats'], 'readonly');
      const store = transaction.objectStore('beats');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveBeat(beat: Beat & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['beats'], 'readwrite');
      const store = transaction.objectStore('beats');
      const request = store.put(beat);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBeat(beatId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['beats'], 'readwrite');
      const store = transaction.objectStore('beats');
      const request = store.delete(beatId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Theme methods
  async getThemes(projectId: string): Promise<Theme[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['themes'], 'readonly');
      const store = transaction.objectStore('themes');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveTheme(theme: Theme & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['themes'], 'readwrite');
      const store = transaction.objectStore('themes');
      const request = store.put(theme);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTheme(themeId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['themes'], 'readwrite');
      const store = transaction.objectStore('themes');
      const request = store.delete(themeId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Conflict methods
  async getConflicts(projectId: string): Promise<Conflict[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['conflicts'], 'readonly');
      const store = transaction.objectStore('conflicts');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveConflict(conflict: Conflict & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['conflicts'], 'readwrite');
      const store = transaction.objectStore('conflicts');
      const request = store.put(conflict);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteConflict(conflictId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['conflicts'], 'readwrite');
      const store = transaction.objectStore('conflicts');
      const request = store.delete(conflictId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // B Story methods
  async getBStories(projectId: string): Promise<BStory[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['bStories'], 'readonly');
      const store = transaction.objectStore('bStories');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveBStory(bStory: BStory & { projectId: string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['bStories'], 'readwrite');
      const store = transaction.objectStore('bStories');
      const request = store.put(bStory);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBStory(bStoryId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['bStories'], 'readwrite');
      const store = transaction.objectStore('bStories');
      const request = store.delete(bStoryId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['workspaces'], 'readonly');
      const store = transaction.objectStore('workspaces');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveWorkspace(workspace: Workspace): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['workspaces'], 'readwrite');
      const store = transaction.objectStore('workspaces');
      const request = store.put(workspace);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['workspaces', 'projects', 'books', 'documents', 'groups', 'characters', 'relationships', 'locations', 'worldEvents', 'worldRules', 'notes', 'plotStructures', 'beats', 'themes', 'conflicts', 'bStories'], 'readwrite');
      
      // Delete workspace and all its contents
      transaction.objectStore('workspaces').delete(workspaceId);
      
      // Get workspace projects and delete them
      const projectStore = transaction.objectStore('projects');
      const projectIndex = projectStore.index('workspaceId');
      const projectRequest = projectIndex.getAll(workspaceId);
      
      projectRequest.onsuccess = () => {
        const projects = projectRequest.result;
        projects.forEach(project => {
          // Delete all project-related data
          this.deleteProjectData(transaction, project.id);
        });
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Books  
  async getBooks(projectId: string): Promise<Book[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['books'], 'readonly');
      const store = transaction.objectStore('books');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveBook(book: Book): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['books'], 'readwrite');
      const store = transaction.objectStore('books');
      const request = store.put(book);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBook(bookId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['books', 'documents', 'groups', 'notes', 'plotStructures'], 'readwrite');
      
      // Delete book
      transaction.objectStore('books').delete(bookId);
      
      // Delete book-specific data
      const stores = ['documents', 'groups', 'notes', 'plotStructures'];
      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const index = store.index('bookId');
        const request = index.getAll(bookId);
        
        request.onsuccess = () => {
          request.result.forEach(item => {
            store.delete(item.id);
          });
        };
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Helper method to delete project data (used by deleteWorkspace)
  private deleteProjectData(transaction: IDBTransaction, projectId: string): void {
    const stores = ['projects', 'documents', 'groups', 'characters', 'relationships', 'locations', 'worldEvents', 'worldRules', 'notes', 'plotStructures', 'beats', 'themes', 'conflicts', 'bStories'];
    
    stores.forEach(storeName => {
      if (storeName === 'projects') {
        transaction.objectStore(storeName).delete(projectId);
      } else {
        const store = transaction.objectStore(storeName);
        const index = store.index('projectId');
        const request = index.getAll(projectId);
        
        request.onsuccess = () => {
          request.result.forEach(item => {
            store.delete(item.id);
          });
        };
      }
    });
  }

  // Export functionality
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
  }> {
    const [project, documents, groups, characters, relationships, locations, worldEvents, worldRules, notes] = await Promise.all([
      this.getProjects().then(projects => projects.find(p => p.id === projectId) || null),
      this.getDocuments(projectId),
      this.getGroups(projectId),
      this.getCharacters(projectId),
      this.getRelationships(projectId),
      this.getLocations(projectId),
      this.getWorldEvents(projectId),
      this.getWorldRules(projectId),
      this.getNotes(projectId),
    ]);

    return { project, documents, groups, characters, relationships, locations, worldEvents, worldRules, notes };
  }
}

export { StorageService };
export const baseStorageService = new StorageService();
export const storageService = baseStorageService; // Keep existing API for now
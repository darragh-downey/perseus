import { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import type { Document } from '../../contexts/AppContext';
import { 
  Users, 
  StickyNote, 
  Settings, 
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Folder,
  Archive,
  Inbox,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Target,
  Clock,
  Globe,
  Map,
} from 'lucide-react';

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    library: true,
    projects: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const libraryItems = [
    { 
      id: 'all', 
      icon: FileText, 
      label: 'All', 
      count: state.documents.length,
      description: 'All sheets in your library'
    },
    { 
      id: 'inbox', 
      icon: Inbox, 
      label: 'Inbox', 
      count: state.documents.filter(d => !d.groupId).length,
      description: 'Ungrouped sheets'
    },
    { 
      id: 'drafts', 
      icon: FileText, 
      label: 'Drafts', 
      count: state.documents.filter(d => d.status === 'draft').length,
      description: 'Draft sheets'
    },
    { 
      id: 'in-progress', 
      icon: Clock, 
      label: 'In Progress', 
      count: state.documents.filter(d => d.status === 'in-progress').length,
      description: 'Sheets being worked on'
    },
    { 
      id: 'complete', 
      icon: Target, 
      label: 'Complete', 
      count: state.documents.filter(d => d.status === 'complete').length,
      description: 'Finished sheets'
    },
  ];

  const handleCreateDocument = () => {
    if (!state.currentBook || !state.currentProject || !state.currentWorkspace) {
      console.error('Missing current book, project, or workspace');
      return;
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      bookId: state.currentBook.id,
      projectId: state.currentProject.id,
      workspaceId: state.currentWorkspace.id,
      title: 'Untitled Sheet',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft' as const,
    };

    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
    dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: newDoc });
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'write' });
  };

  const handleItemClick = (itemId: string) => {
    switch (itemId) {
      case 'all':
      case 'inbox':
      case 'drafts':
      case 'in-progress':
      case 'complete':
        dispatch({ type: 'SET_CURRENT_VIEW', payload: 'write' });
        break;
      case 'characters':
        dispatch({ type: 'SET_CURRENT_VIEW', payload: 'characters' });
        break;
      case 'world':
        dispatch({ type: 'SET_CURRENT_VIEW', payload: 'world' });
        break;
      case 'notes':
        dispatch({ type: 'SET_CURRENT_VIEW', payload: 'notes' });
        break;
      case 'plot':
        dispatch({ type: 'SET_CURRENT_VIEW', payload: 'plot' });
        break;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 p-2 space-y-1">
          {libraryItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                title={item.description}
              >
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Ulysses</span>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Library Section */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {/* Library Header */}
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <button
              onClick={() => toggleSection('library')}
              className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
            >
              {expandedSections.library ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
              <span>Library</span>
            </button>
          </div>

          {/* Library Items */}
          {expandedSections.library && (
            <div className="space-y-1 mb-4">
              {libraryItems.map((item) => {
                const Icon = item.icon;
                const isActive = 
                  (item.id === 'all' && state.currentView === 'write') ||
                  (item.id === 'characters' && state.currentView === 'characters') ||
                  (item.id === 'notes' && state.currentView === 'notes');
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title={item.description}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
              
              {/* Characters, World Building, and Notes */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <button
                  onClick={() => handleItemClick('characters')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    state.currentView === 'characters'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Characters</span>
                  </div>
                  <span className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {state.characters.length}
                  </span>
                </button>
                
                <button
                  onClick={() => handleItemClick('world')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    state.currentView === 'world'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>World Building</span>
                  </div>
                  <span className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {state.locations.length + state.worldEvents.length + state.worldRules.length}
                  </span>
                </button>
                
                <button
                  onClick={() => handleItemClick('notes')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    state.currentView === 'notes'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <StickyNote className="w-4 h-4" />
                    <span>Notes</span>
                  </div>
                  <span className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {state.notes.length}
                  </span>
                </button>
                
                <button
                  onClick={() => handleItemClick('plot')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    state.currentView === 'plot'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Map className="w-4 h-4" />
                    <span>Plot Structure</span>
                  </div>
                  <span className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {state.plotStructure ? '📋' : '—'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Projects Header */}
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <button
              onClick={() => toggleSection('projects')}
              className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
            >
              {expandedSections.projects ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
              <span>Projects</span>
            </button>
          </div>

          {/* Project Items */}
          {expandedSections.projects && (
            <div className="space-y-1">
              {state.currentProject && (
                <div className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                  <div className="flex items-center space-x-2">
                    <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {state.currentProject.name}
                    </span>
                  </div>
                  {state.currentProject.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {state.currentProject.description}
                    </div>
                  )}
                  
                  {/* Project Stats */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                      <div className="text-blue-600 dark:text-blue-400 font-medium">Sheets</div>
                      <div className="text-blue-700 dark:text-blue-300 font-bold">{state.documents.length}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                      <div className="text-purple-600 dark:text-purple-400 font-medium">Words</div>
                      <div className="text-purple-700 dark:text-purple-300 font-bold">
                        {state.documents.reduce((total, doc) => {
                          const words = doc.content.trim() ? doc.content.trim().split(/\s+/).length : 0;
                          return total + words;
                        }, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'settings' })}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={handleCreateDocument}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Sheet</span>
        </button>
        
        <button
          onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'settings' })}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Credits Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between items-center mb-1">
            <span>AI Credits</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{state.credits}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Free queries</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{state.freeQueriesLeft}/5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
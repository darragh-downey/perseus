import { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { Workspace, Project, Book } from '../../contexts/AppContext';
import { storageService } from '../../services';
import { 
  ChevronDown, 
  Plus, 
  Building2, 
  Folder, 
  BookOpen,
  X
} from 'lucide-react';

interface HierarchySelectorProps {
  className?: string;
}

export default function HierarchySelector({ className = '' }: HierarchySelectorProps) {
  const { state, dispatch } = useApp();
  const [showDropdown, setShowDropdown] = useState<'workspace' | 'project' | 'book' | null>(null);
  const [showForm, setShowForm] = useState<'workspace' | 'project' | 'book' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'standalone' as 'series' | 'standalone' | 'collection'
  });

  const handleCreateWorkspace = async () => {
    if (!formData.name.trim()) return;

    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
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

    try {
      await storageService.saveWorkspace(newWorkspace);
      dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
      dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: newWorkspace });
      
      // Reset form
      setFormData({ name: '', description: '', type: 'standalone' });
      setShowForm(null);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!formData.name.trim() || !state.currentWorkspace) return;

    const newProject: Project = {
      id: `project-${Date.now()}`,
      workspaceId: state.currentWorkspace.id,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      type: formData.type,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        shareCharacters: false,
        shareWorldBuilding: false,
        seriesOrder: [],
      },
    };

    try {
      await storageService.saveProject(newProject);
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: newProject });
      
      // Reset form
      setFormData({ name: '', description: '', type: 'standalone' });
      setShowForm(null);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleCreateBook = async () => {
    if (!formData.name.trim() || !state.currentProject || !state.currentWorkspace) return;

    const newBook: Book = {
      id: `book-${Date.now()}`,
      projectId: state.currentProject.id,
      workspaceId: state.currentWorkspace.id,
      title: formData.name.trim(),
      description: formData.description.trim() || undefined,
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

    try {
      await storageService.saveBook(newBook);
      dispatch({ type: 'ADD_BOOK', payload: newBook });
      dispatch({ type: 'SET_CURRENT_BOOK', payload: newBook });
      
      // Reset form
      setFormData({ name: '', description: '', type: 'standalone' });
      setShowForm(null);
    } catch (error) {
      console.error('Failed to create book:', error);
    }
  };

  const handleSwitchWorkspace = async (workspace: Workspace) => {
    dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: workspace });
    
    // Load projects for this workspace
    try {
      const allProjects = await storageService.getProjects();
      const projects = allProjects.filter(p => p.workspaceId === workspace.id);
      dispatch({ type: 'SET_PROJECTS', payload: projects });
      
      // Set first project as current if available
      if (projects.length > 0) {
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: projects[0] });
        
        // Load books for the first project
        const books = await storageService.getBooks(projects[0].id);
        dispatch({ type: 'SET_BOOKS', payload: books });
        
        if (books.length > 0) {
          dispatch({ type: 'SET_CURRENT_BOOK', payload: books[0] });
        }
      } else {
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
        dispatch({ type: 'SET_CURRENT_BOOK', payload: null });
      }
    } catch (error) {
      console.error('Failed to load workspace data:', error);
    }
    
    setShowDropdown(null);
  };

  const handleSwitchProject = async (project: Project) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
    
    // Load books for this project
    try {
      const books = await storageService.getBooks(project.id);
      dispatch({ type: 'SET_BOOKS', payload: books });
      
      if (books.length > 0) {
        dispatch({ type: 'SET_CURRENT_BOOK', payload: books[0] });
      } else {
        dispatch({ type: 'SET_CURRENT_BOOK', payload: null });
      }
    } catch (error) {
      console.error('Failed to load project books:', error);
    }
    
    setShowDropdown(null);
  };

  const handleSwitchBook = (book: Book) => {
    dispatch({ type: 'SET_CURRENT_BOOK', payload: book });
    setShowDropdown(null);
  };

  const renderCreateForm = () => {
    if (!showForm) return null;

    const titles = {
      workspace: 'Create New Workspace',
      project: 'Create New Project',
      book: 'Create New Book'
    };

    const placeholders = {
      workspace: 'My Writing Workspace',
      project: 'My New Project',
      book: 'Untitled Book'
    };

    const handleSubmit = {
      workspace: handleCreateWorkspace,
      project: handleCreateProject,
      book: handleCreateBook
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {titles[showForm]}
            </h3>
            <button
              onClick={() => setShowForm(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={placeholders[showForm]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={`Describe your ${showForm}...`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {showForm === 'project' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'series' | 'standalone' | 'collection' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="standalone">Standalone Novel</option>
                  <option value="series">Book Series</option>
                  <option value="collection">Short Story Collection</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowForm(null)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit[showForm]}
              disabled={!formData.name.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Create {showForm.charAt(0).toUpperCase() + showForm.slice(1)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="px-4 py-3 space-y-2">
          {/* Workspace Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(showDropdown === 'workspace' ? null : 'workspace')}
              className="w-full flex items-center justify-between px-3 py-2 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {state.currentWorkspace?.name || 'No Workspace'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDropdown === 'workspace' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {state.workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleSwitchWorkspace(workspace)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        state.currentWorkspace?.id === workspace.id
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {workspace.name}
                    </button>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                    <button
                      onClick={() => setShowForm('workspace')}
                      className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Workspace</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(showDropdown === 'project' ? null : 'project')}
              className="w-full flex items-center justify-between px-3 py-2 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {state.currentProject?.name || 'No Project'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDropdown === 'project' && state.currentWorkspace && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {state.projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleSwitchProject(project)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        state.currentProject?.id === project.id
                          ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{project.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {project.type}
                        </span>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                    <button
                      onClick={() => setShowForm('project')}
                      className="w-full text-left px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Project</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Book Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(showDropdown === 'book' ? null : 'book')}
              className="w-full flex items-center justify-between px-3 py-2 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {state.currentBook?.title || 'No Book'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDropdown === 'book' && state.currentProject && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {state.books.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleSwitchBook(book)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        state.currentBook?.id === book.id
                          ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{book.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {book.status}
                        </span>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                    <button
                      onClick={() => setShowForm('book')}
                      className="w-full text-left px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Book</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {renderCreateForm()}
    </>
  );
}

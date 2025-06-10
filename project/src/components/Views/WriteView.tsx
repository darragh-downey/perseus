import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../../contexts/hooks';
import type { Document } from '../../contexts/AppContext';
import MarkdownEditor from '../Editor/MarkdownEditor';
import DocumentList from '../Editor/DocumentList';
import WorkflowPanel from '../Editor/WorkflowPanel';
import { storageService } from '../../services/storage';
import { debounce } from '../../utils/debounce';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';

export default function WriteView() {
  const { state, dispatch } = useApp();
  const [showDocumentList, setShowDocumentList] = useState(true);
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);

  // Auto-save functionality
  const debouncedSave = useCallback(
    (document: Document) => {
      const saveDocument = debounce(async (doc: Document) => {
        if (state.settings.autoSave) {
          try {
            await storageService.saveDocument({
              ...doc,
              updatedAt: new Date(),
            });
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }
      }, 1000);
      
      saveDocument(document);
    },
    [state.settings.autoSave]
  );

  useEffect(() => {
    if (state.currentDocument) {
      debouncedSave(state.currentDocument);
    }
  }, [state.currentDocument?.content, debouncedSave, state.currentDocument]);

  const handleContentChange = (content: string) => {
    if (!state.currentDocument) return;

    const updatedDocument = {
      ...state.currentDocument,
      content,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_DOCUMENT', payload: updatedDocument });
  };

  const handleTitleChange = (title: string) => {
    if (!state.currentDocument) return;

    const updatedDocument = {
      ...state.currentDocument,
      title,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_DOCUMENT', payload: updatedDocument });
  };

  const handleDocumentUpdate = (updates: Partial<typeof state.currentDocument>) => {
    if (!state.currentDocument) return;

    const updatedDocument = {
      ...state.currentDocument,
      ...updates,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_DOCUMENT', payload: updatedDocument });
  };

  if (!state.currentProject) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto\" fill="none\" stroke="currentColor\" viewBox="0 0 24 24">
              <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Welcome to Ulysses
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Create or select a project to begin your writing journey with AI-powered tools for fiction writers.
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'settings' })}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      {/* Document List - Ulysses-style middle pane */}
      <div className={`${
        showDocumentList ? 'w-80' : 'w-0'
      } transition-all duration-300 overflow-hidden bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        <DocumentList
          isOpen={showDocumentList}
          onToggle={() => setShowDocumentList(!showDocumentList)}
        />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Toggle Buttons */}
        {!showDocumentList && (
          <button
            onClick={() => setShowDocumentList(true)}
            className="absolute top-4 left-4 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Show Sheets"
          >
            <PanelLeftOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}

        {!showWorkflowPanel && state.currentDocument && (
          <button
            onClick={() => setShowWorkflowPanel(true)}
            className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Show Workflow Panel"
          >
            <PanelRightOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}

        {state.currentDocument ? (
          <div className="flex-1 flex">
            <div className="flex-1">
              <MarkdownEditor
                content={state.currentDocument.content}
                title={state.currentDocument.title}
                onContentChange={handleContentChange}
                onTitleChange={handleTitleChange}
                document={state.currentDocument}
                onDocumentUpdate={handleDocumentUpdate}
              />
            </div>
            
            {/* Workflow Panel */}
            {showWorkflowPanel && (
              <div className="w-80 border-l border-gray-200 dark:border-gray-700">
                <WorkflowPanel
                  document={state.currentDocument}
                  onDocumentUpdate={handleDocumentUpdate}
                  onClose={() => setShowWorkflowPanel(false)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Sheet to Start Writing
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Choose a document from the sheet list, or create a new one to begin your writing session.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowDocumentList(true)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Sheets
                </button>
                <button
                  onClick={() => {
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
                  }}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Create New Sheet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
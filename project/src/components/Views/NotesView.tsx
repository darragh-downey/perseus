import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import NotesList from '../Notes/NotesList';
import NoteEditor from '../Notes/NoteEditor';
import { Plus, Search, Tag } from 'lucide-react';

export default function NotesView() {
  const { state, dispatch } = useApp();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);

  const selectedNote = selectedNoteId ? state.notes.find(n => n.id === selectedNoteId) : null;

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_NOTE', payload: newNote });
    setSelectedNoteId(newNote.id);
    setShowEditor(true);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedNoteId(null);
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(state.notes.flatMap(note => note.tags))
  ).sort();

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Notes List Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
            <button
              onClick={handleCreateNote}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Create New Note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-auto">
          <NotesList
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {showEditor && selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onClose={handleCloseEditor}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {state.notes.length === 0 ? 'No Notes Yet' : 'Select a Note'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {state.notes.length === 0 
                  ? 'Create your first note to capture ideas, research, and story details.'
                  : 'Choose a note from the sidebar to start editing.'
                }
              </p>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
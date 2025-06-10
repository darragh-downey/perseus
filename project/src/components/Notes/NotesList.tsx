import React from 'react';
import { useApp } from '../../contexts/hooks';
import { Calendar, Tag, Trash2 } from 'lucide-react';
import { storageService } from '../../services/storage';

interface NotesListProps {
  searchQuery: string;
  selectedTag: string;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
}

export default function NotesList({
  searchQuery,
  selectedTag,
  selectedNoteId,
  onSelectNote,
}: NotesListProps) {
  const { state, dispatch } = useApp();

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await storageService.deleteNote(noteId);
      dispatch({ type: 'DELETE_NOTE', payload: noteId });
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = state.notes
    .filter(note => {
      // Search filter
      const matchesSearch = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tag filter
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (filteredNotes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        {searchQuery || selectedTag ? 'No notes match your filters' : 'No notes yet'}
      </div>
    );
  }

  return (
    <div className="p-2">
      {filteredNotes.map((note) => (
        <div
          key={note.id}
          onClick={() => onSelectNote(note.id)}
          className={`group p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
            selectedNoteId === note.id
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                {note.title}
              </h3>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                {note.content ? note.content.substring(0, 100) + '...' : 'No content'}
              </p>
              
              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                    >
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </div>

            <button
              onClick={(e) => handleDeleteNote(note.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
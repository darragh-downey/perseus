import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/hooks';
import { Note } from '../../contexts/AppContext';
import { X, Tag, Plus, Hash } from 'lucide-react';
import { storageService } from '../../services/storage';
import { debounce } from '../../utils/debounce';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteEditorProps {
  note: Note;
  onClose: () => void;
}

export default function NoteEditor({ note, onClose }: NoteEditorProps) {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Auto-save functionality
  const debouncedSave = useCallback(
    debounce(async (updatedNote: Note) => {
      if (!state.currentProject) return;
      
      try {
        await storageService.saveNote({
          ...updatedNote,
          projectId: state.currentProject.id,
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1000),
    [state.currentProject]
  );

  useEffect(() => {
    const updatedNote = {
      ...note,
      title,
      content,
      tags,
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    debouncedSave(updatedNote);
  }, [title, content, tags, debouncedSave]);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Extract hashtags from content
  const extractHashtags = () => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    if (matches) {
      const extractedTags = matches.map(match => match.substring(1).toLowerCase());
      const newTags = extractedTags.filter(tag => !tags.includes(tag));
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full"
            placeholder="Note Title"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              showPreview
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          
          <button
            onClick={extractHashtags}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Extract hashtags from content"
          >
            <Hash className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center space-x-2 mb-2">
          <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
        </div>
        
        {/* Existing Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm rounded-full"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-purple-500 hover:text-purple-700 dark:hover:text-purple-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        
        {/* Add New Tag */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add tag..."
            className="flex-1 px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="p-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex min-h-0">
        {showPreview ? (
          /* Preview Mode */
          <div className="flex-1 overflow-auto p-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2 first:mt-0">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-50 dark:bg-purple-900/10 italic text-gray-700 dark:text-gray-300">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                        {children}
                      </code>
                    ) : (
                      <code className={`${className} block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto`}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content || '*Start writing to see your preview...*'}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note... Use # for hashtags and markdown for formatting."
            className="flex-1 w-full p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none outline-none resize-none font-mono text-sm leading-relaxed"
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              lineHeight: '1.6',
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </div>
          <div>
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </div>
          <div>
            {content.trim() ? content.trim().split(/\s+/).length : 0} words
          </div>
        </div>
      </div>
    </div>
  );
}
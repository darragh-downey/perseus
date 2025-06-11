import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Eye, EyeOff, Type, Maximize2, Minimize2, MoreHorizontal, Focus, Settings } from 'lucide-react';
import { Document } from '../../contexts/AppContext';

interface MarkdownEditorProps {
  content: string;
  title: string;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  document: Document;
  onDocumentUpdate: (updates: Partial<Document>) => void;
}

export default function MarkdownEditor({
  content,
  title,
  onContentChange,
  onTitleChange,
  document,
  onDocumentUpdate,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onContentChange(newContent);
      
      // Reset cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }

    // Escape key to exit focus mode
    if (e.key === 'Escape' && isFocusMode) {
      setIsFocusMode(false);
    }
  };

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const getProgressPercentage = () => {
    if (!document.target) return 0;
    return Math.min((wordCount / document.target) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 75) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const editorClasses = `
    flex-1 w-full p-6 border-none outline-none resize-none leading-relaxed transition-all duration-300
    ${isFocusMode 
      ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white' 
      : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
    }
    placeholder-gray-500 dark:placeholder-gray-400
    ${isFocusMode ? 'px-12 py-12' : ''}
  `;

  const editorStyle = {
    fontFamily: isFocusMode 
      ? 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
      : 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    fontSize: isFocusMode ? '18px' : '16px',
    lineHeight: isFocusMode ? '1.8' : '1.7',
  };

  return (
    <div className={`flex flex-col h-full animate-fade-in ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* Toolbar */}
      {!isFocusMode && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1 transition-all"
              placeholder="Untitled Sheet"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Progress Indicator */}
            {document.target && (
              <div className="hidden sm:flex items-center space-x-3 mr-4">
                <div className={`text-sm font-medium ${getProgressColor()}`}>
                  {Math.round(getProgressPercentage())}%
                </div>
                <div className="progress-bar w-16">
                  <div 
                    className={`progress-fill transition-all duration-300 ${
                      getProgressPercentage() >= 100 ? 'bg-green-500' :
                      getProgressPercentage() >= 75 ? 'bg-blue-500' :
                      getProgressPercentage() >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mr-4">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              {wordCount > 0 && (
                <span>{getReadingTime()} min read</span>
              )}
            </div>
            
            <button
              onClick={() => setIsFocusMode(true)}
              className="btn btn-ghost btn-sm"
              title="Focus Mode (Escape to exit)"
            >
              <Focus className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`btn btn-sm transition-colors ${
                showPreview
                  ? 'btn-primary'
                  : 'btn-ghost'
              }`}
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn btn-ghost btn-sm"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn btn-ghost btn-sm"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-full mt-2 w-48 card border border-gray-200 dark:border-gray-700 shadow-lg z-10 animate-slide-up">
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      Export as Markdown
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      Export as PDF
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      Word Count Statistics
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Focus Mode Header */}
      {isFocusMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/20 dark:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            {wordCount} words • Press Escape to exit focus mode
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 flex min-h-0">
        {/* Text Editor */}
        <div className={`${showPreview && !isFocusMode ? 'w-1/2' : 'w-full'} flex flex-col ${showPreview && !isFocusMode ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your story..."
            className={editorClasses}
            style={editorStyle}
          />
        </div>

        {/* Preview Pane */}
        {showPreview && !isFocusMode && (
          <div className="w-1/2 bg-gray-50 dark:bg-gray-800 overflow-auto">
            <div className="p-6 max-w-none">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                {title || 'Untitled Sheet'}
              </h1>
              <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3 first:mt-0">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                        {children}
                      </p>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-6 bg-blue-50 dark:bg-blue-900/10 italic text-gray-700 dark:text-gray-300">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                          {children}
                        </code>
                      ) : (
                        <code className={`${className} block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto`}>
                          {children}
                        </code>
                      );
                    },
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-6 text-gray-700 dark:text-gray-300 space-y-2 text-lg">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-6 text-gray-700 dark:text-gray-300 space-y-2 text-lg">
                        {children}
                      </ol>
                    ),
                  }}
                >
                  {content || '*Start writing to see your preview...*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {!isFocusMode && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="font-medium">{wordCount} words</span>
              <span>{charCount} characters</span>
              {wordCount > 0 && <span>{getReadingTime()} min read</span>}
              {document.target && (
                <span className={`font-medium ${getProgressColor()}`}>
                  Target: {document.target} words ({Math.round(getProgressPercentage())}%)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className={`badge ${
                document.status === 'complete' ? 'badge-success' :
                document.status === 'in-progress' ? 'badge-primary' :
                'badge-secondary'
              }`}>
                {document.status === 'complete' ? '✓ Complete' :
                 document.status === 'in-progress' ? '◐ In Progress' :
                 '○ Draft'}
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">Auto-saved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
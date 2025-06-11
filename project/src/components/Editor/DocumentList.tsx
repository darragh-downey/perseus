import React, { useState } from 'react';
import { useApp } from '../../contexts/hooks';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Filter,
  Target,
  Clock,
  Edit3,
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { Group, Document } from '../../contexts/AppContext';

interface DocumentListProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function DocumentList({ isOpen, onToggle }: DocumentListProps) {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'updated' | 'created' | 'group'>('group');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreateDocument = async (groupId?: string) => {
    if (!state.currentProject) return;

    const newDoc = {
      id: Date.now().toString(),
      title: 'Untitled Sheet',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      groupId,
      status: 'draft' as const,
    };

    try {
      await storageService.saveDocument({
        ...newDoc,
        projectId: state.currentProject.id,
      });
      
      dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
      dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: newDoc });
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !state.currentProject) return;

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      type: 'folder',
      order: state.groups.length,
      isExpanded: true,
    };

    try {
      await storageService.saveGroup({
        ...newGroup,
        projectId: state.currentProject.id,
      });
      
      dispatch({ type: 'ADD_GROUP', payload: newGroup });
      setNewGroupName('');
      setShowGroupForm(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleSelectDocument = (doc: Document) => {
    dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: doc });
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this sheet?')) return;

    try {
      await storageService.deleteDocument(docId);
      dispatch({ type: 'DELETE_DOCUMENT', payload: docId });
      
      if (state.currentDocument?.id === docId) {
        const remainingDocs = state.documents.filter(d => d.id !== docId);
        dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: remainingDocs[0] || null });
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleToggleGroup = (groupId: string) => {
    dispatch({ type: 'TOGGLE_GROUP_EXPANSION', payload: groupId });
  };

  const getFilteredDocuments = () => {
    return state.documents.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getGroupedDocuments = () => {
    const filtered = getFilteredDocuments();
    const grouped: { [key: string]: Document[] } = {};
    
    // Group documents
    filtered.forEach(doc => {
      const groupId = doc.groupId || 'ungrouped';
      if (!grouped[groupId]) {
        grouped[groupId] = [];
      }
      grouped[groupId].push(doc);
    });

    // Sort documents within each group
    Object.keys(grouped).forEach(groupId => {
      grouped[groupId].sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'created':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'updated':
          default:
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      });
    });

    return grouped;
  };

  const getWordCount = (content: string) => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const getPreviewText = (content: string) => {
    const plainText = content.replace(/[#*`_~]/g, '').trim();
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText || 'No content';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 dark:text-green-400';
      case 'in-progress': return 'text-blue-600 dark:text-blue-400';
      case 'draft':
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'complete': return '✓';
      case 'in-progress': return '◐';
      case 'draft':
      default: return '○';
    }
  };

  if (!isOpen) return null;

  const groupedDocuments = getGroupedDocuments();
  const sortedGroups = [...state.groups].sort((a, b) => a.order - b.order);

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sheets</h2>
            <span className="badge badge-secondary">{state.documents.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCreateDocument()}
              className="btn btn-primary btn-sm"
              title="Create New Sheet"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGroupForm(!showGroupForm)}
              className="btn btn-secondary btn-sm"
              title="Create New Group"
            >
              <Folder className="w-4 h-4" />
            </button>
            <button
              onClick={onToggle}
              className="btn btn-ghost btn-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Group Form */}
        {showGroupForm && (
          <div className="card mb-4 animate-slide-up">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name..."
                className="input input-primary flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                autoFocus
              />
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="btn btn-primary btn-sm"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowGroupForm(false);
                  setNewGroupName('');
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sheets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-primary w-full pl-10"
          />
        </div>

        {/* Sort Options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="input input-primary w-full"
        >
          <option value="group">Group by Folder</option>
          <option value="updated">Sort by Last Modified</option>
          <option value="created">Sort by Created</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-auto">
        {Object.keys(groupedDocuments).length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No sheets match your search' : 'No sheets yet'}
          </div>
        ) : (
          <div className="p-2">
            {/* Ungrouped documents */}
            {groupedDocuments.ungrouped && (
              <div className="mb-4">
                <div className="flex items-center px-2 py-1 mb-2">
                  <Filter className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Inbox</span>
                  <span className="ml-auto text-xs text-gray-400">{groupedDocuments.ungrouped.length}</span>
                </div>
                {groupedDocuments.ungrouped.map(doc => (
                  <DocumentItem
                    key={doc.id}
                    doc={doc}
                    isSelected={state.currentDocument?.id === doc.id}
                    onSelect={handleSelectDocument}
                    onDelete={handleDeleteDocument}
                    getWordCount={getWordCount}
                    getPreviewText={getPreviewText}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))}
              </div>
            )}

            {/* Grouped documents */}
            {sortedGroups.map(group => {
              const docs = groupedDocuments[group.id] || [];
              if (docs.length === 0 && !group.isExpanded) return null;

              return (
                <div key={group.id} className="mb-4">
                  <div className="flex items-center px-2 py-1 mb-2">
                    <button
                      onClick={() => handleToggleGroup(group.id)}
                      className="flex items-center space-x-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      {group.isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                      {group.type === 'folder' ? (
                        group.isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
                      ) : (
                        <Filter className="w-4 h-4" />
                      )}
                      <span>{group.name}</span>
                    </button>
                    <span className="ml-auto text-xs text-gray-400">{docs.length}</span>
                    <button
                      onClick={() => handleCreateDocument(group.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Add sheet to group"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {group.isExpanded && docs.map(doc => (
                    <DocumentItem
                      key={doc.id}
                      doc={doc}
                      isSelected={state.currentDocument?.id === doc.id}
                      onSelect={handleSelectDocument}
                      onDelete={handleDeleteDocument}
                      getWordCount={getWordCount}
                      getPreviewText={getPreviewText}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface DocumentItemProps {
  doc: Document;
  isSelected: boolean;
  onSelect: (doc: Document) => void;
  onDelete: (docId: string, e: React.MouseEvent) => void;
  getWordCount: (content: string) => number;
  getPreviewText: (content: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusIcon: (status?: string) => string;
}

function DocumentItem({
  doc,
  isSelected,
  onSelect,
  onDelete,
  getWordCount,
  getPreviewText,
  getStatusColor,
  getStatusIcon,
}: DocumentItemProps) {
  const wordCount = getWordCount(doc.content);
  
  return (
    <div
      onClick={() => onSelect(doc)}
      className={`card-interactive group p-4 rounded-lg cursor-pointer mb-2 transition-all duration-200 ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md ring-2 ring-blue-500/20'
          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`badge ${
              doc.status === 'complete' ? 'badge-success' :
              doc.status === 'in-progress' ? 'badge-primary' :
              'badge-secondary'
            }`}>
              {getStatusIcon(doc.status)}
            </span>
            <FileText className={`w-4 h-4 flex-shrink-0 ${
              isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
            }`} />
            <h3 className={`text-sm font-medium truncate ${
              isSelected 
                ? 'text-blue-900 dark:text-blue-100' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {doc.title}
            </h3>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3 leading-relaxed">
            {getPreviewText(doc.content)}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
              <span>{wordCount} words</span>
              {doc.target && (
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3" />
                  <span>{Math.round((wordCount / doc.target) * 100)}%</span>
                </div>
              )}
            </div>
            
            <button
              onClick={(e) => onDelete(doc.id, e)}
              className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-sm p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Delete Sheet"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress indicator for longer documents */}
      {doc.target && wordCount > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all ${
                isSelected ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              style={{ width: `${Math.min((wordCount / doc.target) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {wordCount} / {doc.target} words
          </div>
        </div>
      )}
    </div>
  );
}
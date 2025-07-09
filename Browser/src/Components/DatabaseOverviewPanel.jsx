import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Database, Clock, User, MapPin, FileText, Calendar, HardDrive, Table, Edit3, Save, X } from 'lucide-react';

const DatabaseOverviewPanel = ({ selectedPath, darkmode }) => {
  const [dbInfo, setDbInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Only fetch data if a database is selected
    if (!selectedPath?.database) {
      setDbInfo(null);
      return;
    }

    const fetchDatabaseInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/database/overview/${selectedPath.database}`
        );
        setDbInfo(response.data);
      } catch (err) {
        console.error('Error fetching database information:', err);
        setError('Failed to load database information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatabaseInfo();
  }, [selectedPath?.database]);

  const handleEditDescription = () => {
    setEditedDescription(dbInfo?.description || '');
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    if (!editedDescription.trim()) {
      setError('Description cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(
        `http://localhost:3000/api/database/${selectedPath.database}/description`,
        { description: editedDescription.trim() }
      );
      
      // Update the local state with the new description
      setDbInfo(prev => ({
        ...prev,
        description: editedDescription.trim()
      }));
      
      setIsEditingDescription(false);
      setError(null);
    } catch (err) {
      console.error('Error updating description:', err);
      setError('Failed to update description');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingDescription(false);
    setEditedDescription('');
    setError(null);
  };

  // Don't render anything if no database is selected
  if (!selectedPath?.database) {
    return null;
  }

  return (
    <div 
      className={`mb-4 rounded-xl border shadow-md overflow-hidden transition-all ${
        darkmode 
          ? 'bg-gradient-to-r from-blue-950 to-blue-900 border-blue-800' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}
    >
      {/* Header with collapse toggle */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Database className={darkmode ? "text-blue-300" : "text-blue-600"} size={18} />
          <h3 className={`font-medium ${darkmode ? "text-blue-100" : "text-blue-800"}`}>
            Database Overview
          </h3>
        </div>
        <button 
          aria-label={isCollapsed ? "Expand" : "Collapse"}
          className={`p-1 rounded ${
            darkmode 
              ? 'hover:bg-blue-800 text-blue-300' 
              : 'hover:bg-blue-100 text-blue-600'
          }`}
        >
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-3">
          {isLoading ? (
            <div className={`text-center py-4 ${darkmode ? "text-blue-200" : "text-blue-600"}`}>
              Loading...
            </div>
          ) : error ? (
            <div className={`text-center py-4 ${darkmode ? "text-red-300" : "text-red-500"}`}>
              {error}
            </div>
          ) : dbInfo ? (
            <div className={`space-y-2 ${darkmode ? "text-blue-200" : "text-gray-700"}`}>
              {/* Full-width layout for critical fields (name and location) */}
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Database size={14} className={darkmode ? "text-blue-300" : "text-blue-600"} />
                  <span className={`text-xs uppercase font-medium ${darkmode ? "text-blue-300" : "text-blue-700"}`}>
                    Name
                  </span>
                </div>
                <div className="text-sm font-medium break-words" title={dbInfo.name}>
                  {dbInfo.name}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={14} className={darkmode ? "text-blue-300" : "text-blue-600"} />
                  <span className={`text-xs uppercase font-medium ${darkmode ? "text-blue-300" : "text-blue-700"}`}>
                    Location
                  </span>
                </div>
                <div className="text-sm break-words" title={dbInfo.location}>
                  {dbInfo.location}
                </div>
              </div>
              
              {/* Modified grid layout with increased gap for the remaining fields */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="overflow-hidden max-w-[95%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <User size={14} className={darkmode ? "text-blue-300" : "text-blue-600"} />
                    <span className={`text-xs uppercase font-medium ${darkmode ? "text-blue-300" : "text-blue-700"}`}>
                      Owner
                    </span>
                  </div>
                  <div className="text-sm truncate" title={dbInfo.owner}>{dbInfo.owner}</div>
                </div>
                
                <div className="overflow-hidden max-w-[95%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar size={14} className={darkmode ? "text-blue-300" : "text-blue-600"} />
                    <span className={`text-xs uppercase font-medium ${darkmode ? "text-blue-300" : "text-blue-700"}`}>
                      Created Date
                    </span>
                  </div>
                  <div className="text-sm truncate" title={dbInfo.created_date || 'N/A'}>{dbInfo.created_date || 'N/A'}</div>
                </div>
                
                <div className="overflow-hidden max-w-[95%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={14} className={darkmode ? "text-blue-300" : "text-blue-600"} />
                    <span className={`text-xs uppercase font-medium ${darkmode ? "text-blue-300" : "text-blue-700"}`}>
                      Last Modified
                    </span>
                  </div>
                  <div 
                    className="text-sm truncate" 
                    title={`Last actual modification date: ${dbInfo.last_modified_date || 'N/A'}`}
                  >
                    {dbInfo.last_modified_date || 'N/A'}
                  </div>
                </div>
                
                <div className="overflow-hidden max-w-[95%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Table size={14} className={darkmode ? "text-blue-300" : "text-blue-600"} />
                    <span className={`text-xs uppercase font-medium ${darkmode ? "text-blue-300" : "text-blue-700"}`}>
                      Tables
                    </span>
                  </div>
                  <div className="text-sm truncate">{dbInfo.table_count}</div>
                </div>
                
                <div className="overflow-hidden max-w-[95%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <HardDrive size={14} className={darkmode ? "text-blue-300" : "text-blue-600"} />
                    <span className={`text-xs uppercase font-medium ${darkmode ? "text-blue-300" : "text-blue-700"}`}>
                      Total Size
                    </span>
                  </div>
                  <div className="text-sm truncate">{dbInfo.total_size}</div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} className={darkmode ? "text-blue-300" : "text-blue-600"} />
                    <span className={`text-xs uppercase font-medium ${darkmode ? "text-blue-300" : "text-blue-700"}`}>
                      Description
                    </span>
                  </div>
                  {!isEditingDescription && (
                    <button
                      onClick={handleEditDescription}
                      className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                        darkmode 
                          ? 'hover:bg-blue-800 text-blue-300' 
                          : 'hover:bg-blue-100 text-blue-600'
                      }`}
                      title="Edit description"
                    >
                      <Edit3 size={12} />
                    </button>
                  )}
                </div>
                
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className={`w-full p-2 text-sm rounded-md border resize-none ${
                        darkmode 
                          ? 'bg-blue-900/50 border-blue-700 text-blue-100 placeholder-blue-400' 
                          : 'bg-white border-blue-200 text-gray-700 placeholder-gray-400'
                      }`}
                      placeholder="Enter database description..."
                      rows={3}
                      disabled={isSaving}
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className={`p-1 rounded flex items-center gap-1 text-xs transition-colors ${
                          darkmode 
                            ? 'hover:bg-blue-800 text-blue-300 disabled:text-blue-500' 
                            : 'hover:bg-gray-100 text-gray-600 disabled:text-gray-400'
                        }`}
                      >
                        <X size={12} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveDescription}
                        disabled={isSaving || !editedDescription.trim()}
                        className={`p-1 rounded flex items-center gap-1 text-xs transition-colors ${
                          darkmode 
                            ? 'hover:bg-green-800 text-green-300 disabled:text-green-600' 
                            : 'hover:bg-green-100 text-green-600 disabled:text-green-400'
                        }`}
                      >
                        <Save size={12} />
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`text-sm p-2 rounded-md ${darkmode ? "bg-blue-900/50" : "bg-white/50"}`}>
                    {dbInfo.description || 'No description available'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`text-center py-4 ${darkmode ? "text-blue-200" : "text-blue-600"}`}>
              No database information available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseOverviewPanel;

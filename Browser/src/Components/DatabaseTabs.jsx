import React, { useState } from 'react';
import ErDiagram from '../ErDiagram';

const DatabaseTabs = ({ 
  selectedPath, 
  darkmode, 
  nodes, 
  edges, 
  setNodes, 
  setEdges 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'chart' },
    { id: 'erdiagram', label: 'ER Diagram', icon: 'diagram' }
  ];

  const renderTabIcon = (iconType) => {
    if (iconType === 'chart') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Headers */}
      <div className={`border-b ${darkmode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === tab.id
                  ? darkmode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-blue-500 text-white shadow-sm'
                  : darkmode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {renderTabIcon(tab.icon)}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && (
          <div className={`h-full flex items-center justify-center ${darkmode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
            <div className="text-center">
              <div className={`p-4 rounded-lg ${darkmode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Overview Tab</h3>
                <p className="text-sm">Content will be implemented by another team member</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'erdiagram' && (
          <ErDiagram
            selectedPath={selectedPath}
            darkmode={darkmode}
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
          />
        )}
      </div>
    </div>
  );
};

export default DatabaseTabs;
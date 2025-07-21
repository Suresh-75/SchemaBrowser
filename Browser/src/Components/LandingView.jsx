import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import axios from 'axios';

const LandingView = ({ darkmode, onSelect }) => {
  const [lobs, setLobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/hierarchy');
        console.log("Raw API Data:", response.data);

        // Only keep valid LOBs that have a name and subject_areas object
        const uniqueLobs = Object.entries(response.data)
          .filter(([_, lobData]) =>
            typeof lobData === 'object' &&
            lobData !== null &&
            'name' in lobData &&
            'subject_areas' in lobData &&
            typeof lobData.subject_areas === 'object'
          )
          .map(([id, lobData]) => ({
            id: parseInt(id),
            name: lobData.name,
            subjectAreaCount: Object.keys(lobData.subject_areas || {}).length
          }));

        console.log('Filtered and Transformed LOBs:', uniqueLobs);
        setLobs(uniqueLobs);
      } catch (error) {
        console.error('Failed to fetch LOBs:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLobs();
  }, []);

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${
        darkmode ? "bg-slate-900/90" : "bg-white/90"
      }`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center p-4 ${
        darkmode ? "bg-slate-900/90 text-red-400" : "bg-white/90 text-red-600"
      }`}>
        <p>Error loading LOBs: {error}</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full backdrop-blur-sm rounded-2xl shadow-xl border ${
      darkmode ? "bg-slate-900/90 border-gray-800" : "bg-white/90 border-gray-200"
    }`}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-2xl font-bold ${
              darkmode ? "text-blue-300" : "text-blue-600"
            }`}>
              Lines of Business
            </h1>
            <span className={`text-sm ${
              darkmode ? "text-gray-400" : "text-gray-600"
            }`}>
              {lobs.length} LOB{lobs.length !== 1 ? 's' : ''} Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lobs.map((lob) => (
              <button
                key={lob.id}
                onClick={() => onSelect({ lob: lob.name })}
                className={`p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                  darkmode 
                    ? "bg-slate-800 border-slate-700 hover:bg-slate-700" 
                    : "bg-white border-gray-200 hover:bg-gray-50"
                } text-left group`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`w-5 h-5 ${
                    darkmode ? "text-blue-400" : "text-blue-600"
                  }`} />
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      darkmode ? "text-gray-200" : "text-gray-800"
                    }`}>
                      {lob.name}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      darkmode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {lob.subjectAreaCount} Subject Area{lob.subjectAreaCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    darkmode ? "text-blue-400" : "text-blue-600"
                  }`}>
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingView;

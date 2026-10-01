import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';

const NewInspection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [inspectionType, setInspectionType] = useState('Safety');
  const [projectId, setProjectId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !projectId) return;
    setIsUploading(true);

    try {
      setTimeout(() => {
        setIsUploading(false);
        navigate('/inspections/demo-id');
      }, 2500);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">New Inspection</h1>
        <p className="text-slate-500 mt-2">Upload visual data for AI-powered safety and structural analysis.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 border border-white shadow-xl relative overflow-hidden">
        {/* Decorative background for the form */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Project Location</label>
              <select 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none text-slate-700 font-medium"
                required
              >
                <option value="" disabled>Select a project site...</option>
                <option value="p1">Downtown Highrise (Sector A)</option>
                <option value="p2">Bridge Alpha (Zone 2)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Inspection Type</label>
              <select 
                value={inspectionType} 
                onChange={(e) => setInspectionType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none text-slate-700 font-medium"
              >
                <option value="Safety">Safety Protocol (PPE, Hazards)</option>
                <option value="Structural">Structural Integrity (Cracks, Rust)</option>
                <option value="Hybrid">Hybrid (Comprehensive)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Visual Data</label>
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-dashed rounded-2xl transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50'}`}
            >
              <div className="space-y-4 text-center">
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                      <ImageIcon size={32} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-800">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={() => setFile(null)} className="text-sm text-rose-500 hover:text-rose-600 font-medium mt-2">
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto w-20 h-20 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
                      <UploadCloud size={40} />
                    </div>
                    <div className="flex text-lg justify-center items-center gap-1">
                      <label className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      </label>
                      <p className="text-slate-600">or drag and drop</p>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Supports High-Res PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={!file || !projectId || isUploading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-indigo-500/30 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Analyzing with VisionGuard-AI...
                </>
              ) : 'Submit for AI Analysis'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewInspection;

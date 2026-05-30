import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  ShieldAlert, 
  Plus, 
  Sparkles, 
  Trash2, 
  Eye, 
  Check, 
  AlertTriangle,
  Loader2,
  BookmarkCheck,
  ChevronRight,
  RefreshCw,
  Clock,
  X
} from 'lucide-react';
import { DocumentRecord, Employee, DocType } from '../types';

interface DocumentSectionProps {
  documents: DocumentRecord[];
  employees: Employee[];
  onAddDocument: (doc: Omit<DocumentRecord, 'id' | 'uploadDate'>) => void;
  onDeleteDocument: (id: string) => void;
  onAddLog: (type: 'employee' | 'leave' | 'attendance' | 'payroll' | 'document', description: string, user: string) => void;
}

export default function DocumentSection({
  documents,
  employees,
  onAddDocument,
  onDeleteDocument,
  onAddLog
}: DocumentSectionProps) {
  
  // Tab within Documents: Vault vs AI Tools
  const [activeDocSubTab, setActiveDocSubTab] = useState<'vault' | 'ai-tools' | 'ai-generator'>('vault');
  const [docTypeFilter, setDocTypeFilter] = useState('All');
  const [searchDoc, setSearchDoc] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'Contract' as DocType,
    employeeId: '',
    fileSize: '350 KB',
    contentSnippet: ''
  });

  // AI Analyzer states
  const [selectedDocForAnalysis, setSelectedDocForAnalysis] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [analyzingLoading, setAnalyzingLoading] = useState(false);

  // AI Generator policy states
  const [generatorForm, setGeneratorForm] = useState({
    topic: 'Workplace Anti-Harassment Policy',
    audience: 'All Employees',
    strictness: 'Balanced and Professional'
  });
  const [generatedPolicy, setGeneratedPolicy] = useState<string>('');
  const [generatingLoading, setGeneratingLoading] = useState(false);

  // PDF Preview simulation modal
  const [viewingDoc, setViewingDoc] = useState<DocumentRecord | null>(null);

  // Filter vault
  const filteredDocs = documents.filter(doc => {
    const matchesType = docTypeFilter === 'All' || doc.type === docTypeFilter;
    const matchesSearch = doc.title.toLowerCase().includes(searchDoc.toLowerCase()) || 
                          (doc.employeeName && doc.employeeName.toLowerCase().includes(searchDoc.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Handle Document upload form
  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title) return;

    const matchedEmp = employees.find(emp => emp.id === uploadForm.employeeId);
    
    onAddDocument({
      title: uploadForm.title,
      type: uploadForm.type,
      employeeId: uploadForm.employeeId || undefined,
      employeeName: matchedEmp ? `${matchedEmp.firstName} ${matchedEmp.lastName}` : undefined,
      fileSize: uploadForm.fileSize || "180 KB",
      contentSnippet: uploadForm.contentSnippet || "This is a custom uploaded personnel attachment document record stored in corporate index directories."
    });

    onAddLog('document', `Indexed document attachment "${uploadForm.title}" into systems vault.`, "Elena Rostova (HR)");

    // Reset upload fields
    setUploadForm({
      title: '',
      type: 'Contract',
      employeeId: '',
      fileSize: '120 KB',
      contentSnippet: ''
    });
    setIsUploading(false);
  };

  // Trigger server-side AI Document Analysis
  const requestAIAnalysis = async () => {
    if (!selectedDocForAnalysis) return;
    
    setAnalyzingLoading(true);
    setAnalysisResult('');
    
    const docObj = documents.find(d => d.id === selectedDocForAnalysis);
    if (!docObj) return;

    try {
      const response = await fetch("/api/ai/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docTitle: docObj.title,
          docContentSnippet: docObj.contentSnippet || "Blank document reference text"
        })
      });

      if (!response.ok) throw new Error("Backend API failure during audit process.");
      
      const data = await response.json();
      setAnalysisResult(data.text);
      onAddLog('document', `Executed Nellie AI Compliance Audit on file "${docObj.title}"`, "Elena Rostova (HR)");
    } catch (err: any) {
      console.error(err);
      setAnalysisResult(`### Nellie System Warning\n\nFailed to process document analysis. Error: ${err.message || 'Gemini API not active'}. Make sure your Gemini API Key is entered in the AI Studio Settings secrets list!`);
    } finally {
      setAnalyzingLoading(false);
    }
  };

  // Trigger server-side AI Policy Generation
  const requestAIPolicyGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingLoading(true);
    setGeneratedPolicy('');

    try {
      const response = await fetch("/api/ai/generate-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatorForm)
      });

      if (!response.ok) throw new Error("Backend API failure during policy generation.");

      const data = await response.json();
      setGeneratedPolicy(data.text);
    } catch (err: any) {
      console.error(err);
      setGeneratedPolicy(`### Nellie System Warning\n\nFailed to generate custom policy file. Error: ${err.message || 'Gemini API Error'}. Make sure your Gemini API Key is active in the AI Studio panel!`);
    } finally {
      setGeneratingLoading(false);
    }
  };

  // Save the generated AI policy as a Doc to the Vault
  const handleSaveGeneratedPolicyToVault = () => {
    if (!generatedPolicy) return;

    onAddDocument({
      title: `${generatorForm.topic.replace(/\s+/g, '_')}_2026.md`,
      type: 'Policy',
      fileSize: "14 KB",
      contentSnippet: generatedPolicy,
      summary: `AI Generated Document: Policy outline covering ${generatorForm.topic} for target division roles.`
    });

    onAddLog('document', `Saved generated policy file for "${generatorForm.topic}" into global company directories.`, "Elena Rostova (HR)");
    alert("Generated Policy has been successfully published to your Vault!");
    setActiveDocSubTab('vault');
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation Sub-Menu tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveDocSubTab('vault')}
          className={`px-5 py-3 border-b-2 font-semibold text-xs tracking-wider uppercase transition cursor-pointer flex items-center gap-2 ${activeDocSubTab === 'vault' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FileText className="w-4 h-4" /> Global Document Vault
        </button>
        <button
          onClick={() => setActiveDocSubTab('ai-generator')}
          className={`px-5 py-3 border-b-2 font-semibold text-xs tracking-wider uppercase transition cursor-pointer flex items-center gap-2 ${activeDocSubTab === 'ai-generator' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" /> Create Policy (AI Generator)
        </button>
        <button
          onClick={() => setActiveDocSubTab('ai-tools')}
          className={`px-5 py-3 border-b-2 font-semibold text-xs tracking-wider uppercase transition cursor-pointer flex items-center gap-2 ${activeDocSubTab === 'ai-tools' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-500" /> AI Compliance Audit
        </button>
      </div>

      {/* SUB-TAB 1: DOCUMENT VAULT INDEX */}
      {activeDocSubTab === 'vault' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 flex gap-3">
              <input
                type="text"
                placeholder="Search files by title, employee name..."
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                className="w-full max-w-sm pl-4 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Contract">Contracts</option>
                <option value="Policy">Company Policies</option>
                <option value="Onboarding">Onboarding Docs</option>
                <option value="ID Proof">ID Proofs</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={() => setIsUploading(!isUploading)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Upload File attachment
            </button>
          </div>

          {/* Interactive Document uploading inline dialog */}
          {isUploading && (
            <form onSubmit={handleDocSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top duration-150">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Attach file parameters</h4>
                <button type="button" onClick={() => setIsUploading(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">File Title/Filename *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ND_Agreement.docx"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Type category</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value as DocType})}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="Contract">Contract</option>
                    <option value="Policy">Policy</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="ID Proof">ID Proof</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Associated Associate (Optional)</label>
                  <select
                    value={uploadForm.employeeId}
                    onChange={(e) => setUploadForm({...uploadForm, employeeId: e.target.value})}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="">-- None (Company Wide) --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">File weight size</label>
                  <input
                    type="text"
                    value={uploadForm.fileSize}
                    onChange={(e) => setUploadForm({...uploadForm, fileSize: e.target.value})}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">Document text body snippet (Needed for AI analysis tools)</label>
                <textarea
                  rows={2}
                  placeholder="Insert core clauses or copy-paste text extract..."
                  value={uploadForm.contentSnippet}
                  onChange={(e) => setUploadForm({...uploadForm, contentSnippet: e.target.value})}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="text-right">
                <button type="submit" className="bg-slate-900 text-white font-bold text-xs p-2 px-4 rounded-xl cursor-pointer">
                  Import File to Vault
                </button>
              </div>
            </form>
          )}

          {/* Docs entries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <div key={doc.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition duration-150 flex flex-col justify-between space-y-4">
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="p-2 border border-slate-100 bg-slate-50 text-indigo-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold rounded px-1.5 py-0.5">
                      {doc.type}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800 leading-snug tracking-tight truncate" title={doc.title}>
                      {doc.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Published: {doc.uploadDate} • Size: {doc.fileSize}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {doc.summary || doc.contentSnippet || "No summary content indexed on registry."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold">
                  {doc.employeeName ? (
                    <span className="text-slate-400 font-sans tracking-wide">
                      Ref: <strong className="text-slate-600">{doc.employeeName}</strong>
                    </span>
                  ) : (
                    <span className="text-indigo-600 font-mono tracking-wide uppercase text-[9px] font-black">
                      Company wide POLICY
                    </span>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="p-1 border border-slate-100 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                      title="Inspect snippet content"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove file index entry "${doc.title}"?`)) {
                          onDeleteDocument(doc.id);
                          onAddLog('document', `Purged document index attachment "${doc.title}"`, "Elena Rostova (HR)");
                        }
                      }}
                      className="p-1 border border-slate-100 text-rose-500 rounded-lg hover:border-rose-100 hover:bg-rose-50 cursor-pointer"
                      title="Delete permanent record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="text-center py-10 col-span-full border border-dashed border-slate-200 bg-white rounded-2xl">
                <FileText className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-600">No document records in query</h4>
                <p className="text-xs text-slate-400 mt-1">Upload a manual file or change filters.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUB-TAB 2: AI POLICY DOCUMENT GENERATOR (NELLIE ADVANCED TEXT GENERATOR) */}
      {activeDocSubTab === 'ai-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Settings form panel */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3.5">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Nellie Policy Drafting Board</h3>
                <p className="text-xs text-slate-400">Generate legally consistent policy blueprints tailored to your company scale.</p>
              </div>
            </div>

            <form onSubmit={requestAIPolicyGeneration} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Draft Topic/Title *</label>
                <input
                  type="text"
                  required
                  value={generatorForm.topic}
                  onChange={(e) => setGeneratorForm({...generatorForm, topic: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Division Audience</label>
                <input
                  type="text"
                  value={generatorForm.audience}
                  onChange={(e) => setGeneratorForm({...generatorForm, audience: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Strictness & Corporate Tone</label>
                <select
                  value={generatorForm.strictness}
                  onChange={(e) => setGeneratorForm({...generatorForm, strictness: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="Balanced and Professional">Balanced and Professional</option>
                  <option value="Strictly Binding & High-Discipline">Strictly Binding & High-Discipline</option>
                  <option value="Supportive & Employee-Centric (Modern startup style)">Supportive & Employee-Centric (Modern startup style)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generatingLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {generatingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Nellie modeling document outlines...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Assemble Custom Policy Draft
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Policy Preview board result */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 text-slate-100 p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Preview Document Draft</span>
                </div>
                {generatedPolicy && (
                  <button
                    onClick={handleSaveGeneratedPolicyToVault}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1 px-3 rounded-lg transition cursor-pointer"
                  >
                    Commit Draft to Vault
                  </button>
                )}
              </div>

              {/* Code text content markdown output */}
              <div className="mt-4 overflow-y-auto max-h-[360px] text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-300">
                {generatingLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-3">
                    <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                    <p className="text-xs text-slate-400 italic">Formulating legal clauses and workplace frameworks...</p>
                  </div>
                ) : generatedPolicy ? (
                  generatedPolicy
                ) : (
                  <span className="text-slate-500 italic block text-center py-20 font-sans">
                    Define topic outlines and click "Assemble Draft" to trigger server-side Gemini.
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>MODEL: GEMINI-3.5-FLASH</span>
              <span>VERIFIED LEGAL ACCENTS: ACTIVE</span>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 3: AI COMPLIANCE AUDIT AUDITOR (NELLIE CONTRACT AUDITOR) */}
      {activeDocSubTab === 'ai-tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Selector list */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Audit Target Selection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select any document in your enterprise vault. Nellie will crawl the clauses, flags, commitments, and detect liability gaps or workplace compliance issues.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Document *</label>
                <select
                  value={selectedDocForAnalysis}
                  onChange={(e) => setSelectedDocForAnalysis(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">-- Choose file --</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.title} ({d.type})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={requestAIAnalysis}
                disabled={!selectedDocForAnalysis || analyzingLoading}
                className="w-full bg-slate-900 border hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition"
              >
                {analyzingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Examining terms...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-indigo-400" /> Run Compliance Check
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Audit report output */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 border-b pb-3.5 mb-4">
                <BookmarkCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Nellie Executive Audit Report</h3>
              </div>

              <div className="overflow-y-auto max-h-[380px] text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                {analyzingLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-xs text-slate-400 italic">Crawling file snippets and checking federal labor codes...</span>
                  </div>
                ) : analysisResult ? (
                  <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                    {analysisResult}
                  </div>
                ) : (
                  <div className="text-center py-24 text-slate-400 italic">
                    Configure target audit selection and click "Run Compliance Check" to view executive audit report.
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3.5 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Complies with Typical Workplace Labor Guidelines 2026.</span>
            </div>

          </div>

        </div>
      )}

      {/* SNIPPET PREVIEW MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider truncate max-w-[300px]">File Body: {viewingDoc.title}</h3>
              <button onClick={() => setViewingDoc(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Indexed snippets / content text</span>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono text-slate-700 leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                  {viewingDoc.contentSnippet || "No text content stored for this index file."}
                </div>
              </div>

              {viewingDoc.summary && (
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-indigo-600">AI summary</span>
                  <p className="text-xs text-slate-600 bg-indigo-50/20 border border-indigo-100/50 p-3 rounded-lg leading-relaxed">
                    {viewingDoc.summary}
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 p-4 bg-slate-50 text-right">
              <button onClick={() => setViewingDoc(null)} className="bg-slate-900 text-white font-bold text-xs py-2 px-5 rounded-xl cursor-pointer">Close Preview</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

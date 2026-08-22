'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DocumentRecord } from '@/lib/types';
import { 
  FolderLock, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Eye, 
  X, 
  Lock, 
  ShieldCheck 
} from 'lucide-react';

interface DocumentsTabProps {
  employeeId: string;
  currentUserId: string;
  canManageDocs: boolean;
}

export default function DocumentsTab({
  employeeId,
  currentUserId,
  canManageDocs,
}: DocumentsTabProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentRecord['documentType']>('ID Proof');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/profile/documents?userId=${employeeId}`, {
        headers: {
          'x-user-id': currentUserId,
        },
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch documents');
      }

      setDocuments(data.data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading employee documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [employeeId, currentUserId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', employeeId);
      formData.append('documentType', documentType);

      const res = await fetch('/api/profile/documents', {
        method: 'POST',
        headers: {
          'x-user-id': currentUserId,
        },
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload document');
      }

      setSuccessMsg('Document uploaded successfully!');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      fetchDocuments();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to permanently delete this document?')) return;

    try {
      const res = await fetch(`/api/profile/documents/${docId}?userId=${employeeId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUserId,
        },
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete document');
      }

      setSuccessMsg('Document deleted successfully');
      setDocuments(documents.filter((d) => d.id !== docId));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'Offer Letter':
        return 'bg-blue-100 text-brand-primary border-blue-200';
      case 'Degree Certificate':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ID Proof':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Payslip':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Tax Document':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-tint text-brand-primary rounded-xl">
            <FolderLock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-text">Employee Documents & Records</h3>
            <p className="text-xs text-brand-muted">
              Securely stored verification documents, government IDs, and academic records.
            </p>
          </div>
        </div>

        {canManageDocs && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-brand-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-brand-muted">Loading employee documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-brand-text mb-1">No Documents Uploaded</h4>
            <p className="text-xs text-brand-muted max-w-sm mx-auto mb-4">
              Upload official records, degree transcripts, government IDs, or offer letters.
            </p>
            {canManageDocs && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-tint text-brand-primary font-semibold text-xs rounded-xl hover:bg-brand-sky/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-brand-bg/80 text-brand-muted font-bold uppercase tracking-wider border-b border-brand-border">
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Filename</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Uploaded Date</th>
                  <th className="py-3.5 px-4">Uploaded By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-text">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-brand-bg/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getDocTypeBadge(doc.documentType)}`}>
                        {doc.documentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{doc.filename}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{formatFileSize(doc.fileSizeBytes)}</td>
                    <td className="py-3.5 px-4 text-gray-600">{doc.uploadedDate}</td>
                    <td className="py-3.5 px-4 text-gray-600">{doc.uploadedBy}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 text-brand-primary hover:bg-brand-tint rounded-lg transition-colors"
                          title="View / Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <a
                          href={doc.fileUrl}
                          download={doc.filename}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-600 hover:text-brand-primary hover:bg-brand-tint rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {canManageDocs && (
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-brand-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-gradient-to-r from-brand-sky/10 to-brand-primary/10">
              <h3 className="text-base font-bold text-brand-text">Upload Document</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-brand-muted hover:text-brand-text p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Document Category *</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                >
                  <option value="ID Proof">Government ID Proof (Passport / Aadhaar)</option>
                  <option value="Degree Certificate">Degree / Educational Certificate</option>
                  <option value="Offer Letter">Signed Offer Letter</option>
                  <option value="Payslip">Payslip / Salary Statement</option>
                  <option value="Tax Document">Tax / Form 16 Document</option>
                  <option value="Resume">Resume / Portfolio</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              {/* Drag & Drop zone */}
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Select File *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-border hover:border-brand-sky rounded-xl p-6 text-center cursor-pointer bg-brand-bg/50 hover:bg-brand-tint/30 transition-all"
                >
                  <Upload className="w-8 h-8 text-brand-primary mx-auto mb-2" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-bold text-brand-text">{selectedFile.name}</p>
                      <p className="text-xs text-brand-muted">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-brand-text">Click to choose a file or drag & drop</p>
                      <p className="text-xs text-brand-muted mt-1">PDF, JPG, PNG, DOCX up to 10MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf, .png, .jpg, .jpeg, .docx, application/pdf, image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-medium text-brand-muted hover:text-brand-text bg-white border border-brand-border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? <span>Uploading...</span> : <span>Upload Document</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-brand-border animate-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-text">Document Details</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-brand-muted hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-brand-bg rounded-xl">
                <span className="text-brand-muted block mb-0.5">Filename</span>
                <span className="font-bold text-brand-text text-sm break-all">{previewDoc.filename}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-brand-bg rounded-xl">
                  <span className="text-brand-muted block mb-0.5">Category</span>
                  <span className="font-semibold text-brand-primary">{previewDoc.documentType}</span>
                </div>
                <div className="p-3 bg-brand-bg rounded-xl">
                  <span className="text-brand-muted block mb-0.5">Size</span>
                  <span className="font-mono font-semibold text-brand-text">{formatFileSize(previewDoc.fileSizeBytes)}</span>
                </div>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl">
                <span className="text-brand-muted block mb-0.5">Uploaded By</span>
                <span className="font-semibold text-brand-text">{previewDoc.uploadedBy} on {previewDoc.uploadedDate}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <a
                href={previewDoc.fileUrl}
                download={previewDoc.filename}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

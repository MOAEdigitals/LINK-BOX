import React, { useState } from 'react';
import { Category, SavedLink } from '../types';
import { db } from '../lib/db';
import { X, Download, Upload, Check, AlertCircle, FileJson } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  links: SavedLink[];
  onRefreshData: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  categories,
  links,
  onRefreshData,
  onShowToast,
}) => {
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      categories,
      links,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linksaver-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Backup exported successfully');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setImporting(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.categories || !data.links || !Array.isArray(data.categories) || !Array.isArray(data.links)) {
        throw new Error('Invalid backup file format.');
      }

      await db.transaction('rw', db.categories, db.links, async () => {
        for (const cat of data.categories) {
          await db.categories.put(cat);
        }
        for (const link of data.links) {
          await db.links.put(link);
        }
      });

      await onRefreshData();
      onShowToast(`Imported ${data.links.length} links and ${data.categories.length} categories!`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse backup JSON.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        id="import-export-modal-card" 
        className="w-full max-w-md bg-[#16191f] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-300"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f1115]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center font-bold">
              <FileJson className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Backup & Restore</h2>
          </div>
          <button
            id="close-import-export-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export section */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Export Backup
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Download your {links.length} saved links and custom categories as a JSON file.
            </p>
            <button
              type="button"
              id="export-data-json-btn"
              onClick={handleExport}
              className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition shadow-xs"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export JSON Backup</span>
            </button>
          </div>

          {/* Import section */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Restore from Backup
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Upload a previously exported JSON backup file to restore categories and links.
            </p>

            <label className="w-full px-4 py-4 bg-indigo-950/20 hover:bg-indigo-950/40 border border-dashed border-indigo-700/60 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition">
              <Upload className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-xs font-semibold text-indigo-300">
                {importing ? 'Importing...' : 'Select JSON Backup File'}
              </span>
              <span className="text-2xs text-slate-500 mt-0.5">.json files supported</span>
              <input
                type="file"
                id="import-backup-file-input"
                accept=".json"
                onChange={handleFileChange}
                disabled={importing}
                className="hidden"
              />
            </label>

            {errorMsg && (
              <div className="mt-2.5 p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end px-6 py-3 bg-[#0f1115] border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

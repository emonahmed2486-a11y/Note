import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  FolderTree, 
  Terminal, 
  CloudLightning, 
  ShieldCheck, 
  Database, 
  FileCode, 
  Layers, 
  ArrowRight,
  ExternalLink,
  BookOpen,
  RefreshCw,
  Upload
} from 'lucide-react';
import JSZip from 'jszip';
import { FLUTTER_PROJECT_FILES, FlutterFile } from '../data/flutterSourceCode';
import { downloadBackupFile, restoreFromJSON, resetToDefaultData, clearAllData } from '../services/storage';

interface FlutterBuilderGuideViewProps {
  onDataChanged: () => void;
}

export const FlutterBuilderGuideView: React.FC<FlutterBuilderGuideViewProps> = ({
  onDataChanged,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'cloud_apk' | 'pwa_instant' | 'termux' | 'code'>('cloud_apk');
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [restoreMessage, setRestoreMessage] = useState<string>('');

  const currentFile = FLUTTER_PROJECT_FILES[selectedFileIndex] || FLUTTER_PROJECT_FILES[0];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add each file into the zip
      FLUTTER_PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.code);
      });

      // Add a helpful README.md
      zip.file(
        'README.md',
        `# TakaTrack - Android Personal Finance App (Flutter & Dart)

An offline-first personal finance tracking app for Android built with Flutter and SQLite.
Currency: Bangladeshi Taka (৳).

## How to Build the APK on an Android Phone (No PC Required):

### Method 1: Free GitHub Actions (Recommended)
1. Create a free GitHub account on your Android phone browser.
2. Create a new repository named 'takatrack'.
3. Upload all the files inside this ZIP.
4. Go to the 'Actions' tab on GitHub.
5. Trigger the 'Build Android APK' workflow.
6. In ~3 minutes, download 'TakaTrack-Release-APK.zip' directly to your phone.
7. Unzip and tap 'app-release.apk' to install on your Android device!

### Features:
- 100% Offline with local SQLite database (sqflite)
- Total Balance, Monthly Income, and Monthly Expenses
- Lent & Borrowed debt tracking (ধার ও দেনা)
- CSV export & JSON backup/restore
- Dark mode & Material 3 UI
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'takatrack_flutter_source_code.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating zip:', e);
    } finally {
      setIsZipping(false);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = restoreFromJSON(content);
        setRestoreMessage(result.message);
        if (result.success) {
          onDataChanged();
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Build Android APK on Phone (No Computer)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete Flutter & Dart project structure with offline SQLite database
              </p>
            </div>
          </div>

          {/* Download Entire Zip Button */}
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Packaging ZIP...' : 'Download Full Flutter Project (.ZIP)'}</span>
          </button>
        </div>

        {/* 3 Quick highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Offline SQLite database</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Bangladeshi Taka (৳) native</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Lent & Borrowed (ধার/দেনা) ledger</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveGuideTab('cloud_apk')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeGuideTab === 'cloud_apk'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CloudLightning className="w-3.5 h-3.5 text-amber-500" />
          <span>Method 1: GitHub Cloud APK (Easiest)</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('pwa_instant')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeGuideTab === 'pwa_instant'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
          <span>Method 2: 1-Tap Home Screen App</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('code')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeGuideTab === 'code'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-indigo-500" />
          <span>Browse Flutter Code ({FLUTTER_PROJECT_FILES.length} Files)</span>
        </button>

        <button
          onClick={() => setActiveGuideTab('termux')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeGuideTab === 'termux'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-sky-500" />
          <span>Method 3: Termux Terminal</span>
        </button>
      </div>

      {/* Guide Content: Method 1 (GitHub Cloud APK) */}
      {activeGuideTab === 'cloud_apk' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CloudLightning className="w-5 h-5 text-amber-500" />
              How to Build the .APK Using GitHub Actions (Free, 0 Computer Required)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Because you only have an Android phone, GitHub provides free cloud servers that can compile Flutter into an Android APK directly through your phone&apos;s browser.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Download the Project ZIP to your phone
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tap the green <strong>&quot;Download Full Flutter Project (.ZIP)&quot;</strong> button above. This saves all Flutter files, including the SQLite database and GitHub build configuration, to your phone&apos;s Downloads folder.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Create a Free GitHub Repository on your phone
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Open Chrome on your phone, visit <strong>github.com</strong>, sign in (or create a free account), and tap <strong>&quot;New Repository&quot;</strong>. Name it <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600">takatrack</code>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Upload files or use GitHub Web Editor
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  On the repo page on your phone, tap <strong>&quot;Add file&quot; &rarr; &quot;Upload files&quot;</strong> and choose the unzipped files, or create a codespace with one tap. Ensure the <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600">.github/workflows/build-apk.yml</code> file is included.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                4
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Automatic Cloud Build & Download APK
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Click on the <strong>&quot;Actions&quot;</strong> tab on GitHub. You will see the &quot;Build Android APK&quot; job running. In ~3 minutes, it will finish with a green checkmark. Tap the completed run, scroll to <strong>Artifacts</strong>, and tap <strong>TakaTrack-Release-APK</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                5
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Install on your Android Phone
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Open the downloaded APK from your phone&apos;s Files app. Allow &quot;Install unknown apps&quot; if prompted. The app installs as a native Android app on your home screen!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Content: Method 2 (Instant Home Screen PWA) */}
      {activeGuideTab === 'pwa_instant' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-500" />
              Use This App Right Now on Your Phone (Install as PWA)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You do not even have to wait for an APK to build! This web application is already fully built with local offline storage, Bangladeshi Taka (৳), debt tracking, CSV export, and dark mode.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
              Steps to Install on Android Chrome:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-emerald-800 dark:text-emerald-300">
              <li>Open this page in <strong>Google Chrome</strong> on your Android phone.</li>
              <li>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner of Chrome.</li>
              <li>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
              <li>Tap <strong>&quot;Add&quot;</strong>.</li>
            </ol>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 pt-1 font-medium">
              It will place an app icon on your phone that launches in standalone full-screen mode, works 100% offline with no internet needed, and never uploads your financial data anywhere!
            </p>
          </div>
        </div>
      )}

      {/* Guide Content: Method 3 (Termux Terminal) */}
      {activeGuideTab === 'termux' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-500" />
              Advanced Option: Termux Linux Terminal on Android
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              If you enjoy working directly in terminal on Android, you can use Termux from F-Droid.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs space-y-2 overflow-x-auto">
            <p className="text-slate-400"># 1. Update Termux packages</p>
            <p className="text-emerald-400">pkg update && pkg install git openjdk-17 -y</p>
            <p className="text-slate-400"># 2. Or use GitHub CLI on your phone</p>
            <p className="text-emerald-400">pkg install gh</p>
            <p className="text-slate-400"># 3. Trigger remote build workflow from Termux</p>
            <p className="text-emerald-400">gh workflow run build-apk.yml</p>
          </div>
        </div>
      )}

      {/* Flutter Source Code File Explorer */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-600" />
              Flutter & Dart Source Code Repository
            </h3>
            <p className="text-xs text-slate-500">
              Complete, production-ready code files ready to compile into your Android APK
            </p>
          </div>

          {/* Copy Code Button */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy This File'}</span>
          </button>
        </div>

        {/* File Tabs Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {FLUTTER_PROJECT_FILES.map((file, idx) => {
            const isSelected = selectedFileIndex === idx;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* File Metadata */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <div>
            <strong>File:</strong> <span className="font-mono text-emerald-600 dark:text-emerald-400">{currentFile.path}</span>
            <p className="text-slate-500 mt-0.5">{currentFile.description}</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {currentFile.code.split('\n').length} lines
          </span>
        </div>

        {/* Code Block with line numbering */}
        <div className="relative rounded-xl bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-[460px] border border-slate-800">
          <pre className="leading-relaxed">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      </div>

      {/* Data Management & Backup/Restore (Requirement #12) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            Reliable Backup, Restore & Data Privacy
          </h3>
          <p className="text-xs text-slate-500">
            All data is 100% offline on your device. Create a backup file anytime to keep your data safe.
          </p>
        </div>

        {restoreMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
            {restoreMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON Backup */}
          <button
            onClick={downloadBackupFile}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Create JSON Backup</span>
          </button>

          {/* Restore JSON Backup */}
          <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold cursor-pointer transition-colors text-center">
            <Upload className="w-4 h-4" />
            <span>Restore from Backup File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>

          {/* Reset Sample Data */}
          <button
            onClick={() => {
              if (confirm('Reset to sample Bangladeshi transactions and debt data?')) {
                resetToDefaultData();
                onDataChanged();
                setRestoreMessage('Sample data reloaded.');
              }
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

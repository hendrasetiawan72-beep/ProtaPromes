import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import { DocumentMeta, LearningObjective, MonthEffectiveBreakdown } from '../types';
import {
  downloadMasterPromesProtaExcel,
  downloadMasterPromesProtaJson,
  parseMasterPromesProtaFile,
  ParsedMasterData,
} from '../services/masterPromesProtaService';

interface MasterPromesProtaModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: DocumentMeta;
  onUpdateMeta: (meta: DocumentMeta) => void;
  objectivesSem1: LearningObjective[];
  objectivesSem2: LearningObjective[];
  onUpdateObjectivesSem1: (objs: LearningObjective[]) => void;
  onUpdateObjectivesSem2: (objs: LearningObjective[]) => void;
  monthAnalysis: MonthEffectiveBreakdown[];
}

export const MasterPromesProtaModal: React.FC<MasterPromesProtaModalProps> = ({
  isOpen,
  onClose,
  meta,
  onUpdateMeta,
  objectivesSem1,
  objectivesSem2,
  onUpdateObjectivesSem1,
  onUpdateObjectivesSem2,
  monthAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'upload_download' | 'capaian' | 'editor'>('upload_download');

  // Local working copy for the in-app editor
  const [localSem1, setLocalSem1] = useState<LearningObjective[]>(objectivesSem1);
  const [localSem2, setLocalSem2] = useState<LearningObjective[]>(objectivesSem2);
  const [localCp, setLocalCp] = useState<string>(
    meta.capaianPembelajaran ||
      'Pada akhir Fase F, peserta didik menggunakan teks lisan, tulisan dan visual dalam berkomunikasi sesuai situasi, tujuan, dan pemirsa/pembacanya. Pembelajaran difokuskan pada penguasaan kompetensi dasar dan kejuruan secara komprehensif, kritis, dan mandiri guna membekali lulusan SMK dengan keahlian kerja dan karakter luhur.'
  );

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedMasterData | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

  // Sync state whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalSem1(objectivesSem1);
      setLocalSem2(objectivesSem2);
      setLocalCp(
        meta.capaianPembelajaran ||
          'Pada akhir Fase F, peserta didik menggunakan teks lisan, tulisan dan visual dalam berkomunikasi sesuai situasi, tujuan, dan pemirsa/pembacanya. Pembelajaran difokuskan pada penguasaan kompetensi dasar dan kejuruan secara komprehensif, kritis, dan mandiri guna membekali lulusan SMK dengan keahlian kerja dan karakter luhur.'
      );
      setParsedPreview(null);
      setUploadSuccessMessage(null);
      setUploadErrorMessage(null);
    }
  }, [isOpen, objectivesSem1, objectivesSem2, meta]);

  if (!isOpen) return null;

  const sem1Eff = monthAnalysis.filter(m => m.semester === 1).reduce((s, m) => s + m.effectiveWeeks, 0) || 19;
  const sem2Eff = monthAnalysis.filter(m => m.semester === 2).reduce((s, m) => s + m.effectiveWeeks, 0) || 18;
  const hpw = Number(meta.weeklyHours) || 4;

  const targetJpSem1 = sem1Eff * hpw;
  const targetJpSem2 = sem2Eff * hpw;

  const currentTotalJpSem1 = localSem1.reduce((sum, it) => sum + (Number(it.jp) || 0), 0);
  const currentTotalJpSem2 = localSem2.reduce((sum, it) => sum + (Number(it.jp) || 0), 0);

  // Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    if (!file) return;

    const fileName = file.name;
    let fileData: ArrayBuffer | string;
    try {
      if (fileName.toLowerCase().endsWith('.json')) {
        fileData = await file.text();
      } else {
        fileData = await file.arrayBuffer();
      }
    } catch (readErr: any) {
      console.error('Error reading file:', readErr);
      setUploadErrorMessage(`Gagal membaca file dari sistem: ${readErr.message}`);
      inputEl.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Reset input immediately so no raw file descriptor is held
    inputEl.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsProcessingFile(true);
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);

    try {
      const result = await parseMasterPromesProtaFile(fileData, fileName, hpw);
      if (result.success && result.totalParsed > 0) {
        setParsedPreview(result);
        setUploadSuccessMessage(
          `File "${fileName}" berhasil dibaca! Terdeteksi ${result.objectivesSem1.length} TP Semester 1 dan ${result.objectivesSem2.length} TP Semester 2.`
        );
      } else {
        setUploadErrorMessage(result.message || 'Format file master tidak dikenali atau kosong.');
      }
    } catch (err: any) {
      setUploadErrorMessage(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsProcessingFile(false);
      if (inputEl) inputEl.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Apply parsed master data into active app state
  const handleApplyParsedData = () => {
    if (!parsedPreview) return;

    if (parsedPreview.objectivesSem1.length > 0) {
      onUpdateObjectivesSem1(parsedPreview.objectivesSem1);
      setLocalSem1(parsedPreview.objectivesSem1);
    }
    if (parsedPreview.objectivesSem2.length > 0) {
      onUpdateObjectivesSem2(parsedPreview.objectivesSem2);
      setLocalSem2(parsedPreview.objectivesSem2);
    }

    const updatedMeta = { ...meta };
    if (parsedPreview.capaianPembelajaran) {
      updatedMeta.capaianPembelajaran = parsedPreview.capaianPembelajaran;
      setLocalCp(parsedPreview.capaianPembelajaran);
    }
    if (parsedPreview.weeklyHours) {
      updatedMeta.weeklyHours = parsedPreview.weeklyHours;
    }
    onUpdateMeta(updatedMeta);

    setUploadSuccessMessage('Data master berhasil diterapkan serentak ke PROMES dan PROTA!');
    setParsedPreview(null);
  };

  // Save changes from manual editor
  const handleSaveEditor = () => {
    onUpdateObjectivesSem1(localSem1);
    onUpdateObjectivesSem2(localSem2);
    onUpdateMeta({
      ...meta,
      capaianPembelajaran: localCp,
    });
    onClose();
  };

  // Add TP to local list
  const handleAddObjective = (sem: 1 | 2) => {
    const targetList = sem === 1 ? localSem1 : localSem2;
    const nextNum = targetList.length + 1;
    const newObj: LearningObjective = {
      id: `tp_${sem}_${Date.now()}`,
      semester: sem,
      code: `TP ${sem}.${nextNum}`,
      element: sem === 1 ? 'Membaca - Memirsa' : 'Menulis - Mempresentasikan',
      description: 'Menganalisis dan menyajikan gagasan serta informasi kontekstual secara kritis.',
      jp: hpw * 4,
      weeklyAllocation: {},
    };

    if (sem === 1) setLocalSem1([...localSem1, newObj]);
    else setLocalSem2([...localSem2, newObj]);
  };

  // Delete TP
  const handleDeleteObjective = (sem: 1 | 2, id: string) => {
    if (sem === 1) setLocalSem1(localSem1.filter(it => it.id !== id));
    else setLocalSem2(localSem2.filter(it => it.id !== id));
  };

  // Update TP field
  const handleUpdateObjective = (sem: 1 | 2, id: string, field: keyof LearningObjective, value: any) => {
    if (sem === 1) {
      setLocalSem1(localSem1.map(it => (it.id === id ? { ...it, [field]: value } : it)));
    } else {
      setLocalSem2(localSem2.map(it => (it.id === id ? { ...it, [field]: value } : it)));
    }
  };

  // Otomatiskan sinkronisasi jam per TP agar pas dengan JP/Minggu
  const handleAutoSyncHours = (sem: 1 | 2) => {
    const targetList = sem === 1 ? localSem1 : localSem2;
    const effWeeks = sem === 1 ? sem1Eff : sem2Eff;
    if (targetList.length === 0) return;

    const baseWeeks = Math.max(1, Math.floor(effWeeks / targetList.length));
    const remainder = effWeeks % targetList.length;

    const updated = targetList.map((tp, idx) => {
      const weeksForThis = baseWeeks + (idx < remainder ? 1 : 0);
      return {
        ...tp,
        jp: weeksForThis * hpw,
      };
    });

    if (sem === 1) setLocalSem1(updated);
    else setLocalSem2(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-2xl text-blue-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Master Kurikulum PROMES & PROTA Terpadu
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sinkron Otomatis
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Mata Pelajaran: <strong className="text-white">{meta.subjectName}</strong> • Beban Belajar: <strong className="text-emerald-300">{hpw} JP/Minggu</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('upload_download')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'upload_download'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl font-bold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-blue-600" />
            Upload & Download Master
          </button>

          <button
            onClick={() => setActiveTab('capaian')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'capaian'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl font-bold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Capaian Pembelajaran (CP)
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'editor'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl font-bold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            Kelola TP & Elemen Langsung
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: UPLOAD & DOWNLOAD */}
          {activeTab === 'upload_download' && (
            <div className="space-y-6">
              {/* Notifications */}
              {uploadSuccessMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-start gap-3 text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Berhasil!</p>
                    <p>{uploadSuccessMessage}</p>
                  </div>
                </div>
              )}

              {uploadErrorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-start gap-3 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Gagal Memproses File</p>
                    <p>{uploadErrorMessage}</p>
                  </div>
                </div>
              )}

              {/* Grid 2 Columns: Download Master & Upload Master */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* CARD 1: DOWNLOAD MASTER */}
                <div className="p-5 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2.5 text-blue-900 mb-2">
                      <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">1. Unduh File Master</h3>
                        <p className="text-xs text-slate-500">Template resmi PROMES & PROTA</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Unduh template master lengkap dengan seluruh <strong>Tujuan Pembelajaran</strong>, <strong>Elemen</strong>, <strong>Alokasi Minggu</strong>, serta <strong>Capaian Pembelajaran (CP)</strong> yang sedang aktif. Anda dapat mengeditnya di Microsoft Excel, WPS Office, atau Google Sheets.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() =>
                        downloadMasterPromesProtaExcel(meta, objectivesSem1, objectivesSem2, monthAnalysis)
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Unduh Master Excel (.xlsx)
                    </button>
                    <button
                      onClick={() =>
                        downloadMasterPromesProtaJson(meta, objectivesSem1, objectivesSem2)
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition"
                      title="Unduh format JSON untuk arsip teknis"
                    >
                      <FileCode className="w-4 h-4" />
                      JSON
                    </button>
                  </div>
                </div>

                {/* CARD 2: UPLOAD MASTER */}
                <div className="p-5 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2.5 text-emerald-900 mb-2">
                      <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">2. Unggah File Master</h3>
                        <p className="text-xs text-slate-500">Menerima .xlsx, .xls, atau .json</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Unggah kembali file master yang telah Anda ubah. Sistem akan langsung memperbarui daftar TP, Elemen, Alokasi Jam, dan Capaian Pembelajaran secara <strong>terintegrasi pada PROMES & PROTA sekaligus</strong>.
                    </p>
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.json"
                      onChange={handleFileChange}
                      className="hidden"
                      id="master-file-upload-input"
                    />
                    <label
                      htmlFor="master-file-upload-input"
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer transition ${
                        isProcessingFile
                          ? 'bg-slate-300 text-slate-600 pointer-events-none'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {isProcessingFile ? 'Sedang Membaca File...' : 'Pilih & Unggah File Master'}
                    </label>
                  </div>
                </div>
              </div>

              {/* PARSED PREVIEW SECTION (If file was uploaded and ready to apply) */}
              {parsedPreview && (
                <div className="p-5 bg-white border-2 border-indigo-200 rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        Hasil Pengecekan File Master
                      </h4>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                      Total: {parsedPreview.totalParsed} TP Terdeteksi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Semester 1 (Gasal):</span>
                      <strong className="text-base text-slate-900">
                        {parsedPreview.objectivesSem1.length} TP
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Semester 2 (Genap):</span>
                      <strong className="text-base text-slate-900">
                        {parsedPreview.objectivesSem2.length} TP
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Capaian Pembelajaran:</span>
                      <strong className="text-base text-slate-900 truncate block">
                        {parsedPreview.capaianPembelajaran ? 'Tersedia di Sheet' : 'Menggunakan CP Aktif'}
                      </strong>
                    </div>
                  </div>

                  {/* Sample rows preview */}
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-700 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-3">Smt</th>
                          <th className="py-1.5 px-3">Kode</th>
                          <th className="py-1.5 px-3">Elemen</th>
                          <th className="py-1.5 px-3">Tujuan Pembelajaran</th>
                          <th className="py-1.5 px-3 text-center">JP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedPreview.objectivesSem1.slice(0, 3).map((tp, idx) => (
                          <tr key={`prev1_${idx}`} className="hover:bg-slate-50">
                            <td className="py-1 px-3 font-semibold text-blue-700">1 (Gasal)</td>
                            <td className="py-1 px-3 font-bold">{tp.code}</td>
                            <td className="py-1 px-3 text-slate-600">{tp.element}</td>
                            <td className="py-1 px-3 truncate max-w-xs">{tp.description}</td>
                            <td className="py-1 px-3 text-center font-bold">{tp.jp} JP</td>
                          </tr>
                        ))}
                        {parsedPreview.objectivesSem2.slice(0, 3).map((tp, idx) => (
                          <tr key={`prev2_${idx}`} className="hover:bg-slate-50">
                            <td className="py-1 px-3 font-semibold text-emerald-700">2 (Genap)</td>
                            <td className="py-1 px-3 font-bold">{tp.code}</td>
                            <td className="py-1 px-3 text-slate-600">{tp.element}</td>
                            <td className="py-1 px-3 truncate max-w-xs">{tp.description}</td>
                            <td className="py-1 px-3 text-center font-bold">{tp.jp} JP</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setParsedPreview(null)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleApplyParsedData}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Terapkan ke PROMES & PROTA Sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CAPAIAN PEMBELAJARAN (CP) */}
          {activeTab === 'capaian' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-indigo-950">
                  <p className="font-bold">Capaian Pembelajaran (CP) Terintegrasi</p>
                  <p className="text-indigo-800">
                    Teks ini akan otomatis ditampilkan pada <strong>Bagian A Capaian Pembelajaran di Program Tahunan (PROTA)</strong> serta saat ekspor dokumen PDF dan Word.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Uraian Capaian Pembelajaran (Fase F - Kelas XII)
                </label>
                <textarea
                  rows={6}
                  value={localCp}
                  onChange={e => setLocalCp(e.target.value)}
                  className="w-full p-3.5 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none leading-relaxed text-slate-800"
                  placeholder="Ketik Capaian Pembelajaran sesuai kurikulum..."
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Template Cepat:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setLocalCp(
                        'Pada akhir Fase F, peserta didik menggunakan teks lisan, tulisan dan visual dalam berkomunikasi sesuai situasi, tujuan, dan pemirsa/pembacanya. Pembelajaran difokuskan pada penguasaan kompetensi dasar dan kejuruan secara komprehensif, kritis, dan mandiri guna membekali lulusan SMK dengan keahlian kerja dan karakter luhur.'
                      )
                    }
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-indigo-400 rounded-lg text-slate-700 hover:text-indigo-700 font-medium"
                  >
                    Bahasa Inggris (Fase F)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalCp(
                        'Pada akhir Fase F, peserta didik memiliki kemampuan menganalisis permasalahan teknis kejuruan, menerapkan prosedur keselamatan kerja, serta merancang dan melaksanakan perbaikan komponen otomotif/komputer sesuai standar operasional industri terakreditasi.'
                      )
                    }
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-indigo-400 rounded-lg text-slate-700 hover:text-indigo-700 font-medium"
                  >
                    Kejuruan SMK (Fase F)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalCp(
                        'Pada akhir Fase F, peserta didik mampu memahami, merefleksi, dan mengevaluasi beragam teks kompleks serta mengintegrasikan pemikiran logis dan keterampilan aplikatif untuk pemecahan masalah di dunia kerja.'
                      )
                    }
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-indigo-400 rounded-lg text-slate-700 hover:text-indigo-700 font-medium"
                  >
                    Mata Pelajaran Umum (Fase F)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KELOLA TP & ELEMEN LANGSUNG */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              {/* Semester 1 Section */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-bold text-xs rounded-lg uppercase">
                      Semester 1 (Gasal)
                    </span>
                    <span className="text-xs text-slate-500">
                      Target: {sem1Eff} Minggu ({targetJpSem1} JP) • Terisi: <strong>{currentTotalJpSem1} JP</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAutoSyncHours(1)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition"
                      title="Ratakan JP antar TP agar total pas dengan minggu efektif"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Auto-Sync JP ({hpw} JP/Mgg)
                    </button>
                    <button
                      onClick={() => handleAddObjective(1)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah TP Sem 1
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {localSem1.map((tp, idx) => (
                    <div
                      key={tp.id}
                      className="p-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center gap-3 transition"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="w-6 text-center text-xs font-bold text-slate-400">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tp.code}
                          onChange={e => handleUpdateObjective(1, tp.id, 'code', e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                          placeholder="Kode"
                        />
                        <input
                          type="text"
                          value={tp.element}
                          onChange={e => handleUpdateObjective(1, tp.id, 'element', e.target.value)}
                          className="w-44 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700"
                          placeholder="Elemen"
                        />
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          value={tp.description}
                          onChange={e => handleUpdateObjective(1, tp.id, 'description', e.target.value)}
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
                          placeholder="Uraian Tujuan Pembelajaran / Lingkup Materi"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <div className="flex items-center gap-1 text-xs">
                          <input
                            type="number"
                            min="1"
                            max="72"
                            value={tp.jp}
                            onChange={e =>
                              handleUpdateObjective(1, tp.id, 'jp', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-14 px-2 py-1 bg-white border border-slate-200 rounded text-center text-xs font-bold text-blue-900"
                          />
                          <span className="font-semibold text-slate-600">JP</span>
                        </div>
                        <button
                          onClick={() => handleDeleteObjective(1, tp.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="Hapus TP"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semester 2 Section */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-lg uppercase">
                      Semester 2 (Genap)
                    </span>
                    <span className="text-xs text-slate-500">
                      Target: {sem2Eff} Minggu ({targetJpSem2} JP) • Terisi: <strong>{currentTotalJpSem2} JP</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAutoSyncHours(2)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition"
                      title="Ratakan JP antar TP agar total pas dengan minggu efektif"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Auto-Sync JP ({hpw} JP/Mgg)
                    </button>
                    <button
                      onClick={() => handleAddObjective(2)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah TP Sem 2
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {localSem2.map((tp, idx) => (
                    <div
                      key={tp.id}
                      className="p-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center gap-3 transition"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="w-6 text-center text-xs font-bold text-slate-400">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tp.code}
                          onChange={e => handleUpdateObjective(2, tp.id, 'code', e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                          placeholder="Kode"
                        />
                        <input
                          type="text"
                          value={tp.element}
                          onChange={e => handleUpdateObjective(2, tp.id, 'element', e.target.value)}
                          className="w-44 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700"
                          placeholder="Elemen"
                        />
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          value={tp.description}
                          onChange={e => handleUpdateObjective(2, tp.id, 'description', e.target.value)}
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
                          placeholder="Uraian Tujuan Pembelajaran / Lingkup Materi"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <div className="flex items-center gap-1 text-xs">
                          <input
                            type="number"
                            min="1"
                            max="72"
                            value={tp.jp}
                            onChange={e =>
                              handleUpdateObjective(2, tp.id, 'jp', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-14 px-2 py-1 bg-white border border-slate-200 rounded text-center text-xs font-bold text-emerald-900"
                          />
                          <span className="font-semibold text-slate-600">JP</span>
                        </div>
                        <button
                          onClick={() => handleDeleteObjective(2, tp.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="Hapus TP"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              Perubahan langsung tersinkronisasi ke dokumen <strong>PROMES</strong> & <strong>PROTA</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-200/60 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition"
            >
              Tutup
            </button>
            <button
              onClick={handleSaveEditor}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan & Sinkronkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

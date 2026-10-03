import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Download, FileUp, X, Sparkles } from 'lucide-react';
import { ParseKbmResult, ParseKaldikResult, parseJadwalKBM, parseKaldikExcel, downloadSampleKbmFile, downloadSampleKaldikFile } from '../services/excelParser';

interface UploadExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKbmParsed: (data: ParseKbmResult) => void;
  onKaldikParsed: (data: ParseKaldikResult) => void;
}

export const UploadExcelModal: React.FC<UploadExcelModalProps> = ({
  isOpen,
  onClose,
  onKbmParsed,
  onKaldikParsed,
}) => {
  const [activeUploadType, setActiveUploadType] = useState<'kbm' | 'kaldik'>('kbm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target;
    const file = inputElement.files?.[0];
    if (!file) return;

    // 1. Saat user memilih file, langsung baca dengan file.arrayBuffer() di dalam event handler
    let buffer: ArrayBuffer;
    try {
      buffer = await file.arrayBuffer();
    } catch (readErr: any) {
      console.error('Gagal membaca file buffer:', readErr);
      setErrorMessage(`Gagal membaca file: ${readErr.message || 'File tidak dapat diakses'}`);
      inputElement.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Segera reset input file agar tidak menahan referensi file descriptor di DOM
    inputElement.value = '';
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (activeUploadType === 'kbm') {
        // 2. Langsung jalankan parser (parseJadwalKBM) dan simpan HASIL PARSING-nya ke state, bukan File object-nya
        const result = await parseJadwalKBM(buffer);
        if (result.teachers.length === 0 && result.schedules.length === 0) {
          throw new Error('Tidak ditemukan data guru atau jadwal yang valid pada file. Pastikan terdapat sheet jadwal pelajaran dengan header Mapel dan Guru.');
        }
        onKbmParsed(result);
        setSuccessMessage(
          `Berhasil mengekstrak ${result.teachers.length} guru, ${result.subjects.length} mapel, ${result.stats.classesDetected.length} kelas, dan ${result.schedules.length} slot jadwal KBM.`
        );
      } else {
        const result = await parseKaldikExcel(buffer);
        onKaldikParsed(result);
        setSuccessMessage(
          `Berhasil memproses Kalender Pendidikan (${result.academicYear}). Minggu efektif Gasal: ${result.totalEffectiveSem1}, Genap: ${result.totalEffectiveSem2}. Terekstrak ${result.events.length} catatan agenda (*).`
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal memproses file Excel.');
    } finally {
      setIsProcessing(false);
      // 3. Setelah berhasil / selesai, pastikan input file selalu ter-reset
      if (inputElement) inputElement.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Upload & Auto-Parse File Excel
              </h2>
              <p className="text-xs text-slate-500">
                Otomatis membaca data tanpa perlu input manual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => {
                setActiveUploadType('kbm');
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeUploadType === 'kbm'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              1. Jadwal KBM (.xlsx)
            </button>
            <button
              onClick={() => {
                setActiveUploadType('kaldik');
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeUploadType === 'kaldik'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              2. KALDIK (.xlsx)
            </button>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-blue-50/40 hover:bg-blue-50/80 transition group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition transform">
              <FileUp className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {isProcessing
                ? 'Sedang Membaca & Mengekstrak Data...'
                : `Klik atau seret file ${activeUploadType === 'kbm' ? 'Jadwal KBM' : 'Kalender Pendidikan'} ke sini`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Mendukung format Microsoft Excel (.xlsx / .xls)
            </p>
          </div>

          {/* Feedback messages */}
          {successMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parser Intelligence Info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {activeUploadType === 'kbm' ? 'Parser Jadwal KBM Cerdas:' : 'Parser KALDIK Cerdas:'}
              </span>
            </div>
            {activeUploadType === 'kbm' ? (
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Mencari baris header <strong>"Hari"</strong>, <strong>"Jam/Waktu"</strong>, serta <strong>"Mapel"</strong> dan <strong>"Guru"</strong>.</li>
                <li>Setiap kata <strong>"Mapel"</strong> menjadi titik awal blok kelas (Mapel | Guru | Ruang).</li>
                <li>Nama kelas diambil dari baris di atasnya &amp; dinormalisasi (otomatis imbuhan X, XI, XII).</li>
                <li>Toleran terhadap pergeseran posisi kolom, gap kosong, dan perbedaan format antar sheet.</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Otomatis membaca sheet <strong>"per mgg efektif"</strong> untuk angka Minggu Efektif.</li>
                <li>Mengekstrak seluruh catatan yang diawali <strong>*</strong> menjadi agenda event resmi sekolah.</li>
                <li>Mendeteksi Tahun Pelajaran dan Beban Jam secara otomatis tanpa hardcode posisi.</li>
              </ul>
            )}
          </div>

          {/* Sample Download section */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Butuh file contoh untuk pengujian?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  downloadSampleKbmFile();
                }}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                <Download className="w-3.5 h-3.5" />
                Format KBM
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  downloadSampleKaldikFile();
                }}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                <Download className="w-3.5 h-3.5" />
                Format KALDIK
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

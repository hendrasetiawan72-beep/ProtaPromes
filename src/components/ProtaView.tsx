import React, { useState, useMemo } from 'react';
import { Download, Printer, Edit3, FileText, CheckCircle2, FileSpreadsheet, Sparkles, BookOpen } from 'lucide-react';
import { SchoolProfile, DocumentMeta, LearningObjective, MonthEffectiveBreakdown } from '../types';
import { KopSurat } from './KopSurat';
import { SignatureBlock } from './SignatureBlock';
import { MasterPromesProtaModal } from './MasterPromesProtaModal';
import { exportProtaDocx } from '../services/documentGenerator';
import { downloadMasterPromesProtaExcel } from '../services/masterPromesProtaService';

interface ProtaViewProps {
  school: SchoolProfile;
  meta: DocumentMeta;
  onUpdateMeta: (meta: DocumentMeta) => void;
  objectivesSem1: LearningObjective[];
  objectivesSem2: LearningObjective[];
  onUpdateObjectivesSem1: (objs: LearningObjective[]) => void;
  onUpdateObjectivesSem2: (objs: LearningObjective[]) => void;
  monthAnalysis: MonthEffectiveBreakdown[];
}

export const ProtaView: React.FC<ProtaViewProps> = ({
  school,
  meta,
  onUpdateMeta,
  objectivesSem1,
  objectivesSem2,
  onUpdateObjectivesSem1,
  onUpdateObjectivesSem2,
  monthAnalysis,
}) => {
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [currentOrientation, setCurrentOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const sem1Eff = monthAnalysis.filter(m => m.semester === 1).reduce((s, m) => s + m.effectiveWeeks, 0) || 19;
  const sem2Eff = monthAnalysis.filter(m => m.semester === 2).reduce((s, m) => s + m.effectiveWeeks, 0) || 18;
  const hpw = Number(meta.weeklyHours) || 4;

  const targetHoursSem1 = hpw * sem1Eff;
  const targetHoursSem2 = hpw * sem2Eff;
  const targetHoursYear = targetHoursSem1 + targetHoursSem2;

  // =========================================================================
  // OTOMASI PENUH JAM PROTA:
  // Alokasi jam masing-masing TP otomatis mengikuti data JP dari Edit Data Guru (hpw)
  // Jumlah jam Semester 1 = sem1Eff x hpw (misal 19 x 4 = 76 JP atau 19 x 5 = 95 JP)
  // Jumlah jam Semester 2 = sem2Eff x hpw (misal 18 x 4 = 72 JP atau 18 x 5 = 90 JP)
  // =========================================================================
  const automatedObjectivesSem1 = useMemo(() => {
    if (objectivesSem1.length === 0) return [];
    const baseWeeks = Math.max(1, Math.floor(sem1Eff / objectivesSem1.length));
    const remainder = sem1Eff % objectivesSem1.length;
    return objectivesSem1.map((tp, idx) => {
      const weeks = baseWeeks + (idx < remainder ? 1 : 0);
      return {
        ...tp,
        allocatedWeeks: weeks,
        calculatedJp: weeks * hpw,
      };
    });
  }, [objectivesSem1, sem1Eff, hpw]);

  const automatedObjectivesSem2 = useMemo(() => {
    if (objectivesSem2.length === 0) return [];
    const baseWeeks = Math.max(1, Math.floor(sem2Eff / objectivesSem2.length));
    const remainder = sem2Eff % objectivesSem2.length;
    return objectivesSem2.map((tp, idx) => {
      const weeks = baseWeeks + (idx < remainder ? 1 : 0);
      return {
        ...tp,
        allocatedWeeks: weeks,
        calculatedJp: weeks * hpw,
      };
    });
  }, [objectivesSem2, sem2Eff, hpw]);

  const totalJpSem1 = automatedObjectivesSem1.reduce((sum, tp) => sum + tp.calculatedJp, 0) || targetHoursSem1;
  const totalJpSem2 = automatedObjectivesSem2.reduce((sum, tp) => sum + tp.calculatedJp, 0) || targetHoursSem2;
  const totalJpYear = totalJpSem1 + totalJpSem2;

  const handleDownloadDocx = async () => {
    try {
      setIsExportingWord(true);
      await exportProtaDocx(school, meta, objectivesSem1, objectivesSem2, monthAnalysis);
    } catch (e) {
      console.error(e);
      alert('Gagal mendownload Word document.');
    } finally {
      setIsExportingWord(false);
    }
  };

  const handlePrint = (orientation: 'landscape' | 'portrait' = 'landscape') => {
    setCurrentOrientation(orientation);
    const existingStyle = document.getElementById('print-orientation-style');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement('style');
    style.id = 'print-orientation-style';
    
    if (orientation === 'landscape') {
      style.innerHTML = `
        @page {
          size: 330mm 210mm;
          margin: 8mm 10mm 8mm 10mm;
        }
        @media print {
          body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .prota-paper {
            max-width: none !important;
            width: 100% !important;
            padding: 0 !important;
          }
          .prota-table {
            width: 100% !important;
          }
        }
      `;
    } else {
      style.innerHTML = `
        @page {
          size: 210mm 330mm;
          margin: 12mm 15mm 12mm 15mm;
        }
        @media print {
          body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .prota-paper {
            max-width: none !important;
            width: 100% !important;
            padding: 0 !important;
          }
          .prota-table {
            width: 100% !important;
          }
        }
      `;
    }
    
    document.head.appendChild(style);
    window.print();
  };

  const defaultCp =
    'Pada akhir Fase F, peserta didik menggunakan teks lisan, tulisan dan visual dalam berkomunikasi sesuai situasi, tujuan, dan pemirsa/pembacanya. Pembelajaran difokuskan pada penguasaan kompetensi dasar dan kejuruan secara komprehensif, kritis, dan mandiri guna membekali lulusan SMK dengan keahlian kerja dan karakter luhur.';

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Master Promes-Prota Action Button */}
          <button
            onClick={() => setIsMasterModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition"
            title="Kelola Master TP, Elemen, dan Capaian Pembelajaran terintegrasi dengan PROMES"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Master TP, Elemen & CP (Upload/Download)
          </button>

          <button
            onClick={() => downloadMasterPromesProtaExcel(meta, objectivesSem1, objectivesSem2, monthAnalysis)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold rounded-xl border border-emerald-300 transition"
            title="Unduh file master kurikulum Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Unduh Master (.xlsx)
          </button>
        </div>

        {/* Dynamic Automation Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Otomasi JP Aktif:</span>
          <strong>{hpw} JP/Minggu</strong>
          <span className="text-slate-400">•</span>
          <span>Sem 1: {sem1Eff} Mgg ({targetHoursSem1} JP)</span>
          <span className="text-slate-400">•</span>
          <span>Sem 2: {sem2Eff} Mgg ({targetHoursSem2} JP)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingWord}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <FileText className="w-4 h-4" />
            {isExportingWord ? 'Menyiapkan Word...' : 'Download Word F4 (.docx)'}
          </button>

          {/* Cetak Landscape Button */}
          <button
            onClick={() => handlePrint('landscape')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
            title="Cetak format Landscape F4 (330 x 210 mm) - logo dan header rata tengah"
          >
            <Printer className="w-4 h-4" />
            Cetak F4 Landscape (PDF)
          </button>

          {/* Cetak Portrait Button */}
          <button
            onClick={() => handlePrint('portrait')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
            title="Cetak format Portrait F4 (210 x 330 mm)"
          >
            <Printer className="w-4 h-4" />
            Cetak Portrait (PDF)
          </button>
        </div>
      </div>

      {/* Main Document Paper */}
      <div className="prota-paper bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-5xl mx-auto print:max-w-none text-black font-sans">
        {/* Kop Surat Landscape / Portrait - Logo tetap di pinggir kiri & vertikal rata tengah */}
        <KopSurat school={school} isLandscape={currentOrientation === 'landscape'} />

        {/* Title */}
        <div className="text-center mt-5 mb-4 space-y-1">
          <h2 className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-black">
            PROGRAM TAHUNAN (PROTA)
          </h2>
          <p className="text-xs sm:text-sm font-semibold font-serif text-slate-800">
            TAHUN PELAJARAN {meta.academicYear}
          </p>
        </div>

        {/* Metadata info */}
        <div className="text-xs sm:text-sm font-sans mb-6 space-y-1 pb-2 border-b border-slate-200">
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-slate-800">Mata Pelajaran</span>
            <span>: {meta.subjectName}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-slate-800">Kelas / Fase</span>
            <span>: {meta.grade} / Fase F</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-slate-800">Nama Guru Pengampu</span>
            <span className="font-bold text-slate-900">: {meta.teacherName}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-slate-800">Bidang Keahlian</span>
            <span>: {meta.department || 'Semua Bidang Keahlian'}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-slate-800">Program Keahlian</span>
            <span>: {meta.expertiseProgram || 'Semua Program Keahlian'}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-semibold text-slate-800">Total Alokasi Waktu</span>
            <span>
              : <strong className="text-slate-900">{totalJpYear} JP</strong> ({totalJpSem1} JP Gasal + {totalJpSem2} JP Genap)
              <span className="ml-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 print:hidden">
                Otomatis {hpw} JP/Minggu
              </span>
            </span>
          </div>
        </div>

        {/* Section A: Capaian Pembelajaran (Terintegrasi dan dapat diubah) */}
        <div className="mb-6 space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide">
              A. CAPAIAN PEMBELAJARAN
            </h3>
            <button
              onClick={() => setIsMasterModalOpen(true)}
              className="print:hidden text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Ubah Capaian Pembelajaran
            </button>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed text-justify">
            {meta.capaianPembelajaran || defaultCp}
          </div>
        </div>

        {/* Section B: Distribution Table - All columns fully visible */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide">
              B. DISTRIBUSI ALOKASI WAKTU TUJUAN PEMBELAJARAN
            </h3>
            <span className="print:hidden text-[11px] text-slate-500">
              Otomatis sinkron dengan input jam di Edit Data Guru
            </span>
          </div>

          <div className="overflow-x-auto print:overflow-visible w-full">
            <table className="prota-table w-full border-collapse border border-black text-left text-xs sm:text-sm font-sans table-auto print:w-full">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-black text-center">
                  <th className="border border-black py-2 px-2 w-12 text-center">No</th>
                  <th className="border border-black py-2 px-3 w-44 sm:w-56 text-left">Elemen</th>
                  <th className="border border-black py-2 px-4 text-left">Tujuan Pembelajaran / Lingkup Materi</th>
                  <th className="border border-black py-2 px-2 w-32 text-center">Alokasi (JP)</th>
                </tr>
              </thead>
              <tbody>
                {/* Semester 1 Header */}
                <tr className="bg-slate-200 font-bold">
                  <td colSpan={4} className="border border-black py-1.5 px-3 uppercase text-slate-900">
                    SEMESTER 1 (GASAL) - {sem1Eff} MINGGU EFEKTIF ({totalJpSem1} JP)
                  </td>
                </tr>
                {automatedObjectivesSem1.map((tp, idx) => (
                  <tr key={tp.id} className="hover:bg-slate-50/50 break-inside-avoid">
                    <td className="border border-black py-1.5 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1.5 px-3 font-medium text-slate-800">{tp.element}</td>
                    <td className="border border-black py-1.5 px-4 leading-relaxed">
                      <span className="font-semibold text-slate-900">{tp.code}:</span> {tp.description}
                    </td>
                    <td className="border border-black py-1.5 px-2 text-center font-bold text-slate-900">
                      {tp.calculatedJp} JP
                      <span className="block text-[10px] text-slate-500 font-normal">
                        ({tp.allocatedWeeks} Minggu @ {hpw} JP)
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={3} className="border border-black py-1.5 px-4 text-right">
                    JUMLAH JP SEMESTER 1 (GASAL):
                  </td>
                  <td className="border border-black py-1.5 px-2 text-center text-blue-900 font-bold text-sm">
                    {totalJpSem1} JP
                  </td>
                </tr>

                {/* Semester 2 Header */}
                <tr className="bg-slate-200 font-bold">
                  <td colSpan={4} className="border border-black py-1.5 px-3 uppercase text-slate-900">
                    SEMESTER 2 (GENAP) - {sem2Eff} MINGGU EFEKTIF ({totalJpSem2} JP)
                  </td>
                </tr>
                {automatedObjectivesSem2.map((tp, idx) => (
                  <tr key={tp.id} className="hover:bg-slate-50/50 break-inside-avoid">
                    <td className="border border-black py-1.5 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1.5 px-3 font-medium text-slate-800">{tp.element}</td>
                    <td className="border border-black py-1.5 px-4 leading-relaxed">
                      <span className="font-semibold text-slate-900">{tp.code}:</span> {tp.description}
                    </td>
                    <td className="border border-black py-1.5 px-2 text-center font-bold text-slate-900">
                      {tp.calculatedJp} JP
                      <span className="block text-[10px] text-slate-500 font-normal">
                        ({tp.allocatedWeeks} Minggu @ {hpw} JP)
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={3} className="border border-black py-1.5 px-4 text-right">
                    JUMLAH JP SEMESTER 2 (GENAP):
                  </td>
                  <td className="border border-black py-1.5 px-2 text-center text-blue-900 font-bold text-sm">
                    {totalJpSem2} JP
                  </td>
                </tr>

                {/* Grand Total */}
                <tr className="bg-slate-300 font-extrabold border-t-2 border-black">
                  <td colSpan={3} className="border border-black py-2 px-4 text-right uppercase">
                    TOTAL ALOKASI WAKTU 1 TAHUN PELAJARAN:
                  </td>
                  <td className="border border-black py-2 px-2 text-center text-base text-slate-950 font-black">
                    {totalJpYear} JP
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Blank Signature Block (Centered & NBM) */}
        <SignatureBlock school={school} meta={meta} />
      </div>

      {/* Integrated Master Promes-Prota Modal */}
      <MasterPromesProtaModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        meta={meta}
        onUpdateMeta={onUpdateMeta}
        objectivesSem1={objectivesSem1}
        objectivesSem2={objectivesSem2}
        onUpdateObjectivesSem1={onUpdateObjectivesSem1}
        onUpdateObjectivesSem2={onUpdateObjectivesSem2}
        monthAnalysis={monthAnalysis}
      />
    </div>
  );
};

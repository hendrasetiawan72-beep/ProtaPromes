import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Edit3,
  FileText,
  FileSpreadsheet,
  Sparkles,
  CalendarCheck,
  Eye,
  Columns,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { SchoolProfile, DocumentMeta, LearningObjective, MonthEffectiveBreakdown, KaldikEvent } from '../types';
import { KopSurat } from './KopSurat';
import { SignatureBlock } from './SignatureBlock';
import { MasterPromesProtaModal } from './MasterPromesProtaModal';
import { exportProtaDocx, exportProtaExcel, getKaldikWeekActivity } from '../services/documentGenerator';
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
  events?: KaldikEvent[];
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
  events = [],
}) => {
  const [viewFilter, setViewFilter] = useState<'all' | 'sem1' | 'sem2' | 'summary'>('all');
  const [screenViewMode, setScreenViewMode] = useState<'scroll' | 'fit'>('scroll');
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [currentOrientation, setCurrentOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const sem1Months = useMemo(() => monthAnalysis.filter(m => m.semester === 1), [monthAnalysis]);
  const sem2Months = useMemo(() => monthAnalysis.filter(m => m.semester === 2), [monthAnalysis]);

  const displayedMonths = useMemo(() => {
    if (viewFilter === 'sem1') return sem1Months;
    if (viewFilter === 'sem2') return sem2Months;
    if (viewFilter === 'all') return [...sem1Months, ...sem2Months];
    return [];
  }, [viewFilter, sem1Months, sem2Months]);

  const sem1Eff = sem1Months.reduce((s, m) => s + m.effectiveWeeks, 0) || 17;
  const sem2Eff = sem2Months.reduce((s, m) => s + m.effectiveWeeks, 0) || 10;
  const sem1Days = sem1Months.reduce((s, m) => s + (m.effectiveDays || 0), 0) || 101;
  const sem2Days = sem2Months.reduce((s, m) => s + (m.effectiveDays || 0), 0) || 61;
  const totalDaysYear = sem1Days + sem2Days;

  const hpw = Number(meta.weeklyHours) || 4;
  const targetHoursSem1 = hpw * sem1Eff;
  const targetHoursSem2 = hpw * sem2Eff;
  const targetHoursYear = targetHoursSem1 + targetHoursSem2;

  const totalColsWeeks = displayedMonths.reduce((acc, m) => acc + m.totalWeeks, 0);

  // Helper activity lookup
  const getActivity = (monthName: string, week: number, semester: 1 | 2) => {
    return getKaldikWeekActivity(monthName, week, semester === 1, events);
  };

  // Pre-calculate effective weeks lists for automatic distribution
  const sem1EffKeys = useMemo(() => {
    const keys: string[] = [];
    sem1Months.forEach(m => {
      for (let w = 1; w <= m.totalWeeks; w++) {
        if (!getActivity(m.monthName, w, 1)) {
          keys.push(`${m.monthName}_${w}`);
        }
      }
    });
    return keys;
  }, [sem1Months, events]);

  const sem2EffKeys = useMemo(() => {
    const keys: string[] = [];
    sem2Months.forEach(m => {
      for (let w = 1; w <= m.totalWeeks; w++) {
        if (!getActivity(m.monthName, w, 2)) {
          keys.push(`${m.monthName}_${w}`);
        }
      }
    });
    return keys;
  }, [sem2Months, events]);

  // Automated distribution for Sem 1
  const { automatedObjectivesSem1, weeklyAllocSem1 } = useMemo(() => {
    const alloc: Record<string, Record<string, number>> = {};
    if (objectivesSem1.length === 0) return { automatedObjectivesSem1: [], weeklyAllocSem1: alloc };

    objectivesSem1.forEach(tp => { alloc[tp.id] = {}; });
    const totalEff = sem1EffKeys.length;
    const baseWeeks = Math.max(1, Math.floor(totalEff / objectivesSem1.length));
    const remainder = totalEff % objectivesSem1.length;

    let wIdx = 0;
    const mapped = objectivesSem1.map((tp, idx) => {
      const weeks = baseWeeks + (idx < remainder ? 1 : 0);
      for (let k = 0; k < weeks && wIdx < totalEff; k++) {
        alloc[tp.id][sem1EffKeys[wIdx]] = hpw;
        wIdx++;
      }
      return {
        ...tp,
        allocatedWeeks: weeks,
        calculatedJp: weeks * hpw,
      };
    });

    return { automatedObjectivesSem1: mapped, weeklyAllocSem1: alloc };
  }, [objectivesSem1, sem1EffKeys, hpw]);

  // Automated distribution for Sem 2
  const { automatedObjectivesSem2, weeklyAllocSem2 } = useMemo(() => {
    const alloc: Record<string, Record<string, number>> = {};
    if (objectivesSem2.length === 0) return { automatedObjectivesSem2: [], weeklyAllocSem2: alloc };

    objectivesSem2.forEach(tp => { alloc[tp.id] = {}; });
    const totalEff = sem2EffKeys.length;
    const baseWeeks = Math.max(1, Math.floor(totalEff / objectivesSem2.length));
    const remainder = totalEff % objectivesSem2.length;

    let wIdx = 0;
    const mapped = objectivesSem2.map((tp, idx) => {
      const weeks = baseWeeks + (idx < remainder ? 1 : 0);
      for (let k = 0; k < weeks && wIdx < totalEff; k++) {
        alloc[tp.id][sem2EffKeys[wIdx]] = hpw;
        wIdx++;
      }
      return {
        ...tp,
        allocatedWeeks: weeks,
        calculatedJp: weeks * hpw,
      };
    });

    return { automatedObjectivesSem2: mapped, weeklyAllocSem2: alloc };
  }, [objectivesSem2, sem2EffKeys, hpw]);

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

  const handleDownloadExcelMatriks = async () => {
    try {
      setIsExportingExcel(true);
      await exportProtaExcel(school, meta, objectivesSem1, objectivesSem2, monthAnalysis, events);
    } catch (e) {
      console.error(e);
      alert('Gagal mengekspor file Excel Matriks PROTA.');
    } finally {
      setIsExportingExcel(false);
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
          margin: 6mm 8mm 6mm 8mm;
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
            table-layout: fixed;
          }
        }
      `;
    } else {
      style.innerHTML = `
        @page {
          size: 210mm 330mm;
          margin: 10mm 12mm 10mm 12mm;
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
      {/* Top Filter and Actions Bar */}
      <div className="print:hidden bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* View Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Matriks 1 Tahun (12 Bulan)
          </button>
          <button
            onClick={() => setViewFilter('sem1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewFilter === 'sem1'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Matriks Sem 1 (Gasal)
          </button>
          <button
            onClick={() => setViewFilter('sem2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewFilter === 'sem2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Matriks Sem 2 (Genap)
          </button>
          <button
            onClick={() => setViewFilter('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewFilter === 'summary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Format Ringkas
          </button>
        </div>

        {/* Dynamic Automation Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Otomasi Kaldik Aktif:</span>
          <strong>{hpw} JP/Minggu</strong>
          <span className="text-slate-400">•</span>
          <span>Sem 1: {sem1Eff} Mgg ({targetHoursSem1} JP | {sem1Days} Hari Putih)</span>
          <span className="text-slate-400">•</span>
          <span>Sem 2: {sem2Eff} Mgg ({targetHoursSem2} JP | {sem2Days} Hari Putih)</span>
        </div>

        {/* Actions & Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {viewFilter !== 'summary' && (
            <button
              onClick={() => setScreenViewMode(screenViewMode === 'scroll' ? 'fit' : 'scroll')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-300 transition"
              title="Ubah mode tampilan antara scroll horizontal atau pas layar"
            >
              {screenViewMode === 'scroll' ? <Eye className="w-3.5 h-3.5" /> : <Columns className="w-3.5 h-3.5" />}
              {screenViewMode === 'scroll' ? 'Mode Pas Layar' : 'Mode Scroll Lebar'}
            </button>
          )}

          <button
            onClick={handleDownloadExcelMatriks}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            title="Download Program Tahunan format Excel lengkap dengan pewarnaan Kaldik"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isExportingExcel ? 'Menyiapkan Excel...' : 'Excel Matriks PROTA (.xlsx)'}
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={isExportingWord}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <FileText className="w-4 h-4" />
            {isExportingWord ? 'Menyiapkan Word...' : 'Word F4 (.docx)'}
          </button>

          <button
            onClick={() => handlePrint('landscape')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            title="Cetak format Landscape F4 (330 x 210 mm) - logo dan header rata tengah"
          >
            <Printer className="w-4 h-4" />
            Cetak F4 (PDF)
          </button>

          <button
            onClick={() => setIsMasterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition"
            title="Kelola Master TP, Elemen, dan Capaian Pembelajaran"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Master TP & CP
          </button>
        </div>
      </div>

      {/* Visual Rule / Alignment Notice Box */}
      <div className="print:hidden bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-blue-950">
        <div className="flex items-start gap-2.5">
          <CalendarCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-900">Sinkronisasi Penuh Kaldik SMK Bawang:</span> Kolom bulan dan minggu telah disesuaikan (Juli 5 mgg, Des 5 mgg, Apr 5 mgg). Pewarnaan agenda ujian (<strong>Tes Sumatif PSTS/PSAS/PSAT</strong>, <strong>Tes UN/ANBK</strong>, <strong>Tes TKA & UKK</strong>, dan <strong>Libur</strong>) otomatis mengikuti Kalender Pendidikan. Hari efektif hanya dihitung pada kolom sheet warna putih.
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-bold text-blue-900 shadow-2xs">
          <span>Total: {targetHoursYear} JP</span>
          <span className="text-slate-300">•</span>
          <span>{sem1Eff + sem2Eff} Minggu</span>
          <span className="text-slate-300">•</span>
          <span>{totalDaysYear} Hari Putih</span>
        </div>
      </div>

      {/* Main Document Paper */}
      <div className="prota-paper bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 w-full print:max-w-none overflow-hidden print:overflow-visible text-black font-sans">
        {/* Kop Surat Landscape / Portrait */}
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
        <div className="text-xs sm:text-sm font-sans mb-5 pb-3 border-b border-slate-200">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-1.5 text-left print:grid-cols-2 print:text-[8pt]">
            <div className="space-y-1">
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-semibold text-slate-700">Mata Pelajaran</span>
                <span className="font-bold text-slate-900">: {meta.subjectName}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-semibold text-slate-700">Kelas / Fase</span>
                <span>: {meta.grade} / Fase F</span>
              </div>
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-semibold text-slate-700">Nama Guru Pengampu</span>
                <span className="font-bold text-slate-900">: {meta.teacherName}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-semibold text-slate-700">Bidang Keahlian</span>
                <span>: {meta.department || 'Semua Bidang Keahlian'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-semibold text-slate-700">Program Keahlian</span>
                <span>: {meta.expertiseProgram || 'Semua Program Keahlian'}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-semibold text-slate-700">Kurikulum</span>
                <span>: {meta.curriculum || 'Kurikulum Merdeka'}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-semibold text-slate-700">Alokasi Waktu Mapel</span>
                <span>: <strong className="text-slate-900">{hpw} JP/Minggu</strong></span>
              </div>
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-semibold text-slate-700">Total Jam Pertemuan</span>
                <span>
                  : <strong className="text-slate-950 font-bold">{totalJpYear} JP</strong> ({totalJpSem1} JP Gasal + {totalJpSem2} JP Genap)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section A: Capaian Pembelajaran */}
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

        {/* Color Legend for Kaldik Matrix */}
        {viewFilter !== 'summary' && (
          <div className="mb-4 p-3 bg-slate-50/80 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
              <span>Panduan Warna Kalender Pendidikan &amp; Agenda di PROTA:</span>
              <span className="text-[10px] text-slate-500 font-normal">Sinkron dengan sheet Kaldik</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 text-[10px] print:text-[6.5pt]">
              <div className="p-1 rounded border border-slate-300 bg-white flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs border border-slate-400 bg-white shrink-0"></span>
                <span className="font-bold text-slate-800 truncate">Hari/Mgg Putih ({hpw} JP)</span>
              </div>
              <div className="p-1 rounded border border-rose-300 bg-rose-100 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500 shrink-0"></span>
                <span className="font-bold text-rose-950 truncate">Tes Sumatif / PSTS</span>
              </div>
              <div className="p-1 rounded border border-cyan-300 bg-cyan-100 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-cyan-500 shrink-0"></span>
                <span className="font-bold text-cyan-950 truncate">Tes UN / ANBK</span>
              </div>
              <div className="p-1 rounded border border-purple-300 bg-purple-100 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-purple-500 shrink-0"></span>
                <span className="font-bold text-purple-950 truncate">Tes TKA / UKK</span>
              </div>
              <div className="p-1 rounded border border-indigo-300 bg-indigo-100 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-500 shrink-0"></span>
                <span className="font-bold text-indigo-950 truncate">PSAS / PSAT</span>
              </div>
              <div className="p-1 rounded border border-blue-300 bg-blue-100 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-500 shrink-0"></span>
                <span className="font-bold text-blue-950 truncate">Tes PSAJ (Ujian)</span>
              </div>
              <div className="p-1 rounded border border-emerald-300 bg-emerald-100 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 shrink-0"></span>
                <span className="font-bold text-emerald-950 truncate">MPLS Siswa</span>
              </div>
              <div className="p-1 rounded border border-amber-300 bg-amber-100 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500 shrink-0"></span>
                <span className="font-bold text-amber-950 truncate">Libur Semester/Hari H</span>
              </div>
            </div>
          </div>
        )}

        {/* Section B: Distribution Table */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide">
              B. DISTRIBUSI ALOKASI WAKTU PROGRAM TAHUNAN ({viewFilter === 'summary' ? 'FORMAT RINGKAS' : 'MATRIKS BULANAN KALDIK'})
            </h3>
            <span className="print:hidden text-[11px] text-slate-500">
              {viewFilter === 'all' && 'Menampilkan 12 Bulan Penuh (Gasal & Genap)'}
              {viewFilter === 'sem1' && 'Menampilkan Semester 1 (Gasal: Juli - Desember)'}
              {viewFilter === 'sem2' && 'Menampilkan Semester 2 (Genap: Januari - Juni)'}
              {viewFilter === 'summary' && 'Menampilkan Rekapitulasi Alokasi JP per TP'}
            </span>
          </div>

          {/* MATRIKS VIEW (Full 1 Year / Sem 1 / Sem 2) */}
          {viewFilter !== 'summary' ? (
            <div className={`w-full ${screenViewMode === 'scroll' ? 'overflow-x-auto' : 'overflow-x-visible'} print:overflow-visible pb-2 print:pb-0`}>
              <table className={`prota-table w-full text-[11px] print:text-[6.5pt] border-collapse border border-black text-center font-sans ${
                screenViewMode === 'scroll' ? 'min-w-[1000px]' : 'min-w-0'
              } print:min-w-0 print:w-full print:table-fixed`}>
                {/* Colgroup */}
                <colgroup>
                  <col className="w-8 print:w-[3%]" />
                  <col className="w-28 sm:w-32 print:w-[15%]" />
                  <col className="w-60 sm:w-72 print:w-[25%]" />
                  <col className="w-12 print:w-[5%]" />
                  {displayedMonths.map(m =>
                    Array.from({ length: m.totalWeeks }, (_, i) => (
                      <col key={`col_${m.monthName}_${i + 1}`} className="print:w-auto" />
                    ))
                  )}
                </colgroup>

                <thead>
                  {/* Header Row 1 */}
                  <tr className="bg-slate-100 font-bold border-b border-black">
                    <th rowSpan={2} className="border border-black p-1 text-center uppercase">No</th>
                    <th rowSpan={2} className="border border-black p-1 text-left uppercase">Elemen</th>
                    <th rowSpan={2} className="border border-black p-1.5 text-left uppercase">Tujuan Pembelajaran / Lingkup Materi</th>
                    <th rowSpan={2} className="border border-black p-1 text-center uppercase">JP</th>
                    <th colSpan={totalColsWeeks} className="border border-black py-1 px-2 text-center uppercase bg-slate-200 font-bold text-slate-900">
                      SEBARAN BULAN DAN MINGGU (SESUAI KALENDER PENDIDIKAN)
                    </th>
                  </tr>
                  {/* Header Row 2: Months */}
                  <tr className="bg-slate-100 font-bold border-b border-black">
                    {displayedMonths.map(m => (
                      <th
                        key={m.monthName}
                        colSpan={m.totalWeeks}
                        className="border border-black py-1 px-0.5 text-center uppercase font-bold text-slate-900 truncate print:text-[6.5pt]"
                      >
                        {m.monthName.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                  {/* Header Row 3: Week Numbers */}
                  <tr className="bg-slate-50 font-semibold border-b border-black text-[10px] print:text-[6pt]">
                    <th className="border border-black"></th>
                    <th className="border border-black"></th>
                    <th className="border border-black"></th>
                    <th className="border border-black"></th>
                    {displayedMonths.map(m =>
                      Array.from({ length: m.totalWeeks }, (_, i) => (
                        <th
                          key={`${m.monthName}_w${i + 1}`}
                          className="border border-black py-0.5 text-center font-mono"
                        >
                          {i + 1}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>

                <tbody>
                  {/* ================= SEMESTER 1 SECTION ================= */}
                  {(viewFilter === 'all' || viewFilter === 'sem1') && (
                    <>
                      <tr className="bg-slate-200 font-bold border-y border-black">
                        <td colSpan={4 + totalColsWeeks} className="border border-black py-1.5 px-3 uppercase text-left text-slate-900">
                          SEMESTER 1 (GASAL) - {sem1Eff} MINGGU EFEKTIF ({totalJpSem1} JP | {sem1Days} HARI EFEKTIF PUTIH)
                        </td>
                      </tr>

                      {automatedObjectivesSem1.map((tp, idx) => (
                        <tr key={tp.id} className="hover:bg-slate-50/50 break-inside-avoid">
                          <td className="border border-black py-1 px-1 text-center font-medium">{idx + 1}</td>
                          <td className="border border-black py-1 px-2 text-left font-medium text-slate-800 break-words">{tp.element}</td>
                          <td className="border border-black py-1 px-2.5 text-left leading-relaxed break-words">
                            <span className="font-bold text-slate-900">{tp.code}:</span> {tp.description}
                          </td>
                          <td className="border border-black py-1 px-1 text-center font-bold text-slate-900 whitespace-nowrap">
                            {tp.calculatedJp} JP
                          </td>

                          {/* Month and Week columns */}
                          {displayedMonths.map(m =>
                            Array.from({ length: m.totalWeeks }, (_, wIdx) => {
                              const weekNum = wIdx + 1;
                              const isGasalMonth = m.semester === 1;
                              const special = getActivity(m.monthName, weekNum, m.semester);
                              const key = `${m.monthName}_${weekNum}`;

                              if (special) {
                                return (
                                  <td
                                    key={key}
                                    className={`border border-black p-0 relative ${special.twColor}`}
                                    title={`${special.text} (${m.monthName} M${weekNum})`}
                                  >
                                    <div className="w-full h-10 print:h-8 flex items-center justify-center overflow-hidden p-0.5">
                                      <span className="transform -rotate-90 origin-center whitespace-nowrap uppercase tracking-wider font-black text-[7px] print:text-[4.5pt] select-none leading-none">
                                        {special.badge}
                                      </span>
                                    </div>
                                  </td>
                                );
                              }

                              // Effective teaching cell
                              const allocated = isGasalMonth ? weeklyAllocSem1[tp.id]?.[key] : null;

                              return (
                                <td
                                  key={key}
                                  className="border border-black text-center font-extrabold text-blue-900 p-0.5 bg-white"
                                >
                                  {allocated ? (
                                    <span className="inline-block text-blue-950 font-black text-xs print:text-[7pt] leading-none">
                                      {allocated}
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                </td>
                              );
                            })
                          )}
                        </tr>
                      ))}

                      {/* Subtotal Sem 1 */}
                      <tr className="bg-slate-100 font-bold border-y border-black">
                        <td colSpan={3} className="border border-black py-1 px-3 text-right">
                          JUMLAH JP SEMESTER 1 (GASAL):
                        </td>
                        <td className="border border-black py-1 px-1 text-center font-black text-blue-900 text-xs">
                          {totalJpSem1} JP
                        </td>
                        {displayedMonths.map(m =>
                          Array.from({ length: m.totalWeeks }, (_, wIdx) => {
                            const weekNum = wIdx + 1;
                            const isGasalMonth = m.semester === 1;
                            const special = getActivity(m.monthName, weekNum, m.semester);
                            const key = `${m.monthName}_${weekNum}`;

                            if (special) {
                              return <td key={`sub1_${key}`} className="border border-black bg-slate-200"></td>;
                            }

                            const weekSum = isGasalMonth
                              ? automatedObjectivesSem1.reduce((sum, tp) => sum + (weeklyAllocSem1[tp.id]?.[key] || 0), 0)
                              : 0;

                            return (
                              <td key={`sub1_${key}`} className="border border-black text-center font-bold text-slate-900 text-[10px] print:text-[6pt]">
                                {weekSum > 0 ? weekSum : ''}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    </>
                  )}

                  {/* ================= SEMESTER 2 SECTION ================= */}
                  {(viewFilter === 'all' || viewFilter === 'sem2') && (
                    <>
                      <tr className="bg-slate-200 font-bold border-y border-black">
                        <td colSpan={4 + totalColsWeeks} className="border border-black py-1.5 px-3 uppercase text-left text-slate-900">
                          SEMESTER 2 (GENAP) - {sem2Eff} MINGGU EFEKTIF ({totalJpSem2} JP | {sem2Days} HARI EFEKTIF PUTIH)
                        </td>
                      </tr>

                      {automatedObjectivesSem2.map((tp, idx) => (
                        <tr key={tp.id} className="hover:bg-slate-50/50 break-inside-avoid">
                          <td className="border border-black py-1 px-1 text-center font-medium">{idx + 1}</td>
                          <td className="border border-black py-1 px-2 text-left font-medium text-slate-800 break-words">{tp.element}</td>
                          <td className="border border-black py-1 px-2.5 text-left leading-relaxed break-words">
                            <span className="font-bold text-slate-900">{tp.code}:</span> {tp.description}
                          </td>
                          <td className="border border-black py-1 px-1 text-center font-bold text-slate-900 whitespace-nowrap">
                            {tp.calculatedJp} JP
                          </td>

                          {/* Month and Week columns */}
                          {displayedMonths.map(m =>
                            Array.from({ length: m.totalWeeks }, (_, wIdx) => {
                              const weekNum = wIdx + 1;
                              const isGenapMonth = m.semester === 2;
                              const special = getActivity(m.monthName, weekNum, m.semester);
                              const key = `${m.monthName}_${weekNum}`;

                              if (special) {
                                return (
                                  <td
                                    key={key}
                                    className={`border border-black p-0 relative ${special.twColor}`}
                                    title={`${special.text} (${m.monthName} M${weekNum})`}
                                  >
                                    <div className="w-full h-10 print:h-8 flex items-center justify-center overflow-hidden p-0.5">
                                      <span className="transform -rotate-90 origin-center whitespace-nowrap uppercase tracking-wider font-black text-[7px] print:text-[4.5pt] select-none leading-none">
                                        {special.badge}
                                      </span>
                                    </div>
                                  </td>
                                );
                              }

                              // Effective teaching cell
                              const allocated = isGenapMonth ? weeklyAllocSem2[tp.id]?.[key] : null;

                              return (
                                <td
                                  key={key}
                                  className="border border-black text-center font-extrabold text-blue-900 p-0.5 bg-white"
                                >
                                  {allocated ? (
                                    <span className="inline-block text-blue-950 font-black text-xs print:text-[7pt] leading-none">
                                      {allocated}
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                </td>
                              );
                            })
                          )}
                        </tr>
                      ))}

                      {/* Subtotal Sem 2 */}
                      <tr className="bg-slate-100 font-bold border-y border-black">
                        <td colSpan={3} className="border border-black py-1 px-3 text-right">
                          JUMLAH JP SEMESTER 2 (GENAP):
                        </td>
                        <td className="border border-black py-1 px-1 text-center font-black text-blue-900 text-xs">
                          {totalJpSem2} JP
                        </td>
                        {displayedMonths.map(m =>
                          Array.from({ length: m.totalWeeks }, (_, wIdx) => {
                            const weekNum = wIdx + 1;
                            const isGenapMonth = m.semester === 2;
                            const special = getActivity(m.monthName, weekNum, m.semester);
                            const key = `${m.monthName}_${weekNum}`;

                            if (special) {
                              return <td key={`sub2_${key}`} className="border border-black bg-slate-200"></td>;
                            }

                            const weekSum = isGenapMonth
                              ? automatedObjectivesSem2.reduce((sum, tp) => sum + (weeklyAllocSem2[tp.id]?.[key] || 0), 0)
                              : 0;

                            return (
                              <td key={`sub2_${key}`} className="border border-black text-center font-bold text-slate-900 text-[10px] print:text-[6pt]">
                                {weekSum > 0 ? weekSum : ''}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    </>
                  )}

                  {/* ================= GRAND TOTAL ROW ================= */}
                  <tr className="bg-slate-300 font-extrabold border-t-2 border-black">
                    <td colSpan={3} className="border border-black py-2 px-3 text-right uppercase">
                      TOTAL ALOKASI WAKTU 1 TAHUN PELAJARAN:
                    </td>
                    <td className="border border-black py-2 px-1 text-center text-sm font-black text-slate-950">
                      {totalJpYear} JP
                    </td>
                    <td colSpan={totalColsWeeks} className="border border-black py-2 px-2 text-center text-[11px] font-bold text-slate-800">
                      Sinkron: {sem1Eff + sem2Eff} Minggu Efektif ({hpw} JP/Minggu) | {totalDaysYear} Hari Efektif Belajar (Putih)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* FORMAT RINGKAS (Summary Table) */
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
                      SEMESTER 1 (GASAL) - {sem1Eff} MINGGU EFEKTIF ({totalJpSem1} JP | {sem1Days} HARI PUTIH)
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
                      SEMESTER 2 (GENAP) - {sem2Eff} MINGGU EFEKTIF ({totalJpSem2} JP | {sem2Days} HARI PUTIH)
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
          )}
        </div>

        {/* Official Blank Signature Block */}
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

import React, { useState, useMemo } from 'react';
import { Download, Printer, Edit3, Sparkles, Eye, Columns, FileSpreadsheet, CalendarCheck } from 'lucide-react';
import { SchoolProfile, DocumentMeta, LearningObjective, MonthEffectiveBreakdown, KaldikEvent } from '../types';
import { KopSurat } from './KopSurat';
import { SignatureBlock } from './SignatureBlock';
import { TujuanPembelajaranModal } from './TujuanPembelajaranModal';
import { MasterPromesProtaModal } from './MasterPromesProtaModal';
import { exportPromesExcel } from '../services/documentGenerator';
import { downloadMasterPromesProtaExcel } from '../services/masterPromesProtaService';

interface PromesViewProps {
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

export const PromesView: React.FC<PromesViewProps> = ({
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
  const [activeSemester, setActiveSemester] = useState<1 | 2>(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [screenViewMode, setScreenViewMode] = useState<'fit' | 'scroll'>('scroll');

  const isGasal = activeSemester === 1;
  const currentObjectives = isGasal ? objectivesSem1 : objectivesSem2;
  const months = isGasal 
    ? monthAnalysis.filter(m => m.semester === 1) 
    : monthAnalysis.filter(m => m.semester === 2);

  const semEffWeeks = months.reduce((sum, m) => sum + m.effectiveWeeks, 0);
  // Jam per minggu secara dinamis membaca langsung dari input Edit Data Guru (meta.weeklyHours)
  const hoursPerWeek = Number(meta.weeklyHours) || 4;
  const totalTargetHours = hoursPerWeek * semEffWeeks;

  const totalWeeks = months.reduce((acc, m) => acc + m.totalWeeks, 0);
  const totalNonEffWeeks = months.reduce((acc, m) => acc + m.nonEffectiveWeeks, 0);

  // Kolom width percentages yang pas agar tidak melebihi 100% dan tidak ada teks terpotong
  const tpColPercent = 25;
  const jpColPercent = 6;
  const remainingPercent = 100 - tpColPercent - jpColPercent; // 69%
  const weekColPercent = totalWeeks > 0 ? (remainingPercent / totalWeeks).toFixed(2) : '2.5';

  // Pemetaan minggu tidak efektif yang terintegrasi 100% dengan Kalender Pendidikan
  // Menjamin jumlah minggu efektif dan non-efektif per bulan SANGAT TEPAT sesuai Kaldik
  const nonEffectiveWeekMap = useMemo(() => {
    const map: Record<string, { set: Set<number>; details: Record<number, { text: string; badge: string; color: string }> }> = {};

    months.forEach(m => {
      const monthLower = m.monthName.toLowerCase();
      const targetNonEff = Math.min(m.totalWeeks, Math.max(0, m.nonEffectiveWeeks));
      const set = new Set<number>();
      const details: Record<number, { text: string; badge: string; color: string }> = {};

      if (targetNonEff === 0) {
        map[m.monthName] = { set, details };
        return;
      }

      // Jika seluruh minggu di bulan ini tidak efektif
      if (m.effectiveWeeks === 0 || targetNonEff >= m.totalWeeks) {
        for (let w = 1; w <= m.totalWeeks; w++) {
          set.add(w);
        }
      } else {
        // Posisi default minggu non-efektif sesuai standar Kalender Pendidikan SMK Bawang
        const preferredWeeks: number[] = [];
        if (isGasal) {
          if (monthLower === 'juli') preferredWeeks.push(1, 2, 3);
          else if (monthLower === 'agustus') preferredWeeks.push(3);
          else if (monthLower === 'september') preferredWeeks.push(1);
          else if (monthLower === 'oktober') preferredWeeks.push(5);
          else if (monthLower === 'november') preferredWeeks.push(4);
          else if (monthLower === 'desember') preferredWeeks.push(1, 2, 3, 4, 5);
        } else {
          if (monthLower === 'januari') preferredWeeks.push(1);
          else if (monthLower === 'februari') preferredWeeks.push(2);
          else if (monthLower === 'maret') preferredWeeks.push(1, 3, 4);
          else if (monthLower === 'april') preferredWeeks.push(1, 3, 4, 5);
          else if (monthLower === 'mei') preferredWeeks.push(1, 2, 3, 4);
          else if (monthLower === 'juni') preferredWeeks.push(1, 2, 3, 4);
        }

        // Gabungkan nomor minggu dari Kaldik events jika ada
        if (events && events.length > 0) {
          const monthEvents = events.filter(ev => ev.monthName.toLowerCase() === monthLower);
          monthEvents.forEach(ev => {
            if (ev.weekNumber && ev.weekNumber >= 1 && ev.weekNumber <= m.totalWeeks && !preferredWeeks.includes(ev.weekNumber)) {
              preferredWeeks.push(ev.weekNumber);
            }
          });
        }

        // Ambil minggu dari prioritas hingga memenuhi targetNonEff
        for (const w of preferredWeeks) {
          if (set.size < targetNonEff && w <= m.totalWeeks) {
            set.add(w);
          }
        }

        // Jika masih kurang, tambahkan dari minggu akhir bulan
        for (let w = m.totalWeeks; w >= 1 && set.size < targetNonEff; w--) {
          set.add(w);
        }
      }

      // Pasang keterangan badge dan warna untuk tiap minggu non-efektif
      set.forEach(w => {
        const matchingEvent = events?.find(ev => ev.monthName.toLowerCase() === monthLower && ev.weekNumber === w);
        let badge = 'NON-EFEKTIF';
        let color = 'bg-slate-200 text-slate-800 border-slate-300';
        let text = matchingEvent?.name || m.notes?.join(', ') || 'Kegiatan Khusus / Non-KBM';

        const checkStr = (matchingEvent?.name || text).toLowerCase();

        if (checkStr.includes('mpls')) {
          badge = 'MPLS';
          color = 'bg-emerald-100 text-emerald-900 border-emerald-300';
        } else if (checkStr.includes('anbk') || checkStr.includes('asesmen')) {
          badge = 'ANBK';
          color = 'bg-cyan-100 text-cyan-900 border-cyan-300';
        } else if (checkStr.includes('psts') || checkStr.includes('tengah semester')) {
          badge = 'PSTS';
          color = 'bg-rose-200 text-rose-950 border-rose-400';
        } else if (checkStr.includes('psas')) {
          badge = 'PSAS';
          color = 'bg-indigo-100 text-indigo-900 border-indigo-300';
        } else if (checkStr.includes('psat') || checkStr.includes('akhir tahun')) {
          badge = 'PSAT';
          color = 'bg-indigo-100 text-indigo-900 border-indigo-300';
        } else if (checkStr.includes('psaj')) {
          badge = 'PSAJ';
          color = 'bg-blue-100 text-blue-900 border-blue-300';
        } else if (checkStr.includes('ukk')) {
          badge = 'UKK';
          color = 'bg-purple-100 text-purple-900 border-purple-300';
        } else if (checkStr.includes('remedial') || checkStr.includes('susulan') || checkStr.includes('meeting')) {
          badge = 'REMEDIAL';
          color = 'bg-sky-100 text-sky-900 border-sky-300';
        } else if (checkStr.includes('rapor')) {
          badge = 'RAPOR';
          color = 'bg-teal-100 text-teal-900 border-teal-300';
        } else if (checkStr.includes('wisuda') || checkStr.includes('kelulusan') || checkStr.includes('lulus')) {
          badge = 'WISUDA';
          color = 'bg-amber-100 text-amber-900 border-amber-300';
        } else if (checkStr.includes('libur') || checkStr.includes('idul')) {
          badge = 'LIBUR';
          color = 'bg-amber-100 text-amber-900 border-amber-300';
        } else if (isGasal) {
          if (monthLower === 'juli') {
            if (w <= 2) { badge = 'LIBUR'; color = 'bg-amber-100 text-amber-900 border-amber-300'; text = 'Libur Semester Genap'; }
            else { badge = 'MPLS'; color = 'bg-emerald-100 text-emerald-900 border-emerald-300'; text = 'Masa Pengenalan Lingkungan Sekolah'; }
          } else if (monthLower === 'agustus') {
            badge = 'ANBK'; color = 'bg-cyan-100 text-cyan-900 border-cyan-300'; text = 'Asesmen Nasional (ANBK)';
          } else if (monthLower === 'september') {
            badge = 'PSTS'; color = 'bg-rose-200 text-rose-950 border-rose-400'; text = 'Penilaian Sumatif Tengah Semester';
          } else if (monthLower === 'desember') {
            if (w === 1) { badge = 'PSAS'; color = 'bg-indigo-100 text-indigo-900 border-indigo-300'; text = 'Penilaian Sumatif Akhir Semester'; }
            else if (w === 2) { badge = 'REMEDIAL'; color = 'bg-sky-100 text-sky-900 border-sky-300'; text = 'Ujian Susulan & Remedial'; }
            else if (w === 3) { badge = 'RAPOR'; color = 'bg-teal-100 text-teal-900 border-teal-300'; text = 'Penyerahan Buku Rapor'; }
            else { badge = 'LIBUR'; color = 'bg-amber-100 text-amber-900 border-amber-300'; text = 'Libur Akhir Semester Gasal'; }
          }
        } else {
          if (monthLower === 'maret') {
            if (w === 1) { badge = 'PSTS'; color = 'bg-rose-200 text-rose-950 border-rose-400'; text = 'PSTS Genap'; }
            else { badge = 'LIBUR'; color = 'bg-amber-100 text-amber-900 border-amber-300'; text = 'Libur Hari Raya Idul Fitri'; }
          } else if (monthLower === 'april') {
            if (w === 1) { badge = 'PSAJ'; color = 'bg-blue-100 text-blue-900 border-blue-300'; text = 'PSAJ Kelas XII'; }
            else { badge = 'UKK'; color = 'bg-purple-100 text-purple-900 border-purple-300'; text = 'Uji Kompetensi Keahlian'; }
          } else if (monthLower === 'mei') {
            if (w === 1) { badge = 'LULUS'; color = 'bg-amber-100 text-amber-900 border-amber-300'; text = 'Pengumuman Kelulusan'; }
            else if (w === 2) { badge = 'WISUDA'; color = 'bg-amber-100 text-amber-900 border-amber-300'; text = 'Wisuda Siswa'; }
            else { badge = 'LIBUR'; color = 'bg-amber-100 text-amber-900 border-amber-300'; text = 'Hari Libur Nasional'; }
          } else if (monthLower === 'juni') {
            if (w === 1) { badge = 'PSAT'; color = 'bg-indigo-100 text-indigo-900 border-indigo-300'; text = 'Penilaian Sumatif Akhir Tahun'; }
            else if (w === 2) { badge = 'RAPOR'; color = 'bg-teal-100 text-teal-900 border-teal-300'; text = 'Remedial & Pembagian Rapor'; }
            else { badge = 'LIBUR'; color = 'bg-amber-100 text-amber-900 border-amber-300'; text = 'Libur Akhir Tahun Pelajaran'; }
          }
        }

        details[w] = { text, badge, color };
      });

      map[m.monthName] = { set, details };
    });

    return map;
  }, [months, isGasal, events]);

  const getSpecialActivity = (monthName: string, week: number) => {
    const data = nonEffectiveWeekMap[monthName];
    if (!data || !data.set.has(week)) return null;
    return data.details[week] || { text: 'Kegiatan Non-Efektif', badge: 'NON-EFEKTIF', color: 'bg-slate-200 text-slate-800 border-slate-300' };
  };

  // Daftar urut seluruh minggu efektif dalam semester ini (langsung sinkron dengan Kaldik)
  const effectiveWeekKeys = useMemo(() => {
    const keys: string[] = [];
    months.forEach(m => {
      for (let w = 1; w <= m.totalWeeks; w++) {
        const special = getSpecialActivity(m.monthName, w);
        if (!special) {
          keys.push(`${m.monthName}_${w}`);
        }
      }
    });
    return keys;
  }, [months, nonEffectiveWeekMap]);

  // Otomasi Penuh: Menghitung pembagian minggu efektif
  // Setiap kolom minggu efektif otomatis terisi angka sesuai input Edit Data Guru (hoursPerWeek: 4 -> 4, 5 -> 5)
  const dynamicWeeklyAllocation = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    if (currentObjectives.length === 0 || effectiveWeekKeys.length === 0) return map;

    currentObjectives.forEach(tp => {
      map[tp.id] = {};
    });

    const totalEff = effectiveWeekKeys.length;
    // Tentukan jumlah minggu untuk masing-masing TP
    const weeksPerTp = currentObjectives.map(tp => {
      const rawWeeks = Math.round((tp.jp || (hoursPerWeek * 3)) / hoursPerWeek);
      return Math.max(1, rawWeeks);
    });

    let sumWeeks = weeksPerTp.reduce((a, b) => a + b, 0);
    while (sumWeeks < totalEff) {
      weeksPerTp[weeksPerTp.length - 1]++;
      sumWeeks++;
    }
    while (sumWeeks > totalEff && weeksPerTp.length > 0) {
      let maxIdx = 0;
      for (let i = 1; i < weeksPerTp.length; i++) {
        if (weeksPerTp[i] > weeksPerTp[maxIdx]) maxIdx = i;
      }
      if (weeksPerTp[maxIdx] > 1) {
        weeksPerTp[maxIdx]--;
        sumWeeks--;
      } else {
        break;
      }
    }

    let currentWeekIdx = 0;
    currentObjectives.forEach((tp, tpIdx) => {
      const weeksForThis = weeksPerTp[tpIdx] || 1;
      for (let i = 0; i < weeksForThis && currentWeekIdx < totalEff; i++) {
        const weekKey = effectiveWeekKeys[currentWeekIdx];
        map[tp.id][weekKey] = hoursPerWeek; // Nilai pasti mengikuti meta.weeklyHours
        currentWeekIdx++;
      }
    });

    while (currentWeekIdx < totalEff && currentObjectives.length > 0) {
      const lastTp = currentObjectives[currentObjectives.length - 1];
      const weekKey = effectiveWeekKeys[currentWeekIdx];
      map[lastTp.id][weekKey] = hoursPerWeek;
      currentWeekIdx++;
    }

    return map;
  }, [currentObjectives, effectiveWeekKeys, hoursPerWeek]);

  const handleDownloadExcel = () => {
    exportPromesExcel(school, meta, objectivesSem1, objectivesSem2, monthAnalysis);
  };

  const handlePrintLandscape = (paper: 'f4' | 'auto' = 'f4') => {
    const existingStyle = document.getElementById('print-orientation-style');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement('style');
    style.id = 'print-orientation-style';
    
    // Konfigurasi cetak landscape F4 atau standar dengan kop dan logo rata tengah
    if (paper === 'f4') {
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
          .promes-paper {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
          }
          .promes-table {
            table-layout: fixed !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `;
    } else {
      style.innerHTML = `
        @page {
          size: landscape;
          margin: 6mm 8mm 6mm 8mm;
        }
        @media print {
          body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .promes-paper {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
          }
          .promes-table {
            table-layout: fixed !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `;
    }
    document.head.appendChild(style);

    window.print();
  };

  const handleAutoDistributeHours = () => {
    const targetObjs = (isGasal ? [...objectivesSem1] : [...objectivesSem2]).map(tp => {
      const alloc = dynamicWeeklyAllocation[tp.id] || {};
      const newJp = Object.values(alloc).reduce((sum, h) => sum + h, 0) || (hoursPerWeek * 3);
      return {
        ...tp,
        jp: newJp,
        weeklyAllocation: { ...alloc }
      };
    });

    if (isGasal) onUpdateObjectivesSem1(targetObjs);
    else onUpdateObjectivesSem2(targetObjs);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Semester Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSemester(1)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
              activeSemester === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SEM GASAL (Semester 1)
          </button>
          <button
            onClick={() => setActiveSemester(2)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
              activeSemester === 2
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SEM GENAP (Semester 2)
          </button>
        </div>

        {/* Dynamic Calculation badge showing weeklyHours x effectiveWeeks & Kaldik sync */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <span className="font-medium">Total Jam Sem {activeSemester}:</span>
            <strong className="font-bold">{hoursPerWeek} JP × {semEffWeeks} Mgg = {totalTargetHours} JP</strong>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kaldik: <strong>{totalWeeks} Mgg</strong> ({semEffWeeks} Efektif, {totalNonEffWeeks} Khusus)</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Master Promes-Prota Action Button */}
          <button
            onClick={() => setIsMasterModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition"
            title="Kelola Master TP, Elemen, dan Capaian Pembelajaran terintegrasi dengan PROTA"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Master TP, Elemen & CP (Upload/Download)
          </button>

          <button
            onClick={() => downloadMasterPromesProtaExcel(meta, objectivesSem1, objectivesSem2, monthAnalysis)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold rounded-xl border border-indigo-200 transition"
            title="Unduh file master kurikulum Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Unduh Master (.xlsx)
          </button>

          {/* View mode toggle on screen */}
          <button
            onClick={() => setScreenViewMode(screenViewMode === 'scroll' ? 'fit' : 'scroll')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl border border-slate-300 transition"
            title="Ubah mode tampilan layar antara scroll horizontal atau pas layar"
          >
            {screenViewMode === 'scroll' ? <Eye className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
            {screenViewMode === 'scroll' ? 'Mode Pas Layar' : 'Mode Scroll Lebar'}
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <Edit3 className="w-4 h-4" />
            Edit Manual TP ({currentObjectives.length})
          </button>

          <button
            onClick={handleAutoDistributeHours}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl border border-slate-300 transition"
            title="Simpan alokasi jam mingguan ini ke data TP"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Plot Otomatis ({hoursPerWeek} JP)
          </button>

          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            Excel F4 (.xlsx)
          </button>

          <div className="inline-flex items-center rounded-xl shadow-xs overflow-hidden border border-slate-700">
            <button
              onClick={() => handlePrintLandscape('f4')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold transition"
              title="Cetak format F4 Landscape (330 x 210 mm) - logo dan header rata tengah"
            >
              <Printer className="w-4 h-4" />
              Cetak F4 Landscape (PDF)
            </button>
            <button
              onClick={() => handlePrintLandscape('auto')}
              className="px-2 py-2 bg-slate-900 hover:bg-black text-slate-300 hover:text-white text-xs font-mono border-l border-slate-700 transition"
              title="Cetak mode Landscape Otomatis (A4/Standar)"
            >
              Auto
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Paper (Landscape format - all columns strictly visible and never hidden) */}
      <div className="promes-paper bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 w-full print:max-w-none overflow-hidden print:overflow-visible text-black font-sans">
        {/* Kop Surat Landscape: Logo Rata Tengah di Header */}
        <KopSurat school={school} isLandscape={true} />

        {/* Title (Rata Tengah) */}
        <div className="text-center mt-5 mb-4 space-y-1">
          <h2 className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-black">
            PROGRAM SEMESTER ({isGasal ? 'GANJIL' : 'GENAP'})
          </h2>
          <p className="text-xs sm:text-sm font-semibold font-serif text-slate-800">
            TAHUN PELAJARAN {meta.academicYear}
          </p>
        </div>

        {/* Metadata info: Rata Tengah dan Seimbang (Tanpa NIP setelah nama guru) */}
        <div className="text-xs sm:text-sm font-sans mb-5 pb-3 border-b border-slate-200">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-1.5 print:grid-cols-2 print:text-[8pt] text-left">
            <div className="space-y-1">
              <div className="grid grid-cols-[130px_1fr]">
                <span className="font-semibold text-slate-700">Bidang Keahlian</span>
                <span>: {meta.department || 'Semua Bidang Keahlian'}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr]">
                <span className="font-semibold text-slate-700">Program Keahlian</span>
                <span>: {meta.expertiseProgram || 'Semua Program Keahlian'}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr]">
                <span className="font-semibold text-slate-700">Kurikulum</span>
                <span>: {meta.curriculum}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr]">
                <span className="font-semibold text-slate-700">Mata Pelajaran</span>
                <span className="font-bold text-slate-900">: {meta.subjectName}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-[130px_1fr]">
                <span className="font-semibold text-slate-700">Kelas / Semester</span>
                <span>: {meta.grade} / {isGasal ? '1 (Gasal)' : '2 (Genap)'}</span>
              </div>
              {/* Identitas Guru: Hapus NIP setelah nama */}
              <div className="grid grid-cols-[130px_1fr]">
                <span className="font-semibold text-slate-700">Guru Pengampu</span>
                <span className="font-bold text-slate-900">: {meta.teacherName}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr]">
                <span className="font-semibold text-slate-700">Tahun Pelajaran</span>
                <span>: {meta.academicYear}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr]">
                <span className="font-semibold text-slate-700">Jml. Jam Mapel</span>
                <span>: <strong className="text-slate-900">{hoursPerWeek} JP/Minggu</strong> (Total: {totalTargetHours} JP)</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROMES Grid Table - Layout Rapi, Teks Tidak Menabrak Garis, Angka Mengikuti JP Input */}
        <div className={`w-full ${screenViewMode === 'scroll' ? 'overflow-x-auto' : 'overflow-x-visible'} print:overflow-visible pb-2 print:pb-0`}>
          <table className={`promes-table w-full text-[11px] print:text-[7pt] border-collapse border border-black text-center select-none font-sans ${
            screenViewMode === 'scroll' ? 'min-w-[950px]' : 'min-w-0'
          } print:min-w-0 print:w-full print:table-fixed`}>
            {/* Pembagian Lebar Kolom yang Presisi */}
            <colgroup>
              <col style={{ width: screenViewMode === 'fit' ? '25%' : undefined }} className="w-[26%] print:w-[25%]" />
              <col style={{ width: screenViewMode === 'fit' ? '6%' : undefined }} className="w-14 print:w-[6%]" />
              {months.map(m =>
                Array.from({ length: m.totalWeeks }, (_, i) => (
                  <col
                    key={`col_${m.monthName}_${i + 1}`}
                    style={{ width: `${weekColPercent}%` }}
                    className="print:w-auto"
                  />
                ))
              )}
            </colgroup>

            <thead>
              {/* Row 1: Header Level 1 */}
              <tr className="bg-slate-50 font-bold border-b border-black">
                <th rowSpan={2} className="border border-black p-2 print:p-1 text-center uppercase tracking-tight">
                  TUJUAN PEMBELAJARAN
                </th>
                <th rowSpan={2} className="border border-black p-1 print:p-0.5 text-center uppercase whitespace-normal leading-tight text-[10px] print:text-[6.5pt]">
                  ALOKASI WAKTU
                </th>
                <th
                  colSpan={totalWeeks}
                  className="border border-black py-1 px-2 print:py-0.5 text-center uppercase bg-slate-100 font-bold"
                >
                  BULAN DAN MINGGU
                </th>
              </tr>
              {/* Row 2: Months Header */}
              <tr className="bg-slate-100 font-bold border-b border-black">
                {months.map(m => (
                  <th
                    key={m.monthName}
                    colSpan={m.totalWeeks}
                    className="border border-black py-1 px-1 print:py-0.5 text-center uppercase font-bold text-slate-900 print:text-[7pt] truncate"
                  >
                    {m.monthName.toUpperCase()}
                  </th>
                ))}
              </tr>
              {/* Row 3: Week Numbers (1, 2, 3, 4, 5) */}
              <tr className="bg-slate-50 font-semibold border-b border-black text-[10px] print:text-[6.5pt]">
                <th className="border border-black"></th>
                <th className="border border-black"></th>
                {months.map(m =>
                  Array.from({ length: m.totalWeeks }, (_, i) => (
                    <th
                      key={`${m.monthName}_w${i + 1}`}
                      className="border border-black py-0.5 print:py-0 text-center font-mono"
                    >
                      {i + 1}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {currentObjectives.map((tp) => {
                // Alokasi total JP TP ini otomatis mengikuti jumlah minggu teralokasi x hoursPerWeek
                const tpTotalHours = Object.values(dynamicWeeklyAllocation[tp.id] || {}).reduce((a, b) => a + b, 0) || (hoursPerWeek * 3);

                return (
                  <tr key={tp.id} className="hover:bg-slate-50/50 break-inside-avoid">
                    {/* Kolom Tujuan Pembelajaran dengan proteksi padding agar tidak menabrak garis */}
                    <td className="border border-black py-1.5 px-2.5 print:py-1 print:px-1.5 text-left leading-relaxed print:leading-tight break-words overflow-hidden text-xs print:text-[6.5pt]">
                      <span className="font-bold text-slate-900">{tp.code}</span> - {tp.description}
                    </td>
                    <td className="border border-black py-1.5 px-1 print:py-0.5 font-bold text-center whitespace-nowrap print:whitespace-normal text-xs print:text-[6.5pt]">
                      {tpTotalHours} JP
                    </td>

                    {/* Kolom-kolom Minggu: Mengikuti nilai hoursPerWeek yang terinput di halaman Edit Data Guru */}
                    {months.map(m =>
                      Array.from({ length: m.totalWeeks }, (_, wIdx) => {
                        const weekNum = wIdx + 1;
                        const special = getSpecialActivity(m.monthName, weekNum);
                        const key = `${m.monthName}_${weekNum}`;

                        if (special) {
                          return (
                            <td
                              key={key}
                              className={`border border-black p-0 relative ${special.color}`}
                              title={special.text}
                            >
                              <div className="w-full h-12 print:h-10 flex items-center justify-center overflow-hidden p-0.5">
                                <span className="transform -rotate-90 origin-center whitespace-nowrap uppercase tracking-wider font-black text-[7.5px] print:text-[5pt] select-none leading-none">
                                  {special.badge}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        // Angka minggu efektif secara konsisten mengikuti JP yang diinput guru (4 -> 4, 5 -> 5)
                        const allocatedHours = dynamicWeeklyAllocation[tp.id]?.[key];

                        return (
                          <td key={key} className="border border-black text-center font-extrabold text-blue-900 p-0.5 print:p-0">
                            {allocatedHours ? (
                              <span className="inline-block text-blue-950 font-black print:text-[8pt] text-xs sm:text-sm leading-none">
                                {allocatedHours}
                              </span>
                            ) : (
                              ''
                            )}
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Blank Signature Block: Rata Tengah (Center Aligned) dengan NBM */}
        <SignatureBlock school={school} meta={meta} />
      </div>

      {/* Manual TP Edit Modal */}
      <TujuanPembelajaranModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        semester={activeSemester}
        objectives={currentObjectives}
        onSave={updated => {
          if (isGasal) onUpdateObjectivesSem1(updated);
          else onUpdateObjectivesSem2(updated);
        }}
        subjectName={meta.subjectName}
      />

      {/* Integrated Master Promes-Prota Modal (Upload, Download & Sync) */}
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

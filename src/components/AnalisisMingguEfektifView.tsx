import React, { useState } from 'react';
import { Download, Printer, Settings2 } from 'lucide-react';
import { SchoolProfile, DocumentMeta, MonthEffectiveBreakdown } from '../types';
import { KopSurat } from './KopSurat';
import { SignatureBlock } from './SignatureBlock';
import { exportAnalisisMingguEfektifExcel } from '../services/documentGenerator';

interface AnalisisMingguEfektifViewProps {
  school: SchoolProfile;
  meta: DocumentMeta;
  onUpdateMeta: (meta: DocumentMeta) => void;
  monthAnalysis: MonthEffectiveBreakdown[];
  onUpdateMonthAnalysis: (data: MonthEffectiveBreakdown[]) => void;
}

export const AnalisisMingguEfektifView: React.FC<AnalisisMingguEfektifViewProps> = ({
  school,
  meta,
  onUpdateMeta,
  monthAnalysis,
  onUpdateMonthAnalysis,
}) => {
  const [isEditingData, setIsEditingData] = useState(false);

  const sem1 = monthAnalysis.filter(m => m.semester === 1);
  const sem2 = monthAnalysis.filter(m => m.semester === 2);

  const totalWeeksSem1 = sem1.reduce((sum, m) => sum + m.totalWeeks, 0);
  const nonEffSem1 = sem1.reduce((sum, m) => sum + m.nonEffectiveWeeks, 0);
  const effSem1 = sem1.reduce((sum, m) => sum + m.effectiveWeeks, 0);

  const totalWeeksSem2 = sem2.reduce((sum, m) => sum + m.totalWeeks, 0);
  const nonEffSem2 = sem2.reduce((sum, m) => sum + m.nonEffectiveWeeks, 0);
  const effSem2 = sem2.reduce((sum, m) => sum + m.effectiveWeeks, 0);

  const totalNonEffYear = nonEffSem1 + nonEffSem2;
  const totalEffYear = effSem1 + effSem2;

  // Formula: Jam per minggu x Minggu efektif
  const hoursSem1 = meta.weeklyHours * effSem1;
  const hoursSem2 = meta.weeklyHours * effSem2;

  const handleCellChange = (monthName: string, field: 'totalWeeks' | 'nonEffectiveWeeks', value: number) => {
    const updated = monthAnalysis.map(m => {
      if (m.monthName === monthName) {
        const total = field === 'totalWeeks' ? value : m.totalWeeks;
        const nonEff = field === 'nonEffectiveWeeks' ? value : m.nonEffectiveWeeks;
        return {
          ...m,
          [field]: value,
          effectiveWeeks: Math.max(0, total - nonEff)
        };
      }
      return m;
    });
    onUpdateMonthAnalysis(updated);
  };

  const handlePrint = (orientation: 'portrait' | 'landscape' = 'portrait') => {
    const existingStyle = document.getElementById('print-orientation-style');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement('style');
    style.id = 'print-orientation-style';
    if (orientation === 'landscape') {
      style.innerHTML = `@page { size: 330mm 210mm; margin: 10mm 12mm; }`;
    } else {
      style.innerHTML = `@page { size: 210mm 330mm; margin: 12mm 15mm; }`;
    }
    document.head.appendChild(style);

    window.print();
  };

  const handleDownloadExcel = () => {
    exportAnalisisMingguEfektifExcel(school, meta, monthAnalysis);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jam/Mgg:</span>
            <input
              type="number"
              min="1"
              max="24"
              value={meta.weeklyHours}
              onChange={e => onUpdateMeta({ ...meta, weeklyHours: parseInt(e.target.value, 10) || 1 })}
              className="w-16 px-2.5 py-1 text-sm font-bold border border-slate-200 rounded-lg text-center bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelas:</span>
            <span className="px-3 py-1 bg-slate-100 font-bold rounded-lg text-xs text-slate-800">
              Kelas {meta.grade}
            </span>
          </div>

          <button
            onClick={() => setIsEditingData(!isEditingData)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              isEditingData 
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            {isEditingData ? 'Selesai Edit Tabel' : 'Kustomisasi Jumlah Minggu'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            Download Excel (.xlsx)
          </button>
          <button
            onClick={() => handlePrint('portrait')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            Cetak F4 Portrait (PDF)
          </button>
        </div>
      </div>

      {/* Main Document Paper Preview (F4 Portrait ready) */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto text-black">
        {/* Kop Surat */}
        <KopSurat school={school} />

        {/* Title */}
        <div className="text-center mt-5 mb-4">
          <h2 className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-black">
            PERHITUNGAN MINGGU EFEKTIF
          </h2>
        </div>

        {/* Metadata info */}
        <div className="text-xs sm:text-sm font-sans mb-4 space-y-1">
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-medium text-slate-800">Mata Diklat</span>
            <span>: {meta.subjectName}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-medium text-slate-800">Kelas / Semester</span>
            <span>: {meta.grade}/Ganjil & Genap</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-medium text-slate-800">Program Keahlian</span>
            <span>: {meta.expertiseProgram || 'Semua Program Keahlian'}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-medium text-slate-800">Tahun</span>
            <span>: {meta.academicYear}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-medium text-slate-800">Jam per Minggu</span>
            <span>: {meta.weeklyHours}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr]">
            <span className="font-medium text-slate-800">Guru Pengampu</span>
            <span className="font-bold text-slate-900">: {meta.teacherName}</span>
          </div>
        </div>

        {/* Table matching Screenshot 2 */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-xs sm:text-sm border-collapse border border-black text-center font-sans">
            <thead>
              <tr className="bg-slate-50 font-bold border-b border-black">
                <th className="border border-black py-2 px-2 w-12">No</th>
                <th className="border border-black py-2 px-4 text-left">Bulan</th>
                <th className="border border-black py-2 px-2 w-32">Jumlah Minggu</th>
                <th className="border border-black py-2 px-2 w-36">Minggu Tidak Efektif</th>
                <th className="border border-black py-2 px-2 w-32">Minggu Efektif</th>
              </tr>
            </thead>
            <tbody>
              {/* Semester 1 */}
              {sem1.map((item, idx) => (
                <tr key={item.monthName} className="hover:bg-slate-50/50">
                  <td className="border border-black py-1.5 px-2">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="border border-black py-1.5 px-4 text-left font-medium">
                    {item.monthName}
                  </td>
                  <td className="border border-black py-1.5 px-2">
                    {isEditingData ? (
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={item.totalWeeks}
                        onChange={e => handleCellChange(item.monthName, 'totalWeeks', parseInt(e.target.value, 10) || 0)}
                        className="w-12 text-center border border-slate-300 rounded"
                      />
                    ) : (
                      item.totalWeeks
                    )}
                  </td>
                  <td className="border border-black py-1.5 px-2">
                    {isEditingData ? (
                      <input
                        type="number"
                        min="0"
                        max="6"
                        value={item.nonEffectiveWeeks}
                        onChange={e => handleCellChange(item.monthName, 'nonEffectiveWeeks', parseInt(e.target.value, 10) || 0)}
                        className="w-12 text-center border border-slate-300 rounded"
                      />
                    ) : (
                      item.nonEffectiveWeeks
                    )}
                  </td>
                  <td className="border border-black py-1.5 px-2 font-semibold">
                    {item.effectiveWeeks}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold border-t-2 border-black">
                <td colSpan={2} className="border border-black py-1.5 px-4 text-center">
                  JUMLAH
                </td>
                <td className="border border-black py-1.5 px-2">{totalWeeksSem1}</td>
                <td className="border border-black py-1.5 px-2">{nonEffSem1}</td>
                <td className="border border-black py-1.5 px-2">{effSem1}</td>
              </tr>

              {/* Semester 2 */}
              {sem2.map((item, idx) => (
                <tr key={item.monthName} className="hover:bg-slate-50/50">
                  <td className="border border-black py-1.5 px-2">{String(sem1.length + idx + 1).padStart(2, '0')}</td>
                  <td className="border border-black py-1.5 px-4 text-left font-medium">
                    {item.monthName}
                  </td>
                  <td className="border border-black py-1.5 px-2">
                    {isEditingData ? (
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={item.totalWeeks}
                        onChange={e => handleCellChange(item.monthName, 'totalWeeks', parseInt(e.target.value, 10) || 0)}
                        className="w-12 text-center border border-slate-300 rounded"
                      />
                    ) : (
                      item.totalWeeks
                    )}
                  </td>
                  <td className="border border-black py-1.5 px-2">
                    {isEditingData ? (
                      <input
                        type="number"
                        min="0"
                        max="6"
                        value={item.nonEffectiveWeeks}
                        onChange={e => handleCellChange(item.monthName, 'nonEffectiveWeeks', parseInt(e.target.value, 10) || 0)}
                        className="w-12 text-center border border-slate-300 rounded"
                      />
                    ) : (
                      item.nonEffectiveWeeks
                    )}
                  </td>
                  <td className="border border-black py-1.5 px-2 font-semibold">
                    {item.effectiveWeeks}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold border-t-2 border-black">
                <td colSpan={2} className="border border-black py-1.5 px-4 text-center">
                  JUMLAH
                </td>
                <td className="border border-black py-1.5 px-2">{totalWeeksSem2}</td>
                <td className="border border-black py-1.5 px-2">{nonEffSem2}</td>
                <td className="border border-black py-1.5 px-2">{effSem2}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary text */}
        <div className="mt-4 text-xs sm:text-sm font-sans space-y-1">
          <p>
            Jumlah Minggu Tidak Efektif dalam satu tahun adalah{' '}
            <strong className="font-semibold underline decoration-slate-400">{totalNonEffYear} minggu</strong>
          </p>
          <p>
            Jumlah Minggu Efektif dalam satu tahun adalah{' '}
            <strong className="font-semibold underline decoration-slate-400">{totalEffYear} minggu</strong>
          </p>
          <div className="pt-2 space-y-0.5">
            <p>
              Jumlah jam pertemuan semester 1 = {meta.weeklyHours} jam x {effSem1} Minggu efektif ={' '}
              <strong>{hoursSem1} jam</strong>
            </p>
            <p>
              Jumlah jam pertemuan semester 2 = {meta.weeklyHours} jam x {effSem2} Minggu efektif ={' '}
              <strong>{hoursSem2} jam</strong>
            </p>
          </div>
        </div>

        {/* Official Blank Signature Block (No mock graphics/stamps, empty for physical signing) */}
        <SignatureBlock school={school} meta={meta} />
      </div>
    </div>
  );
};

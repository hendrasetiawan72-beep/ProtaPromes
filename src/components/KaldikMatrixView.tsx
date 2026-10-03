import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { MonthEffectiveBreakdown, KaldikEvent, SchoolProfile } from '../types';
import { KopSurat } from './KopSurat';

interface KaldikMatrixViewProps {
  school: SchoolProfile;
  monthAnalysis: MonthEffectiveBreakdown[];
  events: KaldikEvent[];
  academicYear: string;
}

export const KaldikMatrixView: React.FC<KaldikMatrixViewProps> = ({
  school,
  monthAnalysis,
  events,
  academicYear,
}) => {
  const sem1 = monthAnalysis.filter(m => m.semester === 1);
  const sem2 = monthAnalysis.filter(m => m.semester === 2);

  const totalEffSem1 = sem1.reduce((sum, m) => sum + m.effectiveWeeks, 0);
  const totalEffSem2 = sem2.reduce((sum, m) => sum + m.effectiveWeeks, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalEffSem1} Minggu</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Efektif Semester 1 (Gasal)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalEffSem2} Minggu</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Efektif Semester 2 (Genap)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalEffSem1 + totalEffSem2} Minggu</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Minggu Efektif 1 Tahun
            </div>
          </div>
        </div>
      </div>

      {/* Main KALDIK Summary Table Paper */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 font-sans">
        <KopSurat school={school} />

        <div className="text-center mt-5 mb-6">
          <h2 className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-black">
            KALENDER PENDIDIKAN DAN ANALISIS MINGGU EFEKTIF
          </h2>
          <p className="text-xs sm:text-sm font-semibold font-serif text-slate-800">
            TAHUN PELAJARAN {academicYear}
          </p>
        </div>

        {/* 2 Semester Grid Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Semester 1 */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-blue-600 text-white px-4 py-2.5 font-bold text-sm flex items-center justify-between">
              <span>SEMESTER 1 (GASAL)</span>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full">
                {totalEffSem1} Minggu Efektif
              </span>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-2 px-3">Bulan</th>
                  <th className="py-2 px-2 text-center">Jml Mgg</th>
                  <th className="py-2 px-2 text-center text-rose-600">Tdk Efektif</th>
                  <th className="py-2 px-2 text-center text-emerald-700">Efektif</th>
                  <th className="py-2 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sem1.map(m => (
                  <tr key={m.monthName} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-900">{m.monthName}</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-700">{m.totalWeeks}</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">{m.nonEffectiveWeeks}</td>
                    <td className="py-2 px-2 text-center font-black text-emerald-700">{m.effectiveWeeks}</td>
                    <td className="py-2 px-3 text-[11px] text-slate-500">
                      {m.notes.join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Semester 2 */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-indigo-600 text-white px-4 py-2.5 font-bold text-sm flex items-center justify-between">
              <span>SEMESTER 2 (GENAP)</span>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full">
                {totalEffSem2} Minggu Efektif
              </span>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-2 px-3">Bulan</th>
                  <th className="py-2 px-2 text-center">Jml Mgg</th>
                  <th className="py-2 px-2 text-center text-rose-600">Tdk Efektif</th>
                  <th className="py-2 px-2 text-center text-emerald-700">Efektif</th>
                  <th className="py-2 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sem2.map(m => (
                  <tr key={m.monthName} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-900">{m.monthName}</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-700">{m.totalWeeks}</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">{m.nonEffectiveWeeks}</td>
                    <td className="py-2 px-2 text-center font-black text-emerald-700">{m.effectiveWeeks}</td>
                    <td className="py-2 px-3 text-[11px] text-slate-500">
                      {m.notes.join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend / Keterangan Event KALDIK matching Screenshot 7 */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Daftar Agenda & Kegiatan Penting KALDIK {academicYear}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            {events.map(ev => (
              <div
                key={ev.id}
                className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 flex items-start gap-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5"></div>
                <div>
                  <div className="font-semibold text-slate-900">{ev.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{ev.dateRange}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

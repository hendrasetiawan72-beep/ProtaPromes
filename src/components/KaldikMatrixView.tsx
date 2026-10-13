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
  const totalEffDaysSem1 = sem1.reduce((sum, m) => sum + (m.effectiveDays || 0), 0);
  const totalEffDaysSem2 = sem2.reduce((sum, m) => sum + (m.effectiveDays || 0), 0);
  const totalEffDaysYear = totalEffDaysSem1 + totalEffDaysSem2;

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
            <div className="text-xs font-bold text-blue-700 mt-0.5">
              {totalEffDaysSem1} Hari Efektif (Putih)
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Semester 1 (Gasal)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalEffSem2} Minggu</div>
            <div className="text-xs font-bold text-emerald-700 mt-0.5">
              {totalEffDaysSem2} Hari Efektif (Putih)
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Semester 2 (Genap)
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalEffSem1 + totalEffSem2} Minggu</div>
            <div className="text-xs font-bold text-indigo-700 mt-0.5">
              {totalEffDaysYear} Hari Efektif (Putih)
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Total 1 Tahun Pelajaran
            </div>
          </div>
        </div>
      </div>

      {/* Visual Rule Notice */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-950">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-blue-900 text-sm">Ketentuan Perhitungan Hari Efektif Belajar (HEB)</div>
          <div className="text-blue-800 mt-0.5">
            Hari Efektif Belajar dihitung <strong>hanya pada kolom sheet / sel kalender yang berwarna putih</strong> pada setiap bulan. Sel yang memiliki warna latar (agenda libur, MPLS, asesmen/ujian, dll.) dihitung sebagai hari tidak efektif.
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
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
                {totalEffSem1} Mgg ({totalEffDaysSem1} Hari Putih)
              </span>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-2 px-3">Bulan</th>
                  <th className="py-2 px-2 text-center text-blue-900 bg-blue-50/50">Hari Putih</th>
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
                    <td className="py-2 px-2 text-center font-bold text-blue-900 bg-blue-50/20">{m.effectiveDays ?? 0} hr</td>
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
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
                {totalEffSem2} Mgg ({totalEffDaysSem2} Hari Putih)
              </span>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-2 px-3">Bulan</th>
                  <th className="py-2 px-2 text-center text-blue-900 bg-blue-50/50">Hari Putih</th>
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
                    <td className="py-2 px-2 text-center font-bold text-blue-900 bg-blue-50/20">{m.effectiveDays ?? 0} hr</td>
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

        {/* Color Legend Box */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Panduan Warna Kalender Pendidikan &amp; Agenda
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs mb-6">
            <div className="p-2 rounded-xl border border-slate-300 bg-white shadow-2xs flex items-center gap-2">
              <span className="w-4 h-4 rounded border border-slate-400 bg-white shrink-0"></span>
              <span className="font-semibold text-slate-800">Hari Putih (Efektif)</span>
            </div>
            <div className="p-2 rounded-xl border border-rose-200 bg-rose-50 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-rose-500 shrink-0"></span>
              <span className="font-semibold text-rose-900">Libur / Cuti</span>
            </div>
            <div className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-500 shrink-0"></span>
              <span className="font-semibold text-emerald-900">MPLS Siswa</span>
            </div>
            <div className="p-2 rounded-xl border border-cyan-200 bg-cyan-50 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-cyan-500 shrink-0"></span>
              <span className="font-semibold text-cyan-900">Asesmen (ANBK)</span>
            </div>
            <div className="p-2 rounded-xl border border-amber-200 bg-amber-50 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-amber-500 shrink-0"></span>
              <span className="font-semibold text-amber-900">PSTS / Ujian</span>
            </div>
            <div className="p-2 rounded-xl border border-indigo-200 bg-indigo-50 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-indigo-500 shrink-0"></span>
              <span className="font-semibold text-indigo-900">PSAS / PSAT / UKK</span>
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Daftar Agenda &amp; Kegiatan Penting KALDIK {academicYear}
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

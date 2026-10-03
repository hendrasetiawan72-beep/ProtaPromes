import React, { useState, useMemo } from 'react';
import { Search, UserCheck, Calendar, Clock, MapPin, BookOpen, Download, Printer, Users } from 'lucide-react';
import { Teacher, ScheduleSlot, SchoolProfile } from '../types';
import { KopSurat } from './KopSurat';
import { SignatureBlock } from './SignatureBlock';
import { exportJadwalPribadiExcel } from '../services/documentGenerator';
import { TIME_SLOTS } from '../data/initialData';

interface JadwalGuruViewProps {
  school: SchoolProfile;
  teachers: Teacher[];
  schedules: ScheduleSlot[];
  selectedTeacherCode: string;
  onSelectTeacher: (code: string) => void;
  academicYear: string;
}

export const JadwalGuruView: React.FC<JadwalGuruViewProps> = ({
  school,
  teachers,
  schedules,
  selectedTeacherCode,
  onSelectTeacher,
  academicYear,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const selectedTeacher = useMemo(() => {
    return teachers.find(t => t.code === selectedTeacherCode) || teachers[0];
  }, [teachers, selectedTeacherCode]);

  const teacherSlots = useMemo(() => {
    if (!selectedTeacher) return [];
    return schedules.filter(s => s.teacherCode.toUpperCase() === selectedTeacher.code.toUpperCase());
  }, [schedules, selectedTeacher]);

  const distinctSubjects = useMemo(() => {
    const map = new Map<string, string>();
    teacherSlots.forEach(s => map.set(s.subjectCode, s.subjectName || s.subjectCode));
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [teacherSlots]);

  const distinctClasses = useMemo(() => {
    return Array.from(new Set(teacherSlots.map(s => s.className))).sort();
  }, [teacherSlots]);

  const totalJp = teacherSlots.length;

  const days: Array<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'> = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    const q = searchQuery.toLowerCase();
    return teachers.filter(t => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
  }, [teachers, searchQuery]);

  const handleDownloadExcel = () => {
    if (!selectedTeacher) return;
    exportJadwalPribadiExcel(school, selectedTeacher, teacherSlots, academicYear);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Teacher Selector & Controls Bar (hidden when printing) */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Guru / Kode Guru
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama guru atau kode (cth: Hasna, F, Wahyu, O)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              Cetak Jadwal / PDF
            </button>
          </div>
        </div>

        {/* Quick Teacher Badges scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          {filteredTeachers.slice(0, 18).map(t => (
            <button
              key={t.id}
              onClick={() => onSelectTeacher(t.code)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                selectedTeacher?.code === t.code
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="font-mono mr-1 text-[11px] opacity-80">[{t.code}]</span>
              {t.name.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Teacher Profile Summary Banner */}
      <div className="print:hidden bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black text-amber-300">
              {selectedTeacher?.code || 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-950 uppercase">
                  Kode: {selectedTeacher?.code}
                </span>
                <span className="text-blue-100 text-xs">SMK Muhammadiyah Bawang</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                {selectedTeacher?.name}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                NBM: {selectedTeacher?.nbm || '1102 9822 1450123'} • Tahun Pelajaran {academicYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/15 text-center min-w-[100px]">
              <div className="text-2xl font-black text-white">{totalJp}</div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Total Jam (JP)</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/15 text-center min-w-[100px]">
              <div className="text-2xl font-black text-amber-300">{distinctClasses.length}</div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Kelas Diampu</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/15 text-center min-w-[100px]">
              <div className="text-2xl font-black text-emerald-300">{distinctSubjects.length}</div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Mata Pelajaran</div>
            </div>
          </div>
        </div>

        {/* Subjects & classes pills */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs text-blue-100">
          <span className="font-semibold text-white">Mengajar:</span>
          {distinctSubjects.map(sub => (
            <span key={sub.code} className="bg-white/15 px-2.5 py-0.5 rounded-full text-white">
              {sub.name} ({sub.code})
            </span>
          ))}
          <span className="mx-1">•</span>
          <span className="font-semibold text-white">Kelas:</span>
          {distinctClasses.map(c => (
            <span key={c} className="bg-amber-400/20 text-amber-200 px-2.5 py-0.5 rounded-full">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Printable Schedule Document Paper */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto text-black font-sans">
        {/* Kop Surat */}
        <KopSurat school={school} />

        {/* Title */}
        <div className="text-center mt-5 mb-4">
          <h2 className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-black">
            JADWAL MENGAJAR GURU (KBM)
          </h2>
          <p className="text-xs sm:text-sm font-semibold font-serif text-slate-800">
            TAHUN PELAJARAN {academicYear}
          </p>
        </div>

        {/* Teacher Metadata Info */}
        <div className="text-xs sm:text-sm font-sans mb-5 pb-3 border-b border-slate-200 space-y-1">
          <div className="grid grid-cols-[160px_1fr]">
            <span className="font-semibold text-slate-700">Nama Guru</span>
            <span className="font-bold">: {selectedTeacher?.name}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr]">
            <span className="font-semibold text-slate-700">Kode Guru</span>
            <span className="font-mono font-bold">: {selectedTeacher?.code}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr]">
            <span className="font-semibold text-slate-700">NBM</span>
            <span>: {selectedTeacher?.nbm || '1102 9822 1450123'}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr]">
            <span className="font-semibold text-slate-700">Total Beban Mengajar</span>
            <span>: <strong className="text-blue-900">{totalJp} Jam Pelajaran (JP)</strong> per Minggu</span>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse border border-black text-center font-sans">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black">
                <th className="border border-black py-2 px-2 w-12">No</th>
                <th className="border border-black py-2 px-3 w-28">Hari</th>
                <th className="border border-black py-2 px-2 w-24">Jam Ke</th>
                <th className="border border-black py-2 px-3 w-36">Waktu</th>
                <th className="border border-black py-2 px-4 text-left">Mata Pelajaran</th>
                <th className="border border-black py-2 px-3 w-28">Kelas</th>
                <th className="border border-black py-2 px-2 w-24">Ruang</th>
              </tr>
            </thead>
            <tbody>
              {teacherSlots.length > 0 ? (
                days.map(day => {
                  const daySlots = teacherSlots
                    .filter(s => s.day === day)
                    .sort((a, b) => a.period - b.period);

                  if (daySlots.length === 0) return null;

                  return daySlots.map((slot, sIdx) => (
                    <tr key={slot.id} className="hover:bg-slate-50/50">
                      <td className="border border-black py-1.5 px-2 text-slate-700 font-mono">
                        {sIdx + 1}
                      </td>
                      {sIdx === 0 && (
                        <td
                          rowSpan={daySlots.length}
                          className="border border-black py-1.5 px-3 font-bold bg-slate-50 align-middle uppercase"
                        >
                          {day}
                        </td>
                      )}
                      <td className="border border-black py-1.5 px-2 font-medium">
                        Jam ke-{slot.period}
                      </td>
                      <td className="border border-black py-1.5 px-3 text-slate-700 font-mono text-[11px]">
                        {slot.timeRange}
                      </td>
                      <td className="border border-black py-1.5 px-4 text-left font-semibold">
                        <span className="text-blue-900">{slot.subjectName}</span>
                        <span className="ml-1 text-[11px] font-normal text-slate-500 font-mono">({slot.subjectCode})</span>
                      </td>
                      <td className="border border-black py-1.5 px-3 font-bold text-slate-900">
                        {slot.className}
                      </td>
                      <td className="border border-black py-1.5 px-2 font-medium text-slate-700">
                        {slot.room || '-'}
                      </td>
                    </tr>
                  ));
                })
              ) : (
                <tr>
                  <td colSpan={7} className="border border-black py-8 text-center text-slate-500 italic">
                    Belum ada jadwal mengajar yang terdaftar untuk Guru {selectedTeacher?.name} ({selectedTeacher?.code}) pada file Jadwal KBM ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Official Blank Signature Form (Empty for physical signing and stamping) */}
        <SignatureBlock
          school={school}
          teacherName={selectedTeacher?.name}
          teacherNbm={selectedTeacher?.nbm}
        />
      </div>
    </div>
  );
};

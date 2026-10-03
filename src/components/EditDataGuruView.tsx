import React from 'react';
import { User, BookOpen, Calendar, Clock, MapPin, CheckCircle2, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { DocumentMeta, Teacher, Subject, MonthEffectiveBreakdown } from '../types';

interface EditDataGuruViewProps {
  meta: DocumentMeta;
  onUpdateMeta: (meta: DocumentMeta) => void;
  teachers: Teacher[];
  subjects: Subject[];
  selectedTeacherCode: string;
  onSelectTeacher: (code: string) => void;
  monthAnalysis: MonthEffectiveBreakdown[];
  onNavigateToDocument: (tab: 'efektif' | 'promes' | 'prota') => void;
}

export const EditDataGuruView: React.FC<EditDataGuruViewProps> = ({
  meta,
  onUpdateMeta,
  teachers,
  subjects,
  selectedTeacherCode,
  onSelectTeacher,
  monthAnalysis,
  onNavigateToDocument,
}) => {
  const sem1Eff = monthAnalysis.filter(m => m.semester === 1).reduce((s, m) => s + m.effectiveWeeks, 0);
  const sem2Eff = monthAnalysis.filter(m => m.semester === 2).reduce((s, m) => s + m.effectiveWeeks, 0);
  const totalEff = sem1Eff + sem2Eff;

  const totalHoursSem1 = meta.weeklyHours * sem1Eff;
  const totalHoursSem2 = meta.weeklyHours * sem2Eff;
  const totalHoursYear = totalHoursSem1 + totalHoursSem2;

  const handleChange = (field: keyof DocumentMeta, value: any) => {
    onUpdateMeta({
      ...meta,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs uppercase mb-1">
                Data Guru & Dokumen
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Edit Data Pribadi Guru
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Semua data di bawah ini langsung otomatis tersinkronisasi ke Analisis Minggu Efektif, PROMES, dan PROTA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToDocument('efektif')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 transition"
            >
              Lihat Analisis Minggu Efektif
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateToDocument('promes')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 transition"
            >
              Lihat PROMES
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Teacher selection row */}
        {teachers.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-2">
              Pilih Cepat Guru Terdaftar dari Jadwal KBM:
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {teachers.slice(0, 15).map(t => (
                <button
                  key={t.id}
                  onClick={() => onSelectTeacher(t.code)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    meta.teacherCode === t.code
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                >
                  <span className="font-mono mr-1 text-[10px] opacity-80">[{t.code}]</span>
                  {t.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Edit Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Identitas Guru & Mata Pelajaran
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ubah data di sini, hasil cetak dan perhitungan jam akan langsung terupdate otomatis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            {/* Nama Guru */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1.5">
                Nama Lengkap Guru (dengan Gelar) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={meta.teacherName}
                onChange={e => handleChange('teacherName', e.target.value)}
                placeholder="Contoh: HASNA ANGGI R, S.Pd"
                className="w-full px-4 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* NBM Guru */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                NBM Guru (Nomor Baku Muhammadiyah) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={meta.teacherNbm || ''}
                onChange={e => handleChange('teacherNbm', e.target.value)}
                placeholder="Contoh: 1102 9822 1450123"
                className="w-full px-4 py-2.5 text-sm font-mono font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* Kode Guru */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Kode Guru (dari Jadwal KBM)
              </label>
              <input
                type="text"
                value={meta.teacherCode}
                onChange={e => handleChange('teacherCode', e.target.value.toUpperCase())}
                placeholder="Contoh: F"
                className="w-full px-4 py-2.5 text-sm font-mono font-bold uppercase border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* Mata Pelajaran */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Mata Pelajaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={meta.subjectName}
                onChange={e => handleChange('subjectName', e.target.value)}
                placeholder="Contoh: Bahasa Inggris"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* Kelas */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tingkat Kelas <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['X', 'XI', 'XII'] as const).map(gr => (
                  <button
                    key={gr}
                    type="button"
                    onClick={() => handleChange('grade', gr)}
                    className={`py-2 text-center rounded-xl font-bold text-xs sm:text-sm border transition ${
                      meta.grade === gr
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Kelas {gr}
                  </button>
                ))}
              </div>
            </div>

            {/* Tahun Pelajaran */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tahun Pelajaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={meta.academicYear}
                onChange={e => handleChange('academicYear', e.target.value)}
                placeholder="Contoh: 2026/2027"
                className="w-full px-4 py-2.5 text-sm font-bold border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* Jam per Minggu (JP) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Alokasi Jam per Minggu (JP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={meta.weeklyHours}
                  onChange={e => handleChange('weeklyHours', parseInt(e.target.value, 10) || 1)}
                  className="w-full px-4 py-2.5 text-sm font-bold border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  JP / Minggu
                </span>
              </div>
              <p className="text-[11px] text-blue-600 mt-1 font-medium">
                Otomatis mengisi kolom minggu efektif di PROMES dan mendistribusikan jam di PROTA.
              </p>
            </div>

            {/* Tanggal Pembuatan Dokumen (Bisa Diubah) */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1.5">
                Tempat & Tanggal Pembuatan Dokumen <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={meta.documentDate}
                onChange={e => handleChange('documentDate', e.target.value)}
                placeholder="Contoh: Bawang, 13 Juli 2026"
                className="w-full px-4 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tempat & tanggal pembuatan dokumen yang tercantum di atas form tanda tangan guru mapel.
              </p>
            </div>

            {/* Capaian Pembelajaran (CP) */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1.5">
                Capaian Pembelajaran (CP) Fase F / Tingkat
              </label>
              <textarea
                rows={3}
                value={meta.capaianPembelajaran || ''}
                onChange={e => handleChange('capaianPembelajaran', e.target.value)}
                placeholder="Uraian Capaian Pembelajaran yang tampil di Bagian A dokumen PROTA..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-normal border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none leading-relaxed transition"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Teks ini tampil pada bagian A Capaian Pembelajaran di PROTA serta dokumen cetak dan Word.
              </p>
            </div>
          </div>
        </div>

        {/* Live Calculation & Preview Side Card */}
        <div className="space-y-6">
          {/* Perhitungan Jam Otomatis */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                Perhitungan Jam Otomatis
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Beban Jam per Minggu:</span>
                  <strong className="text-slate-900">{meta.weeklyHours} JP</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Minggu Efektif Sem 1 (Gasal):</span>
                  <strong className="text-emerald-700">{sem1Eff} Minggu</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Minggu Efektif Sem 2 (Genap):</span>
                  <strong className="text-emerald-700">{sem2Eff} Minggu</strong>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-blue-900">
                  <span className="font-medium">Total JP Semester 1:</span>
                  <span className="font-black text-sm">
                    {meta.weeklyHours} × {sem1Eff} = {totalHoursSem1} JP
                  </span>
                </div>
                <div className="flex items-center justify-between text-blue-900">
                  <span className="font-medium">Total JP Semester 2:</span>
                  <span className="font-black text-sm">
                    {meta.weeklyHours} × {sem2Eff} = {totalHoursSem2} JP
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-blue-950 font-bold">
                  <span>TOTAL 1 TAHUN:</span>
                  <span className="text-base font-black text-indigo-700">{totalHoursYear} JP</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Perhitungan ini otomatis diselaraskan ke dalam dokumen Analisis Minggu Efektif, PROMES, dan PROTA.
              </p>
            </div>
          </div>

          {/* Document Header & Form Tanda Tangan Preview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Preview Header & Form Tanda Tangan
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-sans space-y-3 select-none">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest text-center border-b border-slate-200 pb-1">
                Kop & Data Guru Otomatis
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mata Pelajaran:</span>
                  <span className="font-bold text-slate-900">{meta.subjectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kelas / Tahun:</span>
                  <span className="font-semibold text-slate-800">{meta.grade} / {meta.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guru Mapel:</span>
                  <span className="font-semibold text-slate-800">{meta.teacherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NBM:</span>
                  <span className="font-mono text-slate-700">{meta.teacherNbm || '-'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">
                  Preview Form Tanda Tangan (Rata Tengah, Tanpa Isian):
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-center">
                  <div className="flex flex-col items-center">
                    <p className="text-slate-600">Mengetahui,</p>
                    <p className="font-bold text-slate-900">Kepala Sekolah</p>
                    <div className="h-10 w-full my-1 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400 italic">
                      (Ruang TTD & Stempel)
                    </div>
                    <p className="font-bold underline text-slate-900">Kepala Sekolah</p>
                    <p className="text-slate-500 font-mono text-[9px]">NBM. 1102 7909 1069421</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-slate-600">{meta.documentDate}</p>
                    <p className="font-bold text-slate-900">Guru Mapel,</p>
                    <div className="h-10 w-full my-1 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400 italic">
                      (Ruang TTD Basah)
                    </div>
                    <p className="font-bold underline text-slate-900 truncate max-w-full">{meta.teacherName}</p>
                    <p className="text-slate-500 font-mono text-[9px]">NBM. {meta.teacherNbm || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

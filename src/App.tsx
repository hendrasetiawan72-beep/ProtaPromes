import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  FileSpreadsheet,
  FileText,
  Clock,
  UploadCloud,
  Sliders,
  UserCheck,
  BookOpen,
  UserCog,
  Menu,
  X
} from 'lucide-react';
import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_SCHEDULES,
  INITIAL_MONTH_ANALYSIS,
  INITIAL_KALDIK_EVENTS,
  INITIAL_OBJECTIVES_SEM1,
  INITIAL_OBJECTIVES_SEM2,
} from './data/initialData';
import {
  SchoolProfile,
  Teacher,
  Subject,
  ScheduleSlot,
  MonthEffectiveBreakdown,
  KaldikEvent,
  LearningObjective,
  DocumentMeta,
} from './types';
import { JadwalGuruView } from './components/JadwalGuruView';
import { EditDataGuruView } from './components/EditDataGuruView';
import { AnalisisMingguEfektifView } from './components/AnalisisMingguEfektifView';
import { PromesView } from './components/PromesView';
import { ProtaView } from './components/ProtaView';
import { KaldikMatrixView } from './components/KaldikMatrixView';
import { UploadExcelModal } from './components/UploadExcelModal';
import { PengaturanModal } from './components/PengaturanModal';
import { ParseKbmResult, ParseKaldikResult } from './services/excelParser';

const NAV_ITEMS = [
  { id: 'jadwal', label: '1. Jadwal Pribadi Guru', icon: Clock, desc: 'Jadwal tatap muka mingguan guru' },
  { id: 'editguru', label: '2. Edit Data Guru', icon: UserCog, desc: 'Identitas, NBM & sinkronisasi data' },
  { id: 'efektif', label: '3. Analisis Minggu Efektif', icon: CalendarDays, desc: 'Minggu efektif Gasal & Genap' },
  { id: 'promes', label: '4. Program Semester (PROMES)', icon: FileSpreadsheet, desc: 'Alokasi TP per minggu semester' },
  { id: 'prota', label: '5. Program Tahunan (PROTA)', icon: FileText, desc: 'Pemetaan tahunan alokasi jam' },
  { id: 'kaldik', label: '6. Kalender Pendidikan', icon: BookOpen, desc: 'Matriks kegiatan dan agenda sekolah' },
] as const;

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    if (isSidebarOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Main State
  const [school, setSchool] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('jg_school');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_PROFILE;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('jg_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('jg_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [schedules, setSchedules] = useState<ScheduleSlot[]>(() => {
    const saved = localStorage.getItem('jg_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [monthAnalysis, setMonthAnalysis] = useState<MonthEffectiveBreakdown[]>(() => {
    const saved = localStorage.getItem('jg_monthAnalysis');
    return saved ? JSON.parse(saved) : INITIAL_MONTH_ANALYSIS;
  });

  const [events, setEvents] = useState<KaldikEvent[]>(() => {
    const saved = localStorage.getItem('jg_events');
    return saved ? JSON.parse(saved) : INITIAL_KALDIK_EVENTS;
  });

  const [objectivesSem1, setObjectivesSem1] = useState<LearningObjective[]>(() => {
    const saved = localStorage.getItem('jg_obj_sem1');
    return saved ? JSON.parse(saved) : INITIAL_OBJECTIVES_SEM1;
  });

  const [objectivesSem2, setObjectivesSem2] = useState<LearningObjective[]>(() => {
    const saved = localStorage.getItem('jg_obj_sem2');
    return saved ? JSON.parse(saved) : INITIAL_OBJECTIVES_SEM2;
  });

  const [selectedTeacherCode, setSelectedTeacherCode] = useState<string>('F'); // Default Hasna Anggi R, S.Pd

  const [academicYear, setAcademicYear] = useState<string>('2026/2027');

  const [activeTab, setActiveTab] = useState<'jadwal' | 'editguru' | 'efektif' | 'promes' | 'prota' | 'kaldik'>('jadwal');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Active Teacher details
  const activeTeacher = teachers.find(t => t.code === selectedTeacherCode) || teachers[0];

  // Document metadata synchronized with active teacher and subject
  const [meta, setMeta] = useState<DocumentMeta>(() => {
    const saved = localStorage.getItem('jg_meta');
    if (saved) return JSON.parse(saved);
    return {
      subjectName: 'Bahasa Inggris',
      subjectCode: 'B ING',
      grade: 'XII',
      classNames: 'XII TKR 1, XII TKJ 2, XII AK, XII PBS',
      department: 'Semua Bidang Keahlian',
      expertiseProgram: 'Semua Program Keahlian',
      curriculum: 'Kurikulum Merdeka',
      academicYear: '2026/2027',
      weeklyHours: 4,
      teacherName: activeTeacher?.name || 'HASNA ANGGI R, S.Pd',
      teacherCode: activeTeacher?.code || 'F',
      teacherNbm: activeTeacher?.nbm || '1102 9822 1450123',
      documentDate: 'Bawang, 13 Juli 2026',
      capaianPembelajaran:
        'Pada akhir Fase F, peserta didik menggunakan teks lisan, tulisan dan visual dalam berkomunikasi sesuai situasi, tujuan, dan pemirsa/pembacanya. Pembelajaran difokuskan pada penguasaan kompetensi dasar dan kejuruan secara komprehensif, kritis, dan mandiri guna membekali lulusan SMK dengan keahlian kerja dan karakter luhur.',
    };
  });

  // Sync meta when teacher selection changes
  const handleSelectTeacher = (code: string) => {
    setSelectedTeacherCode(code);
    const teacher = teachers.find(t => t.code === code);
    if (teacher) {
      const teacherSlots = schedules.filter(s => s.teacherCode.toUpperCase() === teacher.code.toUpperCase());
      const sub = teacherSlots[0]?.subjectName || meta.subjectName;
      const subCode = teacherSlots[0]?.subjectCode || meta.subjectCode;
      const grade = teacherSlots[0]?.grade || meta.grade;
      const classNames = Array.from(new Set(teacherSlots.map(s => s.className))).join(', ') || meta.classNames;

      setMeta(prev => ({
        ...prev,
        teacherName: teacher.name,
        teacherCode: teacher.code,
        teacherNbm: teacher.nbm || '1102 9822 1450123',
        subjectName: sub,
        subjectCode: subCode,
        grade,
        classNames,
      }));
    }
  };

  // Persist state
  useEffect(() => {
    localStorage.setItem('jg_school', JSON.stringify(school));
    localStorage.setItem('jg_teachers', JSON.stringify(teachers));
    localStorage.setItem('jg_subjects', JSON.stringify(subjects));
    localStorage.setItem('jg_schedules', JSON.stringify(schedules));
    localStorage.setItem('jg_monthAnalysis', JSON.stringify(monthAnalysis));
    localStorage.setItem('jg_events', JSON.stringify(events));
    localStorage.setItem('jg_obj_sem1', JSON.stringify(objectivesSem1));
    localStorage.setItem('jg_obj_sem2', JSON.stringify(objectivesSem2));
    localStorage.setItem('jg_meta', JSON.stringify(meta));
  }, [school, teachers, subjects, schedules, monthAnalysis, events, objectivesSem1, objectivesSem2, meta]);

  // Handlers for Uploaded Data
  const handleKbmParsed = (data: ParseKbmResult) => {
    if (data.teachers.length > 0) setTeachers(data.teachers);
    if (data.subjects.length > 0) setSubjects(data.subjects);
    if (data.schedules.length > 0) setSchedules(data.schedules);

    // Keep current selected teacher if still valid, or select the first uploaded teacher
    const targetTeacher =
      data.teachers.find(t => t.code.toUpperCase() === selectedTeacherCode.toUpperCase()) ||
      data.teachers[0];

    if (targetTeacher) {
      handleSelectTeacher(targetTeacher.code);
    }
  };

  const handleKaldikParsed = (data: ParseKaldikResult) => {
    if (data.monthAnalysis.length > 0) {
      setMonthAnalysis(data.monthAnalysis);
    }
    if (data.events && data.events.length > 0) {
      setEvents(data.events);
    }
    if (data.academicYear) {
      setAcademicYear(data.academicYear);
    }

    setMeta(prev => ({
      ...prev,
      academicYear: data.academicYear || prev.academicYear,
      weeklyHours: data.weeklyHours || prev.weeklyHours,
      subjectName: data.subjectName || prev.subjectName,
    }));
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan semua data ke sampel asli SMK Muhammadiyah Bawang?')) {
      localStorage.clear();
      setSchool(INITIAL_SCHOOL_PROFILE);
      setTeachers(INITIAL_TEACHERS);
      setSubjects(INITIAL_SUBJECTS);
      setSchedules(INITIAL_SCHEDULES);
      setMonthAnalysis(INITIAL_MONTH_ANALYSIS);
      setEvents(INITIAL_KALDIK_EVENTS);
      setObjectivesSem1(INITIAL_OBJECTIVES_SEM1);
      setObjectivesSem2(INITIAL_OBJECTIVES_SEM2);
      setSelectedTeacherCode('F');
      setMeta({
        subjectName: 'Bahasa Inggris',
        subjectCode: 'B ING',
        grade: 'XII',
        classNames: 'XII TKR 1, XII TKJ 2, XII AK, XII PBS',
        department: 'Semua Bidang Keahlian',
        expertiseProgram: 'Semua Program Keahlian',
        curriculum: 'Kurikulum Merdeka',
        academicYear: '2026/2027',
        weeklyHours: 4,
        teacherName: 'HASNA ANGGI R, S.Pd',
        teacherCode: 'F',
        teacherNbm: '1102 9822 1450123',
        documentDate: 'Bawang, 13 Juli 2026',
        capaianPembelajaran:
          'Pada akhir Fase F, peserta didik menggunakan teks lisan, tulisan dan visual dalam berkomunikasi sesuai situasi, tujuan, dan pemirsa/pembacanya. Pembelajaran difokuskan pada penguasaan kompetensi dasar dan kejuruan secara komprehensif, kritis, dan mandiri guna membekali lulusan SMK dengan keahlian kerja dan karakter luhur.',
      });
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col font-sans"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.97)), url('${school.backgroundUrl}')`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {/* Top Application Header (Hidden in Print Mode) */}
      <header className="print:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Left: 3-line hamburger button without text + School Branding + Active page indicator */}
            <div className="flex items-center gap-3">
              {/* Three-line icon button (garis tiga tanpa teks menu) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 sm:p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/90 active:scale-95 transition flex items-center justify-center border border-slate-200 shadow-2xs cursor-pointer"
                aria-label="Buka bilah navigasi samping"
                title="Buka navigasi samping"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* School Branding */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img
                  src={school.logoUrl}
                  alt="Logo SMK Muhammadiyah Bawang"
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                      JadwalGuru <span className="text-blue-600">Pro</span>
                    </h1>
                    <span className="hidden xs:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      SMK Muhiba
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px] sm:max-w-xs md:max-w-md">
                    {school.name}
                  </p>
                </div>
              </div>

              {/* Active Menu Badge Indicator */}
              {(() => {
                const activeConfig = NAV_ITEMS.find(item => item.id === activeTab) || NAV_ITEMS[0];
                const Icon = activeConfig.icon;
                return (
                  <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
                    <span className="text-slate-400 font-medium">Halaman Aktif:</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 shadow-2xs">
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                      {activeConfig.label}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Academic Year display */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Tahun:</span>
                <select
                  value={meta.academicYear}
                  onChange={e => {
                    setAcademicYear(e.target.value);
                    setMeta(prev => ({ ...prev, academicYear: e.target.value }));
                  }}
                  className="font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                >
                  <option value="2026/2027">2026/2027</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2027/2028">2027/2028</option>
                </select>
              </div>

              {/* Upload Excel Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition transform active:scale-95 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Excel</span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Pengaturan Identitas Sekolah"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop Overlay for Bilah Samping */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Bilah Samping (Sidebar Navigation Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out print:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu Bilah Samping"
      >
        {/* Header Bilah Samping */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <img
              src={school.logoUrl}
              alt="Logo SMK Muhammadiyah Bawang"
              className="w-9 h-9 object-contain drop-shadow-xs"
            />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                JadwalGuru <span className="text-blue-600">Pro</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">
                {school.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Tutup bilah samping"
            title="Tutup bilah samping"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profil Guru Aktif di Bilah Samping */}
        <div className="p-3.5 mx-3.5 my-3 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-100/90 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Profil Guru Aktif</span>
          </div>
          <p className="text-xs font-bold text-slate-900 truncate">
            {meta.teacherName}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200/80 font-bold text-blue-700 text-[10px]">
              [{meta.teacherCode}]
            </span>
            <span className="truncate">{meta.subjectName} ({meta.grade})</span>
          </div>
        </div>

        {/* Daftar Navigasi di Bilah Samping */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu Navigasi
          </div>

          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition text-left cursor-pointer group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div
                      className={`text-[10px] font-normal ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-white shrink-0 shadow-xs" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tombol Aksi Tambahan di Bagian Bawah Bilah Samping */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 space-y-2">
          <button
            onClick={() => {
              setIsUploadModalOpen(true);
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Excel (KBM / Kaldik)</span>
          </button>

          <button
            onClick={() => {
              setIsSettingsModalOpen(true);
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Pengaturan Identitas Sekolah</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0 print:m-0">
        {activeTab === 'jadwal' && (
          <JadwalGuruView
            school={school}
            teachers={teachers}
            schedules={schedules}
            selectedTeacherCode={selectedTeacherCode}
            onSelectTeacher={handleSelectTeacher}
            academicYear={meta.academicYear}
          />
        )}

        {activeTab === 'editguru' && (
          <EditDataGuruView
            meta={meta}
            onUpdateMeta={setMeta}
            teachers={teachers}
            subjects={subjects}
            selectedTeacherCode={selectedTeacherCode}
            onSelectTeacher={handleSelectTeacher}
            monthAnalysis={monthAnalysis}
            onNavigateToDocument={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'efektif' && (
          <AnalisisMingguEfektifView
            school={school}
            meta={meta}
            onUpdateMeta={setMeta}
            monthAnalysis={monthAnalysis}
            onUpdateMonthAnalysis={setMonthAnalysis}
          />
        )}

        {activeTab === 'promes' && (
          <PromesView
            school={school}
            meta={meta}
            onUpdateMeta={setMeta}
            objectivesSem1={objectivesSem1}
            objectivesSem2={objectivesSem2}
            onUpdateObjectivesSem1={setObjectivesSem1}
            onUpdateObjectivesSem2={setObjectivesSem2}
            monthAnalysis={monthAnalysis}
          />
        )}

        {activeTab === 'prota' && (
          <ProtaView
            school={school}
            meta={meta}
            onUpdateMeta={setMeta}
            objectivesSem1={objectivesSem1}
            objectivesSem2={objectivesSem2}
            onUpdateObjectivesSem1={setObjectivesSem1}
            onUpdateObjectivesSem2={setObjectivesSem2}
            monthAnalysis={monthAnalysis}
          />
        )}

        {activeTab === 'kaldik' && (
          <KaldikMatrixView
            school={school}
            monthAnalysis={monthAnalysis}
            events={events}
            academicYear={meta.academicYear}
          />
        )}
      </main>

      {/* Bottom Footer (Hidden when printing) */}
      <footer className="print:hidden border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{school.name}</span>
            <span>•</span>
            <span>Terakreditasi "A"</span>
            <span>•</span>
            <span className="text-slate-400">Batang, Jawa Tengah</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToDefault}
              className="text-slate-400 hover:text-rose-600 transition"
              title="Reset data ke sampel asli"
            >
              Reset Data Default
            </button>
            <span>•</span>
            <span className="text-slate-600 font-medium">JadwalGuru Pro v2.5 (F4 Ready)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadExcelModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onKbmParsed={handleKbmParsed}
        onKaldikParsed={handleKaldikParsed}
      />

      <PengaturanModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        school={school}
        meta={meta}
        onSaveSchool={setSchool}
        onSaveMeta={setMeta}
      />
    </div>
  );
}

export interface Teacher {
  id: string;
  code: string;
  name: string;
  nbm?: string;
  subjectCodes?: string[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category?: string;
  defaultJp?: number;
}

export interface ScheduleSlot {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  period: number; // 1 - 12
  timeRange: string;
  grade: 'X' | 'XI' | 'XII';
  className: string; // e.g. "X TO 1", "XI TKR 1", "XII TKJ 2"
  subjectCode: string;
  subjectName: string;
  teacherCode: string;
  teacherName: string;
  room?: string;
}

export interface KaldikEvent {
  id: string;
  name: string;
  dateRange: string;
  semester: 1 | 2;
  monthName: string;
  weekNumber: number; // 1-5
  type: 'libur' | 'mpls' | 'an' | 'psts' | 'psas' | 'psat' | 'psaj' | 'ukk' | 'remedial' | 'wisuda' | 'kegiatan';
  description?: string;
}

export interface MonthEffectiveBreakdown {
  monthName: string;
  semester: 1 | 2;
  totalWeeks: number;
  nonEffectiveWeeks: number;
  effectiveWeeks: number;
  notes: string[];
}

export interface LearningObjective {
  id: string;
  element: string;
  code: string; // e.g. "TP 1", "TP 2"
  description: string;
  semester: 1 | 2;
  jp: number;
  // Allocation in specific week column, key is `${monthName}_${weekNum}` e.g. "JULI_3": 4
  weeklyAllocation?: Record<string, number>;
}

export interface SchoolProfile {
  name: string;
  foundation: string;
  branch: string;
  accreditation: string;
  address: string;
  email: string;
  website: string;
  postalCode: string;
  phone: string;
  fax: string;
  headmasterName: string;
  headmasterTitle: string;
  headmasterNbm: string;
  locationCity: string;
  signatureDate: string;
  logoUrl: string;
  backgroundUrl: string;
}

export interface DocumentMeta {
  subjectName: string;
  subjectCode: string;
  grade: 'X' | 'XI' | 'XII';
  classNames: string;
  department: string;
  expertiseProgram: string;
  curriculum: string;
  academicYear: string;
  weeklyHours: number;
  teacherName: string;
  teacherCode: string;
  teacherNbm: string;
  documentDate: string; // e.g. "Bawang, 13 Juli 2026"
  capaianPembelajaran?: string; // Capaian Pembelajaran (CP) Fase / Mata Pelajaran
}

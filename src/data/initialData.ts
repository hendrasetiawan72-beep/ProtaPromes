import { Teacher, Subject, ScheduleSlot, MonthEffectiveBreakdown, KaldikEvent, LearningObjective, SchoolProfile } from '../types';

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  name: 'SMK MUHAMMADIYAH BAWANG',
  foundation: 'MAJLIS PENDIDIKAN DASAR DAN MENENGAH',
  branch: 'DAERAH MUHAMMADIYAH BATANG',
  accreditation: 'TERAKREDITASI "A"',
  address: 'Jl. Bawang-Sukorejo Km 01 Ds. Jlamprang Kec. Bawang Kab. Batang.',
  email: 'smkmuhbawang@gmail.com',
  website: 'www.smkmuhiba.sch.id',
  postalCode: '51274',
  phone: '(0285) 4486909',
  fax: '(0285) 4486899',
  headmasterName: 'Imam Pamungkas, S.Pd., M.Si.',
  headmasterTitle: 'Kepala SMK Muhammadiyah Bawang',
  headmasterNbm: '1102 7909 1069421',
  locationCity: 'Bawang',
  signatureDate: 'Juli 2026',
  logoUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgzWdtCjCcX2chJuhLX_26N5MmkVK-1SkyO7kgXznQQJPQa6_TB_EJzD1WWpztg7yX9RBRE7rGn0t2Z3FdG06mwwT6pQix8t6vnlcOBm_EgGl9z0jeJemJkppP0KIIjkXGksQvaCLh2dz-gOF6a2H213VQBL6Am8Elhmd76OOnphogk-EoTTbkYbg0TQJhv/s512/34690.png',
  backgroundUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh14eQT9MWn4-D1hdb8FisPsg0qK1iIvxXbMg0RGCvXFzUVWUt_KTiOWcEBzrJYxqALWV7_RPeowvTNfbyw-tbCeDb40lvY5jm_lWN5_jjeZko2SF82_wLRcW2-rBs6fWcauvugbRXBRODAeDb0FBkV81rSrgh6stKQG9ZWf5MU3qxTwiqdSEO9AaJ1EbUX/s480/44857.png',
};

export const INITIAL_TEACHERS: Teacher[] = [
  { id: '1', code: 'A', name: 'Drs. SOLIKHIN, M.Pd' },
  { id: '2', code: 'B', name: 'Drs. WIDODO' },
  { id: '3', code: 'C', name: 'GURU C' },
  { id: '4', code: 'D', name: 'SRI WELASIH, S.Pd' },
  { id: '5', code: 'E', name: 'SUYATNO, MPd' },
  { id: '6', code: 'F', name: 'HASNA ANGGI R, S.Pd', nbm: '1102 9822 1450123' },
  { id: '7', code: 'G', name: 'AMALIA DESY N S, S.Pd' },
  { id: '8', code: 'H', name: 'JOHAN SETIAJI, S.Pd' },
  { id: '9', code: 'I', name: 'GURU I' },
  { id: '10', code: 'J', name: 'RIYAN ARDIYANTO, S.Pd' },
  { id: '11', code: 'K', name: 'MUHAMAD THORIQ RAIHAN, S.Pd' },
  { id: '12', code: 'L', name: 'HERA RINTANINGSIH, S.Pd' },
  { id: '13', code: 'M', name: 'TEGUH NUGROHO, S.Si' },
  { id: '14', code: 'N', name: 'FARA AMALIA, S.Pd' },
  { id: '15', code: 'O', name: 'WAHYU WIDODO, S.Pd' },
  { id: '16', code: 'P', name: 'RIFKI YOGA K, S.Pd' },
  { id: '17', code: 'Q', name: 'QUNI MUSYABIHAH, S.Pd' },
  { id: '18', code: 'R', name: 'SINTA DEWI KARTIKA, S.Pd' },
  { id: '19', code: 'S', name: 'JUMALI, S.Pd' },
  { id: '20', code: 'T', name: 'A SOLECHUDIN, S.Kom' },
  { id: '21', code: 'U', name: 'MARATUS SOLIKA, S.HUM' },
  { id: '22', code: 'V', name: 'CATUR YUDHI PRASETIYO, S.Pdl' },
  { id: '23', code: 'W', name: 'SUGI HARNOTO, S.Ak' },
  { id: '24', code: 'X', name: 'JOKO SETIAWAN, S.E' },
  { id: '25', code: 'Y', name: 'LYLIS TRI UTAMI, S.Pd' },
  { id: '26', code: 'Z', name: 'ALFIYAH, S.AK' },
  { id: '27', code: 'AA', name: 'MUHAMMAD BURHANUDIN, S.Pd' },
  { id: '28', code: 'AB', name: 'SUKRON, S.Pd' },
  { id: '29', code: 'AC', name: 'HENDRA SETIAWAN, S.Pd' },
  { id: '30', code: 'AD', name: 'M HANIF AL FATIH, S.Pd' },
  { id: '31', code: 'AE', name: 'AKHMAD HIDAYANTO, S.Pd' },
  { id: '32', code: 'AF', name: 'BANDA PUTRA P, S.Pd' },
  { id: '33', code: 'AG', name: 'AULIA NABILLA, S. Hum, M.A' },
  { id: '34', code: 'AH', name: 'ESTI HANDAYANI, S.Pd' },
  { id: '35', code: 'AI', name: 'KHOLIFAH, Amd.Kom' },
  { id: '36', code: 'AJ', name: 'EDI SETIANTO' },
  { id: '37', code: 'AK', name: 'SUKMA NADA SHAFIRA, S.Pd' },
  { id: '38', code: 'AL', name: 'SOVIYANA, S.Ag' },
  { id: '39', code: 'AM', name: 'ANGGIT NAUFAL S' },
  { id: '40', code: 'AN', name: 'TAUFIK, S.Pd' },
  { id: '41', code: 'AO', name: 'FATKHUROHMAN, S.Pd' },
  { id: '42', code: 'AP', name: 'BIKI SABILI KARKAUNI' },
  { id: '43', code: 'AQ', name: 'UNTUNG SUBAGYA' },
  { id: '44', code: 'AR', name: 'MAYLAN BUDIARTANTI, S.Pd' },
  { id: '45', code: 'AS', name: 'DADANG' },
  { id: '46', code: 'AT', name: 'MUJTAHIDUN' },
  { id: '47', code: 'AU', name: 'RIPNO' },
  { id: '48', code: 'AV', name: 'IVA NAZHATINA, S.E' },
  { id: '49', code: 'AW', name: 'ROSALIANINGRUM, S.Pd' },
  { id: '50', code: 'AX', name: 'DATU NOVIA MARCHELLINA, S.Pd' },
  { id: '51', code: 'AY', name: 'AHMAD NASI\'IN, S.Pd' },
  { id: '52', code: 'AZ', name: 'YOFIANA FAJRIN, S.Pd' },
  { id: '53', code: 'AAA', name: 'COURNICOVA AFIFFAH SYAILENDRA, S.Pd' },
  { id: '54', code: 'AAB', name: 'NADILA PUTRI INDRIANI, S.Kom' }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', code: 'PAIPB', name: 'Pendidikan Agama Islam dan Budi Pekerti', defaultJp: 3 },
  { id: '2', code: 'PP', name: 'Pendidikan Pancasila', defaultJp: 2 },
  { id: '3', code: 'B INDO', name: 'Bahasa Indonesia', defaultJp: 4 },
  { id: '4', code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', defaultJp: 3 },
  { id: '5', code: 'SEJ', name: 'Sejarah Indonesia', defaultJp: 2 },
  { id: '6', code: 'SB', name: 'Seni Budaya', defaultJp: 2 },
  { id: '7', code: 'B JAWA', name: 'Bahasa Jawa', defaultJp: 2 },
  { id: '8', code: 'MTK', name: 'Matematika', defaultJp: 4 },
  { id: '9', code: 'B ING', name: 'Bahasa Inggris', defaultJp: 4 },
  { id: '10', code: 'INF', name: 'Informatika', defaultJp: 4 },
  { id: '11', code: 'IPAS', name: 'Projek Ilmu Pengetahuan Alam dan Sosial', defaultJp: 6 },
  { id: '12', code: 'DPKTKR', name: 'Dasar-dasar Program Keahlian TKR', defaultJp: 12 },
  { id: '13', code: 'DPKTSM', name: 'Dasar-dasar Program Keahlian TSM', defaultJp: 12 },
  { id: '14', code: 'DPKTKJ', name: 'Dasar-dasar Program Keahlian TKJ', defaultJp: 12 },
  { id: '15', code: 'DPKTJAT', name: 'Dasar-dasar Program Keahlian TJAT', defaultJp: 12 },
  { id: '16', code: 'DPKAKL', name: 'Dasar-dasar Program Keahlian AKL', defaultJp: 12 },
  { id: '17', code: 'KK3TKR', name: 'Konsentrasi Keahlian TKR', defaultJp: 18 },
  { id: '18', code: 'KK3TSM', name: 'Konsentrasi Keahlian TSM', defaultJp: 18 },
  { id: '19', code: 'KK3TKJ', name: 'Konsentrasi Keahlian TKJ', defaultJp: 18 },
  { id: '20', code: 'KK3TJAT', name: 'Konsentrasi Keahlian TJAT', defaultJp: 18 },
  { id: '21', code: 'KK3AK', name: 'Konsentrasi Keahlian Akuntansi', defaultJp: 18 },
  { id: '22', code: 'KK2TKR', name: 'Konsentrasi Keahlian TKR XI', defaultJp: 18 },
  { id: '23', code: 'KK2TSM', name: 'Konsentrasi Keahlian TSM XI', defaultJp: 18 },
  { id: '24', code: 'KK2TKJ', name: 'Konsentrasi Keahlian TKJ XI', defaultJp: 18 },
  { id: '25', code: 'KK2TJAT', name: 'Konsentrasi Keahlian TJAT XI', defaultJp: 18 },
  { id: '26', code: 'KK2AK', name: 'Konsentrasi Keahlian AK XI', defaultJp: 18 },
  { id: '27', code: 'KMH', name: 'Pendidikan Kemuhammadiyahan', defaultJp: 2 },
  { id: '28', code: 'KEMUH', name: 'Pendidikan Kemuhammadiyahan', defaultJp: 2 },
  { id: '29', code: 'CK', name: 'Ciri Khusus', defaultJp: 2 },
  { id: '30', code: 'MP', name: 'Mata Pelajaran Pilihan', defaultJp: 4 },
  { id: '31', code: 'KIK', name: 'Kreatif, Inovasi, dan Kewirausahaan', defaultJp: 5 },
  { id: '32', code: 'BK', name: 'Bimbingan Konseling', defaultJp: 2 },
];

export const INITIAL_MONTH_ANALYSIS: MonthEffectiveBreakdown[] = [
  // Semester 1 (Gasal)
  { monthName: 'Juli', semester: 1, totalWeeks: 5, nonEffectiveWeeks: 3, effectiveWeeks: 2, notes: ['Libur Semester Genap', 'MPLS'] },
  { monthName: 'Agustus', semester: 1, totalWeeks: 4, nonEffectiveWeeks: 1, effectiveWeeks: 3, notes: ['Asesmen Nasional'] },
  { monthName: 'September', semester: 1, totalWeeks: 4, nonEffectiveWeeks: 1, effectiveWeeks: 3, notes: ['PSTS'] },
  { monthName: 'Oktober', semester: 1, totalWeeks: 5, nonEffectiveWeeks: 0, effectiveWeeks: 5, notes: [] },
  { monthName: 'November', semester: 1, totalWeeks: 4, nonEffectiveWeeks: 0, effectiveWeeks: 4, notes: [] },
  { monthName: 'Desember', semester: 1, totalWeeks: 5, nonEffectiveWeeks: 5, effectiveWeeks: 0, notes: ['PSAS', 'Ujian Susulan & Remedial', 'Class Meeting', 'Libur Semester Gasal'] },
  // Semester 2 (Genap)
  { monthName: 'Januari', semester: 2, totalWeeks: 4, nonEffectiveWeeks: 0, effectiveWeeks: 4, notes: [] },
  { monthName: 'Februari', semester: 2, totalWeeks: 4, nonEffectiveWeeks: 0, effectiveWeeks: 4, notes: [] },
  { monthName: 'Maret', semester: 2, totalWeeks: 4, nonEffectiveWeeks: 3, effectiveWeeks: 1, notes: ['PSTS', 'Libur Hari Raya Idul Fitri 1448 H'] },
  { monthName: 'April', semester: 2, totalWeeks: 5, nonEffectiveWeeks: 4, effectiveWeeks: 1, notes: ['PSAJ', 'PSAJ Susulan', 'UKK'] },
  { monthName: 'Mei', semester: 2, totalWeeks: 4, nonEffectiveWeeks: 4, effectiveWeeks: 0, notes: ['Pengumuman Kelulusan', 'Wisuda', 'Persiapan Ujian'] },
  { monthName: 'Juni', semester: 2, totalWeeks: 4, nonEffectiveWeeks: 4, effectiveWeeks: 0, notes: ['PSAT', 'Ujian Susulan & Remedial', 'Libur Akhir Semester'] },
];

export const INITIAL_KALDIK_EVENTS: KaldikEvent[] = [
  { id: '1', name: 'Mulai Masuk Tahun Ajaran Baru 2026/2027', dateRange: '13 Juli 2026', semester: 1, monthName: 'Juli', weekNumber: 3, type: 'kegiatan' },
  { id: '2', name: 'Masa Pengenalan Lingkungan Sekolah (MPLS)', dateRange: '13 - 17 Juli 2026', semester: 1, monthName: 'Juli', weekNumber: 3, type: 'mpls' },
  { id: '3', name: 'Upacara HUT RI ke-81', dateRange: '17 Agustus 2026', semester: 1, monthName: 'Agustus', weekNumber: 3, type: 'kegiatan' },
  { id: '4', name: 'Asesmen Nasional (ANBK)', dateRange: '24 - 27 Agustus 2026', semester: 1, monthName: 'Agustus', weekNumber: 4, type: 'an' },
  { id: '5', name: 'Penilaian Sumatif Tengah Semester (PSTS) Gasal', dateRange: '21 - 24 September 2026', semester: 1, monthName: 'September', weekNumber: 4, type: 'psts' },
  { id: '6', name: 'Penilaian Sumatif Akhir Semester (PSAS)', dateRange: '1 - 4 Desember 2026', semester: 1, monthName: 'Desember', weekNumber: 1, type: 'psas' },
  { id: '7', name: 'Ujian Susulan, Remedial & Class Meeting', dateRange: '7 - 10 Desember 2026', semester: 1, monthName: 'Desember', weekNumber: 2, type: 'remedial' },
  { id: '8', name: 'Penyerahan Buku Laporan Hasil Belajar (Rapor)', dateRange: '18 Desember 2026', semester: 1, monthName: 'Desember', weekNumber: 3, type: 'kegiatan' },
  { id: '9', name: 'Libur Akhir Semester Gasal', dateRange: '21 Desember 2026 - 1 Januari 2027', semester: 1, monthName: 'Desember', weekNumber: 4, type: 'libur' },
  { id: '10', name: 'Awal Masuk Semester Genap', dateRange: '4 Januari 2027', semester: 2, monthName: 'Januari', weekNumber: 1, type: 'kegiatan' },
  { id: '11', name: 'PSTS Genap', dateRange: '8 - 12 Maret 2027', semester: 2, monthName: 'Maret', weekNumber: 2, type: 'psts' },
  { id: '12', name: 'Libur Menjelang & Hari Raya Idul Fitri 1448 H', dateRange: '15 - 26 Maret 2027', semester: 2, monthName: 'Maret', weekNumber: 3, type: 'libur' },
  { id: '13', name: 'Penilaian Sumatif Akhir Jenjang (PSAJ) Kelas XII', dateRange: '5 - 8 April 2027', semester: 2, monthName: 'April', weekNumber: 1, type: 'psaj' },
  { id: '14', name: 'Uji Kompetensi Keahlian (UKK Praktik)', dateRange: '19 - 24 April 2027', semester: 2, monthName: 'April', weekNumber: 3, type: 'ukk' },
  { id: '15', name: 'Pengumuman Kelulusan SMK', dateRange: '3 Mei 2027', semester: 2, monthName: 'Mei', weekNumber: 1, type: 'wisuda' },
  { id: '16', name: 'Wisuda & Pelepasan Siswa Kelas XII', dateRange: '19 Mei 2027', semester: 2, monthName: 'Mei', weekNumber: 3, type: 'wisuda' },
  { id: '17', name: 'Penilaian Sumatif Akhir Tahun (PSAT) X & XI', dateRange: '2 - 4 Juni 2027', semester: 2, monthName: 'Juni', weekNumber: 1, type: 'psat' },
  { id: '18', name: 'Libur Akhir Semester Genap', dateRange: '21 Juni - 10 Juli 2027', semester: 2, monthName: 'Juni', weekNumber: 4, type: 'libur' },
];

export const INITIAL_OBJECTIVES_SEM1: LearningObjective[] = [
  {
    id: 'tp1-1',
    element: 'Menyimak - Berbicara',
    code: 'TP 1.1',
    description: 'Siswa mampu memahami konsep, struktur, dan unsur kebahasaan pada discussion text secara mendalam dengan menunjukkan kemampuan menganalisis isu, argumen pro-kontra, dan simpulan.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'Juli_3': 4 }
  },
  {
    id: 'tp1-2',
    element: 'Membaca - Memirsa',
    code: 'TP 1.2',
    description: 'Siswa mampu mengidentifikasi dan mengevaluasi berbagai perspektif dari suatu isu aktual dengan menggunakan keterampilan berpikir kritis (critical thinking) dan landasan informasi yang valid.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'Juli_4': 4 }
  },
  {
    id: 'tp1-3',
    element: 'Membaca - Memirsa',
    code: 'TP 1.3',
    description: 'Siswa mampu mengintegrasikan informasi dari berbagai sumber (artikel, video, berita, opini) untuk menyusun argumentasi pro dan kontra yang logis, relevan, dan berbukti.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'Agustus_1': 4 }
  },
  {
    id: 'tp1-4',
    element: 'Menulis - Mempresentasikan',
    code: 'TP 1.4',
    description: 'Siswa mampu menyusun discussion text secara mandiri dengan struktur lengkap (issue – arguments for – arguments against – conclusion) dan penggunaan bahasa yang sesuai kaidah academic writing.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'Agustus_3': 4 }
  },
  {
    id: 'tp1-5',
    element: 'Menyimak - Berbicara',
    code: 'TP 1.5',
    description: 'Siswa mampu mengkomunikasikan hasil analisisnya baik secara lisan maupun tulisan dengan jelas, runtut, serta menggunakan ungkapan expressing stance secara tepat.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'Agustus_4': 4 }
  },
  {
    id: 'tp1-6',
    element: 'Membaca - Memirsa',
    code: 'TP 1.6',
    description: 'Siswa memahami fungsi dan struktur job application letter (opening, body, closing).',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'September_1': 4 }
  },
  {
    id: 'tp1-7',
    element: 'Membaca - Memirsa',
    code: 'TP 1.7',
    description: 'Siswa mampu menganalisis contoh surat lamaran kerja untuk mengidentifikasi unsur penting dan bahasa formal yang sesuai.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'September_2': 4 }
  },
  {
    id: 'tp1-8',
    element: 'Menulis - Mempresentasikan',
    code: 'TP 1.8',
    description: 'Siswa mampu memilih informasi diri yang relevan (pengalaman, keterampilan, prestasi) sesuai posisi pekerjaan yang dilamar.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'September_3': 4 }
  },
  {
    id: 'tp1-9',
    element: 'Menulis - Mempresentasikan',
    code: 'TP 1.9',
    description: 'Siswa mampu menulis job application letter yang sistematis dan profesional menggunakan bahasa formal dan format yang sesuai.',
    semester: 1,
    jp: 8,
    weeklyAllocation: { 'Oktober_1': 4, 'Oktober_2': 4 }
  },
  {
    id: 'tp1-10',
    element: 'Menulis - Mempresentasikan',
    code: 'TP 1.10',
    description: 'Siswa mampu merevisi dan menyempurnakan surat lamaran kerja berdasarkan masukan guru atau teman (peer review).',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'Oktober_3': 4 }
  },
  {
    id: 'tp1-11',
    element: 'Menyimak - Berbicara',
    code: 'TP 1.11',
    description: 'Siswa memahami tujuan, alur, dan etika dasar job interview (perkenalan, pertanyaan utama, penutup).',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'Oktober_4': 4 }
  },
  {
    id: 'tp1-12',
    element: 'Menyimak - Berbicara',
    code: 'TP 1.12',
    description: 'Siswa mampu mengidentifikasi jenis-jenis pertanyaan wawancara kerja (personal questions, strength & weakness, experience, motivation, situational & behavioral questions).',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'Oktober_5': 4 }
  },
  {
    id: 'tp1-13',
    element: 'Menyimak - Berbicara',
    code: 'TP 1.13',
    description: 'Siswa mampu menyiapkan jawaban yang relevan, jujur, dan profesional berdasarkan pengalaman, keterampilan, dan posisi pekerjaan yang dilamar.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'November_1': 4 }
  },
  {
    id: 'tp1-14',
    element: 'Menyimak - Berbicara',
    code: 'TP 1.14',
    description: 'Siswa mampu menggunakan bahasa Inggris lisan yang tepat dalam job interview, termasuk formal expressions, clear articulation, dan polite tone.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'November_2': 4 }
  },
  {
    id: 'tp1-15',
    element: 'Menyimak - Berbicara',
    code: 'TP 1.15',
    description: 'Siswa mampu melakukan simulasi job interview dengan menunjukkan sikap percaya diri, komunikasi efektif, dan bahasa tubuh yang baik.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'November_3': 4 }
  },
  {
    id: 'tp1-16',
    element: 'Menyimak - Berbicara',
    code: 'TP 1.16',
    description: 'Siswa mampu mengevaluasi performa wawancara diri sendiri dan teman melalui peer review, termasuk kekuatan dan aspek yang perlu ditingkatkan.',
    semester: 1,
    jp: 4,
    weeklyAllocation: { 'November_4': 4 }
  }
];

export const INITIAL_OBJECTIVES_SEM2: LearningObjective[] = [
  {
    id: 'tp2-1',
    element: 'Membaca - Memirsa',
    code: 'TP 2.1',
    description: 'Siswa mampu mengidentifikasi struktur report text (general classification dan description).',
    semester: 2,
    jp: 4,
    weeklyAllocation: { 'Januari_1': 4 }
  },
  {
    id: 'tp2-2',
    element: 'Membaca - Memirsa',
    code: 'TP 2.2',
    description: 'Siswa mampu mengenali dan menggunakan unsur kebahasaan utama seperti simple present tense, general nouns, dan technical vocabulary.',
    semester: 2,
    jp: 4,
    weeklyAllocation: { 'Januari_2': 4 }
  },
  {
    id: 'tp2-3',
    element: 'Membaca - Memirsa',
    code: 'TP 2.3',
    description: 'Siswa mampu menganalisis contoh report text untuk melihat kesesuaian struktur, isi, dan bahasa.',
    semester: 2,
    jp: 4,
    weeklyAllocation: { 'Januari_3': 4 }
  },
  {
    id: 'tp2-4',
    element: 'Menulis - Mempresentasikan',
    code: 'TP 2.4',
    description: 'Siswa mampu menulis report text sederhana secara runtut dan faktual berdasarkan sumber terpercaya.',
    semester: 2,
    jp: 4,
    weeklyAllocation: { 'Januari_4': 4 }
  },
  {
    id: 'tp2-5',
    element: 'Membaca - Memirsa',
    code: 'TP 2.5',
    description: 'Mengidentifikasi konteks, gagasan utama, dan informasi terperinci dari teks argumentatif.',
    semester: 2,
    jp: 4,
    weeklyAllocation: { 'Februari_1': 4 }
  },
  {
    id: 'tp2-6',
    element: 'Membaca - Memirsa',
    code: 'TP 2.6',
    description: 'Mengidentifikasi makna tersurat dari teks argumentatif dalam bentuk multimodal.',
    semester: 2,
    jp: 4,
    weeklyAllocation: { 'Februari_2': 4 }
  },
  {
    id: 'tp2-7',
    element: 'Menulis - Mempresentasikan',
    code: 'TP 2.7',
    description: 'Merancang teks argumentatif dengan memperhatikan konteks dan tujuan penulisan.',
    semester: 2,
    jp: 4,
    weeklyAllocation: { 'Februari_3': 4 }
  },
  {
    id: 'tp2-8',
    element: 'Menulis - Mempresentasikan',
    code: 'TP 2.8',
    description: 'Memproduksi teks argumentatif dalam bentuk multimodal.',
    semester: 2,
    jp: 8,
    weeklyAllocation: { 'Februari_4': 4, 'Maret_1': 4 }
  },
  {
    id: 'tp2-9',
    element: 'Menulis - Mempresentasikan',
    code: 'TP 2.9',
    description: 'Mempresentasikan teks argumentatif hasil karya mandiri maupun kelompok dengan santun dan persuasif.',
    semester: 2,
    jp: 4,
    weeklyAllocation: { 'April_5': 4 }
  }
];

export const TIME_SLOTS = [
  { period: 1, timeRange: '07:05 - 07:45' },
  { period: 2, timeRange: '07:45 - 08:15' },
  { period: 3, timeRange: '08:15 - 08:45' },
  { period: 4, timeRange: '08:45 - 09:15' },
  { period: 5, timeRange: '09:30 - 10:00' },
  { period: 6, timeRange: '10:00 - 10:30' },
  { period: 7, timeRange: '10:30 - 11:00' },
  { period: 8, timeRange: '11:00 - 11:30' },
  { period: 9, timeRange: '11:30 - 12:00' },
  { period: 10, timeRange: '13:00 - 13:40' },
  { period: 11, timeRange: '13:40 - 14:20' },
  { period: 12, timeRange: '14:20 - 15:00' }
];

export const INITIAL_SCHEDULES: ScheduleSlot[] = [
  // Teacher F (Hasna Anggi R, S.Pd) - Bahasa Inggris
  // Senin: XII TKR 1, XII TKJ 1
  { id: 's1', day: 'Senin', period: 5, timeRange: '09:30 - 10:00', grade: 'XII', className: 'XII TKJ 2', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'B5' },
  { id: 's2', day: 'Senin', period: 6, timeRange: '10:00 - 10:30', grade: 'XII', className: 'XII TKJ 2', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'B5' },
  { id: 's3', day: 'Senin', period: 7, timeRange: '10:30 - 11:00', grade: 'XII', className: 'XII TKJ 2', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'B5' },
  { id: 's4', day: 'Senin', period: 8, timeRange: '11:00 - 11:30', grade: 'XII', className: 'XII TKJ 2', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'B5' },

  // Selasa: XI TKJ 1, XII TSM 1
  { id: 's5', day: 'Selasa', period: 1, timeRange: '07:05 - 07:45', grade: 'XI', className: 'XI TKJ 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'D2' },
  { id: 's6', day: 'Selasa', period: 2, timeRange: '07:45 - 08:15', grade: 'XI', className: 'XI TKJ 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'D2' },
  { id: 's7', day: 'Selasa', period: 3, timeRange: '08:15 - 08:45', grade: 'XI', className: 'XI TKJ 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'D2' },
  { id: 's8', day: 'Selasa', period: 4, timeRange: '08:45 - 09:15', grade: 'XI', className: 'XI TKJ 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'D2' },
  { id: 's9', day: 'Selasa', period: 5, timeRange: '09:30 - 10:00', grade: 'XII', className: 'XII AK', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'C2' },
  { id: 's10', day: 'Selasa', period: 6, timeRange: '10:00 - 10:30', grade: 'XII', className: 'XII AK', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'C2' },
  { id: 's11', day: 'Selasa', period: 7, timeRange: '10:30 - 11:00', grade: 'XII', className: 'XII AK', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'C2' },
  { id: 's12', day: 'Selasa', period: 8, timeRange: '11:00 - 11:30', grade: 'XII', className: 'XII AK', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'C2' },

  // Rabu: X TO 1, X TO 2
  { id: 's13', day: 'Rabu', period: 5, timeRange: '09:30 - 10:00', grade: 'X', className: 'X TO 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'F3' },
  { id: 's14', day: 'Rabu', period: 6, timeRange: '10:00 - 10:30', grade: 'X', className: 'X TO 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'F3' },
  { id: 's15', day: 'Rabu', period: 7, timeRange: '10:30 - 11:00', grade: 'X', className: 'X TO 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'F3' },
  { id: 's16', day: 'Rabu', period: 8, timeRange: '11:00 - 11:30', grade: 'X', className: 'X TO 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'F3' },

  // Kamis: XII TKR 1
  { id: 's17', day: 'Kamis', period: 1, timeRange: '07:05 - 07:45', grade: 'XII', className: 'XII TKR 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'F2' },
  { id: 's18', day: 'Kamis', period: 2, timeRange: '07:45 - 08:15', grade: 'XII', className: 'XII TKR 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'F2' },
  { id: 's19', day: 'Kamis', period: 3, timeRange: '08:15 - 08:45', grade: 'XII', className: 'XII TKR 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'F2' },
  { id: 's20', day: 'Kamis', period: 4, timeRange: '08:45 - 09:15', grade: 'XII', className: 'XII TKR 1', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'F2' },

  // Jumat: XII PBS
  { id: 's21', day: 'Jumat', period: 6, timeRange: '09:30 - 10:00', grade: 'XII', className: 'XII PBS', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'B2' },
  { id: 's22', day: 'Jumat', period: 7, timeRange: '10:00 - 10:30', grade: 'XII', className: 'XII PBS', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'B2' },
  { id: 's23', day: 'Jumat', period: 8, timeRange: '10:30 - 11:00', grade: 'XII', className: 'XII PBS', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'B2' },
  { id: 's24', day: 'Jumat', period: 9, timeRange: '11:00 - 11:30', grade: 'XII', className: 'XII PBS', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'F', teacherName: 'HASNA ANGGI R, S.Pd', room: 'B2' },

  // Additional teachers for realism
  // Teacher O (Wahyu Widodo, S.Pd) - Matematika
  { id: 's30', day: 'Senin', period: 1, timeRange: '07:05 - 07:45', grade: 'X', className: 'X TO 3', subjectCode: 'MTK', subjectName: 'Matematika', teacherCode: 'O', teacherName: 'WAHYU WIDODO, S.Pd', room: 'F4' },
  { id: 's31', day: 'Senin', period: 2, timeRange: '07:45 - 08:15', grade: 'X', className: 'X TO 3', subjectCode: 'MTK', subjectName: 'Matematika', teacherCode: 'O', teacherName: 'WAHYU WIDODO, S.Pd', room: 'F4' },
  { id: 's32', day: 'Senin', period: 3, timeRange: '08:15 - 08:45', grade: 'X', className: 'X TO 3', subjectCode: 'MTK', subjectName: 'Matematika', teacherCode: 'O', teacherName: 'WAHYU WIDODO, S.Pd', room: 'F4' },
  { id: 's33', day: 'Senin', period: 4, timeRange: '08:45 - 09:15', grade: 'X', className: 'X TO 3', subjectCode: 'MTK', subjectName: 'Matematika', teacherCode: 'O', teacherName: 'WAHYU WIDODO, S.Pd', room: 'F4' },

  // Teacher T (A Solechudin, S.Kom) - DPK / KK TKJ
  { id: 's40', day: 'Senin', period: 5, timeRange: '09:30 - 10:00', grade: 'X', className: 'X TJKT 2', subjectCode: 'DPKTKJ', subjectName: 'DPK Teknik Komputer dan Jaringan', teacherCode: 'T', teacherName: 'A SOLECHUDIN, S.Kom', room: 'LAB TKJ' },
  { id: 's41', day: 'Senin', period: 6, timeRange: '10:00 - 10:30', grade: 'X', className: 'X TJKT 2', subjectCode: 'DPKTKJ', subjectName: 'DPK Teknik Komputer dan Jaringan', teacherCode: 'T', teacherName: 'A SOLECHUDIN, S.Kom', room: 'LAB TKJ' },
  { id: 's42', day: 'Senin', period: 7, timeRange: '10:30 - 11:00', grade: 'X', className: 'X TJKT 2', subjectCode: 'DPKTKJ', subjectName: 'DPK Teknik Komputer dan Jaringan', teacherCode: 'T', teacherName: 'A SOLECHUDIN, S.Kom', room: 'LAB TKJ' },
  { id: 's43', day: 'Senin', period: 8, timeRange: '11:00 - 11:30', grade: 'X', className: 'X TJKT 2', subjectCode: 'DPKTKJ', subjectName: 'DPK Teknik Komputer dan Jaringan', teacherCode: 'T', teacherName: 'A SOLECHUDIN, S.Kom', room: 'LAB TKJ' },

  // Teacher H (Johan Setiaji, S.Pd) - Bahasa Inggris
  { id: 's50', day: 'Senin', period: 1, timeRange: '07:05 - 07:45', grade: 'X', className: 'X TO 4', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'H', teacherName: 'JOHAN SETIAJI, S.Pd', room: 'F5' },
  { id: 's51', day: 'Senin', period: 2, timeRange: '07:45 - 08:15', grade: 'X', className: 'X TO 4', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'H', teacherName: 'JOHAN SETIAJI, S.Pd', room: 'F5' },
  { id: 's52', day: 'Senin', period: 3, timeRange: '08:15 - 08:45', grade: 'X', className: 'X TO 4', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'H', teacherName: 'JOHAN SETIAJI, S.Pd', room: 'F5' },
  { id: 's53', day: 'Senin', period: 4, timeRange: '08:45 - 09:15', grade: 'X', className: 'X TO 4', subjectCode: 'B ING', subjectName: 'Bahasa Inggris', teacherCode: 'H', teacherName: 'JOHAN SETIAJI, S.Pd', room: 'F5' }
];

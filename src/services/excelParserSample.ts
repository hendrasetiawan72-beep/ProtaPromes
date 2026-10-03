import * as XLSX from 'xlsx';

/**
 * Downloads a sample Jadwal KBM Excel template with real SMK Muhammadiyah Bawang data
 */
export function downloadSampleKbmFile(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: kode guru dan mapel
  const wsCodesData = [
    ['', '', 'KODE GURU DAN MATA PELAJARAN'],
    ['', '', 'SMK MUHAMMADIYAH BAWANG'],
    ['', '', 'TAHUN PELAJARAN 2026/2027'],
    [],
    ['NO', 'KODE GURU', 'NAMA GURU', '', 'KODE MAPEL', 'MATA PELAJARAN'],
    [1, 'A', 'Drs. SOLIKHIN, M.Pd', '', 'PAIPB', 'Pendidikan Agama Islam dan Budi Pekerti'],
    [2, 'B', 'Drs. WIDODO', '', 'PP', 'Pendidikan Pancasila'],
    [3, 'C', 'GURU C', '', 'B INDO', 'Bahasa Indonesia'],
    [4, 'D', 'SRI WELASIH, S.Pd', '', 'PJOK', 'Pendidikan Jasmani, Olahraga, dan Kesehatan'],
    [5, 'E', 'SUYATNO, MPd', '', 'SEJ', 'Sejarah Indonesia'],
    [6, 'F', 'HASNA ANGGI R, S.Pd', '', 'SB', 'Seni Budaya'],
    [7, 'G', 'AMALIA DESY N S, S.Pd', '', 'B JAWA', 'Bahasa Jawa'],
    [8, 'H', 'JOHAN SETIAJI, S.Pd', '', 'MTK', 'Matematika'],
    [9, 'I', 'GURU I', '', 'B ING', 'Bahasa Inggris'],
    [10, 'J', 'RIYAN ARDIYANTO, S.Pd', '', 'INF', 'Informatika'],
    [11, 'K', 'MUHAMAD THORIQ RAIHAN, S.Pd', '', 'IPAS', 'Projek Ilmu Pengetahuan Alam dan Sosial'],
    [12, 'L', 'HERA RINTANINGSIH, S.Pd', '', 'DPK', 'Dasar-dasar Program Keahlian'],
    [13, 'M', 'TEGUH NUGROHO, S.Si', '', 'KK', 'Kompetensi Kejuruan'],
    [14, 'N', 'FARA AMALIA, S.Pd', '', 'KMH', 'Pendidikan Kemuhammadiyahan'],
    [15, 'O', 'WAHYU WIDODO, S.Pd', '', 'CK', 'Ciri Khusus'],
    [16, 'P', 'RIFKI YOGA K, S.Pd', '', 'MP', 'Mata Pelajaran Pilihan'],
    [17, 'Q', 'QUNI MUSYABIHAH, S.Pd', '', 'KIK', 'Kreatif, Inovasi, dan Kewirausahaan']
  ];
  const wsCodes = XLSX.utils.aoa_to_sheet(wsCodesData);
  XLSX.utils.book_append_sheet(wb, wsCodes, 'kode guru dan mapel');

  // Sheet 2: KELAS X
  const wsKelasXData = [
    ['JADWAL PELAJARAN KELAS X'],
    ['SMK MUHAMMADIYAH BAWANG'],
    [],
    ['Hari', 'Jam ke', 'Waktu', 'X TO 1', '', '', 'X TO 2', '', '', 'X TJKT 1', '', ''],
    ['', '', '', 'Mapel', 'Guru', 'Ruang', 'Mapel', 'Guru', 'Ruang', 'Mapel', 'Guru', 'Ruang'],
    ['Senin', 1, '07:05 - 07:45', 'DPKTKR', 'AO', 'F6.1', 'DPKTKR', 'AT', '', 'DPKTKJ', 'T', 'LAB TKJ'],
    ['Senin', 2, '07:45 - 08:15', 'DPKTKR', 'AO', 'F6.1', 'DPKTKR', 'AT', '', 'DPKTKJ', 'T', 'LAB TKJ'],
    ['Senin', 3, '08:15 - 08:45', 'DPKTKR', 'AO', 'F6.1', 'DPKTKR', 'AT', '', 'DPKTKJ', 'T', 'LAB TKJ'],
    ['Senin', 4, '08:45 - 09:15', 'DPKTKR', 'AO', 'F6.1', 'DPKTKR', 'AT', '', 'DPKTKJ', 'T', 'LAB TKJ'],
    ['Rabu', 5, '09:30 - 10:00', 'B ING', 'F', 'F3', 'MTK', 'Y', '', 'INF', 'AAA', 'LAB FO'],
    ['Rabu', 6, '10:00 - 10:30', 'B ING', 'F', 'F3', 'MTK', 'Y', '', 'INF', 'AAA', 'LAB FO'],
    ['Rabu', 7, '10:30 - 11:00', 'B ING', 'F', 'F3', 'MTK', 'Y', '', 'INF', 'AAA', 'LAB FO'],
    ['Rabu', 8, '11:00 - 11:30', 'B ING', 'F', 'F3', 'MTK', 'Y', '', 'INF', 'AAA', 'LAB FO']
  ];
  const wsKelasX = XLSX.utils.aoa_to_sheet(wsKelasXData);
  XLSX.utils.book_append_sheet(wb, wsKelasX, 'KELAS X');

  // Sheet 3: KELAS XI
  const wsKelasXIData = [
    ['JADWAL PELAJARAN KELAS XI'],
    ['SMK MUHAMMADIYAH BAWANG'],
    [],
    ['Hari', 'Jam ke', 'Waktu', 'XI TKJ 1', '', '', 'XI TKR 1', '', ''],
    ['', '', '', 'Mapel', 'Guru', 'Ruang', 'Mapel', 'Guru', 'Ruang'],
    ['Selasa', 1, '07:05 - 07:45', 'B ING', 'F', 'D2', 'KK2TKR', 'AO', 'F6'],
    ['Selasa', 2, '07:45 - 08:15', 'B ING', 'F', 'D2', 'KK2TKR', 'AO', 'F6'],
    ['Selasa', 3, '08:15 - 08:45', 'B ING', 'F', 'D2', 'KK2TKR', 'AO', 'F6'],
    ['Selasa', 4, '08:45 - 09:15', 'B ING', 'F', 'D2', 'KK2TKR', 'AO', 'F6']
  ];
  const wsKelasXI = XLSX.utils.aoa_to_sheet(wsKelasXIData);
  XLSX.utils.book_append_sheet(wb, wsKelasXI, 'KELAS XI');

  // Sheet 4: KELAS XII
  const wsKelasXIIData = [
    ['JADWAL PELAJARAN KELAS XII'],
    ['SMK MUHAMMADIYAH BAWANG'],
    [],
    ['Hari', 'Jam ke', 'Waktu', 'XII TKR 1', '', '', 'XII TKJ 2', '', ''],
    ['', '', '', 'Mapel', 'Guru', 'Ruang', 'Mapel', 'Guru', 'Ruang'],
    ['Senin', 5, '09:30 - 10:00', 'PP', 'AJ', '', 'B ING', 'F', 'B5'],
    ['Senin', 6, '10:00 - 10:30', 'MTK', 'O', '', 'B ING', 'F', 'B5'],
    ['Senin', 7, '10:30 - 11:00', 'MTK', 'O', '', 'B ING', 'F', 'B5'],
    ['Senin', 8, '11:00 - 11:30', 'MTK', 'O', '', 'B ING', 'F', 'B5'],
    ['Kamis', 1, '07:05 - 07:45', 'B ING', 'F', 'F2', 'MP3', 'AP', ''],
    ['Kamis', 2, '07:45 - 08:15', 'B ING', 'F', 'F2', 'MP3', 'AP', '']
  ];
  const wsKelasXII = XLSX.utils.aoa_to_sheet(wsKelasXIIData);
  XLSX.utils.book_append_sheet(wb, wsKelasXII, 'KELAS XII');

  XLSX.writeFile(wb, 'Format_Jadwal_KBM_SMK.xlsx');
}

/**
 * Downloads sample KALDIK Excel template
 */
export function downloadSampleKaldikFile(): void {
  const wb = XLSX.utils.book_new();

  const kaldikSummaryData = [
    ['PERHITUNGAN MINGGU EFEKTIF'],
    ['Mata Diklat', ': Bahasa Inggris'],
    ['Kelas / Semester', ': XII/Ganjil & Genap'],
    ['Program Keahlian', ': Semua Program Keahlian'],
    ['Tahun', ': 2026/2027'],
    ['Jam per Minggu', ': 4'],
    [],
    ['No', 'Bulan', 'Jumlah Minggu', 'Minggu Tidak Efektif', 'Minggu Efektif'],
    ['01', 'Juli', 5, 3, 2],
    ['02', 'Agustus', 4, 1, 3],
    ['03', 'September', 4, 1, 3],
    ['04', 'Oktober', 5, 0, 5],
    ['05', 'November', 4, 0, 4],
    ['06', 'Desember', 5, 5, 0],
    ['', 'JUMLAH', 27, 10, 17],
    ['07', 'Januari', 4, 0, 4],
    ['08', 'Februari', 4, 0, 4],
    ['09', 'Maret', 4, 3, 1],
    ['10', 'April', 5, 4, 1],
    ['11', 'Mei', 4, 4, 0],
    ['12', 'Juni', 4, 4, 0],
    ['', 'JUMLAH', 25, 15, 10],
    [],
    ['Jumlah Minggu Tidak Efektif dalam satu tahun adalah 25 minggu'],
    ['Jumlah Minggu Efektif dalam satu tahun adalah 27 minggu'],
    [],
    ['Jumlah jam pertemuan semester 1 = 4 jam x 17 Minggu efektif = 68 jam'],
    ['Jumlah jam pertemuan semester 2 = 4 jam x 10 Minggu efektif = 40 jam'],
    [],
    ['CATATAN AGENDA & KEGIATAN PENTING (KALDIK):'],
    ['* 15 - 20 Juli 2026 : Masa Pengenalan Lingkungan Sekolah (MPLS)'],
    ['* 18 - 23 Agustus 2026 : Asesmen Nasional Berbasis Komputer (ANBK)'],
    ['* 1 - 6 September 2026 : Penilaian Sumatif Tengah Semester (PSTS) Gasal'],
    ['* 24 - 30 November 2026 : Penilaian Sumatif Akhir Semester (PSAS) Gasal'],
    ['* 19 - 31 Desember 2026 : Libur Akhir Semester Gasal'],
    ['* 1 - 6 Maret 2027 : Penilaian Sumatif Tengah Semester (PSTS) Genap'],
    ['* 15 - 27 Maret 2027 : Libur Hari Raya Idul Fitri 1448 H'],
    ['* 5 - 10 April 2027 : Penilaian Sumatif Akhir Jenjang (PSAJ)'],
    ['* 19 - 24 April 2027 : Uji Kompetensi Keahlian (UKK)'],
    ['* 8 Mei 2027 : Pengumuman Kelulusan & Wisuda Siswa'],
    ['* 1 - 8 Juni 2027 : Penilaian Sumatif Akhir Tahun (PSAT) Genap'],
    ['* 21 Juni - 10 Juli 2027 : Libur Akhir Tahun Pelajaran']
  ];

  const ws = XLSX.utils.aoa_to_sheet(kaldikSummaryData);
  XLSX.utils.book_append_sheet(wb, ws, 'per mgg efektif');
  XLSX.writeFile(wb, 'Format_KALDIK_SMK_Bawang.xlsx');
}

import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

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
 * Downloads sample KALDIK Excel template with colored matrix and white effective days
 */
export async function downloadSampleKaldikFile(): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SMK Muhammadiyah Bawang';
  wb.created = new Date();

  // -------------------------------------------------------------------------
  // SHEET 1: KALDIK Matrix (Warna)
  // Sel warna PUTIH = Hari Efektif Belajar (HEB)
  // Sel BERWARNA = Libur / Agenda Khusus / Ujian (Tidak Efektif)
  // -------------------------------------------------------------------------
  const wsMatrix = wb.addWorksheet('KALDIK Matrix (Warna)');

  wsMatrix.addRow(['KALENDER PENDIDIKAN DAN PERHITUNGAN HARI EFEKTIF (SMK BAWANG)']);
  wsMatrix.addRow(['Keterangan: Sel warna PUTIH = Hari Efektif Belajar (HEB). Sel BERWARNA = Libur / Agenda Khusus / Ujian.']);
  wsMatrix.addRow([]);

  // Header row
  const headerRow = wsMatrix.addRow([
    'No',
    'Bulan',
    ...Array.from({ length: 31 }, (_, i) => i + 1),
    'Hari Efektif (Putih)',
    'Hari Tdk Efektif',
    'Total Hari',
    'Jml Minggu',
    'Minggu Efektif'
  ]);

  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Months definition
  const monthsData = [
    { name: 'Juli', sem: 1, totalDays: 31, whiteDays: 12, nonEffDays: 19, totalWeeks: 5, effWeeks: 2, coloredRanges: [[1, 12], [15, 20]] }, // Libur Genap & MPLS
    { name: 'Agustus', sem: 1, totalDays: 31, whiteDays: 20, nonEffDays: 11, totalWeeks: 4, effWeeks: 3, coloredRanges: [[17, 17], [18, 23]] }, // HUT RI & ANBK
    { name: 'September', sem: 1, totalDays: 30, whiteDays: 19, nonEffDays: 11, totalWeeks: 4, effWeeks: 3, coloredRanges: [[1, 6]] }, // PSTS Gasal
    { name: 'Oktober', sem: 1, totalDays: 31, whiteDays: 26, nonEffDays: 5, totalWeeks: 5, effWeeks: 5, coloredRanges: [] }, // Full KBM
    { name: 'November', sem: 1, totalDays: 30, whiteDays: 24, nonEffDays: 6, totalWeeks: 4, effWeeks: 4, coloredRanges: [] }, // Full KBM
    { name: 'Desember', sem: 1, totalDays: 31, whiteDays: 0, nonEffDays: 31, totalWeeks: 5, effWeeks: 0, coloredRanges: [[1, 31]] }, // PSAS, Remedial, Rapor, Libur
    { name: 'Januari', sem: 2, totalDays: 31, whiteDays: 24, nonEffDays: 7, totalWeeks: 4, effWeeks: 4, coloredRanges: [[1, 3]] }, // Masuk Awal & Libur Tahun Baru
    { name: 'Februari', sem: 2, totalDays: 28, whiteDays: 22, nonEffDays: 6, totalWeeks: 4, effWeeks: 4, coloredRanges: [] }, // Full KBM
    { name: 'Maret', sem: 2, totalDays: 31, whiteDays: 8, nonEffDays: 23, totalWeeks: 4, effWeeks: 1, coloredRanges: [[1, 6], [15, 27]] }, // PSTS & Idul Fitri
    { name: 'April', sem: 2, totalDays: 30, whiteDays: 7, nonEffDays: 23, totalWeeks: 5, effWeeks: 1, coloredRanges: [[5, 10], [19, 24]] }, // PSAJ & UKK
    { name: 'Mei', sem: 2, totalDays: 31, whiteDays: 0, nonEffDays: 31, totalWeeks: 4, effWeeks: 0, coloredRanges: [[1, 31]] }, // Kelulusan & Wisuda
    { name: 'Juni', sem: 2, totalDays: 30, whiteDays: 0, nonEffDays: 30, totalWeeks: 4, effWeeks: 0, coloredRanges: [[1, 30]] }, // PSAT, Rapor, Libur
  ];

  monthsData.forEach((m, idx) => {
    const rowValues: any[] = [
      String(idx + 1).padStart(2, '0'),
      m.name
    ];

    // Dates 1..31
    for (let d = 1; d <= 31; d++) {
      if (d <= m.totalDays) {
        rowValues.push(d);
      } else {
        rowValues.push('-');
      }
    }

    rowValues.push(m.whiteDays);
    rowValues.push(m.nonEffDays);
    rowValues.push(m.totalDays);
    rowValues.push(m.totalWeeks);
    rowValues.push(m.effWeeks);

    const row = wsMatrix.addRow(rowValues);
    row.getCell(2).font = { bold: true };

    // Apply colors to date cells
    for (let d = 1; d <= 31; d++) {
      const cell = row.getCell(d + 2);
      cell.alignment = { horizontal: 'center' };

      if (d > m.totalDays) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        continue;
      }

      // Check if day falls in any colored range
      const isColored = m.coloredRanges.some(([start, end]) => d >= start && d <= end);

      if (isColored) {
        // Colored cell: Holiday / Exam / Agenda
        let argb = 'FFFF9999'; // default light red
        if (m.name === 'Juli' && d >= 15 && d <= 20) argb = 'FFAAFFAA'; // MPLS (Green)
        else if (m.name === 'Agustus' && d >= 18 && d <= 23) argb = 'FF88DDFF'; // ANBK (Cyan)
        else if (m.name.includes('Maret') && d >= 1 && d <= 6) argb = 'FFFFFF99'; // PSTS (Yellow)
        else if (m.name === 'April' && d >= 19 && d <= 24) argb = 'FFFFCC88'; // UKK (Orange)

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb }
        };
      } else {
        // Pure WHITE cell: Hari Efektif Belajar
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' }
        };
      }
    }

    // Highlight summary columns
    row.getCell(34).font = { bold: true }; // Hari Efektif Putih
    row.getCell(34).alignment = { horizontal: 'center' };
    row.getCell(38).font = { bold: true }; // Minggu Efektif
    row.getCell(38).alignment = { horizontal: 'center' };
  });

  // -------------------------------------------------------------------------
  // SHEET 2: per mgg efektif (Tabel Rekapitulasi)
  // -------------------------------------------------------------------------
  const wsSummary = wb.addWorksheet('per mgg efektif');
  const summaryRows = [
    ['PERHITUNGAN MINGGU & HARI EFEKTIF'],
    ['Mata Diklat', ': Bahasa Inggris'],
    ['Kelas / Semester', ': XII/Ganjil & Genap'],
    ['Program Keahlian', ': Semua Program Keahlian'],
    ['Tahun', ': 2026/2027'],
    ['Jam per Minggu', ': 4'],
    [],
    ['No', 'Bulan', 'Hari Efektif (Putih)', 'Jumlah Minggu', 'Minggu Tidak Efektif', 'Minggu Efektif'],
    ['01', 'Juli', 12, 5, 3, 2],
    ['02', 'Agustus', 20, 4, 1, 3],
    ['03', 'September', 19, 4, 1, 3],
    ['04', 'Oktober', 26, 5, 0, 5],
    ['05', 'November', 24, 4, 0, 4],
    ['06', 'Desember', 0, 5, 5, 0],
    ['', 'JUMLAH SEMESTER 1', 101, 27, 10, 17],
    ['07', 'Januari', 24, 4, 0, 4],
    ['08', 'Februari', 22, 4, 0, 4],
    ['09', 'Maret', 8, 4, 3, 1],
    ['10', 'April', 7, 5, 4, 1],
    ['11', 'Mei', 0, 4, 4, 0],
    ['12', 'Juni', 0, 4, 4, 0],
    ['', 'JUMLAH SEMESTER 2', 61, 25, 15, 10],
    [],
    ['Total Hari Efektif Belajar (Warna Putih) dalam 1 Tahun = 162 hari'],
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

  summaryRows.forEach(r => wsSummary.addRow(r));

  // Trigger browser download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Format_KALDIK_SMK_Bawang.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

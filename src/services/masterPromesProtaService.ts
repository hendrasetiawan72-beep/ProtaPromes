import * as XLSX from 'xlsx';
import { DocumentMeta, LearningObjective, MonthEffectiveBreakdown } from '../types';

export interface ParsedMasterData {
  success: boolean;
  objectivesSem1: LearningObjective[];
  objectivesSem2: LearningObjective[];
  capaianPembelajaran?: string;
  weeklyHours?: number;
  message: string;
  totalParsed: number;
}

/**
 * Download Master Promes-Prota template in Excel (.xlsx) format
 * Containing TP, Elemen, Capaian Pembelajaran, and week/hour allocations
 */
export const downloadMasterPromesProtaExcel = (
  meta: DocumentMeta,
  objectivesSem1: LearningObjective[],
  objectivesSem2: LearningObjective[],
  monthAnalysis: MonthEffectiveBreakdown[]
) => {
  const wb = XLSX.utils.book_new();

  const sem1Eff = monthAnalysis.filter(m => m.semester === 1).reduce((s, m) => s + m.effectiveWeeks, 0) || 19;
  const sem2Eff = monthAnalysis.filter(m => m.semester === 2).reduce((s, m) => s + m.effectiveWeeks, 0) || 18;
  const hpw = Number(meta.weeklyHours) || 4;

  // ==========================================
  // SHEET 1: MASTER TP, ELEMEN & CP (PROMES-PROTA)
  // ==========================================
  const sheet1Data: any[][] = [];

  // Header banner info
  sheet1Data.push(['MASTER TUJUAN PEMBELAJARAN (TP), ELEMEN & ALOKASI WAKTU']);
  sheet1Data.push([`Mata Pelajaran: ${meta.subjectName}`, `Kelas: ${meta.grade}`, `Tahun: ${meta.academicYear}`, `Guru: ${meta.teacherName} (NBM: ${meta.teacherNbm})`]);
  sheet1Data.push([`Ketentuan: ${hpw} JP/Minggu | Sem 1: ${sem1Eff} Minggu (${sem1Eff * hpw} JP) | Sem 2: ${sem2Eff} Minggu (${sem2Eff * hpw} JP)`]);
  sheet1Data.push([]); // blank row

  // Table Column Headers
  sheet1Data.push([
    'Semester',
    'Kode TP',
    'Elemen',
    'Tujuan Pembelajaran / Lingkup Materi',
    'Alokasi Minggu',
    'Alokasi JP',
    'Capaian Pembelajaran Terkait'
  ]);

  // Semester 1 Rows
  objectivesSem1.forEach((tp, idx) => {
    const calculatedWeeks = Math.max(1, Math.round((Number(tp.jp) || hpw * 3) / hpw));
    const calculatedJp = Number(tp.jp) || (calculatedWeeks * hpw);
    sheet1Data.push([
      1,
      tp.code || `TP 1.${idx + 1}`,
      tp.element || 'Membaca - Memirsa',
      tp.description || '',
      calculatedWeeks,
      calculatedJp,
      'Memahami dan menganalisis ide pokok serta konteks teks lisan dan visual.'
    ]);
  });

  // Semester 2 Rows
  objectivesSem2.forEach((tp, idx) => {
    const calculatedWeeks = Math.max(1, Math.round((Number(tp.jp) || hpw * 3) / hpw));
    const calculatedJp = Number(tp.jp) || (calculatedWeeks * hpw);
    sheet1Data.push([
      2,
      tp.code || `TP 2.${idx + 1}`,
      tp.element || 'Menulis - Mempresentasikan',
      tp.description || '',
      calculatedWeeks,
      calculatedJp,
      'Menyusun teks tertulis dan mempresentasikannya dengan kaidah berbahasa yang tepat.'
    ]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  // Column widths
  ws1['!cols'] = [
    { wch: 10 }, // Semester
    { wch: 14 }, // Kode TP
    { wch: 28 }, // Elemen
    { wch: 55 }, // Tujuan Pembelajaran
    { wch: 16 }, // Alokasi Minggu
    { wch: 14 }, // Alokasi JP
    { wch: 50 }, // Capaian Pembelajaran
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'MASTER_TP_PROMES_PROTA');

  // ==========================================
  // SHEET 2: CAPAIAN PEMBELAJARAN & INFO UMUM
  // ==========================================
  const defaultCp = meta.capaianPembelajaran ||
    'Pada akhir Fase F, peserta didik menggunakan teks lisan, tulisan dan visual dalam berkomunikasi sesuai situasi, tujuan, dan pemirsa/pembacanya. Pembelajaran difokuskan pada penguasaan kompetensi dasar dan kejuruan secara komprehensif, kritis, dan mandiri guna membekali lulusan SMK dengan keahlian kerja dan karakter luhur.';

  const sheet2Data: any[][] = [
    ['INFORMASI KURIKULUM & CAPAIAN PEMBELAJARAN (FASE F)'],
    [],
    ['Parameter', 'Nilai / Uraian'],
    ['Mata Pelajaran', meta.subjectName],
    ['Tingkat / Fase', `${meta.grade} / Fase F`],
    ['Guru Pengampu', meta.teacherName],
    ['NBM Guru', meta.teacherNbm],
    ['Beban Belajar (JP per Minggu)', hpw],
    ['Kurikulum', meta.curriculum || 'Kurikulum Merdeka'],
    ['Tahun Pelajaran', meta.academicYear],
    ['Minggu Efektif Semester 1', sem1Eff],
    ['Minggu Efektif Semester 2', sem2Eff],
    [],
    ['CAPAIAN PEMBELAJARAN UMUM (FASE F)'],
    [defaultCp],
    [],
    ['PETUNJUK PENGISIAN & INTEGRASI PROMES-PROTA:'],
    ['1. Anda dapat menambah, mengubah, atau menghapus baris Tujuan Pembelajaran pada Sheet "MASTER_TP_PROMES_PROTA".'],
    ['2. Kolom "Semester" diisi 1 untuk Gasal dan 2 untuk Genap.'],
    ['3. Kolom "Elemen" dan "Tujuan Pembelajaran" akan langsung tampil di tabel PROTA dan PROMES.'],
    ['4. Kolom "Alokasi Minggu" otomatis dihitung menjadi Jam Pelajaran (Alokasi Minggu x JP per Minggu).'],
    ['5. Baris Capaian Pembelajaran Umum di atas akan memperbarui teks bagian A Capaian Pembelajaran di PROTA.'],
    ['6. Simpan file ini lalu gunakan tombol "Upload Master Promes-Prota" di aplikasi JadwalGuru Pro.']
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [{ wch: 32 }, { wch: 80 }];

  XLSX.utils.book_append_sheet(wb, ws2, 'CAPAIAN_PEMBELAJARAN_UMUM');

  const cleanSubject = (meta.subjectName || 'MAPEL').replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `MASTER_PROMES_PROTA_${cleanSubject}_${meta.grade}.xlsx`);
};

/**
 * Export Master as JSON backup
 */
export const downloadMasterPromesProtaJson = (
  meta: DocumentMeta,
  objectivesSem1: LearningObjective[],
  objectivesSem2: LearningObjective[]
) => {
  const payload = {
    app: 'JadwalGuru Pro SMK Muhammadiyah Bawang',
    exportedAt: new Date().toISOString(),
    meta,
    capaianPembelajaran: meta.capaianPembelajaran,
    objectivesSem1,
    objectivesSem2,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanSubject = (meta.subjectName || 'MAPEL').replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `MASTER_PROMES_PROTA_${cleanSubject}_${meta.grade}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Parse an uploaded Master Promes-Prota file (.xlsx, .xls, or .json)
 */
export const parseMasterPromesProtaFile = async (
  file: File,
  currentHpw: number = 4
): Promise<ParsedMasterData> => {
  const fileName = file.name.toLowerCase();

  // If JSON
  if (fileName.endsWith('.json')) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const objs1: LearningObjective[] = Array.isArray(parsed.objectivesSem1) ? parsed.objectivesSem1 : [];
      const objs2: LearningObjective[] = Array.isArray(parsed.objectivesSem2) ? parsed.objectivesSem2 : [];
      const cp = parsed.capaianPembelajaran || parsed.meta?.capaianPembelajaran;
      const weeklyHours = parsed.meta?.weeklyHours;

      return {
        success: true,
        objectivesSem1: objs1,
        objectivesSem2: objs2,
        capaianPembelajaran: cp,
        weeklyHours: weeklyHours ? Number(weeklyHours) : undefined,
        message: `Berhasil mengimpor ${objs1.length} TP Sem 1 dan ${objs2.length} TP Sem 2 dari format JSON.`,
        totalParsed: objs1.length + objs2.length,
      };
    } catch (e: any) {
      return {
        success: false,
        objectivesSem1: [],
        objectivesSem2: [],
        message: `Gagal membaca file JSON: ${e.message}`,
        totalParsed: 0,
      };
    }
  }

  // If Excel (.xlsx, .xls)
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });

        let capaianPembelajaran: string | undefined = undefined;
        let detectedWeeklyHours: number | undefined = undefined;

        // Check if there is a CAPAIAN_PEMBELAJARAN_UMUM sheet
        const cpSheetName = wb.SheetNames.find(n => n.toUpperCase().includes('CAPAIAN') || n.toUpperCase().includes('INFO'));
        if (cpSheetName) {
          const cpSheet = wb.Sheets[cpSheetName];
          const cpRows: any[][] = XLSX.utils.sheet_to_json(cpSheet, { header: 1 });
          for (let r = 0; r < cpRows.length; r++) {
            const row = cpRows[r];
            if (!row || row.length === 0) continue;
            const label = String(row[0] || '').toLowerCase();
            const val = String(row[1] || row[0] || '');

            if (label.includes('beban belajar') || label.includes('jp per minggu')) {
              const num = parseInt(val.replace(/\D/g, ''), 10);
              if (num > 0) detectedWeeklyHours = num;
            }

            if (label.includes('capaian pembelajaran umum') && cpRows[r + 1] && cpRows[r + 1][0]) {
              capaianPembelajaran = String(cpRows[r + 1][0]).trim();
            }
          }
        }

        // Get main TP sheet
        const tpSheetName = wb.SheetNames.find(n => n.toUpperCase().includes('MASTER') || n.toUpperCase().includes('TP') || n.toUpperCase().includes('PROMES')) || wb.SheetNames[0];
        const tpSheet = wb.Sheets[tpSheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(tpSheet, { header: 1 });

        // Find header row index
        let headerRowIdx = -1;
        let colIdxMap: Record<string, number> = {};

        for (let i = 0; i < Math.min(10, rawRows.length); i++) {
          const row = rawRows[i];
          if (!row) continue;
          const strRow = row.map(c => String(c || '').toLowerCase().trim());
          
          const hasTp = strRow.some(c => c.includes('tujuan') || c.includes('tp') || c.includes('materi'));
          const hasElemen = strRow.some(c => c.includes('elemen') || c.includes('element'));

          if (hasTp || hasElemen) {
            headerRowIdx = i;
            strRow.forEach((colName, cIdx) => {
              if (colName.includes('semester') || colName.includes('smt') || colName.includes('sem')) {
                colIdxMap.semester = cIdx;
              } else if (colName.includes('kode') || colName.includes('no')) {
                colIdxMap.code = cIdx;
              } else if (colName.includes('elemen') || colName.includes('element')) {
                colIdxMap.element = cIdx;
              } else if (colName.includes('tujuan') || colName.includes('materi') || colName.includes('deskripsi') || colName.includes('lingkup')) {
                colIdxMap.description = cIdx;
              } else if (colName.includes('minggu') || colName.includes('week')) {
                colIdxMap.weeks = cIdx;
              } else if (colName.includes('jp') || colName.includes('alokasi') || colName.includes('jam')) {
                colIdxMap.jp = cIdx;
              } else if (colName.includes('capaian') || colName.includes('cp')) {
                colIdxMap.cp = cIdx;
              }
            });
            break;
          }
        }

        if (headerRowIdx === -1) {
          // Fallback default column indexes if header not detected
          colIdxMap = {
            semester: 0,
            code: 1,
            element: 2,
            description: 3,
            weeks: 4,
            jp: 5,
            cp: 6,
          };
          headerRowIdx = 3;
        }

        const hpw = detectedWeeklyHours || currentHpw;
        const sem1List: LearningObjective[] = [];
        const sem2List: LearningObjective[] = [];

        for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;

          const desc = String(row[colIdxMap.description ?? 3] || '').trim();
          if (!desc || desc.toLowerCase().includes('total') || desc.toLowerCase().includes('jumlah')) {
            continue;
          }

          const rawSem = String(row[colIdxMap.semester ?? 0] || '1').toLowerCase();
          const semester: 1 | 2 = (rawSem.includes('2') || rawSem.includes('genap')) ? 2 : 1;

          const element = String(row[colIdxMap.element ?? 2] || (semester === 1 ? 'Membaca - Memirsa' : 'Menulis - Mempresentasikan')).trim();
          const targetList = semester === 1 ? sem1List : sem2List;
          const code = String(row[colIdxMap.code ?? 1] || `TP ${semester}.${targetList.length + 1}`).trim();

          const rawWeeks = parseInt(String(row[colIdxMap.weeks ?? 4] || '').replace(/\D/g, ''), 10);
          const rawJp = parseInt(String(row[colIdxMap.jp ?? 5] || '').replace(/\D/g, ''), 10);

          let finalJp = 16;
          if (rawJp && rawJp > 0) {
            finalJp = rawJp;
          } else if (rawWeeks && rawWeeks > 0) {
            finalJp = rawWeeks * hpw;
          } else {
            finalJp = 4 * hpw;
          }

          const newObj: LearningObjective = {
            id: `tp_${semester}_${Date.now()}_${targetList.length}`,
            semester,
            code,
            element,
            description: desc,
            jp: finalJp,
            weeklyAllocation: {},
          };

          targetList.push(newObj);
        }

        resolve({
          success: true,
          objectivesSem1: sem1List,
          objectivesSem2: sem2List,
          capaianPembelajaran,
          weeklyHours: detectedWeeklyHours,
          message: `Berhasil mengekstrak ${sem1List.length} TP Semester 1 dan ${sem2List.length} TP Semester 2.`,
          totalParsed: sem1List.length + sem2List.length,
        });
      } catch (err: any) {
        resolve({
          success: false,
          objectivesSem1: [],
          objectivesSem2: [],
          message: `Gagal memproses file Excel: ${err.message}`,
          totalParsed: 0,
        });
      }
    };
    reader.onerror = () => {
      resolve({
        success: false,
        objectivesSem1: [],
        objectivesSem2: [],
        message: 'Gagal membaca file dari perangkat.',
        totalParsed: 0,
      });
    };
    reader.readAsArrayBuffer(file);
  });
};

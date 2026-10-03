import * as XLSX from 'xlsx';
import { Teacher, Subject, ScheduleSlot, MonthEffectiveBreakdown, KaldikEvent } from '../types';
import { TIME_SLOTS } from '../data/initialData';

export interface ParseKbmResult {
  teachers: Teacher[];
  subjects: Subject[];
  schedules: ScheduleSlot[];
  stats: {
    totalTeachers: number;
    totalSubjects: number;
    totalSlots: number;
    sheetsDetected: string[];
    classesDetected: string[];
  };
}

export interface ParseKaldikResult {
  monthAnalysis: MonthEffectiveBreakdown[];
  events: KaldikEvent[];
  academicYear: string;
  weeklyHours?: number;
  subjectName?: string;
  totalEffectiveSem1: number;
  totalEffectiveSem2: number;
}

/**
 * Normalizes class name and guarantees Roman numeral grade prefix (X, XI, XII)
 * E.g. "TO 1" with default "X" -> "X TO 1"
 * E.g. "12 TKR 1" -> "XII TKR 1"
 * E.g. "XI TKJ 2" -> "XI TKJ 2"
 */
function normalizeClassName(
  rawName: string,
  defaultGrade: 'X' | 'XI' | 'XII' = 'X'
): { className: string; grade: 'X' | 'XI' | 'XII' } {
  let cleaned = rawName
    .replace(/^(?:KELAS|KLAS)\s+/i, '')
    .replace(/[._\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Check if it starts with 12 or XII
  if (/^(?:12|XII)(?:\s+|$)/i.test(cleaned)) {
    const rest = cleaned.replace(/^(?:12|XII)\s*/i, '').trim();
    return { className: `XII ${rest}`.trim(), grade: 'XII' };
  }

  // Check if it starts with 11 or XI
  if (/^(?:11|XI)(?:\s+|$)/i.test(cleaned)) {
    const rest = cleaned.replace(/^(?:11|XI)\s*/i, '').trim();
    return { className: `XI ${rest}`.trim(), grade: 'XI' };
  }

  // Check if it starts with 10 or X (but not XI or XII)
  if (/^(?:10|X)(?:\s+|$)/i.test(cleaned)) {
    const rest = cleaned.replace(/^(?:10|X)\s*/i, '').trim();
    return { className: `X ${rest}`.trim(), grade: 'X' };
  }

  // If no grade prefix, add the sheet default grade
  return { className: `${defaultGrade} ${cleaned}`.trim(), grade: defaultGrade };
}

/**
 * Checks whether text is a common header word that should NOT be considered a class name
 */
function isHeaderKeyword(text: string): boolean {
  const upper = text.toUpperCase().trim();
  const keywords = [
    'HARI',
    'JAM',
    'JAM KE',
    'WAKTU',
    'PUKUL',
    'NO',
    'NOMOR',
    'JADWAL',
    'PELAJARAN',
    'SMK',
    'MUHAMMADIYAH',
    'BAWANG',
    'TAHUN',
    'SEMESTER',
    'GASAL',
    'GENAP',
    'KURIKULUM',
    'MERDEKA',
    'MAPEL',
    'GURU',
    'RUANG',
    'KODE',
  ];
  return keywords.some(kw => upper === kw || upper.startsWith(kw + ' '));
}

/**
 * Fully dynamic Jadwal KBM Excel parser
 * - Finds rows containing "Hari" and "Jam/Waktu"
 * - Finds rows containing "Mapel" and "Guru"
 * - Uses every occurrence of "Mapel" as the start of a class block (Mapel | Guru | Ruang)
 * - Extracts class name from the row(s) above and normalizes (adds X / XI / XII)
 * - Immune to shifted columns, blank gaps, or formatting differences between sheets
 */
export async function parseJadwalKBM(input: File | ArrayBuffer | Uint8Array): Promise<ParseKbmResult> {
  const data: ArrayBuffer | Uint8Array =
    input instanceof ArrayBuffer || input instanceof Uint8Array
      ? input
      : await input.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  const teachers: Teacher[] = [];
  const subjects: Subject[] = [];
  const schedules: ScheduleSlot[] = [];
  const classesDetected = new Set<string>();
  const sheetsDetected: string[] = [];

  // =========================================================================
  // 1. LOCATE AND PARSE TEACHERS & SUBJECTS REFERENCE SHEET
  // =========================================================================
  const codeSheetName = sheetNames.find(s => {
    const lower = s.toLowerCase();
    return lower.includes('kode') || lower.includes('guru') || lower.includes('mapel') || lower.includes('daftar guru');
  });

  if (codeSheetName && workbook.Sheets[codeSheetName]) {
    const sheet = workbook.Sheets[codeSheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    let tCodeCol = -1;
    let tNameCol = -1;
    let tNbmCol = -1;
    let mCodeCol = -1;
    let mNameCol = -1;

    // Scan first 30 rows to detect header positions dynamically based on text content
    for (let r = 0; r < Math.min(rows.length, 30); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;

      row.forEach((cell, c) => {
        const text = String(cell || '').trim().toUpperCase();
        if (text.includes('KODE GURU') || text === 'KODE GR' || (text === 'KODE' && tCodeCol === -1)) {
          tCodeCol = c;
        } else if (text.includes('NAMA GURU') || text.includes('GURU MAPEL') || (text.includes('GURU') && !text.includes('KODE') && tNameCol === -1)) {
          tNameCol = c;
        } else if (text.includes('NBM') || text.includes('NIP')) {
          tNbmCol = c;
        } else if (text.includes('KODE MAPEL') || text.includes('KODE MP') || (text.includes('KODE') && c > tCodeCol + 1 && mCodeCol === -1)) {
          mCodeCol = c;
        } else if (text.includes('MATA PELAJARAN') || text.includes('NAMA MAPEL') || (text.includes('MAPEL') && !text.includes('KODE') && mNameCol === -1)) {
          mNameCol = c;
        }
      });
      if (tCodeCol !== -1 && mCodeCol !== -1) break;
    }

    // Fallbacks if not explicitly labeled
    if (tCodeCol === -1) tCodeCol = 1;
    if (tNameCol === -1) tNameCol = tCodeCol + 1;
    if (mCodeCol === -1 && rows[0] && rows[0].length > tNameCol + 1) mCodeCol = tNameCol + 2;
    if (mNameCol === -1 && mCodeCol !== -1) mNameCol = mCodeCol + 1;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      // Extract Teacher
      const tCode = row[tCodeCol] ? String(row[tCodeCol]).trim() : '';
      const tName = row[tNameCol] ? String(row[tNameCol]).trim() : '';
      const tNbm = tNbmCol !== -1 && row[tNbmCol] ? String(row[tNbmCol]).trim() : undefined;

      if (tCode && tName && !tCode.toUpperCase().includes('KODE') && !tName.toUpperCase().includes('NAMA')) {
        if (!teachers.some(t => t.code.toUpperCase() === tCode.toUpperCase())) {
          teachers.push({
            id: `t_${tCode}_${teachers.length + 1}`,
            code: tCode,
            name: tName,
            nbm: tNbm,
          });
        }
      }

      // Extract Subject
      if (mCodeCol !== -1 && mNameCol !== -1) {
        const mCode = row[mCodeCol] ? String(row[mCodeCol]).trim() : '';
        const mName = row[mNameCol] ? String(row[mNameCol]).trim() : '';
        if (mCode && mName && !mCode.toUpperCase().includes('KODE') && !mName.toUpperCase().includes('MATA')) {
          if (!subjects.some(s => s.code.toUpperCase() === mCode.toUpperCase())) {
            subjects.push({
              id: `s_${mCode}_${subjects.length + 1}`,
              code: mCode,
              name: mName,
            });
          }
        }
      }
    }
  }

  // Lookup maps
  const teacherMap = new Map<string, string>();
  teachers.forEach(t => teacherMap.set(t.code.toUpperCase(), t.name));

  const subjectMap = new Map<string, string>();
  subjects.forEach(s => subjectMap.set(s.code.toUpperCase(), s.name));

  // =========================================================================
  // 2. PARSE SCHEDULE SHEETS
  // =========================================================================
  const candidateSheets = sheetNames.filter(s => {
    const lower = s.toLowerCase();
    return (
      !lower.includes('kode guru dan mapel') &&
      !lower.includes('summary') &&
      !lower.includes('rekap') &&
      !lower.includes('per mgg')
    );
  });

  for (const sName of candidateSheets) {
    const sheet = workbook.Sheets[sName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    if (rows.length < 4) continue;

    // Detect sheet default grade from sheet title
    let defaultGrade: 'X' | 'XI' | 'XII' = 'X';
    if (sName.toUpperCase().includes('XII') || sName.includes('12')) defaultGrade = 'XII';
    else if (sName.toUpperCase().includes('XI') || sName.includes('11')) defaultGrade = 'XI';
    else if (sName.toUpperCase().includes('X') || sName.includes('10')) defaultGrade = 'X';

    // -----------------------------------------------------------------------
    // FIND ROW WITH "HARI" AND "JAM/WAKTU" & ROW WITH "MAPEL" AND "GURU"
    // -----------------------------------------------------------------------
    let headerRowIdx = -1;
    let mapelRowIdx = -1;

    for (let r = 0; r < Math.min(rows.length, 30); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;

      const rowStr = row.map(c => String(c || '').trim().toUpperCase());

      // Check for Hari / Jam / Waktu
      const hasHari = rowStr.some(c => c === 'HARI' || c.includes('HARI'));
      const hasJamOrWaktu = rowStr.some(c => c.includes('JAM') || c.includes('WAKTU') || c.includes('PUKUL'));
      if (hasHari && hasJamOrWaktu && headerRowIdx === -1) {
        headerRowIdx = r;
      }

      // Check for Mapel and Guru
      const mapelCount = rowStr.filter(c => c === 'MAPEL' || c.startsWith('MAPEL')).length;
      const guruCount = rowStr.filter(c => c === 'GURU' || c.startsWith('GURU')).length;
      if (mapelCount >= 1 && (guruCount >= 1 || rowStr.some(c => c.includes('GURU')))) {
        mapelRowIdx = r;
        break;
      }
    }

    // If mapelRowIdx not found, continue to next sheet
    if (mapelRowIdx === -1) continue;
    sheetsDetected.push(sName);

    // If headerRowIdx was not found, assume it is right above mapelRowIdx or on the same row
    if (headerRowIdx === -1) {
      headerRowIdx = Math.max(0, mapelRowIdx - 1);
    }

    const mapelRow = rows[mapelRowIdx];

    // -----------------------------------------------------------------------
    // DETECT CLASS BLOCKS:
    // Every occurrence of word "MAPEL" starts a class block (Mapel | Guru | Ruang)
    // -----------------------------------------------------------------------
    interface ClassBlock {
      className: string;
      grade: 'X' | 'XI' | 'XII';
      mapelCol: number;
      guruCol: number;
      ruangCol: number;
    }

    const classBlocks: ClassBlock[] = [];

    for (let c = 0; c < mapelRow.length; c++) {
      const cellText = String(mapelRow[c] || '').trim().toUpperCase();
      if (cellText === 'MAPEL' || cellText.startsWith('MAPEL')) {
        const mapelCol = c;

        // Find Guru column: look in c+1 to c+3 for "GURU"
        let guruCol = -1;
        let ruangCol = -1;

        for (let next = c + 1; next <= c + 4 && next < mapelRow.length; next++) {
          const nextText = String(mapelRow[next] || '').trim().toUpperCase();
          if ((nextText === 'GURU' || nextText.includes('GURU')) && guruCol === -1) {
            guruCol = next;
          } else if ((nextText === 'RUANG' || nextText.includes('RUANG') || nextText === 'R.') && ruangCol === -1) {
            ruangCol = next;
          }
        }

        // Fallback for adjacent columns if not explicitly labeled
        if (guruCol === -1) guruCol = mapelCol + 1;
        if (ruangCol === -1) ruangCol = mapelCol + 2;

        // Extract class name from the row(s) directly ABOVE mapelRowIdx
        let extractedRawClass = '';

        // Check rows above (from mapelRowIdx - 1 upwards)
        for (let rAbove = mapelRowIdx - 1; rAbove >= Math.max(0, mapelRowIdx - 3); rAbove--) {
          const parentRow = rows[rAbove];
          if (!Array.isArray(parentRow)) continue;

          // Check cell at mapelCol, guruCol, or ruangCol
          const directCand = String(parentRow[mapelCol] || parentRow[guruCol] || parentRow[ruangCol] || '').trim();
          if (directCand && !isHeaderKeyword(directCand)) {
            extractedRawClass = directCand;
            break;
          }

          // In Excel, merged cells store value in the leftmost cell of the merge
          // Trace leftwards in parentRow from mapelCol down to 0
          for (let leftCol = mapelCol; leftCol >= Math.max(0, mapelCol - 4); leftCol--) {
            const cand = String(parentRow[leftCol] || '').trim();
            if (cand && !isHeaderKeyword(cand)) {
              extractedRawClass = cand;
              break;
            }
          }

          if (extractedRawClass) break;
        }

        // Fallback name if nothing found above
        if (!extractedRawClass) {
          extractedRawClass = `KELAS_${classBlocks.length + 1}`;
        }

        const { className, grade } = normalizeClassName(extractedRawClass, defaultGrade);
        classesDetected.add(className);

        classBlocks.push({
          className,
          grade,
          mapelCol,
          guruCol,
          ruangCol,
        });
      }
    }

    if (classBlocks.length === 0) continue;

    // -----------------------------------------------------------------------
    // DYNAMICALLY DETECT DAY, PERIOD, AND TIME COLUMNS
    // -----------------------------------------------------------------------
    let dayCol = -1;
    let periodCol = -1;
    let timeCol = -1;

    // Check header rows
    for (let r = 0; r <= mapelRowIdx; r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;
      row.forEach((cell, c) => {
        const text = String(cell || '').trim().toUpperCase();
        if (text === 'HARI' || text.includes('HARI')) {
          if (dayCol === -1) dayCol = c;
        } else if (text === 'JAM' || text === 'JAM KE' || text.includes('JAM KE') || text === 'KE') {
          if (periodCol === -1) periodCol = c;
        } else if (text === 'WAKTU' || text.includes('WAKTU') || text.includes('PUKUL')) {
          if (timeCol === -1) timeCol = c;
        }
      });
    }

    // Fallbacks if not labeled
    if (dayCol === -1) dayCol = 0;
    if (periodCol === -1) periodCol = dayCol + 1;
    if (timeCol === -1) timeCol = periodCol + 1;

    // -----------------------------------------------------------------------
    // SCAN TIMETABLE ROWS
    // Maintain currentDay across vertically merged cells
    // -----------------------------------------------------------------------
    let currentDay: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' = 'Senin';

    for (let r = mapelRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      // Detect Day in first 5 columns
      const scanSection = row.slice(0, 5).map(c => String(c || '').trim().toUpperCase()).join(' ');
      if (scanSection.includes('SENIN')) currentDay = 'Senin';
      else if (scanSection.includes('SELASA')) currentDay = 'Selasa';
      else if (scanSection.includes('RABU')) currentDay = 'Rabu';
      else if (scanSection.includes('KAMIS')) currentDay = 'Kamis';
      else if (scanSection.includes('JUMAT') || scanSection.includes("JUM'AT")) currentDay = 'Jumat';

      // Detect Period (Jam Ke 1 - 12)
      let period = 0;
      let timeRange = '';

      // Check periodCol first
      const directPeriodVal = row[periodCol];
      const parsedNum = parseInt(String(directPeriodVal || '').trim(), 10);
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 12) {
        period = parsedNum;
      } else {
        // Fallback scan columns 0 to 4
        for (let c = 0; c < 5; c++) {
          const val = row[c];
          const num = parseInt(String(val || '').trim(), 10);
          if (!isNaN(num) && num >= 1 && num <= 12) {
            period = num;
            break;
          }
        }
      }

      if (!period) continue; // Skip non-teaching rows or breaks

      // Detect Time Range
      const directTimeVal = row[timeCol];
      if (typeof directTimeVal === 'string' && directTimeVal.includes(':')) {
        timeRange = directTimeVal.trim();
      } else {
        // Fallback scan
        for (let c = 0; c < 5; c++) {
          const val = String(row[c] || '').trim();
          if (/\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}/.test(val)) {
            timeRange = val;
            break;
          }
        }
      }

      if (!timeRange) {
        const defaultSlot = TIME_SLOTS.find(ts => ts.period === period);
        timeRange = defaultSlot ? defaultSlot.timeRange : `Jam ke-${period}`;
      }

      // Check for whole-row break (e.g. Istirahat / Sholat)
      const fullRowText = row.map(c => String(c || '')).join(' ').toUpperCase();
      if (
        fullRowText.includes('ISTIRAHAT') ||
        fullRowText.includes('SHOLAT') ||
        fullRowText.includes('DHUHA') ||
        fullRowText.includes('UPACARA') ||
        fullRowText.includes('LITERASI')
      ) {
        continue;
      }

      // Read each dynamic class block
      for (const block of classBlocks) {
        const rawMapel = row[block.mapelCol] ? String(row[block.mapelCol]).trim() : '';
        const rawGuru = row[block.guruCol] ? String(row[block.guruCol]).trim() : '';
        const rawRuang = block.ruangCol < row.length && row[block.ruangCol] ? String(row[block.ruangCol]).trim() : '';

        if (!rawMapel && !rawGuru) continue;

        const cellCheck = (rawMapel + ' ' + rawGuru).toUpperCase();
        if (
          cellCheck.includes('ISTIRAHAT') ||
          cellCheck.includes('SHOLAT') ||
          cellCheck.includes('SEHAT') ||
          cellCheck.includes('UPACARA')
        ) {
          continue;
        }

        // Auto-register teacher code if not yet registered
        if (rawGuru && !teacherMap.has(rawGuru.toUpperCase())) {
          const autoTeacher: Teacher = {
            id: `t_${rawGuru}_${teachers.length + 1}`,
            code: rawGuru,
            name: `Guru ${rawGuru}`,
          };
          teachers.push(autoTeacher);
          teacherMap.set(rawGuru.toUpperCase(), autoTeacher.name);
        }

        // Auto-register subject code if not yet registered
        if (rawMapel && !subjectMap.has(rawMapel.toUpperCase())) {
          const autoSubject: Subject = {
            id: `s_${rawMapel}_${subjects.length + 1}`,
            code: rawMapel,
            name: rawMapel,
          };
          subjects.push(autoSubject);
          subjectMap.set(rawMapel.toUpperCase(), autoSubject.name);
        }

        const teacherName = teacherMap.get(rawGuru.toUpperCase()) || `Guru ${rawGuru}`;
        const subjectName = subjectMap.get(rawMapel.toUpperCase()) || rawMapel;

        schedules.push({
          id: `slot_${block.grade}_${block.className}_${currentDay}_${period}_${Math.random().toString(36).substring(2, 7)}`,
          day: currentDay,
          period,
          timeRange,
          grade: block.grade,
          className: block.className,
          subjectCode: rawMapel,
          subjectName,
          teacherCode: rawGuru,
          teacherName,
          room: rawRuang || undefined,
        });
      }
    }
  }

  return {
    teachers,
    subjects,
    schedules,
    stats: {
      totalTeachers: teachers.length,
      totalSubjects: subjects.length,
      totalSlots: schedules.length,
      sheetsDetected,
      classesDetected: Array.from(classesDetected).sort(),
    },
  };
}

/**
 * Fully dynamic KALDIK Excel parser
 * - Reads sheet "per mgg efektif" (or equivalent) for Effective Weeks counts
 * - Extracts all notes starting with '*' as important events
 * - Automatically detects academic year, weekly hours, and subject name
 */
export async function parseKaldikExcel(input: File | ArrayBuffer | Uint8Array): Promise<ParseKaldikResult> {
  const data: ArrayBuffer | Uint8Array =
    input instanceof ArrayBuffer || input instanceof Uint8Array
      ? input
      : await input.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  let monthAnalysis: MonthEffectiveBreakdown[] = [];
  const events: KaldikEvent[] = [];
  let detectedYear = '2026/2027';
  let detectedWeeklyHours: number | undefined = undefined;
  let detectedSubjectName: string | undefined = undefined;

  // -------------------------------------------------------------------------
  // 1. SCAN ALL SHEETS FOR ACADEMIC YEAR, SUBJECT, AND WEEKLY HOURS
  // -------------------------------------------------------------------------
  for (const sName of sheetNames) {
    const sheet = workbook.Sheets[sName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    for (const r of rows.slice(0, 15)) {
      if (!Array.isArray(r)) continue;
      const line = r.join(' ');

      // Academic year regex: matches 2026/2027, 2026-2027, 2025/2026
      const yearMatch = line.match(/(?:Tahun\s*(?:Pelajaran|Ajaran)?\s*[:\s]*)?((?:20\d{2})\s*[\/\-]\s*(?:20\d{2}))/i);
      if (yearMatch && yearMatch[1]) {
        detectedYear = yearMatch[1].replace('-', '/').trim();
      }

      // Weekly hours regex: matches "Jam per Minggu: 4" or "4 jam x 17" or "Beban 4 JP"
      const hoursMatch = line.match(/(?:Jam\s*(?:per\s*Minggu|Mapel)?|Beban)\s*[:\s]*(\d+)/i) ||
                         line.match(/(\d+)\s*(?:jam|jp)\s*x\s*\d+\s*minggu/i);
      if (hoursMatch && hoursMatch[1]) {
        const h = parseInt(hoursMatch[1], 10);
        if (h >= 1 && h <= 36) detectedWeeklyHours = h;
      }

      // Subject name: matches "Mata Diklat : Bahasa Inggris" or "Mata Pelajaran : ..."
      const subjectMatch = line.match(/(?:Mata\s*(?:Diklat|Pelajaran))\s*[:\s]+([^,\n\r]+)/i);
      if (subjectMatch && subjectMatch[1]) {
        const sub = subjectMatch[1].trim();
        if (sub.length > 2) detectedSubjectName = sub;
      }
    }
  }

  // -------------------------------------------------------------------------
  // 2. LOCATE SHEET "per mgg efektif" FOR EFFECTIVE WEEKS TABLE
  // -------------------------------------------------------------------------
  const targetSheetName = sheetNames.find(s => {
    const lower = s.toLowerCase();
    return lower.includes('per mgg efektif') || lower.includes('mgg efektif') || lower.includes('minggu efektif');
  }) || sheetNames.find(s => s.toLowerCase().includes('efektif')) || sheetNames[0];

  const standardMonths: Array<{ name: string; semester: 1 | 2; defaultWeeks: number }> = [
    { name: 'Juli', semester: 1, defaultWeeks: 5 },
    { name: 'Agustus', semester: 1, defaultWeeks: 4 },
    { name: 'September', semester: 1, defaultWeeks: 4 },
    { name: 'Oktober', semester: 1, defaultWeeks: 5 },
    { name: 'November', semester: 1, defaultWeeks: 4 },
    { name: 'Desember', semester: 1, defaultWeeks: 5 },
    { name: 'Januari', semester: 2, defaultWeeks: 4 },
    { name: 'Februari', semester: 2, defaultWeeks: 4 },
    { name: 'Maret', semester: 2, defaultWeeks: 4 },
    { name: 'April', semester: 2, defaultWeeks: 5 },
    { name: 'Mei', semester: 2, defaultWeeks: 4 },
    { name: 'Juni', semester: 2, defaultWeeks: 4 },
  ];

  if (targetSheetName && workbook.Sheets[targetSheetName]) {
    const sheet = workbook.Sheets[targetSheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    // Detect column indexes for table: Bulan, Jumlah Minggu, Tidak Efektif, Efektif
    let colMonth = -1;
    let colTotal = -1;
    let colNonEff = -1;
    let colEff = -1;

    for (let r = 0; r < Math.min(rows.length, 25); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;

      row.forEach((cell, c) => {
        const str = String(cell || '').trim().toUpperCase();
        if (str === 'BULAN' || str.includes('NAMA BULAN')) {
          colMonth = c;
        } else if (str.includes('JUMLAH MINGGU') || str.includes('JML MINGGU') || str.includes('TOTAL MINGGU')) {
          colTotal = c;
        } else if (str.includes('TIDAK EFEKTIF') || str.includes('NON EFEKTIF')) {
          colNonEff = c;
        } else if (str.includes('EFEKTIF') && !str.includes('TIDAK') && !str.includes('NON')) {
          colEff = c;
        }
      });
      if (colMonth !== -1 && colEff !== -1) break;
    }

    // Map each standard month from table rows
    standardMonths.forEach(mObj => {
      let foundData: { totalWeeks: number; nonEffectiveWeeks: number; effectiveWeeks: number } | null = null;

      for (const row of rows) {
        if (!Array.isArray(row)) continue;

        // Check if any cell in row matches month name
        const matchIdx = row.findIndex(c => {
          const s = String(c || '').trim().toLowerCase();
          return s === mObj.name.toLowerCase() || s.startsWith(mObj.name.toLowerCase().substring(0, 3));
        });

        if (matchIdx !== -1) {
          // If columns were identified by headers
          if (colTotal !== -1 && colNonEff !== -1 && colEff !== -1) {
            const tot = parseInt(String(row[colTotal] || '').replace(/\D/g, ''), 10);
            const non = parseInt(String(row[colNonEff] || '').replace(/\D/g, ''), 10);
            const eff = parseInt(String(row[colEff] || '').replace(/\D/g, ''), 10);

            if (!isNaN(tot) && !isNaN(eff)) {
              foundData = {
                totalWeeks: tot,
                nonEffectiveWeeks: isNaN(non) ? Math.max(0, tot - eff) : non,
                effectiveWeeks: eff,
              };
              break;
            }
          }

          // Fallback: extract sequential numbers after the month cell
          const numbersAfter = row
            .slice(matchIdx + 1)
            .map(n => parseInt(String(n || '').trim(), 10))
            .filter(n => !isNaN(n) && n >= 0 && n <= 10);

          if (numbersAfter.length >= 3) {
            foundData = {
              totalWeeks: numbersAfter[0],
              nonEffectiveWeeks: numbersAfter[1],
              effectiveWeeks: numbersAfter[2],
            };
            break;
          } else if (numbersAfter.length === 2) {
            foundData = {
              totalWeeks: numbersAfter[0],
              nonEffectiveWeeks: numbersAfter[1],
              effectiveWeeks: Math.max(0, numbersAfter[0] - numbersAfter[1]),
            };
            break;
          } else if (numbersAfter.length === 1) {
            foundData = {
              totalWeeks: mObj.defaultWeeks,
              nonEffectiveWeeks: Math.max(0, mObj.defaultWeeks - numbersAfter[0]),
              effectiveWeeks: numbersAfter[0],
            };
            break;
          }
        }
      }

      if (foundData) {
        monthAnalysis.push({
          monthName: mObj.name,
          semester: mObj.semester,
          totalWeeks: foundData.totalWeeks,
          nonEffectiveWeeks: foundData.nonEffectiveWeeks,
          effectiveWeeks: foundData.effectiveWeeks,
          notes: [],
        });
      }
    });
  }

  // -------------------------------------------------------------------------
  // 3. EXTRACT ALL NOTES STARTING WITH '*' AS IMPORTANT EVENTS
  // -------------------------------------------------------------------------
  for (const sName of sheetNames) {
    const sheet = workbook.Sheets[sName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    for (const row of rows) {
      if (!Array.isArray(row)) continue;

      for (const cell of row) {
        if (!cell) continue;
        const cellStr = String(cell).trim();

        // Check if cell contains '*'
        if (cellStr.includes('*')) {
          // Split by newline or '*' to handle multiple note bullet points
          const rawItems = cellStr
            .split(/[\r\n*]+/)
            .map(s => s.trim())
            .filter(s => s.length > 3);

          for (const item of rawItems) {
            // Remove leading bullet marks or numbers
            const cleaned = item.replace(/^[\s*\-•:.]+/, '').trim();
            if (cleaned.length < 4) continue;

            const lower = cleaned.toLowerCase();

            // Detect event type
            let eventType: KaldikEvent['type'] = 'kegiatan';
            if (lower.includes('mpls')) eventType = 'mpls';
            else if (lower.includes('psts') || lower.includes('pts') || lower.includes('tengah semester')) eventType = 'psts';
            else if (lower.includes('psas') || lower.includes('pas') || lower.includes('akhir semester gasal')) eventType = 'psas';
            else if (lower.includes('psat') || lower.includes('pat') || lower.includes('akhir tahun')) eventType = 'psat';
            else if (lower.includes('psaj') || lower.includes('akhir jenjang') || lower.includes('us')) eventType = 'psaj';
            else if (lower.includes('ukk') || lower.includes('kejuruan')) eventType = 'ukk';
            else if (lower.includes('libur') || lower.includes('idul') || lower.includes('cuti') || lower.includes('puasa')) eventType = 'libur';
            else if (lower.includes('remedial') || lower.includes('class meeting') || lower.includes('susulan')) eventType = 'remedial';
            else if (lower.includes('wisuda') || lower.includes('kelulusan') || lower.includes('pelepasan')) eventType = 'wisuda';
            else if (lower.includes('anbk') || lower.includes('asesmen') || lower.includes('akm')) eventType = 'an';

            // Determine semester & month
            let semester: 1 | 2 = 1;
            let targetMonth = 'Juli';

            if (lower.includes('januari') || lower.includes('jan')) { targetMonth = 'Januari'; semester = 2; }
            else if (lower.includes('februari') || lower.includes('feb')) { targetMonth = 'Februari'; semester = 2; }
            else if (lower.includes('maret') || lower.includes('mar')) { targetMonth = 'Maret'; semester = 2; }
            else if (lower.includes('april') || lower.includes('apr')) { targetMonth = 'April'; semester = 2; }
            else if (lower.includes('mei')) { targetMonth = 'Mei'; semester = 2; }
            else if (lower.includes('juni') || lower.includes('jun')) { targetMonth = 'Juni'; semester = 2; }
            else if (lower.includes('juli') || lower.includes('jul')) { targetMonth = 'Juli'; semester = 1; }
            else if (lower.includes('agustus') || lower.includes('agu')) { targetMonth = 'Agustus'; semester = 1; }
            else if (lower.includes('september') || lower.includes('sep')) { targetMonth = 'September'; semester = 1; }
            else if (lower.includes('oktober') || lower.includes('okt')) { targetMonth = 'Oktober'; semester = 1; }
            else if (lower.includes('november') || lower.includes('nov')) { targetMonth = 'November'; semester = 1; }
            else if (lower.includes('desember') || lower.includes('des')) { targetMonth = 'Desember'; semester = 1; }

            // Extract date part (e.g. "15 - 20 Juli 2026")
            const dateMatch = cleaned.match(/\d{1,2}(?:\s*-\s*\d{1,2})?\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|\bJan\b|\bFeb\b|\bMar\b|\bApr\b|\bMei\b|\bJun\b|\bJul\b|\bAgu\b|\bSep\b|\bOkt\b|\bNov\b|\bDes\b)(?:\s+\d{4})?/i);
            const dateRange = dateMatch ? dateMatch[0] : `${targetMonth}`;

            // Add event if not duplicate
            if (!events.some(ev => ev.name.toLowerCase() === cleaned.toLowerCase())) {
              events.push({
                id: `ev_${events.length + 1}`,
                name: cleaned,
                dateRange,
                semester,
                monthName: targetMonth,
                weekNumber: 1,
                type: eventType,
                description: cleaned,
              });

              // Also link this note into monthAnalysis.notes
              const targetAnalysis = monthAnalysis.find(m => m.monthName.toLowerCase() === targetMonth.toLowerCase());
              if (targetAnalysis) {
                // Short note summary (e.g. "MPLS", "PSTS", "Libur")
                const shortNote = cleaned.split(':')[1]?.trim() || cleaned;
                if (!targetAnalysis.notes.includes(shortNote)) {
                  targetAnalysis.notes.push(shortNote.substring(0, 40));
                }
              }
            }
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. FALLBACK ROBUST DEFAULTS IF SHEET DATA WAS INCOMPLETE
  // -------------------------------------------------------------------------
  if (monthAnalysis.length < 12) {
    const existingMap = new Map(monthAnalysis.map(m => [m.monthName.toLowerCase(), m]));
    const completeAnalysis: MonthEffectiveBreakdown[] = [];

    standardMonths.forEach(sm => {
      const exist = existingMap.get(sm.name.toLowerCase());
      if (exist) {
        completeAnalysis.push(exist);
      } else {
        // Fallback default SMK Muhammadiyah Bawang calendar distribution
        let eff = 4;
        let nonEff = 0;
        let defaultNotes: string[] = [];

        if (sm.name === 'Juli') { eff = 2; nonEff = 3; defaultNotes = ['Libur Sem Genap', 'MPLS']; }
        else if (sm.name === 'Agustus') { eff = 3; nonEff = 1; defaultNotes = ['Asesmen Nasional']; }
        else if (sm.name === 'September') { eff = 3; nonEff = 1; defaultNotes = ['PSTS']; }
        else if (sm.name === 'Oktober') { eff = 5; nonEff = 0; }
        else if (sm.name === 'November') { eff = 4; nonEff = 0; }
        else if (sm.name === 'Desember') { eff = 0; nonEff = 5; defaultNotes = ['PSAS', 'Remedial', 'Libur Gasal']; }
        else if (sm.name === 'Januari') { eff = 4; nonEff = 0; }
        else if (sm.name === 'Februari') { eff = 4; nonEff = 0; }
        else if (sm.name === 'Maret') { eff = 1; nonEff = 3; defaultNotes = ['PSTS', 'Libur Idul Fitri']; }
        else if (sm.name === 'April') { eff = 1; nonEff = 4; defaultNotes = ['PSAJ', 'UKK']; }
        else if (sm.name === 'Mei') { eff = 0; nonEff = 4; defaultNotes = ['Kelulusan', 'Wisuda']; }
        else if (sm.name === 'Juni') { eff = 0; nonEff = 4; defaultNotes = ['PSAT', 'Libur Genap']; }

        completeAnalysis.push({
          monthName: sm.name,
          semester: sm.semester,
          totalWeeks: sm.defaultWeeks,
          nonEffectiveWeeks: nonEff,
          effectiveWeeks: eff,
          notes: defaultNotes,
        });
      }
    });

    monthAnalysis = completeAnalysis;
  }

  const sem1 = monthAnalysis.filter(m => m.semester === 1).reduce((sum, m) => sum + m.effectiveWeeks, 0);
  const sem2 = monthAnalysis.filter(m => m.semester === 2).reduce((sum, m) => sum + m.effectiveWeeks, 0);

  return {
    monthAnalysis,
    events,
    academicYear: detectedYear,
    weeklyHours: detectedWeeklyHours,
    subjectName: detectedSubjectName,
    totalEffectiveSem1: sem1,
    totalEffectiveSem2: sem2,
  };
}

export const parseKbmExcel = parseJadwalKBM;

export { downloadSampleKbmFile, downloadSampleKaldikFile } from '../services/excelParserSample';

import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, Packer } from 'docx';
import { SchoolProfile, DocumentMeta, MonthEffectiveBreakdown, LearningObjective, ScheduleSlot, KaldikEvent } from '../types';

/**
 * Exports Analisis Minggu Efektif to Excel (.xlsx) with formal blank signature form
 */
export function exportAnalisisMingguEfektifExcel(
  school: SchoolProfile,
  meta: DocumentMeta,
  monthAnalysis: MonthEffectiveBreakdown[]
): void {
  const sem1 = monthAnalysis.filter(m => m.semester === 1);
  const sem2 = monthAnalysis.filter(m => m.semester === 2);

  const totalWeeksSem1 = sem1.reduce((acc, m) => acc + m.totalWeeks, 0);
  const nonEffSem1 = sem1.reduce((acc, m) => acc + m.nonEffectiveWeeks, 0);
  const effSem1 = sem1.reduce((acc, m) => acc + m.effectiveWeeks, 0);
  const effDaysSem1 = sem1.reduce((acc, m) => acc + (m.effectiveDays || 0), 0);

  const totalWeeksSem2 = sem2.reduce((acc, m) => acc + m.totalWeeks, 0);
  const nonEffSem2 = sem2.reduce((acc, m) => acc + m.nonEffectiveWeeks, 0);
  const effSem2 = sem2.reduce((acc, m) => acc + m.effectiveWeeks, 0);
  const effDaysSem2 = sem2.reduce((acc, m) => acc + (m.effectiveDays || 0), 0);

  const totalNonEffYear = nonEffSem1 + nonEffSem2;
  const totalEffYear = effSem1 + effSem2;
  const totalEffDaysYear = effDaysSem1 + effDaysSem2;

  const hoursSem1 = meta.weeklyHours * effSem1;
  const hoursSem2 = meta.weeklyHours * effSem2;

  const data: any[][] = [
    ['', '', 'PERHITUNGAN MINGGU & HARI EFEKTIF'],
    [],
    ['Mata Diklat', ': ' + meta.subjectName],
    ['Kelas / Semester', ': ' + meta.grade + '/Ganjil & Genap'],
    ['Program Keahlian', ': ' + (meta.expertiseProgram || 'Semua Program Keahlian')],
    ['Tahun', ': ' + meta.academicYear],
    ['Jam per Minggu', ': ' + meta.weeklyHours],
    [],
    ['No', 'Bulan', 'Hari Efektif (Putih)', 'Jumlah Minggu', 'Minggu Tidak Efektif', 'Minggu Efektif']
  ];

  // Semester 1 rows
  sem1.forEach((m, idx) => {
    data.push([
      String(idx + 1).padStart(2, '0'),
      m.monthName,
      m.effectiveDays ?? 0,
      m.totalWeeks,
      m.nonEffectiveWeeks,
      m.effectiveWeeks
    ]);
  });
  data.push(['', 'JUMLAH SEMESTER 1', effDaysSem1, totalWeeksSem1, nonEffSem1, effSem1]);

  // Semester 2 rows
  sem2.forEach((m, idx) => {
    data.push([
      String(sem1.length + idx + 1).padStart(2, '0'),
      m.monthName,
      m.effectiveDays ?? 0,
      m.totalWeeks,
      m.nonEffectiveWeeks,
      m.effectiveWeeks
    ]);
  });
  data.push(['', 'JUMLAH SEMESTER 2', effDaysSem2, totalWeeksSem2, nonEffSem2, effSem2]);

  data.push([]);
  data.push(['', `Total Hari Efektif Belajar (Warna Putih) dalam 1 Tahun adalah ${totalEffDaysYear} hari`]);
  data.push(['', `Jumlah Minggu Tidak Efektif dalam satu tahun adalah ${totalNonEffYear} minggu`]);
  data.push(['', `Jumlah Minggu Efektif dalam satu tahun adalah ${totalEffYear} minggu`]);
  data.push([]);
  data.push(['', `Jumlah jam pertemuan semester 1 = ${meta.weeklyHours} jam x ${effSem1} Minggu efektif = ${hoursSem1} jam`]);
  data.push(['', `Jumlah jam pertemuan semester 2 = ${meta.weeklyHours} jam x ${effSem2} Minggu efektif = ${hoursSem2} jam`]);
  data.push([]);

  // Blank Signature form (clean vertical gap for manual ink signing)
  const docDate = meta.documentDate || `${school.locationCity}, ${school.signatureDate}`;
  data.push(['', '', '', '', docDate]);
  data.push(['', 'Mengetahui,', '', '', 'Guru Mata Pelajaran']);
  data.push(['', school.headmasterTitle, '', '', '']);
  data.push([]);
  data.push([]);
  data.push([]);
  data.push(['', school.headmasterName, '', '', meta.teacherName]);
  data.push(['', 'NBM. ' + school.headmasterNbm, '', '', 'NBM. ' + (meta.teacherNbm || '-')]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 8 },
    { wch: 22 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 26 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'minggu efektif');
  XLSX.writeFile(wb, `Analisis_Minggu_Efektif_${meta.subjectName.replace(/\s+/g, '_')}_${meta.grade}.xlsx`);
}

/**
 * Exports PROMES (Program Semester) with 2 sheets: SEM GASAL & SEM GENAP
 * Includes formal blank signature form.
 */
export function exportPromesExcel(
  school: SchoolProfile,
  meta: DocumentMeta,
  objectivesSem1: LearningObjective[],
  objectivesSem2: LearningObjective[],
  monthAnalysis: MonthEffectiveBreakdown[],
  events?: KaldikEvent[]
): void {
  const wb = XLSX.utils.book_new();

  const createPromesSheet = (semester: 1 | 2, objectives: LearningObjective[]) => {
    const isGasal = semester === 1;
    const months = isGasal 
      ? monthAnalysis.filter(m => m.semester === 1)
      : monthAnalysis.filter(m => m.semester === 2);

    const sheetTitle = isGasal ? 'PROGRAM SEMESTER GANJIL SMK MUHAMMADIYAH BAWANG' : 'PROGRAM SEMESTER GENAP SMK MUHAMMADIYAH BAWANG';

    const sheetData: any[][] = [
      [sheetTitle],
      [],
      ['Bid Keahlian', ': ' + (meta.department || 'Semua Bidang'), '', '', '', '', '', '', '', '', '', '', '', '', 'Kelas', ': ' + meta.grade],
      ['Prog Keahlian', ': ' + (meta.expertiseProgram || 'Semua program'), '', '', '', '', '', '', '', '', '', '', '', '', 'Semester', ': ' + (isGasal ? '1' : '2')],
      ['Kurikulum', ': ' + (meta.curriculum || 'Kurikulum Merdeka'), '', '', '', '', '', '', '', '', '', '', '', '', 'Tahun Pelajaran', ': ' + meta.academicYear],
      ['Mata Pelajaran', ': ' + meta.subjectName, '', '', '', '', '', '', '', '', '', '', '', '', 'Guru Pengampu', ': ' + meta.teacherName],
      ['Jml.Jam Mapel', ': ' + meta.weeklyHours + ' JP/Minggu'],
      []
    ];

    const headerRow1 = ['TUJUAN PEMBELAJARAN', 'ALOKASI WAKTU'];
    months.forEach(m => {
      headerRow1.push(m.monthName.toUpperCase());
      for (let w = 1; w < m.totalWeeks; w++) {
        headerRow1.push('');
      }
    });

    const headerRow2 = ['', ''];
    months.forEach(m => {
      for (let w = 1; w <= m.totalWeeks; w++) {
        headerRow2.push(String(w));
      }
    });

    sheetData.push(headerRow1);
    sheetData.push(headerRow2);

    const getWeekLabel = (month: MonthEffectiveBreakdown, weekNum: number): string | null => {
      const act = getKaldikWeekActivity(month.monthName, weekNum, isGasal, events);
      if (act) return act.badge || act.text;
      return null;
    };

    // Pre-calculate automatic distribution of weeklyHours across effective weeks
    const effectiveKeys: string[] = [];
    months.forEach(m => {
      for (let w = 1; w <= m.totalWeeks; w++) {
        if (!getWeekLabel(m, w)) {
          effectiveKeys.push(`${m.monthName}_${w}`);
        }
      }
    });

    const hoursPerWeek = Number(meta.weeklyHours) || 4;
    const autoAlloc: Record<string, Record<string, number>> = {};
    objectives.forEach(tp => { autoAlloc[tp.id] = {}; });

    let effIdx = 0;
    const totalEff = effectiveKeys.length;
    const weeksPerTp = objectives.map(tp => Math.max(1, Math.round((tp.jp || (hoursPerWeek * 3)) / hoursPerWeek)));
    let sumW = weeksPerTp.reduce((a, b) => a + b, 0);
    while (sumW < totalEff) {
      weeksPerTp[weeksPerTp.length - 1]++;
      sumW++;
    }
    while (sumW > totalEff && weeksPerTp.length > 0) {
      let maxI = 0;
      for (let i = 1; i < weeksPerTp.length; i++) {
        if (weeksPerTp[i] > weeksPerTp[maxI]) maxI = i;
      }
      if (weeksPerTp[maxI] > 1) {
        weeksPerTp[maxI]--;
        sumW--;
      } else break;
    }

    objectives.forEach((tp, tpIdx) => {
      const cnt = weeksPerTp[tpIdx] || 1;
      for (let i = 0; i < cnt && effIdx < totalEff; i++) {
        autoAlloc[tp.id][effectiveKeys[effIdx]] = hoursPerWeek;
        effIdx++;
      }
    });
    while (effIdx < totalEff && objectives.length > 0) {
      const lastTp = objectives[objectives.length - 1];
      autoAlloc[lastTp.id][effectiveKeys[effIdx]] = hoursPerWeek;
      effIdx++;
    }

    objectives.forEach(tp => {
      const row: any[] = [tp.description, `${tp.jp} JP`];

      months.forEach(m => {
        for (let w = 1; w <= m.totalWeeks; w++) {
          const key = `${m.monthName}_${w}`;
          const nonEff = getWeekLabel(m, w);
          if (nonEff) {
            row.push(nonEff);
          } else {
            const val = (tp.weeklyAllocation && tp.weeklyAllocation[key]) || autoAlloc[tp.id]?.[key];
            row.push(val || '');
          }
        }
      });

      sheetData.push(row);
    });

    // Blank signature block
    const docDate = meta.documentDate || `${school.locationCity}, ${school.signatureDate}`;
    sheetData.push([]);
    sheetData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', docDate]);
    sheetData.push(['Mengetahui,', '', '', '', '', '', '', '', '', '', '', '', '', 'Guru Mata Pelajaran']);
    sheetData.push([school.headmasterTitle]);
    sheetData.push([]);
    sheetData.push([]);
    sheetData.push([]);
    sheetData.push([school.headmasterName, '', '', '', '', '', '', '', '', '', '', '', '', meta.teacherName]);
    sheetData.push(['NBM. ' + school.headmasterNbm, '', '', '', '', '', '', '', '', '', '', '', '', 'NBM. ' + (meta.teacherNbm || '-')]);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 55 },
      { wch: 14 },
      ...Array(30).fill({ wch: 6 })
    ];

    return ws;
  };

  const wsGasal = createPromesSheet(1, objectivesSem1);
  XLSX.utils.book_append_sheet(wb, wsGasal, 'SEM GASAL');

  const wsGenap = createPromesSheet(2, objectivesSem2);
  XLSX.utils.book_append_sheet(wb, wsGenap, 'SEM GENAP');

  XLSX.writeFile(wb, `PROMES_${meta.subjectName.replace(/\s+/g, '_')}_${meta.grade}_${meta.academicYear.replace('/', '-')}.xlsx`);
}

/**
 * Exports Jadwal Pribadi Guru to Excel (.xlsx) with blank signature form
 */
export function exportJadwalPribadiExcel(
  school: SchoolProfile,
  teacher: { code: string; name: string; nbm?: string; nip?: string },
  schedules: ScheduleSlot[],
  academicYear: string,
  documentDate?: string
): void {
  const days: Array<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'> = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  
  const data: any[][] = [
    [school.foundation],
    [school.branch],
    [school.name],
    [`JADWAL MENGAJAR GURU - TAHUN PELAJARAN ${academicYear}`],
    [],
    ['Nama Guru', ': ' + teacher.name],
    ['Kode Guru', ': ' + teacher.code],
    ['NBM', ': ' + (teacher.nbm || '-')],
    ['Total Jam Mengajar', ': ' + schedules.length + ' JP / Minggu'],
    [],
    ['No', 'Hari', 'Jam Ke', 'Waktu', 'Mata Pelajaran', 'Kelas', 'Ruang']
  ];

  let counter = 1;
  days.forEach(day => {
    const daySlots = schedules.filter(s => s.day === day).sort((a, b) => a.period - b.period);
    daySlots.forEach(slot => {
      data.push([
        counter++,
        slot.day,
        `Jam ke-${slot.period}`,
        slot.timeRange,
        slot.subjectName || slot.subjectCode,
        slot.className,
        slot.room || '-'
      ]);
    });
  });

  data.push([]);
  data.push(['', '', '', '', '', documentDate || `${school.locationCity}, ${school.signatureDate}`]);
  data.push(['', 'Mengetahui,', '', '', '', 'Guru Mata Pelajaran']);
  data.push(['', school.headmasterTitle]);
  data.push([]);
  data.push([]);
  data.push([]);
  data.push(['', school.headmasterName, '', '', '', teacher.name]);
  data.push(['', 'NBM. ' + school.headmasterNbm, '', '', '', 'NBM. ' + (teacher.nbm || '-')]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 32 },
    { wch: 16 },
    { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Jadwal Mengajar');
  XLSX.writeFile(wb, `Jadwal_Mengajar_${teacher.code}_${teacher.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}

/**
 * Exports PROTA (Program Tahunan) to Microsoft Word (.docx) format
 * Format F4 (210 x 330 mm), Portrait, margin 1.5 cm with blank signature block.
 */
export async function exportProtaDocx(
  school: SchoolProfile,
  meta: DocumentMeta,
  objectivesSem1: LearningObjective[],
  objectivesSem2: LearningObjective[],
  monthAnalysis?: MonthEffectiveBreakdown[]
): Promise<void> {
  const hpw = Number(meta.weeklyHours) || 4;
  const sem1Eff = monthAnalysis ? monthAnalysis.filter(m => m.semester === 1).reduce((s, m) => s + m.effectiveWeeks, 0) : 19;
  const sem2Eff = monthAnalysis ? monthAnalysis.filter(m => m.semester === 2).reduce((s, m) => s + m.effectiveWeeks, 0) : 18;

  // Otomasi distribusi jam mengikuti input JP dari data guru
  const getAutomatedTps = (objs: LearningObjective[], effWeeks: number) => {
    if (objs.length === 0) return [];
    const baseWeeks = Math.max(1, Math.floor(effWeeks / objs.length));
    const rem = effWeeks % objs.length;
    return objs.map((tp, i) => {
      const weeks = baseWeeks + (i < rem ? 1 : 0);
      return {
        ...tp,
        jp: weeks * hpw,
      };
    });
  };

  const autoObjsSem1 = getAutomatedTps(objectivesSem1, sem1Eff);
  const autoObjsSem2 = getAutomatedTps(objectivesSem2, sem2Eff);

  const totalHoursSem1 = autoObjsSem1.reduce((sum, tp) => sum + tp.jp, 0) || (sem1Eff * hpw);
  const totalHoursSem2 = autoObjsSem2.reduce((sum, tp) => sum + tp.jp, 0) || (sem2Eff * hpw);
  const totalHoursYear = totalHoursSem1 + totalHoursSem2;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 18708,
            },
            margin: {
              top: 850,
              bottom: 850,
              left: 850,
              right: 850,
            }
          }
        },
        children: [
          // Kop Surat Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: school.foundation, bold: true, size: 20 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: school.branch, bold: true, size: 20 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: school.name, bold: true, size: 26 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: school.accreditation, bold: true, size: 20 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${school.address}`, size: 16 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Email : ${school.email} | Web : ${school.website} | Telp : ${school.phone}`, size: 16 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: BorderStyle.DOUBLE,
                size: 16,
              },
            },
            children: [],
          }),

          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({ text: 'PROGRAM TAHUNAN (PROTA)', bold: true, size: 26, underline: {} }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: `TAHUN PELAJARAN ${meta.academicYear}`, bold: true, size: 22 }),
            ],
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Mata Pelajaran', bold: true })] })] }),
                  new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun(`: ${meta.subjectName}`)] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Kelas / Program', bold: true })] })] }),
                  new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun(`: ${meta.grade} / ${meta.expertiseProgram || 'Semua Program Keahlian'}`)] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Nama Guru', bold: true })] })] }),
                  new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun(`: ${meta.teacherName}`)] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Kurikulum', bold: true })] })] }),
                  new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun(`: ${meta.curriculum || 'Kurikulum Merdeka'}`)] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Total Alokasi Waktu', bold: true })] })] }),
                  new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun(`: ${totalHoursYear} JP (${totalHoursSem1} JP Gasal + ${totalHoursSem2} JP Genap)`)] })] }),
                ]
              }),
            ]
          }),

          new Paragraph({ spacing: { before: 300, after: 100 }, children: [new TextRun({ text: 'A. CAPAIAN PEMBELAJARAN (FASE F)', bold: true, size: 22 })] }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: meta.capaianPembelajaran || 'Pada akhir Fase F, peserta didik menggunakan teks lisan, tulisan dan visual dalam berkomunikasi sesuai situasi, tujuan, dan pemirsa/pembacanya. Pembelajaran difokuskan pada penguasaan kompetensi dasar dan kejuruan secara komprehensif, kritis, dan mandiri guna membekali lulusan SMK dengan keahlian kerja dan karakter luhur.',
                size: 20
              })
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: 'B. DISTRIBUSI ALOKASI WAKTU (PROGRAM TAHUNAN)', bold: true, size: 22 })] }),

          // Objectives Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No', bold: true })] })] }),
                  new TableCell({ width: { size: 22, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Elemen', bold: true })] })] }),
                  new TableCell({ width: { size: 55, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Tujuan Pembelajaran / Lingkup Materi', bold: true })] })] }),
                  new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Alokasi (JP)', bold: true })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 4,
                    children: [new Paragraph({ children: [new TextRun({ text: `SEMESTER 1 (GASAL) - ${sem1Eff} MINGGU EFEKTIF`, bold: true })] })]
                  })
                ]
              }),
              ...autoObjsSem1.map((tp, i) => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(String(i + 1))] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(tp.element)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(tp.description)] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`${tp.jp} JP`)] })] }),
                ]
              })),
              new TableRow({
                children: [
                  new TableCell({ columnSpan: 3, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Jumlah JP Semester 1:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${totalHoursSem1} JP`, bold: true })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 4,
                    children: [new Paragraph({ children: [new TextRun({ text: `SEMESTER 2 (GENAP) - ${sem2Eff} MINGGU EFEKTIF`, bold: true })] })]
                  })
                ]
              }),
              ...autoObjsSem2.map((tp, i) => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(String(i + 1))] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(tp.element)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun(tp.description)] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`${tp.jp} JP`)] })] }),
                ]
              })),
              new TableRow({
                children: [
                  new TableCell({ columnSpan: 3, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Jumlah JP Semester 2:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${totalHoursSem2} JP`, bold: true })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ columnSpan: 3, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TOTAL ALOKASI WAKTU 1 TAHUN:', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${totalHoursYear} JP`, bold: true })] })] }),
                ]
              })
            ]
          }),

          // Blank signature block
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mengetahui,' })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: school.headmasterTitle, bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200 }, children: [new TextRun({ text: school.headmasterName, bold: true, underline: {} })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`NBM. ${school.headmasterNbm}`)] }),
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: meta.documentDate || `${school.locationCity}, ${school.signatureDate}` })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Guru Mata Pelajaran,', bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200 }, children: [new TextRun({ text: meta.teacherName, bold: true, underline: {} })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`NBM. ${meta.teacherNbm || '-'}`)] }),
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PROTA_${meta.subjectName.replace(/\s+/g, '_')}_${meta.grade}_${meta.academicYear.replace('/', '-')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Helper to get week activity info based on Kaldik
 */
export function getKaldikWeekActivity(
  monthName: string,
  weekNum: number,
  isGasal: boolean,
  events?: KaldikEvent[]
): { text: string; badge: string; argbBg: string; argbFg: string; twColor: string } | null {
  const mLower = monthName.toLowerCase();

  // Check event matches with priority on exam, assessment, or holiday events
  const matchingEvents = events?.filter(ev => ev.monthName.toLowerCase() === mLower && ev.weekNumber === weekNum) || [];
  const matchingEvent = matchingEvents.find(ev => ev.type !== 'kegiatan') || matchingEvents[0];
  let text = matchingEvent?.name || '';
  const searchStr = (text || '').toLowerCase();

  if (searchStr.includes('tka') && searchStr.includes('ukk')) {
    return { text: text || 'Tes TKA & UKK Kejuruan', badge: 'TKA/UKK', argbBg: 'FFE9D5FF', argbFg: 'FF581C87', twColor: 'bg-purple-100 text-purple-900 border-purple-300' };
  }
  if (searchStr.includes('tka')) {
    return { text: text || 'Tes Kemampuan Akademik (TKA)', badge: 'TKA', argbBg: 'FFE9D5FF', argbFg: 'FF581C87', twColor: 'bg-purple-100 text-purple-900 border-purple-300' };
  }
  if (searchStr.includes('ukk')) {
    return { text: text || 'Uji Kompetensi Keahlian (UKK)', badge: 'UKK', argbBg: 'FFE9D5FF', argbFg: 'FF581C87', twColor: 'bg-purple-100 text-purple-900 border-purple-300' };
  }
  if (searchStr.includes('anbk') || searchStr.includes('asesmen') || searchStr.includes(' un ')) {
    return { text: text || 'Tes UN / Asesmen Nasional (ANBK)', badge: 'UN/ANBK', argbBg: 'FFCFFAFE', argbFg: 'FF164E63', twColor: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
  }
  if (searchStr.includes('psts') || searchStr.includes('sumatif tengah')) {
    return { text: text || 'Tes Sumatif Tengah Semester (PSTS)', badge: 'PSTS', argbBg: 'FFFFE4E6', argbFg: 'FF9F1239', twColor: 'bg-rose-200 text-rose-950 border-rose-400' };
  }
  if (searchStr.includes('psas')) {
    return { text: text || 'Tes Sumatif Akhir Semester (PSAS)', badge: 'PSAS', argbBg: 'FFE0E7FF', argbFg: 'FF312E81', twColor: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
  }
  if (searchStr.includes('psat')) {
    return { text: text || 'Tes Sumatif Akhir Tahun (PSAT)', badge: 'PSAT', argbBg: 'FFE0E7FF', argbFg: 'FF312E81', twColor: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
  }
  if (searchStr.includes('psaj')) {
    return { text: text || 'Tes PSAJ (Ujian Sekolah Kelas XII)', badge: 'PSAJ', argbBg: 'FFDBEAFE', argbFg: 'FF1E3A8A', twColor: 'bg-blue-100 text-blue-900 border-blue-300' };
  }
  if (searchStr.includes('mpls')) {
    return { text: text || 'Masa Pengenalan Lingkungan Sekolah (MPLS)', badge: 'MPLS', argbBg: 'FFD1FAE5', argbFg: 'FF065F46', twColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  }
  if (searchStr.includes('remedial') || searchStr.includes('susulan')) {
    return { text: text || 'Ujian Susulan & Remedial', badge: 'REMEDIAL', argbBg: 'FFE0F2FE', argbFg: 'FF075985', twColor: 'bg-sky-100 text-sky-900 border-sky-300' };
  }
  if (searchStr.includes('rapor')) {
    return { text: text || 'Penyerahan Rapor Siswa', badge: 'RAPOR', argbBg: 'FFCCFBF1', argbFg: 'FF115E59', twColor: 'bg-teal-100 text-teal-900 border-teal-300' };
  }
  if (searchStr.includes('wisuda') || searchStr.includes('pelepasan')) {
    return { text: text || 'Wisuda & Pelepasan Siswa Kelas XII', badge: 'WISUDA', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
  }
  if (searchStr.includes('kelulusan') || searchStr.includes('lulus')) {
    return { text: text || 'Pengumuman Kelulusan SMK', badge: 'LULUS', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
  }
  if (searchStr.includes('libur') || searchStr.includes('idul') || searchStr.includes('cuti')) {
    return { text: text || 'Hari Libur / Cuti', badge: 'LIBUR', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
  }

  // Standard KALDIK rules per month
  if (isGasal) {
    if (mLower === 'juli') {
      if (weekNum <= 2) return { text: 'Libur Akhir Semester Genap', badge: 'LIBUR', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
      if (weekNum === 3) return { text: 'Masa Pengenalan Lingkungan Sekolah (MPLS)', badge: 'MPLS', argbBg: 'FFD1FAE5', argbFg: 'FF065F46', twColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    } else if (mLower === 'agustus') {
      if (weekNum === 3) return { text: 'Tes UN / Asesmen Nasional (ANBK)', badge: 'UN/ANBK', argbBg: 'FFCFFAFE', argbFg: 'FF164E63', twColor: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
    } else if (mLower === 'september') {
      if (weekNum === 1) return { text: 'Tes Sumatif Tengah Semester (PSTS) Gasal', badge: 'PSTS', argbBg: 'FFFFE4E6', argbFg: 'FF9F1239', twColor: 'bg-rose-200 text-rose-950 border-rose-400' };
    } else if (mLower === 'desember') {
      if (weekNum === 1) return { text: 'Tes Sumatif Akhir Semester (PSAS) Gasal', badge: 'PSAS', argbBg: 'FFE0E7FF', argbFg: 'FF312E81', twColor: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      if (weekNum === 2) return { text: 'Ujian Susulan & Remedial', badge: 'REMEDIAL', argbBg: 'FFE0F2FE', argbFg: 'FF075985', twColor: 'bg-sky-100 text-sky-900 border-sky-300' };
      if (weekNum === 3) return { text: 'Penyerahan Buku Rapor Gasal', badge: 'RAPOR', argbBg: 'FFCCFBF1', argbFg: 'FF115E59', twColor: 'bg-teal-100 text-teal-900 border-teal-300' };
      return { text: 'Libur Akhir Semester Gasal', badge: 'LIBUR', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
  } else {
    if (mLower === 'maret') {
      if (weekNum === 1) return { text: 'Tes Sumatif Tengah Semester (PSTS) Genap', badge: 'PSTS', argbBg: 'FFFFE4E6', argbFg: 'FF9F1239', twColor: 'bg-rose-200 text-rose-950 border-rose-400' };
      if (weekNum >= 3) return { text: 'Libur Hari Raya Idul Fitri 1448 H', badge: 'LIBUR', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
    } else if (mLower === 'april') {
      if (weekNum === 1) return { text: 'Tes PSAJ (Ujian Sekolah Kelas XII)', badge: 'PSAJ', argbBg: 'FFDBEAFE', argbFg: 'FF1E3A8A', twColor: 'bg-blue-100 text-blue-900 border-blue-300' };
      if (weekNum === 3) return { text: 'Tes TKA (Kemampuan Akademik) & UKK Kejuruan', badge: 'TKA/UKK', argbBg: 'FFE9D5FF', argbFg: 'FF581C87', twColor: 'bg-purple-100 text-purple-900 border-purple-300' };
      if (weekNum === 4) return { text: 'Uji Kompetensi Keahlian (UKK) Lanjutan', badge: 'UKK', argbBg: 'FFE9D5FF', argbFg: 'FF581C87', twColor: 'bg-purple-100 text-purple-900 border-purple-300' };
      if (weekNum === 5) return { text: 'Libur Pasca Ujian Kejuruan', badge: 'LIBUR', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
    } else if (mLower === 'mei') {
      if (weekNum === 1) return { text: 'Pengumuman Kelulusan SMK', badge: 'LULUS', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
      if (weekNum === 2) return { text: 'Wisuda & Pelepasan Siswa Kelas XII', badge: 'WISUDA', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
      return { text: 'Hari Libur Nasional / Cuti', badge: 'LIBUR', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
    } else if (mLower === 'juni') {
      if (weekNum === 1) return { text: 'Tes Sumatif Akhir Tahun (PSAT)', badge: 'PSAT', argbBg: 'FFE0E7FF', argbFg: 'FF312E81', twColor: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      if (weekNum === 2) return { text: 'Remedial & Pembagian Rapor Genap', badge: 'RAPOR', argbBg: 'FFCCFBF1', argbFg: 'FF115E59', twColor: 'bg-teal-100 text-teal-900 border-teal-300' };
      return { text: 'Libur Akhir Tahun Pelajaran', badge: 'LIBUR', argbBg: 'FFFEF3C7', argbFg: 'FF92400E', twColor: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
  }

  return null;
}

/**
 * Export PROTA with full Kaldik month columns, week headers, colors, and agendas
 */
export async function exportProtaExcel(
  school: SchoolProfile,
  meta: DocumentMeta,
  objectivesSem1: LearningObjective[],
  objectivesSem2: LearningObjective[],
  monthAnalysis: MonthEffectiveBreakdown[],
  events?: KaldikEvent[]
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = school.name;
  wb.created = new Date();

  const ws = wb.addWorksheet('PROTA Matriks Kaldik', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }
  });

  const hpw = Number(meta.weeklyHours) || 4;
  const sem1Months = monthAnalysis.filter(m => m.semester === 1);
  const sem2Months = monthAnalysis.filter(m => m.semester === 2);
  const allMonths = [...sem1Months, ...sem2Months];

  const sem1Eff = sem1Months.reduce((s, m) => s + m.effectiveWeeks, 0) || 17;
  const sem2Eff = sem2Months.reduce((s, m) => s + m.effectiveWeeks, 0) || 10;
  const targetHoursSem1 = sem1Eff * hpw;
  const targetHoursSem2 = sem2Eff * hpw;
  const targetHoursYear = targetHoursSem1 + targetHoursSem2;

  // Title & Metadata
  ws.mergeCells('A1', 'AF1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'PROGRAM TAHUNAN (PROTA) MATRIKS SEBARAN KALDIK';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E293B' } };
  titleCell.alignment = { horizontal: 'center' };

  ws.mergeCells('A2', 'AF2');
  const subTitleCell = ws.getCell('A2');
  subTitleCell.value = `${school.name.toUpperCase()} - TAHUN PELAJARAN ${meta.academicYear}`;
  subTitleCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF334155' } };
  subTitleCell.alignment = { horizontal: 'center' };

  ws.addRow([]);
  ws.addRow(['Mata Pelajaran', `: ${meta.subjectName}`, '', '', 'Kelas / Fase', `: ${meta.grade} / Fase F`]);
  ws.addRow(['Guru Pengampu', `: ${meta.teacherName}`, '', '', 'Jam Pelajaran', `: ${hpw} JP/Minggu`]);
  ws.addRow(['Bidang Keahlian', `: ${meta.department || 'Semua Bidang'}`, '', '', 'Total Waktu', `: ${targetHoursYear} JP (${targetHoursSem1} JP Gasal + ${targetHoursSem2} JP Genap)`]);
  ws.addRow([]);

  // Build Month & Week Column Headers
  const headerRow1 = ['NO', 'ELEMEN', 'TUJUAN PEMBELAJARAN / LINGKUP MATERI', 'JP'];
  const headerRow2 = ['', '', '', ''];

  allMonths.forEach(m => {
    headerRow1.push(m.monthName.toUpperCase());
    for (let w = 2; w <= m.totalWeeks; w++) {
      headerRow1.push('');
    }
    for (let w = 1; w <= m.totalWeeks; w++) {
      headerRow2.push(String(w));
    }
  });

  const r1 = ws.addRow(headerRow1);
  const r2 = ws.addRow(headerRow2);

  // Style Header Level 1
  r1.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  r1.alignment = { horizontal: 'center', vertical: 'middle' };
  r1.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });

  // Merge No, Elemen, TP, JP vertically
  ws.mergeCells(`A${r1.number}`, `A${r2.number}`);
  ws.mergeCells(`B${r1.number}`, `B${r2.number}`);
  ws.mergeCells(`C${r1.number}`, `C${r2.number}`);
  ws.mergeCells(`D${r1.number}`, `D${r2.number}`);

  // Merge Month names horizontally
  let currentCol = 5;
  allMonths.forEach(m => {
    if (m.totalWeeks > 1) {
      ws.mergeCells(r1.number, currentCol, r1.number, currentCol + m.totalWeeks - 1);
    }
    currentCol += m.totalWeeks;
  });

  // Style Header Level 2 (Week numbers)
  r2.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  r2.alignment = { horizontal: 'center', vertical: 'middle' };
  r2.eachCell(cell => {
    if (!cell.fill) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });

  // Pre-calculate effective weeks distribution for Sem 1
  const sem1EffKeys: string[] = [];
  sem1Months.forEach(m => {
    for (let w = 1; w <= m.totalWeeks; w++) {
      if (!getKaldikWeekActivity(m.monthName, w, true, events)) {
        sem1EffKeys.push(`${m.monthName}_${w}`);
      }
    }
  });

  const sem2EffKeys: string[] = [];
  sem2Months.forEach(m => {
    for (let w = 1; w <= m.totalWeeks; w++) {
      if (!getKaldikWeekActivity(m.monthName, w, false, events)) {
        sem2EffKeys.push(`${m.monthName}_${w}`);
      }
    }
  });

  const allocSem1: Record<string, Record<string, number>> = {};
  objectivesSem1.forEach(tp => { allocSem1[tp.id] = {}; });
  let w1Idx = 0;
  objectivesSem1.forEach(tp => {
    const rawWeeks = Math.max(1, Math.round((Number(tp.jp) || hpw * 3) / hpw));
    for (let k = 0; k < rawWeeks && w1Idx < sem1EffKeys.length; k++) {
      allocSem1[tp.id][sem1EffKeys[w1Idx]] = hpw;
      w1Idx++;
    }
  });

  const allocSem2: Record<string, Record<string, number>> = {};
  objectivesSem2.forEach(tp => { allocSem2[tp.id] = {}; });
  let w2Idx = 0;
  objectivesSem2.forEach(tp => {
    const rawWeeks = Math.max(1, Math.round((Number(tp.jp) || hpw * 3) / hpw));
    for (let k = 0; k < rawWeeks && w2Idx < sem2EffKeys.length; k++) {
      allocSem2[tp.id][sem2EffKeys[w2Idx]] = hpw;
      w2Idx++;
    }
  });

  // Add Semester 1 Banner Row
  const sem1Banner = ws.addRow([`SEMESTER 1 (GASAL) - ${sem1Eff} MINGGU EFEKTIF (${targetHoursSem1} JP)`]);
  sem1Banner.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E293B' } };
  ws.mergeCells(sem1Banner.number, 1, sem1Banner.number, currentCol - 1);
  sem1Banner.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  sem1Banner.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

  // Add Objectives Sem 1 Rows
  objectivesSem1.forEach((tp, idx) => {
    const totalJp = Object.values(allocSem1[tp.id] || {}).reduce((a, b) => a + b, 0) || (hpw * 3);
    const rowVals: any[] = [idx + 1, tp.element, `${tp.code}: ${tp.description}`, totalJp];

    allMonths.forEach(m => {
      for (let w = 1; w <= m.totalWeeks; w++) {
        const isGasalMonth = m.semester === 1;
        const special = getKaldikWeekActivity(m.monthName, w, isGasalMonth, events);
        if (special) {
          rowVals.push(special.badge);
        } else if (isGasalMonth) {
          const key = `${m.monthName}_${w}`;
          rowVals.push(allocSem1[tp.id]?.[key] || '');
        } else {
          rowVals.push('');
        }
      }
    });

    const addedRow = ws.addRow(rowVals);
    addedRow.font = { name: 'Arial', size: 8.5 };
    addedRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    addedRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    addedRow.getCell(4).font = { bold: true };

    let cIndex = 5;
    allMonths.forEach(m => {
      for (let w = 1; w <= m.totalWeeks; w++) {
        const cell = addedRow.getCell(cIndex);
        const isGasalMonth = m.semester === 1;
        const special = getKaldikWeekActivity(m.monthName, w, isGasalMonth, events);

        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        if (special) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: special.argbBg } };
          cell.font = { name: 'Arial', size: 7.5, bold: true, color: { argb: special.argbFg } };
        } else if (cell.value) {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
        }
        cIndex++;
      }
    });
  });

  // Add Semester 2 Banner Row
  const sem2Banner = ws.addRow([`SEMESTER 2 (GENAP) - ${sem2Eff} MINGGU EFEKTIF (${targetHoursSem2} JP)`]);
  sem2Banner.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E293B' } };
  ws.mergeCells(sem2Banner.number, 1, sem2Banner.number, currentCol - 1);
  sem2Banner.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  sem2Banner.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

  // Add Objectives Sem 2 Rows
  objectivesSem2.forEach((tp, idx) => {
    const totalJp = Object.values(allocSem2[tp.id] || {}).reduce((a, b) => a + b, 0) || (hpw * 3);
    const rowVals: any[] = [idx + 1, tp.element, `${tp.code}: ${tp.description}`, totalJp];

    allMonths.forEach(m => {
      for (let w = 1; w <= m.totalWeeks; w++) {
        const isGasalMonth = m.semester === 1;
        const special = getKaldikWeekActivity(m.monthName, w, isGasalMonth, events);
        if (special) {
          rowVals.push(special.badge);
        } else if (!isGasalMonth) {
          const key = `${m.monthName}_${w}`;
          rowVals.push(allocSem2[tp.id]?.[key] || '');
        } else {
          rowVals.push('');
        }
      }
    });

    const addedRow = ws.addRow(rowVals);
    addedRow.font = { name: 'Arial', size: 8.5 };
    addedRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    addedRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    addedRow.getCell(4).font = { bold: true };

    let cIndex = 5;
    allMonths.forEach(m => {
      for (let w = 1; w <= m.totalWeeks; w++) {
        const cell = addedRow.getCell(cIndex);
        const isGasalMonth = m.semester === 1;
        const special = getKaldikWeekActivity(m.monthName, w, isGasalMonth, events);

        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        if (special) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: special.argbBg } };
          cell.font = { name: 'Arial', size: 7.5, bold: true, color: { argb: special.argbFg } };
        } else if (cell.value) {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
        }
        cIndex++;
      }
    });
  });

  // Grand Total Row
  const totalRow = ws.addRow(['', 'TOTAL ALOKASI WAKTU 1 TAHUN', '', targetHoursYear]);
  totalRow.font = { name: 'Arial', size: 9.5, bold: true };
  totalRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
    cell.border = { top: { style: 'double' }, bottom: { style: 'medium' } };
  });

  // Column Widths
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 22;
  ws.getColumn(3).width = 45;
  ws.getColumn(4).width = 8;
  for (let c = 5; c < currentCol; c++) {
    ws.getColumn(c).width = 4.2;
  }

  // Legend Section
  ws.addRow([]);
  ws.addRow(['KETERANGAN WARNA KALDIK & AGENDA:']);
  const legend1 = ws.addRow(['', 'PUTIH', ': Minggu / Hari Efektif KBM Tatap Muka', '', 'ROSE', ': Tes Sumatif Tengah Semester (PSTS)']);
  legend1.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  legend1.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };

  const legend2 = ws.addRow(['', 'CYAN', ': Tes UN / Asesmen Nasional (ANBK)', '', 'PURPLE', ': Tes TKA & UKK Kejuruan']);
  legend2.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCFFAFE' } };
  legend2.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9D5FF' } };

  const legend3 = ws.addRow(['', 'INDIGO', ': PSAS / PSAT (Ujian Akhir Semester/Tahun)', '', 'AMBER', ': Libur Semester / Libur Nasional']);
  legend3.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };
  legend3.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };

  const legend4 = ws.addRow(['', 'EMERALD', ': Masa Pengenalan Lingkungan Sekolah (MPLS)', '', 'SKY/TEAL', ': Remedial, Ujian Susulan & Rapor']);
  legend4.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  legend4.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };

  // Signature Block
  ws.addRow([]);
  ws.addRow([]);
  const signDate = meta.documentDate || `${school.locationCity}, ${school.signatureDate}`;
  ws.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', signDate]);
  ws.addRow(['', 'Mengetahui,', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Guru Mata Pelajaran,']);
  ws.addRow(['', school.headmasterTitle]);
  ws.addRow([]);
  ws.addRow([]);
  ws.addRow([]);
  ws.addRow(['', school.headmasterName, '', '', '', '', '', '', '', '', '', '', '', '', '', meta.teacherName]);
  ws.addRow(['', `NBM. ${school.headmasterNbm}`, '', '', '', '', '', '', '', '', '', '', '', '', '', `NBM. ${meta.teacherNbm || '-'}`]);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PROTA_Matriks_Kaldik_${meta.subjectName.replace(/\s+/g, '_')}_${meta.grade}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

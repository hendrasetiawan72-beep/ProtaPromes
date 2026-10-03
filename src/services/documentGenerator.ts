import * as XLSX from 'xlsx';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, Packer } from 'docx';
import { SchoolProfile, DocumentMeta, MonthEffectiveBreakdown, LearningObjective, ScheduleSlot } from '../types';

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

  const totalWeeksSem2 = sem2.reduce((acc, m) => acc + m.totalWeeks, 0);
  const nonEffSem2 = sem2.reduce((acc, m) => acc + m.nonEffectiveWeeks, 0);
  const effSem2 = sem2.reduce((acc, m) => acc + m.effectiveWeeks, 0);

  const totalNonEffYear = nonEffSem1 + nonEffSem2;
  const totalEffYear = effSem1 + effSem2;

  const hoursSem1 = meta.weeklyHours * effSem1;
  const hoursSem2 = meta.weeklyHours * effSem2;

  const data: any[][] = [
    ['', '', 'PERHITUNGAN MINGGU EFEKTIF'],
    [],
    ['Mata Diklat', ': ' + meta.subjectName],
    ['Kelas / Semester', ': ' + meta.grade + '/Ganjil & Genap'],
    ['Program Keahlian', ': ' + (meta.expertiseProgram || 'Semua Program Keahlian')],
    ['Tahun', ': ' + meta.academicYear],
    ['Jam per Minggu', ': ' + meta.weeklyHours],
    [],
    ['No', 'Bulan', 'Jumlah Minggu', 'Minggu Tidak Efektif', 'Minggu Efektif']
  ];

  // Semester 1 rows
  sem1.forEach((m, idx) => {
    data.push([
      String(idx + 1).padStart(2, '0'),
      m.monthName,
      m.totalWeeks,
      m.nonEffectiveWeeks,
      m.effectiveWeeks
    ]);
  });
  data.push(['', 'JUMLAH', totalWeeksSem1, nonEffSem1, effSem1]);

  // Semester 2 rows
  sem2.forEach((m, idx) => {
    data.push([
      String(sem1.length + idx + 1).padStart(2, '0'),
      m.monthName,
      m.totalWeeks,
      m.nonEffectiveWeeks,
      m.effectiveWeeks
    ]);
  });
  data.push(['', 'JUMLAH', totalWeeksSem2, nonEffSem2, effSem2]);

  data.push([]);
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
  monthAnalysis: MonthEffectiveBreakdown[]
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
      if (isGasal) {
        if (month.monthName === 'Juli' && (weekNum === 1 || weekNum === 2)) return 'LIBUR SEM GENAP';
        if (month.monthName === 'Juli' && (weekNum === 3 || weekNum === 4)) return 'MPLS';
        if (month.monthName === 'Agustus' && weekNum === 2) return 'Asesmen Nasional';
        if (month.monthName === 'September' && weekNum === 4) return 'PSTS';
        if (month.monthName === 'Desember' && weekNum === 1) return 'PSAS';
        if (month.monthName === 'Desember' && (weekNum === 2 || weekNum === 3)) return 'Ujian Susulan, remedial';
        if (month.monthName === 'Desember' && (weekNum === 4 || weekNum === 5)) return 'LIBUR SEM GANJIL';
      } else {
        if (month.monthName === 'Maret' && weekNum === 2) return 'PSTS';
        if (month.monthName === 'Maret' && (weekNum === 3 || weekNum === 4)) return 'LIBUR HARI RAYA IDUL FITRI';
        if (month.monthName === 'April' && weekNum === 1) return 'PSAJ';
        if (month.monthName === 'April' && weekNum === 2) return 'PSAJ SUSULAN';
        if (month.monthName === 'April' && (weekNum === 3 || weekNum === 4)) return 'UKK';
        if (month.monthName === 'Mei' && weekNum === 1) return 'PENGUMUMAN KELULUSAN';
        if (month.monthName === 'Mei' && weekNum === 2) return 'WISUDA';
        if (month.monthName === 'Juni' && weekNum === 1) return 'PSAT';
        if (month.monthName === 'Juni' && (weekNum === 2 || weekNum === 3)) return 'Ujian susulan remedial';
        if (month.monthName === 'Juni' && weekNum === 4) return 'Libur Akhir Semester';
      }
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

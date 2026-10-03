import React from 'react';
import { SchoolProfile, DocumentMeta } from '../types';

interface SignatureBlockProps {
  school: SchoolProfile;
  meta?: DocumentMeta;
  teacherName?: string;
  teacherNbm?: string;
  teacherNip?: string;
  documentDate?: string;
}

/**
 * Reusable official blank signature block:
 * - Rata tengah (center aligned) on both Kepala Sekolah and Guru Mata Pelajaran blocks.
 * - Menggunakan NBM (Nomor Baku Muhammadiyah) secara konsisten (tanpa NIP).
 * - Ruang tanda tangan kosong dan bersih (tanpa gambar tanda tangan miring atau stempel grafik digital).
 */
export const SignatureBlock: React.FC<SignatureBlockProps> = ({
  school,
  meta,
  teacherName,
  teacherNbm,
  documentDate,
}) => {
  const resolvedTeacherName = teacherName || meta?.teacherName || 'Guru Mata Pelajaran';
  const resolvedNbm = teacherNbm || meta?.teacherNbm || '1102 9822 1450123';
  const resolvedDate = documentDate || meta?.documentDate || `${school.locationCity}, ${school.signatureDate}`;

  return (
    <div className="mt-8 pt-4 grid grid-cols-2 text-xs sm:text-sm font-sans break-inside-avoid print:break-inside-avoid select-none text-center">
      {/* Kolom Kiri: Kepala Sekolah (Rata Tengah) */}
      <div className="flex flex-col items-center justify-start text-center px-4">
        <p className="invisible select-none text-xs">Kota, Tanggal</p>
        <p className="text-slate-800 leading-snug">Mengetahui,</p>
        <p className="font-bold text-black leading-snug">{school.headmasterTitle}</p>

        {/* Ruang kosong fisik untuk pembubuhan tanda tangan basah & stempel sekolah */}
        <div className="h-20 sm:h-24 w-full" aria-label="Ruang tanda tangan dan stempel basah"></div>

        <p className="font-bold underline text-black tracking-wide text-center">
          {school.headmasterName}
        </p>
        <p className="text-slate-800 font-mono text-[11px] sm:text-xs mt-0.5 text-center">
          NBM. {school.headmasterNbm}
        </p>
      </div>

      {/* Kolom Kanan: Guru Mata Pelajaran (Rata Tengah) */}
      <div className="flex flex-col items-center justify-start text-center px-4">
        <p className="text-slate-800 leading-snug text-center">
          {resolvedDate}
        </p>
        <p className="font-bold text-black leading-snug text-center">Guru Mata Pelajaran,</p>
        <p className="invisible select-none text-[10px]">Jabatan</p>

        {/* Ruang kosong fisik untuk pembubuhan tanda tangan basah guru */}
        <div className="h-20 sm:h-24 w-full" aria-label="Ruang tanda tangan basah guru"></div>

        <p className="font-bold underline text-black tracking-wide text-center">
          {resolvedTeacherName}
        </p>
        <p className="text-slate-800 font-mono text-[11px] sm:text-xs mt-0.5 text-center">
          NBM. {resolvedNbm}
        </p>
      </div>
    </div>
  );
};

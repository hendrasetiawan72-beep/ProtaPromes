import React from 'react';
import { SchoolProfile } from '../types';

interface KopSuratProps {
  school: SchoolProfile;
  compact?: boolean;
  isLandscape?: boolean;
}

export const KopSurat: React.FC<KopSuratProps> = ({
  school,
  compact = false,
  isLandscape = false,
}) => {
  return (
    <div className={`w-full bg-white select-none ${compact ? 'pb-2' : 'pb-3'}`}>
      {/* 
        Official Kop Surat Layout:
        - Logo tetap di pinggir kiri (edge)
        - Logo rata tengah secara vertikal (items-center) terhadap seluruh blok kop
        - Teks instansi rata tengah horizontal (text-center font-serif)
        - Spacer kanan dengan lebar sama persis agar teks berada tepat di tengah halaman (simetris)
      */}
      <div className={`flex items-center justify-between gap-2 sm:gap-4 px-1 sm:px-4 ${isLandscape ? 'w-full' : ''}`}>
        {/* Logo Sekolah di Pinggir Kiri (Vertikal Rata Tengah) */}
        <div className={`${isLandscape ? 'w-20 sm:w-24' : compact ? 'w-18 sm:w-20' : 'w-20 sm:w-24'} shrink-0 flex items-center justify-center`}>
          <img
            src={school.logoUrl}
            alt={`Logo ${school.name}`}
            className={`${compact ? 'w-18 h-18 sm:w-20 sm:h-20' : isLandscape ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-20 h-20 sm:w-24 sm:h-24'} object-contain`}
          />
        </div>

        {/* Teks Identitas Sekolah - Rata Tengah Sempurna */}
        <div className="flex-1 text-center font-serif text-black leading-tight px-1 sm:px-2">
          <h3 className={`${compact ? 'text-xs sm:text-sm' : isLandscape ? 'text-xs sm:text-sm md:text-base' : 'text-xs sm:text-base'} font-bold tracking-wider uppercase`}>
            {school.foundation}
          </h3>
          <h3 className={`${compact ? 'text-xs sm:text-sm' : isLandscape ? 'text-xs sm:text-sm md:text-base' : 'text-xs sm:text-base'} font-bold tracking-wider uppercase`}>
            {school.branch}
          </h3>
          <h1 className={`${compact ? 'text-base sm:text-xl' : isLandscape ? 'text-lg sm:text-2xl' : 'text-xl sm:text-2xl'} font-extrabold tracking-wide uppercase mt-0.5`}>
            {school.name}
          </h1>
          <div className={`${compact ? 'text-[11px] sm:text-xs' : isLandscape ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-bold tracking-[0.25em] uppercase my-0.5 text-slate-800`}>
            {school.accreditation}
          </div>
          <p className={`${compact ? 'text-[9px] sm:text-[11px]' : isLandscape ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-[13px]'} text-slate-800 font-sans`}>
            {school.address}
          </p>
          <p className={`${compact ? 'text-[8.5px] sm:text-[10px]' : isLandscape ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'} text-slate-800 font-sans`}>
            <span>Email : <a href={`mailto:${school.email}`} className="text-blue-700 underline">{school.email}</a></span>
            <span className="mx-1.5">•</span>
            <span>Website : <a href={`https://${school.website}`} target="_blank" rel="noreferrer" className="text-blue-700 underline">{school.website}</a></span>
            {isLandscape && (
              <>
                <span className="mx-1.5">•</span>
                <span>Kode Pos {school.postalCode} Telp. {school.phone} Fax. {school.fax}</span>
              </>
            )}
          </p>
          {!isLandscape && (
            <p className={`${compact ? 'text-[8.5px] sm:text-[10px]' : 'text-[10px] sm:text-xs'} text-slate-800 font-sans`}>
              Kode Pos. {school.postalCode} Telp. {school.phone} Fax. {school.fax}
            </p>
          )}
        </div>

        {/* Spacer Kanan dengan lebar identik agar teks kop benar-benar presisi di tengah kertas */}
        <div className={`${isLandscape ? 'w-20 sm:w-24' : compact ? 'w-18 sm:w-20' : 'w-20 sm:w-24'} shrink-0 invisible pointer-events-none select-none`} aria-hidden="true">
          <div className={`${compact ? 'w-18 h-18 sm:w-20 sm:h-20' : isLandscape ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-20 h-20 sm:w-24 sm:h-24'}`} />
        </div>
      </div>

      {/* Garis Ganda Resmi (Double border line kop surat) */}
      <div className="mt-2.5">
        <div className="border-t-[3px] border-black w-full"></div>
        <div className="border-t-[1px] border-black w-full mt-[2px]"></div>
      </div>
    </div>
  );
};

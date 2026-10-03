import React from 'react';
import { X, Check, School, User, Calendar, ShieldCheck } from 'lucide-react';
import { SchoolProfile, DocumentMeta } from '../types';

interface PengaturanModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfile;
  meta: DocumentMeta;
  onSaveSchool: (profile: SchoolProfile) => void;
  onSaveMeta: (meta: DocumentMeta) => void;
}

export const PengaturanModal: React.FC<PengaturanModalProps> = ({
  isOpen,
  onClose,
  school,
  meta,
  onSaveSchool,
  onSaveMeta,
}) => {
  const [localSchool, setLocalSchool] = React.useState<SchoolProfile>(school);
  const [localMeta, setLocalMeta] = React.useState<DocumentMeta>(meta);

  React.useEffect(() => {
    setLocalSchool(school);
    setLocalMeta(meta);
  }, [school, meta, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSchool(localSchool);
    onSaveMeta(localMeta);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pengaturan Kop & Identitas Dokumen
              </h2>
              <p className="text-xs text-slate-500">
                Data ini otomatis tercetak pada seluruh dokumen siap cetak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {/* School info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-blue-600" />
              Identitas Sekolah & Kop
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={localSchool.name}
                  onChange={e => setLocalSchool({ ...localSchool, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status Akreditasi</label>
                <input
                  type="text"
                  value={localSchool.accreditation}
                  onChange={e => setLocalSchool({ ...localSchool, accreditation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Alamat Sekolah</label>
                <input
                  type="text"
                  value={localSchool.address}
                  onChange={e => setLocalSchool({ ...localSchool, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Headmaster & Teacher Signatures */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Penandatanganan Dokumen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={localSchool.headmasterName}
                  onChange={e => setLocalSchool({ ...localSchool, headmasterName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NBM Kepala Sekolah</label>
                <input
                  type="text"
                  value={localSchool.headmasterNbm}
                  onChange={e => setLocalSchool({ ...localSchool, headmasterNbm: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kota / Lokasi TTD</label>
                <input
                  type="text"
                  value={localSchool.locationCity}
                  onChange={e => setLocalSchool({ ...localSchool, locationCity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bulan & Tahun TTD</label>
                <input
                  type="text"
                  value={localSchool.signatureDate}
                  onChange={e => setLocalSchool({ ...localSchool, signatureDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Academic meta */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Parameter Dokumen Akademik
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tahun Pelajaran</label>
                <input
                  type="text"
                  value={localMeta.academicYear}
                  onChange={e => setLocalMeta({ ...localMeta, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                  placeholder="2026/2027"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Program Keahlian</label>
                <input
                  type="text"
                  value={localMeta.expertiseProgram}
                  onChange={e => setLocalMeta({ ...localMeta, expertiseProgram: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mata Pelajaran Aktif</label>
                <input
                  type="text"
                  value={localMeta.subjectName}
                  onChange={e => setLocalMeta({ ...localMeta, subjectName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alokasi Jam per Minggu (JP)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={localMeta.weeklyHours}
                  onChange={e => setLocalMeta({ ...localMeta, weeklyHours: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <Check className="w-4 h-4" />
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};

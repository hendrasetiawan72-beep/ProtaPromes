import React, { useState } from 'react';
import { Plus, Trash2, Edit3, X, Check, BookOpen, Clock } from 'lucide-react';
import { LearningObjective } from '../types';

interface TujuanPembelajaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  semester: 1 | 2;
  objectives: LearningObjective[];
  onSave: (updated: LearningObjective[]) => void;
  subjectName: string;
}

export const TujuanPembelajaranModal: React.FC<TujuanPembelajaranModalProps> = ({
  isOpen,
  onClose,
  semester,
  objectives,
  onSave,
  subjectName,
}) => {
  const [items, setItems] = useState<LearningObjective[]>(objectives);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sync state when opened
  React.useEffect(() => {
    setItems(objectives);
  }, [objectives, isOpen]);

  if (!isOpen) return null;

  const handleTextChange = (id: string, field: keyof LearningObjective, value: any) => {
    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleAddNew = () => {
    const nextNum = items.length + 1;
    const newObjective: LearningObjective = {
      id: `tp_${semester}_${Date.now()}`,
      semester,
      element: 'Membaca - Memirsa',
      code: `TP ${semester}.${nextNum}`,
      description: 'Peserta didik mampu memahami dan menganalisis materi pembelajaran dengan kritis.',
      jp: 4,
      weeklyAllocation: {}
    };
    setItems([...items, newObjective]);
    setEditingId(newObjective.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus Tujuan Pembelajaran ini?')) {
      setItems(items.filter(it => it.id !== id));
    }
  };

  const handleSaveAndClose = () => {
    onSave(items);
    onClose();
  };

  const totalJp = items.reduce((sum, it) => sum + (Number(it.jp) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Edit Manual Tujuan Pembelajaran (TP)
              </h2>
              <p className="text-xs text-slate-500">
                Mata Pelajaran: <span className="font-semibold text-slate-700">{subjectName}</span> • Semester {semester === 1 ? '1 (Gasal)' : '2 (Genap)'}
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2 text-blue-800 text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>
                Total Jam Pelajaran (JP) Semester {semester}: <strong className="text-blue-900">{totalJp} JP</strong>
              </span>
            </div>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah TP Baru
            </button>
          </div>

          <div className="space-y-3">
            {items.map((tp, idx) => (
              <div
                key={tp.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={tp.code}
                      onChange={e => handleTextChange(tp.id, 'code', e.target.value)}
                      className="text-xs font-semibold px-2 py-1 border border-slate-200 rounded w-24 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                      placeholder="Kode TP"
                    />
                    <select
                      value={tp.element}
                      onChange={e => handleTextChange(tp.id, 'element', e.target.value)}
                      className="text-xs px-2 py-1 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-700 outline-none"
                    >
                      <option value="Menyimak - Berbicara">Menyimak - Berbicara</option>
                      <option value="Membaca - Memirsa">Membaca - Memirsa</option>
                      <option value="Menulis - Mempresentasikan">Menulis - Mempresentasikan</option>
                      <option value="Pemahaman Konsep">Pemahaman Konsep</option>
                      <option value="Keterampilan Proses">Keterampilan Proses</option>
                      <option value="Praktik Kejuruan">Praktik Kejuruan</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span>Alokasi:</span>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        value={tp.jp}
                        onChange={e => handleTextChange(tp.id, 'jp', parseInt(e.target.value, 10) || 0)}
                        className="w-16 px-2 py-1 text-center font-bold border border-slate-200 rounded bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                      />
                      <span className="font-semibold text-slate-700">JP</span>
                    </div>

                    <button
                      onClick={() => handleDelete(tp.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Tujuan Pembelajaran"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <textarea
                    rows={2}
                    value={tp.description}
                    onChange={e => handleTextChange(tp.id, 'description', e.target.value)}
                    placeholder="Tuliskan deskripsi rumusan Tujuan Pembelajaran..."
                    className="w-full text-xs sm:text-sm p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y"
                  />
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                Belum ada Tujuan Pembelajaran. Klik "Tambah TP Baru" untuk menambahkan.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500">
            Perubahan akan otomatis diterapkan ke dokumen PROMES dan PROTA.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSaveAndClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              Simpan & Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

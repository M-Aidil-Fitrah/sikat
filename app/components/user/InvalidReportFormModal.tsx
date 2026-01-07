"use client";

import { useState } from 'react';
import { X, AlertTriangle, User, Phone } from 'lucide-react';

interface InvalidReportFormModalProps {
  reportId: number;
  reportName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvalidReportFormModal({
  reportId,
  reportName,
  onClose,
  onSuccess
}: InvalidReportFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    reporterName: '',
    kontak: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      alert('Alasan harus diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/invalid-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          reason: formData.reason,
          reporterName: formData.reporterName || undefined,
          kontak: formData.kontak || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim laporan');
      }

      alert('Terima kasih! Laporan Anda telah dikirim.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting invalid report:', error);
      alert(`Gagal mengirim laporan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Laporkan Tidak Valid</h2>
              <p className="text-sm text-gray-600">{reportName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Reason Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alasan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
              placeholder="Jelaskan mengapa laporan ini tidak valid..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Contoh: Lokasi tidak sesuai, kerusakan sudah diperbaiki, data tidak akurat, dll.
            </p>
          </div>

          {/* Reporter Name Field (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Pelapor <span className="text-gray-400 text-xs">(Opsional)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="Nama Anda"
              />
            </div>
          </div>

          {/* Contact Field (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kontak <span className="text-gray-400 text-xs">(Opsional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.kontak}
                onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="No. HP / Email"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.reason.trim()}
              className="flex-1 px-6 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, MapPin, Loader2, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { LatLngExpression, LeafletMouseEvent } from 'leaflet';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

interface DisasterFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface FormData {
  namaPelapor: string;
  desaKecamatan: string;
  namaObjek: string;
  jenisKerusakan: string;
  tingkatKerusakan: 'Ringan' | 'Sedang' | 'Berat';
  keteranganKerusakan: string;
  lat: number | null;
  lng: number | null;
  fotoLokasi: string[];
}

// Map click handler component with conditional import
function MapClickHandlerInner({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  if (typeof window !== 'undefined') {
    const { useMapEvents } = require('react-leaflet');
    useMapEvents({
      click: (e: LeafletMouseEvent) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
  }
  return null;
}

const MapClickHandler = dynamic(
  () => Promise.resolve(MapClickHandlerInner),
  { ssr: false }
);

export default function DisasterForm({ onClose, onSubmit }: DisasterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    namaPelapor: '',
    desaKecamatan: '',
    namaObjek: '',
    jenisKerusakan: '',
    tingkatKerusakan: 'Sedang',
    keteranganKerusakan: '',
    lat: null,
    lng: null,
    fotoLokasi: [],
  });

  const [photoMode, setPhotoMode] = useState<'capture' | 'upload' | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.5483, 95.3238]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get current location
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung di browser Anda');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        
        // Reverse geocoding untuk mendapatkan nama lokasi
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          const village = data.address.village || data.address.suburb || '';
          const district = data.address.county || data.address.city_district || '';
          const city = data.address.city || data.address.town || '';
          
          const locationName = `${village}${district ? ', ' + district : ''}${city ? ', ' + city : ''}`;
          setFormData(prev => ({ ...prev, desaKecamatan: locationName }));
        } catch (error) {
          console.error('Error getting location name:', error);
        }
        
        setLoadingLocation(false);
      },
      (error) => {
        setLocationError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.');
        setLoadingLocation(false);
      }
    );
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData(prev => ({
            ...prev,
            fotoLokasi: [...prev.fotoLokasi, base64String]
          }));
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.8);

    stopCamera();
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          fotoLokasi: [...prev.fotoLokasi, base64String]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotoLokasi: prev.fotoLokasi.filter((_, i) => i !== index)
    }));
  };

  // Handle photo mode selection
  const handlePhotoModeSelect = (mode: 'capture' | 'upload') => {
    setPhotoMode(mode);
    
    if (mode === 'capture') {
      // Capture mode: get real-time location
      getCurrentLocation();
      startCamera();
    } else {
      // Upload mode: show map for coordinate selection
      setShowMap(true);
    }
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    setFormData(prev => ({ ...prev, lat, lng }));
    
    // Reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      const village = data.address.village || data.address.suburb || '';
      const district = data.address.county || data.address.city_district || '';
      const city = data.address.city || data.address.town || '';
      
      const locationName = `${village}${district ? ', ' + district : ''}${city ? ', ' + city : ''}`;
      setFormData(prev => ({ ...prev, desaKecamatan: locationName }));
    } catch (error) {
      console.error('Error getting location name:', error);
    }
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lat || !formData.lng) {
      alert('Koordinat lokasi harus diisi');
      return;
    }

    if (formData.fotoLokasi.length === 0) {
      alert('Minimal 1 foto harus diupload');
      return;
    }

    const timestamp = new Date().toISOString();
    const submissionData = {
      ...formData,
      timestamp: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestampISO: timestamp,
      verified: false,
      type: formData.jenisKerusakan.includes('Banjir') ? 'Banjir' : 
            formData.jenisKerusakan.includes('Longsor') ? 'Longsor' : 'Lainnya',
      severity: formData.tingkatKerusakan === 'Berat' ? 'high' : 
                formData.tingkatKerusakan === 'Sedang' ? 'medium' : 'low',
    };

    onSubmit(submissionData);
    onClose();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-red-600 to-orange-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tambah Laporan Bencana</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Mode Selection */}
          {!photoMode && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pilih Metode Pengambilan Foto</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handlePhotoModeSelect('capture')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-center"
                >
                  <Camera className="w-12 h-12 mx-auto mb-3 text-red-600" />
                  <div className="font-semibold text-gray-900">Ambil Foto</div>
                  <div className="text-sm text-gray-500 mt-1">Lokasi otomatis dari GPS</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handlePhotoModeSelect('upload')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-center"
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-red-600" />
                  <div className="font-semibold text-gray-900">Upload Foto</div>
                  <div className="text-sm text-gray-500 mt-1">Pilih lokasi di peta</div>
                </button>
              </div>
            </div>
          )}

          {/* Camera Capture */}
          {photoMode === 'capture' && isCameraActive && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Ambil Foto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setPhotoMode(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* File Upload */}
          {photoMode === 'upload' && !showMap && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all"
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <div className="font-semibold text-gray-700">Upload Foto</div>
                <div className="text-sm text-gray-500 mt-1">Maksimal 3 foto</div>
              </button>
            </div>
          )}

          {/* Location Loading */}
          {loadingLocation && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">Mengambil lokasi Anda...</span>
            </div>
          )}

          {/* Location Error */}
          {locationError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{locationError}</span>
            </div>
          )}

          {/* Map for Upload Mode */}
          {photoMode === 'upload' && showMap && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">Klik pada peta untuk menentukan lokasi kejadian</span>
              </div>
              <div className="h-96 rounded-xl overflow-hidden border-2 border-gray-200">
                {typeof window !== 'undefined' && (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <MapClickHandler onLocationSelect={handleMapClick} />
                    {selectedPosition && (
                      <Marker position={selectedPosition as LatLngExpression} />
                    )}
                  </MapContainer>
                )}
              </div>
            </div>
          )}

          {/* Photo Preview */}
          {formData.fotoLokasi.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Foto Lokasi ({formData.fotoLokasi.length}/3)</h3>
              <div className="grid grid-cols-3 gap-4">
                {formData.fotoLokasi.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coordinates Display */}
          {formData.lat && formData.lng && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Koordinat Lokasi</span>
              </div>
              <div className="font-mono text-sm text-gray-700">
                {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
              </div>
            </div>
          )}

          {/* Form Fields */}
          {(formData.lat && formData.lng) && (
            <>
              <div className="space-y-2">
                <label className="block font-semibold text-gray-900">Nama Pelapor *</label>
                <input
                  type="text"
                  required
                  value={formData.namaPelapor}
                  onChange={(e) => setFormData(prev => ({ ...prev, namaPelapor: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-900">Desa / Kecamatan *</label>
                <input
                  type="text"
                  required
                  value={formData.desaKecamatan}
                  onChange={(e) => setFormData(prev => ({ ...prev, desaKecamatan: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                  placeholder="Otomatis dari koordinat"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-900">Nama Objek / Bangunan *</label>
                <input
                  type="text"
                  required
                  value={formData.namaObjek}
                  onChange={(e) => setFormData(prev => ({ ...prev, namaObjek: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Contoh: Jembatan Krueng Raya"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-900">Jenis Kerusakan / Kebutuhan *</label>
                <select
                  required
                  value={formData.jenisKerusakan}
                  onChange={(e) => setFormData(prev => ({ ...prev, jenisKerusakan: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Pilih jenis kerusakan</option>
                  <option value="Banjir - Rumah tinggal terendam">Banjir - Rumah tinggal terendam</option>
                  <option value="Banjir - Jalan tertutup air">Banjir - Jalan tertutup air</option>
                  <option value="Banjir - Fasilitas umum rusak">Banjir - Fasilitas umum rusak</option>
                  <option value="Longsor - Jalan tertutup material">Longsor - Jalan tertutup material</option>
                  <option value="Longsor - Bangunan tertimpa">Longsor - Bangunan tertimpa</option>
                  <option value="Longsor - Lahan pertanian rusak">Longsor - Lahan pertanian rusak</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-900">Tingkat Kerusakan *</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Ringan', 'Sedang', 'Berat'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tingkatKerusakan: level }))}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        formData.tingkatKerusakan === level
                          ? level === 'Berat' ? 'bg-red-600 text-white' :
                            level === 'Sedang' ? 'bg-amber-500 text-white' :
                            'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-gray-900">Keterangan Kerusakan *</label>
                <textarea
                  required
                  value={formData.keteranganKerusakan}
                  onChange={(e) => setFormData(prev => ({ ...prev, keteranganKerusakan: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Jelaskan kondisi kerusakan secara detail..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
                >
                  Kirim Laporan
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

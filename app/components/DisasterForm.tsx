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
  const [cameraError, setCameraError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.5483, 95.3238]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // PERBAIKAN: Auto-stop camera saat max photos tercapai
  useEffect(() => {
    if (formData.fotoLokasi.length >= 3 && isCameraActive) {
      console.log('Max photos reached, stopping camera...');
      stopCamera();
      // Auto proceed to location after short delay
      setTimeout(() => {
        if (photoMode === 'capture') {
          getCurrentLocation();
        }
      }, 500);
    }
  }, [formData.fotoLokasi.length, isCameraActive, photoMode]);

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
        setFormData(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude
        }));

        // Reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          const village = data.address.village || data.address.suburb || '';
          const district = data.address.county || data.address.city_district || '';
          const city = data.address.city || data.address.town || '';
          const locationName = `${village}${district ? ', ' + district : ''}${city ? ', ' + city : ''}`;

          setFormData(prev => ({
            ...prev,
            desaKecamatan: locationName
          }));
        } catch (error) {
          console.error('Error getting location name:', error);
        }
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.');
        setLoadingLocation(false);
      }
    );
  };

  // Start camera
  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Camera started successfully');
                setIsCameraActive(true);
              })
              .catch((playError) => {
                console.error('Error playing video:', playError);
                setCameraError('Gagal memulai kamera. Coba lagi.');
                stopCamera();
              });
          }
        };

        // PERBAIKAN: Timeout fallback dengan null check yang benar
        setTimeout(() => {
          // Check if video exists and is ready before accessing readyState
          if (!isCameraActive && videoRef.current && videoRef.current.readyState >= 2) {
            setIsCameraActive(true);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setCameraError('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.');
        } else if (error.name === 'NotFoundError') {
          setCameraError('Kamera tidak ditemukan pada perangkat Anda.');
        } else if (error.name === 'NotReadableError') {
          setCameraError('Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut dan coba lagi.');
        } else {
          setCameraError('Gagal mengakses kamera: ' + error.message);
        }
      } else {
        setCameraError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
      }
      
      setPhotoMode(null);
    }
  };

  // Stop camera
  const stopCamera = () => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
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
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (formData.fotoLokasi.length >= 3) {
      alert('Maksimal 3 foto');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} tidak didukung. Hanya JPG, PNG, dan HEIC yang diperbolehkan.`);
        return;
      }

      if (file.size > maxSize) {
        alert(`File ${file.name} terlalu besar. Maksimal 2MB per foto.`);
        return;
      }

      if (formData.fotoLokasi.length >= 3) {
        alert('Maksimal 3 foto');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => {
          if (prev.fotoLokasi.length >= 3) return prev;
          return {
            ...prev,
            fotoLokasi: [...prev.fotoLokasi, base64String]
          };
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
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
      startCamera();
    }
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    setFormData(prev => ({
      ...prev,
      lat,
      lng
    }));

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

      setFormData(prev => ({
        ...prev,
        desaKecamatan: locationName
      }));
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 to-orange-600 p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Tambah Laporan Bencana</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Mode Selection */}
          {!photoMode && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Pilih Metode Pengambilan Foto</h3>
              <p className="text-sm text-gray-600 mb-4">Min 1 - Maks 3 foto</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handlePhotoModeSelect('capture')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-center"
                >
                  <Camera className="w-12 h-12 mx-auto mb-3 text-red-600" />
                  <h4 className="font-semibold text-lg mb-1">Ambil Foto</h4>
                  <p className="text-sm text-gray-600">Lokasi otomatis dari GPS</p>
                </button>

                <button
                  type="button"
                  onClick={() => handlePhotoModeSelect('upload')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-center"
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-red-600" />
                  <h4 className="font-semibold text-lg mb-1">Upload Foto</h4>
                  <p className="text-sm text-gray-600">Pilih lokasi di peta</p>
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Format: JPG, PNG, HEIC • Ukuran maks: 2MB per foto
              </p>
            </div>
          )}

          {/* Camera Capture */}
          {photoMode === 'capture' && formData.fotoLokasi.length < 3 && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {!isCameraActive && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white">
                    <Loader2 className="w-12 h-12 animate-spin mb-3" />
                    <p className="font-semibold">Mengaktifkan Kamera...</p>
                    <p className="text-sm text-gray-300 mt-1">Mohon izinkan akses kamera</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 text-white p-6">
                    <AlertCircle className="w-12 h-12 mb-3" />
                    <p className="font-semibold text-center mb-3">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCameraError('');
                        startCamera();
                      }}
                      className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}
              </div>

              {isCameraActive && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={formData.fotoLokasi.length >= 3}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-5 h-5" />
                    Ambil Foto ({formData.fotoLokasi.length}/3)
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
              )}

              {formData.fotoLokasi.length >= 3 && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">Maksimal 3 foto sudah tercapai</p>
                </div>
              )}
            </div>
          )}

          {/* File Upload */}
          {photoMode === 'upload' && !showMap && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/heic"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={formData.fotoLokasi.length >= 3}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-semibold text-gray-700">Upload Foto</p>
                <p className="text-sm text-gray-500 mt-1">
                  Min 1 - Maks 3 foto (JPG, PNG, HEIC)
                </p>
                <p className="text-xs text-gray-400 mt-1">Maksimal 2MB per foto</p>
              </button>

              {formData.fotoLokasi.length === 0 && (
                <button
                  type="button"
                  onClick={() => setPhotoMode(null)}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  ← Kembali ke Pilihan Metode
                </button>
              )}
            </div>
          )}

          {/* Location Loading */}
          {loadingLocation && (
            <div className="flex items-center gap-3 text-blue-600 bg-blue-50 p-4 rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="font-medium">Mengambil lokasi Anda...</p>
            </div>
          )}

          {/* Location Error */}
          {locationError && (
            <div className="flex items-start gap-3 text-red-600 bg-red-50 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{locationError}</p>
            </div>
          )}

          {/* Map for Upload Mode */}
          {photoMode === 'upload' && showMap && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                Klik pada peta untuk menentukan lokasi kejadian
              </p>

              <div className="h-96 rounded-xl overflow-hidden border-2 border-gray-200">
                {typeof window !== 'undefined' && (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onLocationSelect={handleMapClick} />
                    {selectedPosition && (
                      <Marker position={selectedPosition} />
                    )}
                  </MapContainer>
                )}
              </div>
            </div>
          )}

          {/* Photo Preview */}
          {formData.fotoLokasi.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Foto Lokasi ({formData.fotoLokasi.length}/3)
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {formData.fotoLokasi.map((photo, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
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

              {/* Proceed to Location Button */}
              {!formData.lat && !formData.lng && (
                <button
                  type="button"
                  onClick={() => {
                    if (photoMode === 'capture') {
                      getCurrentLocation();
                    } else {
                      setShowMap(true);
                    }
                  }}
                  className="w-full px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Lanjut ke Lokasi {photoMode === 'capture' ? '(GPS Otomatis)' : '(Pilih di Peta)'}
                </button>
              )}
            </div>
          )}

          {/* Coordinates Display */}
          {formData.lat && formData.lng && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Koordinat Lokasi</p>
              <p className="font-mono text-sm font-semibold text-gray-800">
                {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Form Fields */}
          {(formData.lat && formData.lng) && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Pelapor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaPelapor}
                  onChange={(e) => setFormData(prev => ({ ...prev, namaPelapor: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Desa / Kecamatan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.desaKecamatan}
                  onChange={(e) => setFormData(prev => ({ ...prev, desaKecamatan: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                  placeholder="Otomatis dari koordinat"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Objek / Bangunan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaObjek}
                  onChange={(e) => setFormData(prev => ({ ...prev, namaObjek: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Contoh: Jembatan Krueng Raya"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Kerusakan / Kebutuhan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.jenisKerusakan}
                  onChange={(e) => setFormData(prev => ({ ...prev, jenisKerusakan: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Contoh: Banjir - Rumah terendam, Longsor - Jalan tertutup"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tingkat Kerusakan *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Ringan', 'Sedang', 'Berat'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tingkatKerusakan: level }))}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        formData.tingkatKerusakan === level
                          ? level === 'Berat'
                            ? 'bg-red-600 text-white'
                            : level === 'Sedang'
                            ? 'bg-amber-500 text-white'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keterangan Kerusakan *
                </label>
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
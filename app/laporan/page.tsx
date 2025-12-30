"use client";
import { useState } from "react";

export default function LaporanPage() {
  const [form, setForm] = useState({
    namaPelapor: "",
    namaObjek: "",
    desa: "",
    kecamatan: "",
    jenisKerusakan: "",
    tingkatKerusakan: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/laporan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        fotoLokasi: [], // aman
      }),
    });

    const data = await res.json();
    console.log(data);

    if (data.success) {
      alert("Laporan berhasil dikirim");
    } else {
      alert("Gagal mengirim laporan");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="namaPelapor" placeholder="Nama Pelapor" onChange={handleChange} />
      <input name="namaObjek" placeholder="Objek" onChange={handleChange} />
      <input name="desa" placeholder="Desa" onChange={handleChange} />
      <input name="kecamatan" placeholder="Kecamatan" onChange={handleChange} />
      <input name="jenisKerusakan" placeholder="Jenis Kerusakan" onChange={handleChange} />
      <input name="tingkatKerusakan" placeholder="Tingkat Kerusakan" onChange={handleChange} />
      <input name="latitude" placeholder="Latitude" onChange={handleChange} />
      <input name="longitude" placeholder="Longitude" onChange={handleChange} />
      <button type="submit">Kirim</button>
    </form>
  );
}

import { Link } from 'react-router-dom';
export default function NotFound() {
  return <main className="not-found"><span className="eyebrow">404 — PAGE NOT FOUND</span><h1>Halaman tidak ditemukan</h1><p>Alamat yang kamu buka mungkin sudah dipindahkan.</p><Link className="button button-primary" to="/">Kembali ke dashboard</Link></main>;
}

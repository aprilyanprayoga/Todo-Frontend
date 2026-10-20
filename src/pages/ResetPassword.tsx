import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { resetPassword } from '../services/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token');
    const type = hash.get('type');
    if (accessToken && (!type || type === 'recovery')) setToken(accessToken);
    else setError('Token reset tidak ditemukan. Buka tautan terbaru dari email kamu.');
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!token) { setError('Token reset tidak valid atau sudah kedaluwarsa.'); return; }
    if (password.length < 8 || password.length > 72) { setError('Password harus terdiri dari 8–72 karakter.'); return; }
    if (password !== confirm) { setError('Konfirmasi password belum cocok.'); return; }
    setBusy(true);
    try {
      await resetPassword(password, token);
      window.history.replaceState(null, '', window.location.pathname);
      setDone(true);
      window.setTimeout(() => navigate('/login', { replace: true }), 2200);
    } catch (err) {
      setError((err as Error).message || 'Gagal mengubah password.');
    } finally { setBusy(false); }
  }

  return <AuthLayout title="Choose a new password" subtitle="Gunakan password baru yang kuat dan mudah kamu ingat.">
    {done ? <div className="success-panel"><span className="success-icon"><CheckCircle2 size={24}/></span><h3>Password berhasil diubah</h3><p>Mengarahkan kamu ke halaman login...</p><Link to="/login">Login sekarang</Link></div> :
    <form className="form-stack" onSubmit={submit}>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <label className="field"><span>Password baru</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required /></label>
      <label className="field"><span>Konfirmasi password</span><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required /></label>
      <button className="button button-primary button-full" disabled={busy || !token}>{busy ? 'Menyimpan...' : 'Ubah password'}</button>
    </form>}
  </AuthLayout>;
}

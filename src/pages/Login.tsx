import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../services/api';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!email.trim() || !password) { setError('Email dan password wajib diisi.'); return; }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from || '/', { replace: true });
    } catch (err) {
      const e = err as ApiRequestError;
      setError(e.code === 'INVALID_CREDENTIALS' ? 'Email atau password salah.' :
        e.code === 'EMAIL_NOT_CONFIRMED' ? 'Verifikasi email kamu sebelum login.' : e.message || 'Login gagal.');
    } finally { setBusy(false); }
  }

  return <AuthLayout title="Welcome back" subtitle="Masuk untuk melanjutkan progresmu.">
    <form className="form-stack" onSubmit={submit}>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <label className="field"><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" required /></label>
      <label className="field"><span className="field-between">Password <Link to="/forgot-password">Lupa password?</Link></span><span className="password-wrap"><input type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" required /><button className="icon-button password-toggle" type="button" onClick={() => setShow(v => !v)} aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
      <button className="button button-primary button-full" disabled={busy}>{busy ? <><span className="spinner spinner-light"/> Memproses...</> : <>Masuk <ArrowRight size={17}/></>}</button>
    </form>
    <p className="auth-switch">Belum punya akun? <Link to="/register">Buat akun</Link></p>
  </AuthLayout>;
}

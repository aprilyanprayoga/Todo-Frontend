import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../services/api';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess('');
    if (password.length < 8 || password.length > 72) { setError('Password harus terdiri dari 8–72 karakter.'); return; }
    if (password !== confirm) { setError('Konfirmasi password belum cocok.'); return; }
    setBusy(true);
    try {
      const loggedIn = await signUp(email.trim(), password, name.trim() || undefined);
      if (loggedIn) navigate('/', { replace: true });
      else setSuccess('Akun berhasil dibuat. Cek email untuk verifikasi, lalu login.');
    } catch (err) {
      const e = err as ApiRequestError;
      setError(e.code === 'EMAIL_ALREADY_REGISTERED' ? 'Email sudah terdaftar.' :
        e.code === 'WEAK_PASSWORD' ? 'Password terlalu lemah. Coba password yang lebih kuat.' : e.message || 'Registrasi gagal.');
    } finally { setBusy(false); }
  }

  return <AuthLayout title="Create your account" subtitle="Buat akun dan mulai atur tugasmu.">
    <form className="form-stack" onSubmit={submit}>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}
      <label className="field"><span>Nama (opsional)</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Nama kamu" autoComplete="name" /></label>
      <label className="field"><span>Email address</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" required /></label>
      <label className="field"><span>Password</span><span className="password-wrap"><input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter" autoComplete="new-password" minLength={8} maxLength={72} required /><button className="icon-button password-toggle" type="button" onClick={() => setShow(v => !v)} aria-label="Tampilkan atau sembunyikan password">{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
      <label className="field"><span>Konfirmasi password</span><input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Ulangi password" autoComplete="new-password" required /></label>
      <button className="button button-primary button-full" disabled={busy}>{busy ? <><span className="spinner spinner-light"/> Membuat akun...</> : <>Buat akun <ArrowRight size={17}/></>}</button>
    </form>
    <p className="auth-switch">Sudah punya akun? <Link to="/login">Masuk</Link></p>
  </AuthLayout>;
}

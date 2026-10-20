import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { forgotPassword } from '../services/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setBusy(true);
    try { await forgotPassword(email.trim()); setSent(true); }
    catch (err) { setError((err as Error).message || 'Permintaan gagal. Coba lagi.'); }
    finally { setBusy(false); }
  }

  return <AuthLayout title="Reset your password" subtitle="Kami akan mengirim tautan reset jika email sesuai.">
    {sent ? <div className="success-panel"><span className="success-icon"><Mail size={23}/></span><h3>Periksa email kamu</h3><p>Jika alamat tersebut terdaftar, instruksi reset password akan dikirimkan.</p><Link className="button button-primary button-full" to="/login">Kembali ke login</Link></div> :
    <form className="form-stack" onSubmit={submit}>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <label className="field"><span>Email address</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" required /></label>
      <button className="button button-primary button-full" disabled={busy}>{busy ? 'Mengirim...' : 'Kirim tautan reset'}</button>
    </form>}
    <p className="auth-switch"><Link to="/login"><ArrowLeft size={15}/> Kembali ke login</Link></p>
  </AuthLayout>;
}

import type { ReactNode } from 'react';
import { CheckSquare2, Sparkles } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }: {
  children: ReactNode; title: string; subtitle: string;
}) {
  return (
    <main className="auth-page">
      <section className="auth-aside">
        <div className="brand brand-light"><span className="brand-icon"><CheckSquare2 size={22} /></span> taskflow</div>
        <div className="aside-copy">
          <div className="eyebrow"><Sparkles size={14} /> YOUR SPACE TO FOCUS</div>
          <h1>Make room for<br /><em>what matters.</em></h1>
          <p>Rencanakan hari, atur prioritas, dan selesaikan satu hal dalam satu waktu.</p>
          <div className="aside-note"><span className="note-check"><CheckSquare2 size={16} /></span><span><b>Small steps, big progress.</b><small>Mulai dari satu tugas hari ini.</small></span></div>
        </div>
        <span className="aside-footer">A calmer way to get things done.</span>
      </section>
      <section className="auth-main">
        <div className="auth-mobile-brand brand"><span className="brand-icon"><CheckSquare2 size={20} /></span> taskflow</div>
        <div className="auth-form-wrap">
          <div className="auth-heading"><span className="eyebrow">WELCOME TO TASKFLOW</span><h2>{title}</h2><p>{subtitle}</p></div>
          {children}
        </div>
        <p className="auth-legal">Dengan melanjutkan, kamu setuju menggunakan Taskflow secara bertanggung jawab.</p>
      </section>
    </main>
  );
}

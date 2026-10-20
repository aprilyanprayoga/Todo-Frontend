import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckSquare2, Plus, Search, LogOut, ListTodo, CircleCheck, Clock3, Flame, CalendarDays, Pencil, Trash2, Check, X, ChevronDown, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../services/api';
import { createTodo, deleteTodo, listTodos, updateTodo } from '../services/todos';
import type { Priority, Todo, TodoQuery } from '../types/api';

type StatusFilter = 'all' | 'pending' | 'completed';
const priorityLabels: Record<Priority, string> = { low: 'Low', medium: 'Medium', high: 'High' };

function formatDate(value: string | null) {
  if (!value) return 'Tanpa tenggat';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak valid';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
function errorText(error: unknown) {
  const e = error as ApiRequestError;
  if (e.code === 'VALIDATION_ERROR' && e.details?.length) return e.details.map(d => d.message).join(' ');
  if (e.code === 'NETWORK_ERROR') return e.message;
  if (e.code === 'NOT_FOUND') return 'Todo tidak ditemukan atau sudah dihapus.';
  return e.message || 'Terjadi kesalahan. Coba lagi.';
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [priority, setPriority] = useState<'' | Priority>('');
  const [sortBy, setSortBy] = useState<TodoQuery['sort_by']>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadTodos = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await listTodos({
        page, limit: 100,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status === 'all' ? {} : { is_completed: status === 'completed' }),
        ...(priority ? { priority } : {}),
        sort_by: sortBy, order,
      });
      setTodos(result.data);
      setTotal(result.meta?.total ?? result.data.length);
      setTotalPages(result.meta?.total_pages ?? 1);
    } catch (err) {
      setError(errorText(err));
      setTodos([]);
    } finally { setLoading(false); }
  }, [page, search, status, priority, sortBy, order]);

  useEffect(() => { void loadTodos(); }, [loadTodos]);
  useEffect(() => { setPage(1); }, [search, status, priority, sortBy, order]);

  const completed = useMemo(() => todos.filter(t => t.is_completed).length, [todos]);
  const pending = useMemo(() => todos.filter(t => !t.is_completed).length, [todos]);
  const high = useMemo(() => todos.filter(t => t.priority === 'high' && !t.is_completed).length, [todos]);

  function openCreate() {
    setEditing(null); setTitle(''); setDescription(''); setFormPriority('medium'); setDueDate('');
    setNotice(''); setModal(true);
  }
  function openEdit(todo: Todo) {
    setEditing(todo); setTitle(todo.title); setDescription(todo.description || '');
    setFormPriority(todo.priority);
    setDueDate(todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : '');
    setNotice(''); setModal(true);
  }
  async function submitTodo(e: React.FormEvent) {
    e.preventDefault(); setNotice('');
    if (!title.trim()) { setNotice('Judul tugas wajib diisi.'); return; }
    if (title.trim().length > 200) { setNotice('Judul maksimal 200 karakter.'); return; }
    if (description.length > 5000) { setNotice('Deskripsi maksimal 5.000 karakter.'); return; }
    setSaving(true);
    try {
      const input = {
        title: title.trim(),
        description: description.trim() || null,
        priority: formPriority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      };
      if (editing) await updateTodo(editing.id, input);
      else await createTodo(input);
      setModal(false);
      await loadTodos();
    } catch (err) { setNotice(errorText(err)); }
    finally { setSaving(false); }
  }
  async function toggleTodo(todo: Todo) {
    setError('');
    try { await updateTodo(todo.id, { is_completed: !todo.is_completed }); await loadTodos(); }
    catch (err) { setError(errorText(err)); }
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    try { await deleteTodo(deleteTarget.id); setDeleteTarget(null); await loadTodos(); }
    catch (err) { setError(errorText(err)); setDeleteTarget(null); }
  }
  async function handleLogout() {
    try { await signOut(); } catch { /* session lokal tetap dihapus oleh auth service */ }
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/"><span className="brand-icon"><CheckSquare2 size={21}/></span> taskflow<span className="brand-dot">.</span></a>
      <div className="side-label">WORKSPACE</div>
      <button className="side-link active"><ListTodo size={18}/> My tasks <span className="side-count">{total}</span></button>
      <div className="sidebar-bottom">
        <div className="side-label">ACCOUNT</div>
        <div className="user-mini"><div className="avatar">{(user?.email?.[0] || 'U').toUpperCase()}</div><div className="user-mini-copy"><b>{String(user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Pengguna')}</b><small>{user?.email || 'Akun kamu'}</small></div><button className="icon-button" onClick={handleLogout} aria-label="Logout" title="Logout"><LogOut size={17}/></button></div>
      </div>
    </aside>

    <section className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>My tasks</b></div><div className="topbar-right"><span className="today-label"><CalendarDays size={15}/>{new Intl.DateTimeFormat('id-ID',{weekday:'short',day:'numeric',month:'short'}).format(new Date())}</span><div className="topbar-profile"><div className="avatar avatar-small">{(user?.email?.[0] || 'U').toUpperCase()}</div><button className="icon-button" aria-label="Menu akun" onClick={() => setMenuOpen(v => !v)}><ChevronDown size={16}/></button>{menuOpen && <div className="profile-menu"><span>{user?.email}</span><button onClick={handleLogout}><LogOut size={15}/> Keluar</button></div>}</div></div></header>

      <div className="dashboard-content">
        <div className="welcome-row"><div><div className="eyebrow">YOUR PERSONAL WORKSPACE</div><h1>Good day, {String(user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there')} <span className="wave">✳</span></h1><p>Fokus pada hal penting. Satu tugas dalam satu waktu.</p></div><button className="button button-primary" onClick={openCreate}><Plus size={18}/> Tambah tugas</button></div>

        {error && <div className="alert alert-error dashboard-alert" role="alert"><AlertCircle size={17}/>{error}<button className="icon-button" onClick={() => setError('')} aria-label="Tutup pesan"><X size={16}/></button></div>}

        <div className="stats-grid">
          <article className="stat-card"><div className="stat-top"><span>Total tasks</span><span className="stat-icon stat-purple"><ListTodo size={18}/></span></div><strong>{loading ? '—' : total}</strong><small>Semua tugas yang cocok</small></article>
          <article className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon stat-green"><CircleCheck size={18}/></span></div><strong>{loading ? '—' : completed}</strong><small>Tugas di halaman ini</small></article>
          <article className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon stat-blue"><Clock3 size={18}/></span></div><strong>{loading ? '—' : pending}</strong><small>Masih perlu dikerjakan</small></article>
          <article className="stat-card"><div className="stat-top"><span>High priority</span><span className="stat-icon stat-orange"><Flame size={18}/></span></div><strong>{loading ? '—' : high}</strong><small>Prioritas tinggi, belum selesai</small></article>
        </div>

        <section className="tasks-panel">
          <div className="panel-heading"><div><h2>Daftar tugas</h2><p>Atur tugasmu dan lacak progres hari ini.</p></div><span className="task-total">{total} tugas</span></div>
          <div className="toolbar"><label className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul tugas..." aria-label="Cari tugas"/></label><div className="toolbar-filters"><label className="select-wrap"><SlidersHorizontal size={15}/><select value={status} onChange={e => setStatus(e.target.value as StatusFilter)} aria-label="Filter status"><option value="all">Semua status</option><option value="pending">Belum selesai</option><option value="completed">Selesai</option></select></label><label className="select-wrap"><select value={priority} onChange={e => setPriority(e.target.value as '' | Priority)} aria-label="Filter prioritas"><option value="">Semua prioritas</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label className="select-wrap"><select value={sortBy} onChange={e => setSortBy(e.target.value as TodoQuery['sort_by'])} aria-label="Urutkan tugas"><option value="created_at">Tanggal dibuat</option><option value="updated_at">Terakhir diubah</option><option value="due_date">Tenggat</option><option value="priority">Prioritas</option><option value="title">Judul</option></select></label><button className="button button-quiet sort-order" onClick={() => setOrder(v => v === 'asc' ? 'desc' : 'asc')} title="Balik urutan">{order === 'asc' ? '↑' : '↓'}</button></div></div>

          {loading ? <div className="loading-state"><span className="spinner"/> Memuat tugas...</div> :
          todos.length === 0 ? <div className="empty-state"><span className="empty-icon"><ListTodo size={26}/></span><h3>{search || status !== 'all' || priority ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas'}</h3><p>{search || status !== 'all' || priority ? 'Coba ubah pencarian atau filter yang dipilih.' : 'Mulai dari tugas kecil. Kamu bisa menambahkannya sekarang.'}</p>{!search && status === 'all' && !priority && <button className="button button-primary" onClick={openCreate}><Plus size={17}/> Buat tugas pertama</button>}</div> :
          <div className="task-list">{todos.map(todo => <article className={`task-row ${todo.is_completed ? 'task-done' : ''}`} key={todo.id}><button className={`task-check ${todo.is_completed ? 'checked' : ''}`} onClick={() => void toggleTodo(todo)} aria-label={todo.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}>{todo.is_completed && <Check size={15}/>}</button><div className="task-main"><div className="task-title-line"><h3>{todo.title}</h3><span className={`priority priority-${todo.priority}`}><span/> {priorityLabels[todo.priority]}</span></div>{todo.description && <p className="task-description">{todo.description}</p>}<div className="task-meta"><span><CalendarDays size={13}/>{formatDate(todo.due_date)}</span><span>Diubah {formatDate(todo.updated_at)}</span></div></div><div className="task-actions"><button className="icon-button" onClick={() => openEdit(todo)} aria-label={`Edit ${todo.title}`} title="Edit"><Pencil size={16}/></button><button className="icon-button danger-hover" onClick={() => setDeleteTarget(todo)} aria-label={`Hapus ${todo.title}`} title="Hapus"><Trash2 size={16}/></button></div></article>)}</div>}
          {!loading && totalPages > 1 && <div className="pagination"><span>Halaman {page} dari {totalPages}</span><div><button className="button button-quiet" disabled={page <= 1} onClick={() => setPage(p => Math.max(1,p-1))}>Sebelumnya</button><button className="button button-quiet" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages,p+1))}>Berikutnya</button></div></div>}
        </section>
        <footer className="dashboard-footer"><span>© {new Date().getFullYear()} Taskflow</span><span>Progress over perfection.</span></footer>
      </div>
    </section>

    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="todo-modal-title"><div className="modal-heading"><div><span className="eyebrow">{editing ? 'UPDATE TASK' : 'NEW TASK'}</span><h2 id="todo-modal-title">{editing ? 'Edit tugas' : 'Tambah tugas baru'}</h2></div><button className="icon-button" onClick={() => setModal(false)} aria-label="Tutup"><X size={19}/></button></div><form className="form-stack" onSubmit={submitTodo}>{notice && <div className="alert alert-error">{notice}</div>}<label className="field"><span>Judul tugas <b className="required">*</b></span><input autoFocus value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="Contoh: Selesaikan tugas matematika" required/></label><label className="field"><span>Deskripsi <small>(opsional)</small></span><textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={5000} rows={3} placeholder="Tambahkan detail tugas..."/></label><div className="form-two-col"><label className="field"><span>Prioritas</span><select value={formPriority} onChange={e => setFormPriority(e.target.value as Priority)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="field"><span>Tenggat <small>(opsional)</small></span><input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)}/></label></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setModal(false)}>Batal</button><button className="button button-primary" disabled={saving}>{saving ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Buat tugas'}</button></div></form></section></div>}

    {deleteTarget && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}><section className="modal modal-small" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span className="delete-icon"><Trash2 size={22}/></span><h2 id="delete-title">Hapus tugas ini?</h2><p>Tugas “{deleteTarget.title}” akan dihapus secara permanen.</p><div className="modal-actions"><button className="button button-quiet" onClick={() => setDeleteTarget(null)}>Batal</button><button className="button button-danger" onClick={() => void confirmDelete()}>Ya, hapus</button></div></section></div>}
  </main>;
}

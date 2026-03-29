import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FIRCard, { FIRItem } from '../components/FIRCard';
import VoiceInput from '../components/VoiceInput';
import { processFIR } from '../utils/aiProcessor';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import StatsCards from '../components/StatsCards';
import InsightsPanel from '../components/InsightsPanel';

interface FormState {
  name: string;
  relationType: 'Father' | 'Husband';
  relationName: string;
  mobile: string;
  description: string;
}

const emptyForm: FormState = {
  name: '',
  relationType: 'Father',
  relationName: '',
  mobile: '',
  description: '',
};

const sampleFIRs: FIRItem[] = [
  {
    id: 'seed-1',
    name: 'Anil Kumar',
    relationType: 'Father',
    relationName: 'Ramesh Kumar',
    mobile: '9876543210',
    description: 'Bike stolen near market',
    summary: 'Bike stolen near market',
    status: 'Pending',
    category: 'Theft',
    priority: 'High',
    date: new Date().toLocaleString(),
  },
  {
    id: 'seed-2',
    name: 'Priya Sharma',
    relationType: 'Father',
    relationName: 'Mahesh Sharma',
    mobile: '9123456780',
    description: 'Mobile snatching case in bus stop',
    summary: 'Mobile snatching near bus stop',
    status: 'Resolved',
    category: 'Theft',
    priority: 'Medium',
    date: new Date(Date.now() - 86400000).toLocaleString(),
  },
  {
    id: 'seed-3',
    name: 'Rahul Verma',
    relationType: 'Father',
    relationName: 'Suresh Verma',
    mobile: '9988776655',
    description: 'Street fight incident outside cinema hall',
    summary: 'Street fight outside cinema hall',
    status: 'Pending',
    category: 'Assault',
    priority: 'High',
    date: new Date(Date.now() - 2 * 86400000).toLocaleString(),
  },
  {
    id: 'seed-4',
    name: 'Neha Singh',
    relationType: 'Husband',
    relationName: 'Amit Singh',
    mobile: '9090909090',
    description: 'Wallet theft in crowded market',
    summary: 'Wallet theft in crowded market',
    status: 'Resolved',
    category: 'Theft',
    priority: 'Low',
    date: new Date(Date.now() - 3 * 86400000).toLocaleString(),
  },
  {
    id: 'seed-5',
    name: 'Kiran Rao',
    relationType: 'Father',
    relationName: 'Prakash Rao',
    mobile: '9876501234',
    description: 'Verbal assault complaint near park',
    summary: 'Verbal assault complaint near park',
    status: 'Pending',
    category: 'Assault',
    priority: 'Medium',
    date: new Date(Date.now() - 4 * 86400000).toLocaleString(),
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [firs, setFirs] = useState<FIRItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Resolved'>('All');
  const [officerName, setOfficerName] = useState<string>('');

  // Load session and FIRs
  useEffect(() => {
    const session = localStorage.getItem('firAuth');
    if (!session) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(session);
    setOfficerName(parsed.name || 'Officer');

    const saved = localStorage.getItem('firData');
    if (saved) {
      setFirs(JSON.parse(saved));
    } else {
      setFirs(sampleFIRs);
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('firData', JSON.stringify(firs));
  }, [firs]);

  const handleLogout = () => {
    localStorage.removeItem('firAuth');
    navigate('/login');
  };

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleVoice = (text: string) => {
    updateForm('description', text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.relationName || !form.mobile || !form.description) {
      alert('Please fill all required fields');
      return;
    }

    const processed = await processFIR(form.description);

    const newFir: FIRItem = {
      id: crypto.randomUUID(),
      name: form.name,
      relationType: form.relationType,
      relationName: form.relationName,
      mobile: form.mobile,
      description: processed.englishText,
      summary: processed.summary,
      status: 'Pending',
      category: processed.category,
      priority: processed.priority,
      date: new Date().toLocaleString(),
    };

    setFirs((prev) => [newFir, ...prev]);
    setForm(emptyForm);
  };

  const handleToggleStatus = (id: string) => {
    setFirs((prev) => prev.map((fir) => (fir.id === id ? { ...fir, status: fir.status === 'Pending' ? 'Resolved' : 'Pending' } : fir)));
  };

  const handleDelete = (id: string) => {
    setFirs((prev) => prev.filter((fir) => fir.id !== id));
  };

  const filtered = useMemo(() => {
    return firs.filter((fir) => {
      const matchesSearch = fir.summary.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : fir.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [firs, search, statusFilter]);

  const total = firs.length;
  const resolved = firs.filter((f) => f.status === 'Resolved').length;
  const pendingCount = firs.filter((f) => f.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      <Sidebar />

      <main className="flex-1 px-3 md:px-6 py-5 space-y-4">
        <Topbar officerName={officerName} language={language} onLanguageChange={setLanguage} onLogout={handleLogout} />

        <StatsCards total={total} resolved={resolved} pending={pendingCount} />

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-slate-200 p-4 space-y-4">
            <div>
              <div className="text-xl font-semibold text-slate-900">Greeting</div>
              <div className="text-sm text-slate-600">Serving the nation with integrity.</div>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Name *</label>
                  <input
                    className="w-full rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="Complainant name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Relation *</label>
                    <select
                      className="w-full rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      value={form.relationType}
                      onChange={(e) => updateForm('relationType', e.target.value as 'Father' | 'Husband')}
                    >
                      <option value="Father">Father</option>
                      <option value="Husband">Husband</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Relation Name *</label>
                    <input
                      className="w-full rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      value={form.relationName}
                      onChange={(e) => updateForm('relationName', e.target.value)}
                      placeholder="Father/Husband name"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Mobile *</label>
                  <input
                    className="w-full rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.mobile}
                    onChange={(e) => updateForm('mobile', e.target.value)}
                    placeholder="10-digit mobile"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Description *</label>
                  <textarea
                    className="w-full rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Enter complaint details"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <VoiceInput onTranscript={handleVoice} language={language} />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  Save FIR
                </button>
              </div>
            </form>
          </div>

          <InsightsPanel firs={firs} />
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex gap-2 items-center">
              <input
                className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Search summary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Pending' | 'Resolved')}
              >
                <option>All</option>
                <option>Pending</option>
                <option>Resolved</option>
              </select>
            </div>
            <div className="text-sm text-slate-500">FIR stored in English · Displayed in English</div>
          </div>

          <div className="grid gap-3">
            {filtered.length === 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center text-slate-500">
                No FIRs yet. Add one to get started.
              </div>
            )}
            {filtered.map((fir) => (
              <div key={fir.id} className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
                <FIRCard
                  fir={fir}
                  language={language}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

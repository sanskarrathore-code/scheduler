import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, BookOpen, GraduationCap } from 'lucide-react';
import './App.css';

interface Assignment {
  id: number;
  name: string;
  deadline: string;
  timeLeft: string;
  completion: number;
}

interface Topic {
  name: string;
  weightage: number;
  done: boolean;
}

interface Exam {
  id: number;
  subject: string;
  date: string;
  timeLeft: string;
  readiness: number;
  topics: Topic[];
}

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [newAssign, setNewAssign] = useState({ name: '', date: '', h: '23', m: '59', completion: '0' });
  const [newExam, setNewExam] = useState({ subject: '', date: '', h: '9', m: '0' });

  const fetchData = async () => {
    try {
      const [aRes, eRes] = await Promise.all([
        fetch(`${API_BASE}/assignments`),
        fetch(`${API_BASE}/exams`)
      ]);
      const aData = await aRes.json();
      const eData = await eRes.json();
      setAssignments(aData.assignments || []);
      setExams(eData.exams || []);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssign)
    });
    setShowAssignModal(false);
    fetchData();
  };

  const deleteAssignment = async (id: number) => {
    await fetch(`${API_BASE}/assignments/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const updateCompletion = async (id: number, val: number) => {
    await fetch(`${API_BASE}/assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completion: val })
    });
    fetchData();
  };

  const addExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExam)
    });
    setShowExamModal(false);
    fetchData();
  };

  const deleteExam = async (id: number) => {
    await fetch(`${API_BASE}/exams/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleTopic = async (eid: number, tidx: number) => {
    await fetch(`${API_BASE}/exams/${eid}/topics/${tidx}/toggle`, { method: 'PATCH' });
    fetchData();
  };

  const addTopic = async (eid: number) => {
    const name = prompt('Topic name?');
    const weight = prompt('Weightage (1-10)?', '5');
    if (!name || !weight) return;
    await fetch(`${API_BASE}/exams/${eid}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, weightage: parseInt(weight) })
    });
    fetchData();
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <header>
        <div>
          <h1>Student Scheduler</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track your academic progress</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setShowAssignModal(true)}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Assignment
          </button>
          <button className="btn btn-primary" onClick={() => setShowExamModal(true)}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Exam
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Assignments Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <BookOpen size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline' }} />
              Assignments
            </h2>
            <span className="badge badge-warning">{assignments.length} Total</span>
          </div>
          {assignments.length === 0 ? <p className="item-meta">No assignments yet.</p> : (
            assignments.map(a => (
              <div key={a.id} className="list-item">
                <div className="item-main">
                  <div>
                    <div className="item-name">{a.name}</div>
                    <div className="item-meta">
                      <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Due {a.deadline} • <span style={{ color: a.timeLeft.includes('Overdue') ? 'var(--danger)' : 'inherit' }}>{a.timeLeft}</span>
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => deleteAssignment(a.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="progress-container" style={{ flex: 1 }}>
                    <div className="progress-bar" style={{ width: `${a.completion}%` }}></div>
                  </div>
                  <span className="item-meta" style={{ minWidth: '3rem', textAlign: 'right' }}>
                    <input 
                      type="number" 
                      value={a.completion} 
                      onChange={(e) => updateCompletion(a.id, parseInt(e.target.value))}
                      style={{ width: '3rem', border: 'none', background: 'transparent', textAlign: 'right', fontWeight: 600 }}
                    />%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Exams Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <GraduationCap size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline' }} />
              Exams
            </h2>
            <span className="badge badge-success">{exams.length} Total</span>
          </div>
          {exams.length === 0 ? <p className="item-meta">No exams scheduled.</p> : (
            exams.map(e => (
              <div key={e.id} className="list-item">
                <div className="item-main">
                  <div>
                    <div className="item-name">{e.subject}</div>
                    <div className="item-meta">
                      <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Date {e.date} • {e.timeLeft}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => addTopic(e.id)}>
                      <Plus size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => deleteExam(e.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <span className="item-meta" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Readiness: {e.readiness}%</span>
                  <div className="progress-container" style={{ flex: 1, background: '#eee' }}>
                    <div className="progress-bar" style={{ width: `${e.readiness}%`, background: 'var(--success)' }}></div>
                  </div>
                </div>

                <div className="topic-list">
                  {e.topics.map((t, idx) => (
                    <div key={idx} className="topic-item" onClick={() => toggleTopic(e.id, idx)} style={{ cursor: 'pointer' }}>
                      {t.done ? <CheckCircle2 size={14} color="var(--success)" /> : <Circle size={14} color="var(--text-muted)" />}
                      <span style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-muted)' : 'inherit' }}>
                        {t.name} (w:{t.weightage})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Assignment Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Add Assignment</h3>
            <form onSubmit={addAssignment}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" required value={newAssign.name} onChange={e => setNewAssign({...newAssign, name: e.target.value})} placeholder="Math Problem Set" />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline Date</label>
                <input className="form-input" type="date" required value={newAssign.date} onChange={e => setNewAssign({...newAssign, date: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {showExamModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Add Exam</h3>
            <form onSubmit={addExam}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input" required value={newExam.subject} onChange={e => setNewExam({...newExam, subject: e.target.value})} placeholder="Physics" />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" required value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowExamModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

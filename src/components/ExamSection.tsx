import { useState, useMemo } from 'react'
import { getRemainingTime, sortExamTopics, getReadiness } from '../schedulerLogic'
import type { Exam, Topic } from '../types'

interface Props {
  exams: Exam[]
  now: number
  onAdd: (exam: Exam) => void
  onRemoveExam: (id: string) => void
  onAddTopic: (examId: string, topic: Topic) => void
  onRemoveTopic: (examId: string, topicName: string) => void
  onToggleTopic: (examId: string, topicName: string) => void
}

function ExamSection({ exams, now, onAdd, onRemoveExam, onAddTopic, onRemoveTopic, onToggleTopic }: Props) {
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')
  const [hour, setHour] = useState('09')
  const [minute, setMinute] = useState('00')

  const sorted = useMemo(
    () => exams.map(e => ({ ...e, topics: sortExamTopics(e.topics) })),
    [exams],
  )

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = subject.trim()
    if (!trimmed || !date) return

    onAdd({
      id: crypto.randomUUID(),
      subject: trimmed,
      date: new Date(`${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`).toISOString(),
      topics: [],
    })

    setSubject('')
    setDate('')
    setHour('09')
    setMinute('00')
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const urgencyColor = (ms: number) => {
    if (ms <= 0) return 'text-red-600'
    if (ms < 86_400_000) return 'text-orange-500'
    if (ms < 3 * 86_400_000) return 'text-amber-500'
    return 'text-stone-400'
  }

  const readinessColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-600'
    if (pct >= 50) return 'text-amber-600'
    return 'text-red-500'
  }

  const readinessBarColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500'
    if (pct >= 50) return 'bg-amber-400'
    return 'bg-red-400'
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-emerald-600 tracking-tight">Exams</h2>

      <form onSubmit={handleAddExam} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Exam subject"
          required
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="flex-1 bg-white text-stone-800 border border-stone-200 rounded-lg px-3 py-2 text-sm
                     placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                     shadow-sm"
        />
        <input
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-white text-stone-800 border border-stone-200 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                     shadow-sm"
        />
        <div className="flex items-center gap-1">
          <select
            value={hour}
            onChange={e => setHour(e.target.value)}
            className="bg-white text-stone-800 border border-stone-200 rounded-lg px-2 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                       shadow-sm cursor-pointer"
          >
            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span className="text-stone-400 font-bold">:</span>
          <select
            value={minute}
            onChange={e => setMinute(e.target.value)}
            className="bg-white text-stone-800 border border-stone-200 rounded-lg px-2 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                       shadow-sm cursor-pointer"
          >
            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium
                     rounded-lg px-5 py-2 transition-colors cursor-pointer shadow-sm"
        >
          Add
        </button>
      </form>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-sm text-stone-400 italic">No exams yet. Add one above.</p>
        )}

        {sorted.map(exam => {
          const remaining = getRemainingTime(exam.date, now)
          const readiness = getReadiness(exam.topics)

          return (
            <div key={exam.id} className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-stone-800">{exam.subject}</h3>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs text-stone-400">{fmtDate(exam.date)}</span>
                  <button
                    onClick={() => onRemoveExam(exam.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors cursor-pointer text-lg leading-none"
                    title="Remove exam"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <p className={`text-xs mb-4 font-medium ${urgencyColor(remaining.ms)}`}>{remaining.label}</p>

              {/* Readiness score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-stone-500">Readiness</span>
                  <span className={`text-xs font-bold ${readinessColor(readiness)}`}>
                    {readiness}% complete
                  </span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${readinessBarColor(readiness)}`}
                    style={{ width: `${readiness}%` }}
                  />
                </div>
              </div>

              {/* Topics list */}
              {exam.topics.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {exam.topics.map(topic => (
                    <li
                      key={topic.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <button
                        onClick={() => onToggleTopic(exam.id, topic.name)}
                        className="flex items-center gap-2.5 hover:text-stone-900 transition-colors cursor-pointer"
                      >
                        <span
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] transition-colors ${
                            topic.status === 'Completed'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-stone-300'
                          }`}
                        >
                          {topic.status === 'Completed' && '✓'}
                        </span>
                        <span className={topic.status === 'Completed' ? 'line-through text-stone-400' : 'text-stone-700'}>
                          {topic.name}
                        </span>
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 font-medium">{topic.weightage}/10</span>
                        <button
                          onClick={() => onRemoveTopic(exam.id, topic.name)}
                          className="text-stone-300 hover:text-red-500 transition-colors cursor-pointer text-sm leading-none"
                          title="Remove topic"
                        >
                          &times;
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <AddTopicForm onAdd={topic => onAddTopic(exam.id, topic)} />
            </div>
          )
        })}
      </div>
    </section>
  )
}

function AddTopicForm({ onAdd }: { onAdd: (t: Topic) => void }) {
  const [name, setName] = useState('')
  const [weightage, setWeightage] = useState(5)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
      >
        + Add topic
      </button>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    onAdd({ name: trimmed, weightage, status: 'Pending' })
    setName('')
    setWeightage(5)
    setOpen(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-3 border-t border-stone-100">
      <input
        type="text"
        placeholder="Topic name"
        required
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
        className="bg-stone-50 text-stone-800 border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm
                   placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
      />
      <div className="flex items-center gap-2">
        <label className="text-xs text-stone-500 shrink-0 font-medium">Weightage</label>
        <input
          type="range"
          min={1}
          max={10}
          value={weightage}
          onChange={e => setWeightage(Number(e.target.value))}
          className="flex-1 accent-emerald-500"
        />
        <span className="text-xs w-5 text-right font-semibold text-stone-600">{weightage}</span>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg px-3 py-1.5
                     transition-colors cursor-pointer shadow-sm"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ExamSection

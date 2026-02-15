import { useState, useMemo } from 'react'
import { getRemainingTime, sortAssignments } from '../schedulerLogic'
import type { Assignment } from '../types'

interface Props {
  assignments: Assignment[]
  now: number
  onAdd: (a: Assignment) => void
  onRemove: (id: string) => void
  onUpdateCompletion: (id: string, val: number) => void
}

function AssignmentTracker({ assignments, now, onAdd, onRemove, onUpdateCompletion }: Props) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [hour, setHour] = useState('23')
  const [minute, setMinute] = useState('59')

  const sorted = useMemo(() => sortAssignments(assignments, now), [assignments, now])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !date) return

    onAdd({
      id: crypto.randomUUID(),
      name: trimmed,
      deadline: new Date(`${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`).toISOString(),
      completion: 0,
    })

    setName('')
    setDate('')
    setHour('23')
    setMinute('59')
  }

  const urgencyColor = (ms: number) => {
    if (ms <= 0) return 'text-red-600'
    if (ms < 86_400_000) return 'text-orange-500'
    if (ms < 3 * 86_400_000) return 'text-amber-500'
    return 'text-stone-400'
  }

  const barColor = (pct: number) => {
    if (pct >= 75) return 'bg-emerald-500'
    if (pct >= 40) return 'bg-amber-400'
    return 'bg-indigo-500'
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-indigo-600 tracking-tight">Assignments</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Assignment name"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 bg-white text-stone-800 border border-stone-200 rounded-lg px-3 py-2 text-sm
                     placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                     shadow-sm"
        />
        <input
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-white text-stone-800 border border-stone-200 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                     shadow-sm"
        />
        <div className="flex items-center gap-1">
          <select
            value={hour}
            onChange={e => setHour(e.target.value)}
            className="bg-white text-stone-800 border border-stone-200 rounded-lg px-2 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
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
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                       shadow-sm cursor-pointer"
          >
            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium
                     rounded-lg px-5 py-2 transition-colors cursor-pointer shadow-sm"
        >
          Add
        </button>
      </form>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-sm text-stone-400 italic">No assignments yet. Add one above.</p>
        )}

        {sorted.map((a, idx) => {
          const remaining = getRemainingTime(a.deadline, now)
          const isTop = idx === 0

          return (
            <div
              key={a.id}
              className={`bg-white rounded-xl p-5 border transition-all shadow-sm hover:shadow-md ${
                isTop ? 'border-red-300 ring-1 ring-red-200' : 'border-stone-200'
              }`}
            >
              {isTop && (
                <span className="inline-block text-[10px] uppercase tracking-widest text-red-500 font-semibold mb-1">
                  Most urgent
                </span>
              )}

              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-stone-800">{a.name}</h3>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs text-stone-400">Due {fmtDate(a.deadline)}</span>
                  <button
                    onClick={() => onRemove(a.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors cursor-pointer text-lg leading-none"
                    title="Remove assignment"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <p className={`text-xs font-medium ${urgencyColor(remaining.ms)}`}>{remaining.label}</p>

              <hr className="my-3 border-stone-100" />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-stone-500">Progress</span>
                  <span className="text-xs font-semibold text-stone-600">{a.completion}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor(a.completion)}`}
                    style={{ width: `${a.completion}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={a.completion}
                  onChange={e => onUpdateCompletion(a.id, Number(e.target.value))}
                  className="w-full mt-1.5 accent-indigo-500"
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default AssignmentTracker

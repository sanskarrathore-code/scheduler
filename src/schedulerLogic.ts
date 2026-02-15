import type { Assignment, Topic } from './types'

export interface RemainingTime {
  label: string
  ms: number
}

export function getRemainingTime(deadline: string, now: number = Date.now()): RemainingTime {
  const ms = new Date(deadline).getTime() - now

  if (ms <= 0) return { label: 'Overdue', ms }

  const days = Math.floor(ms / 86_400_000)
  const hrs = Math.floor((ms % 86_400_000) / 3_600_000)
  const mins = Math.floor((ms % 3_600_000) / 60_000)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hrs > 0) parts.push(`${hrs}h`)
  if (days === 0 && mins > 0) parts.push(`${mins}m`)

  return { label: `${parts.join(' ')} left`, ms }
}

export function sortAssignments(assignments: Assignment[], now: number = Date.now()): Assignment[] {
  return [...assignments].sort((a, b) => {
    const msA = new Date(a.deadline).getTime() - now
    const msB = new Date(b.deadline).getTime() - now
    return msA - msB
  })
}

export function sortExamTopics(topics: Topic[]): Topic[] {
  return [...topics].sort((a, b) => b.weightage - a.weightage)
}

export function getReadiness(topics: Topic[]): number {
  const total = topics.reduce((sum, t) => sum + t.weightage, 0)
  if (total === 0) return 0
  const done = topics
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.weightage, 0)
  return Math.round((done / total) * 100)
}

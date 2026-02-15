import type { Assignment, Exam } from './types'

export const seedAssignments: Assignment[] = [
  {
    id: 'a1',
    name: 'Math Problem Set 4',
    deadline: '2026-03-01T23:59:00.000Z',
    completion: 40,
  },
  {
    id: 'a2',
    name: 'Physics Lab Report',
    deadline: '2026-02-25T23:59:00.000Z',
    completion: 75,
  },
  {
    id: 'a3',
    name: 'History Essay',
    deadline: '2026-03-10T23:59:00.000Z',
    completion: 0,
  },
]

export const seedExams: Exam[] = [
  {
    id: 'e1',
    subject: 'Mathematics',
    date: '2026-03-15T09:00:00.000Z',
    topics: [
      { name: 'Linear Algebra', weightage: 8, status: 'Pending' },
      { name: 'Calculus II', weightage: 9, status: 'Pending' },
      { name: 'Probability', weightage: 6, status: 'Completed' },
    ],
  },
  {
    id: 'e2',
    subject: 'Physics',
    date: '2026-03-18T09:00:00.000Z',
    topics: [
      { name: 'Thermodynamics', weightage: 7, status: 'Pending' },
      { name: 'Electromagnetism', weightage: 10, status: 'Pending' },
      { name: 'Optics', weightage: 5, status: 'Completed' },
    ],
  },
]

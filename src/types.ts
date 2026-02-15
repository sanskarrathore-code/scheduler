export type TopicStatus = 'Completed' | 'Pending'

export interface Topic {
  name: string
  weightage: number // 1-10
  status: TopicStatus
}

export interface Assignment {
  id: string
  name: string
  deadline: string // ISO string
  completion: number // 0-100
}

export interface Exam {
  id: string
  subject: string
  date: string // ISO string
  topics: Topic[]
}

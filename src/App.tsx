import { useLocalStorage } from './hooks/useLocalStorage'
import { useTick } from './hooks/useTick'
import { seedAssignments, seedExams } from './seedData'
import AssignmentTracker from './components/AssignmentTracker'
import ExamSection from './components/ExamSection'
import type { Assignment, Exam, Topic } from './types'

function App() {
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>('scheduler-assignments', seedAssignments)
  const [exams, setExams] = useLocalStorage<Exam[]>('scheduler-exams', seedExams)
  const now = useTick(60_000)

  const addAssignment = (a: Assignment) => {
    setAssignments(prev => [...prev, a])
  }

  const updateCompletion = (id: string, val: number) => {
    setAssignments(prev =>
      prev.map(a => (a.id === id ? { ...a, completion: val } : a))
    )
  }

  const removeAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id))
  }

  const addExam = (exam: Exam) => {
    setExams(prev => [...prev, exam])
  }

  const removeExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id))
  }

  const addTopic = (examId: string, topic: Topic) => {
    setExams(prev =>
      prev.map(e =>
        e.id === examId ? { ...e, topics: [...e.topics, topic] } : e
      )
    )
  }

  const removeTopic = (examId: string, topicName: string) => {
    setExams(prev =>
      prev.map(e =>
        e.id === examId ? { ...e, topics: e.topics.filter(t => t.name !== topicName) } : e
      )
    )
  }

  const toggleTopic = (examId: string, topicName: string) => {
    setExams(prev =>
      prev.map(exam =>
        exam.id === examId
          ? {
              ...exam,
              topics: exam.topics.map(t =>
                t.name === topicName
                  ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
                  : t
              ),
            }
          : exam
      )
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 p-6 md:p-12 lg:p-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Student Scheduler</h1>
        <p className="text-sm text-stone-400 mt-1">Stay on top of your deadlines and exams</p>
      </header>

      <div className="grid md:grid-cols-2 gap-10">
        <AssignmentTracker
          assignments={assignments}
          now={now}
          onAdd={addAssignment}
          onRemove={removeAssignment}
          onUpdateCompletion={updateCompletion}
        />

        <ExamSection
          exams={exams}
          now={now}
          onAdd={addExam}
          onRemoveExam={removeExam}
          onAddTopic={addTopic}
          onRemoveTopic={removeTopic}
          onToggleTopic={toggleTopic}
        />
      </div>
    </div>
  )
}

export default App

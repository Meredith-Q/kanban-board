import { useState, useMemo, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  TouchSensor
} from '@dnd-kit/core'
import { useAuth } from './useAuth'
import { useTasks } from './useTasks'
import Column from './Column'
import NewTaskModal from './NewTaskModal'
import TaskDetailModal from './TaskDetailModal'

const COLUMNS = [
  { id: 'todo',        title: 'To Do',       color: '#a0aec0' },
  { id: 'in_progress', title: 'In Progress',  color: '#4299e1' },
  { id: 'in_review',   title: 'In Review',    color: '#ed8936' },
  { id: 'done',        title: 'Done',         color: '#48bb78' },
]

// 检测是否是移动端
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function App() {
  const { user, loading: authLoading } = useAuth()
  const { tasks, loading: tasksLoading, createTask, updateTaskStatus, deleteTask, updateTask } = useTasks(user?.id)
  const [showModal, setShowModal]           = useState(false)
  const [selectedTask, setSelectedTask]     = useState(null)
  const [activeTask, setActiveTask]         = useState(null)
  const [search, setSearch]                 = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [activeColumn, setActiveColumn]     = useState('todo')
  const isMobile                            = useIsMobile()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch   = task.title.toLowerCase().includes(search.toLowerCase())
      const matchPriority = filterPriority === 'all' || task.priority === filterPriority
      return matchSearch && matchPriority
    })
  }, [tasks, search, filterPriority])

  function handleDragStart(event) {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return
    const overColumn = COLUMNS.find(col => col.id === over.id)
    const overTask   = tasks.find(t => t.id === over.id)
    let newStatus = null
    if (overColumn)    newStatus = overColumn.id
    else if (overTask) newStatus = overTask.status
    if (newStatus && active.id !== over.id) {
      updateTaskStatus(active.id, newStatus)
    }
  }

  if (authLoading || tasksLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888'
      }}>
        Loading...
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totalTasks   = tasks.length
  const doneTasks    = tasks.filter(t => t.status === 'done').length
  const overdueTasks = tasks.filter(t =>
    t.due_date && new Date(t.due_date) < today && t.status !== 'done'
  ).length

  const priorityButtons = [
    { value: 'all',    label: 'All' },
    { value: 'high',   label: 'High' },
    { value: 'normal', label: 'Normal' },
    { value: 'low',    label: 'Low' },
  ]

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ minHeight: '100vh', padding: isMobile ? '16px' : '24px' }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '12px'
        }}>
          <h1 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700' }}>
            My Board
          </h1>
          <span style={{ color: '#aaa', fontSize: '13px' }}>
            {tasks.length} tasks
          </span>
          <button
            onClick={() => setShowModal(true)}
            style={{
              marginLeft: 'auto',
              padding: isMobile ? '8px 12px' : '8px 16px',
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {isMobile ? '+ New' : '+ New Task'}
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {[
            { num: totalTasks,   label: 'Total',     color: '#1a1a1a' },
            { num: doneTasks,    label: 'Completed', color: '#48bb78' },
            { num: overdueTasks, label: 'Overdue',   color: '#e53e3e' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: isMobile ? '10px 12px' : '14px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <div style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: stat.color }}>
                {stat.num}
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
              marginBottom: '8px',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {priorityButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilterPriority(btn.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: filterPriority === btn.value ? '#1a1a1a' : '#e2e8f0',
                  background:  filterPriority === btn.value ? '#1a1a1a' : '#fff',
                  color:       filterPriority === btn.value ? '#fff'    : '#555',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: filterPriority === btn.value ? '500' : '400'
                }}
              >
                {btn.label}
              </button>
            ))}
            {(search || filterPriority !== 'all') && (
              <button
                onClick={() => { setSearch(''); setFilterPriority('all') }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: '#aaa',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {(search || filterPriority !== 'all') && (
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          )}
        </div>

        {isMobile && (
          <div style={{
            display: 'flex',
            gap: '0',
            marginBottom: '12px',
            background: '#f0f0f0',
            borderRadius: '10px',
            padding: '3px',
            overflowX: 'auto'
          }}>
            {COLUMNS.map(col => {
              const count = filteredTasks.filter(t => t.status === col.id).length
              return (
                <button
                  key={col.id}
                  onClick={() => setActiveColumn(col.id)}
                  style={{
                    flex: 1,
                    padding: '7px 4px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeColumn === col.id ? '#fff' : 'transparent',
                    color: activeColumn === col.id ? '#1a1a1a' : '#888',
                    fontSize: '12px',
                    fontWeight: activeColumn === col.id ? '600' : '400',
                    cursor: 'pointer',
                    boxShadow: activeColumn === col.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {col.title}
                  {count > 0 && (
                    <span style={{
                      marginLeft: '4px',
                      background: activeColumn === col.id ? col.color : '#ccc',
                      color: '#fff',
                      borderRadius: '999px',
                      padding: '0 5px',
                      fontSize: '10px'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {isMobile ? (
          <Column
            title={COLUMNS.find(c => c.id === activeColumn).title}
            color={COLUMNS.find(c => c.id === activeColumn).color}
            tasks={filteredTasks.filter(t => t.status === activeColumn)}
            onOpenTask={setSelectedTask}
          />
        ) : (
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            overflowX: 'auto',
            paddingBottom: '24px'
          }}>
            {COLUMNS.map(col => (
              <Column
                key={col.id}
                title={col.title}
                color={col.color}
                tasks={filteredTasks.filter(t => t.status === col.id)}
                onOpenTask={setSelectedTask}
              />
            ))}
          </div>
        )}

      </div>

      <DragOverlay>
        {activeTask && (
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            opacity: 0.95,
            width: '260px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              {activeTask.title}
            </div>
            {activeTask.description && (
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                {activeTask.description}
              </div>
            )}
          </div>
        )}
      </DragOverlay>

      {showModal && (
        <NewTaskModal
          onClose={() => setShowModal(false)}
          onCreate={createTask}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onDelete={(id) => { deleteTask(id); setSelectedTask(null) }}
          onUpdate={async (id, updates) => {
            await updateTask(id, updates)
            setSelectedTask(prev => ({ ...prev, ...updates }))
          }}
        />
      )}

    </DndContext>
  )
}

export default App
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function getDueDateStatus(dueDateStr) {
  if (!dueDateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr)
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0)   return { label: 'Overdue',             color: '#e53e3e', bg: '#fff0f0' }
  if (diffDays === 0) return { label: 'Due today',            color: '#dd6b20', bg: '#fff8f0' }
  if (diffDays <= 2)  return { label: `Due in ${diffDays}d`,  color: '#d69e2e', bg: '#fffff0' }
  return {
    label: new Date(dueDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    color: '#888',
    bg: '#f5f5f5'
  }
}

function TaskCard({ task, onOpen }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const dueDateStatus = getDueDateStatus(task.due_date)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
    >
      <div style={{
        background: '#fafafa',
        border: '1px solid #ebebeb',
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        userSelect: 'none'
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
          {task.title}
        </div>
        {task.description && (
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
            {task.description}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '999px',
            background: task.priority === 'high' ? '#fff0f0' :
                        task.priority === 'low'  ? '#f0f7ff' : '#f5f5f5',
            color: task.priority === 'high' ? '#e53e3e' :
                   task.priority === 'low'  ? '#3182ce' : '#888'
          }}>
            {task.priority === 'high' ? 'High' :
             task.priority === 'low'  ? 'Low'  : 'Normal'}
          </span>
          {dueDateStatus && (
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: dueDateStatus.bg,
              color: dueDateStatus.color,
              fontWeight: dueDateStatus.label === 'Overdue' ? '600' : '400',
              marginLeft: 'auto'
            }}>
              {dueDateStatus.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Column({ title, tasks, color, onOpenTask }) {
  const columnId = title === 'To Do' ? 'todo' :
    title === 'In Progress' ? 'in_progress' :
    title === 'In Review'   ? 'in_review'   : 'done'

  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  return (
    <div style={{
      background: isOver ? '#f0f7ff' : '#ffffff',
      borderRadius: '12px',
      padding: '16px',
      minWidth: '260px',
      flex: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      transition: 'background 0.15s'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: color
        }} />
        <span style={{ fontWeight: '600', fontSize: '14px' }}>{title}</span>
        <span style={{
          marginLeft: 'auto',
          background: '#f0f0f0',
          borderRadius: '999px',
          padding: '1px 8px',
          fontSize: '12px',
          color: '#888'
        }}>
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minHeight: '80px'
      }}>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
        ))}
        {tasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '32px 0',
            color: '#ccc',
            fontSize: '13px'
          }}>
            No tasks yet
          </div>
        )}
      </div>
    </div>
  )
}

export default Column
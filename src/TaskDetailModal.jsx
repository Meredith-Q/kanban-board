import { useState } from 'react'

const STATUSES = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review',   label: 'In Review' },
  { value: 'done',        label: 'Done' },
]

function getDueDateStatus(dueDateStr) {
  if (!dueDateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr)
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0)   return { label: 'Overdue',          color: '#e53e3e' }
  if (diffDays === 0) return { label: 'Due today',         color: '#dd6b20' }
  if (diffDays <= 2)  return { label: `Due in ${diffDays}d`, color: '#d69e2e' }
  return null
}

function TaskDetailModal({ task, onClose, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority)
  const [status, setStatus] = useState(task.status)
  const [dueDate, setDueDate] = useState(task.due_date || '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const dueDateStatus = getDueDateStatus(task.due_date)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    await onUpdate(task.id, { title, description, priority, status, due_date: dueDate || null })
    setSaving(false)
    setIsEditing(false)
  }

  function handleCancelEdit() {
    setTitle(task.title)
    setDescription(task.description || '')
    setPriority(task.priority)
    setStatus(task.status)
    setDueDate(task.due_date || '')
    setIsEditing(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#fafafa'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#888',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  }

  const fieldStyle = {
    marginBottom: '16px'
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          height: '4px',
          background: priority === 'high' ? '#e53e3e' :
                      priority === 'low'  ? '#3182ce' : '#a0aec0'
        }} />

        <div style={{ padding: '24px' }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input
                  style={{ ...inputStyle, fontSize: '18px', fontWeight: '600' }}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                />
              ) : (
                <h2 style={{ fontSize: '18px', fontWeight: '700', lineHeight: 1.3 }}>
                  {task.title}
                </h2>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#aaa',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '2px 6px',
                borderRadius: '6px'
              }}
            >
              ✕
            </button>
          </div>

          {!isEditing && (
            <>
              <div style={fieldStyle}>
                <label style={labelStyle}>Description</label>
                <p style={{
                  fontSize: '14px',
                  color: task.description ? '#333' : '#bbb',
                  lineHeight: 1.6
                }}>
                  {task.description || 'No description'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Priority</label>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '13px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: priority === 'high' ? '#fff0f0' :
                                priority === 'low'  ? '#f0f7ff' : '#f5f5f5',
                    color: priority === 'high' ? '#e53e3e' :
                           priority === 'low'  ? '#3182ce' : '#888'
                  }}>
                    {priority === 'high' ? 'High' : priority === 'low' ? 'Low' : 'Normal'}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Status</label>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '13px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: '#f0f0f0',
                    color: '#555'
                  }}>
                    {STATUSES.find(s => s.value === task.status)?.label}
                  </span>
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Due Date</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#555' }}>
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'No due date'}
                  </span>
                  {dueDateStatus && (
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: dueDateStatus.color + '18',
                      color: dueDateStatus.color,
                      fontWeight: '600'
                    }}>
                      {dueDateStatus.label}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#bbb', marginBottom: '20px' }}>
                Created {new Date(task.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
            </>
          )}

          {isEditing && (
            <>
              <div style={fieldStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add more details..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Priority</label>
                  <select style={inputStyle} value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value)}>
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Due Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {!isEditing && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #fed7d7',
                  background: '#fff5f5',
                  color: '#e53e3e',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            )}

            {confirmDelete && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#e53e3e' }}>Are you sure?</span>
                <button
                  onClick={() => { onDelete(task.id); onClose() }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#e53e3e',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!title.trim() || saving}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: title.trim() ? '#1a1a1a' : '#e2e8f0',
                      color: title.trim() ? '#fff' : '#aaa',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: title.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailModal
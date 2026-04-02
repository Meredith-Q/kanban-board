import { useState } from 'react'

function NewTaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!title.trim()) return
    setSubmitting(true)
    await onCreate({ title, description, priority, due_date: dueDate })
    setSubmitting(false)
    onClose()
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
    fontSize: '13px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '6px'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}
      onClick={onClose}
    >
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '28px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
          New Task
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle}
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
            placeholder="Add more details..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Priority</label>
            <select
              style={inputStyle}
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Due Date</label>
            <input
              type="date"
              style={inputStyle}
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: title.trim() ? '#1a1a1a' : '#e2e8f0',
              color: title.trim() ? '#fff' : '#aaa',
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewTaskModal
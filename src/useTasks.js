import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useTasks(userId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error) setTasks(data)
      setLoading(false)
    }

    fetchTasks()
  }, [userId])

  async function createTask({ title, description, priority, due_date }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        priority,
        due_date: due_date || null,
        status: 'todo',
        user_id: userId
      })
      .select()
      .single()

    if (!error) setTasks(prev => [...prev, data])
  }

  async function updateTaskStatus(taskId, newStatus) {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    )

    await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
  }

  async function deleteTask(taskId) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  async function updateTask(taskId, updates) {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, ...updates } : t)
    )
    await supabase.from('tasks').update(updates).eq('id', taskId)
  }

  return { tasks, loading, createTask, updateTaskStatus, deleteTask, updateTask }

}
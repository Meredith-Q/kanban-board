import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      } else {        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (!error) setUser(data.user)
          setLoading(false)
        })
      }
    })
  }, [])

  return { user, loading }
}
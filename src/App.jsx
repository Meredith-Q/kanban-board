import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function App() {
  const [status, setStatus] = useState('连接中...')
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // 测试1：尝试匿名登录
        const { data, error } = await supabase.auth.signInAnonymously()

        if (error) {
          setStatus('❌ 连接失败：' + error.message)
          return
        }

        setUser(data.user)
        setStatus('✅ 连接成功！')

      } catch (e) {
        setStatus('❌ 出错了：' + e.message)
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2>Supabase 连接测试</h2>
      <p style={{ fontSize: '18px' }}>{status}</p>
      {user && (
        <div style={{ marginTop: '16px', color: '#666' }}>
          <p>用户 ID：{user.id}</p>
          <p>登录方式：{user.app_metadata?.provider}</p>
        </div>
      )}
    </div>
  )
}

export default App
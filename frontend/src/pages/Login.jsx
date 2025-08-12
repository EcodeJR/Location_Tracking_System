import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await login(email, password)
      nav('/dashboard')
    } catch (e) {
      setErr('Invalid credentials');
      console.log(e);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
      {err && <p className="text-red-600 mt-2">{err}</p>}
      <p className="mt-4 text-sm">No account? <Link className="text-blue-700" to="/register">Register</Link></p>
    </div>
  )
}
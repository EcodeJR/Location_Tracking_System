import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await register({ name, email, password })
      nav('/dashboard')
    } catch (e) {
      setErr('Registration failed');
      console.log(e);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
      </form>
      {err && <p className="text-red-600 mt-2">{err}</p>}
      <p className="mt-4 text-sm">Already have an account? <Link className="text-blue-700" to="/login">Login</Link></p>
    </div>
  )
}
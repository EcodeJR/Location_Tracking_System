import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">LastSeen</Link>
        <nav className="flex items-center gap-4">
          {user && (
            <>
              <NavLink to="/dashboard" className={({isActive}) => isActive ? 'font-semibold' : ''}>Dashboard</NavLink>
              <NavLink to="/recognize" className={({isActive}) => isActive ? 'font-semibold' : ''}>Recognize</NavLink>
            </>
          )}
          {!user ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          ) : (
            <button onClick={logout} className="px-3 py-1 rounded bg-gray-900 text-white">Logout</button>
          )}
        </nav>
      </div>
    </header>
  )
}
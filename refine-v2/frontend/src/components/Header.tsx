import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MusicPlayer from './MusicPlayer';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/refine-nobg.png" alt="refine" className="h-7 w-7" />
          <span className="text-lg font-semibold text-gray-900">refine</span>
        </Link>

        <MusicPlayer />

        <nav className="flex items-center gap-4 shrink-0 ml-auto">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Play
          </Link>
          {user ? (
            <>
              <Link to="/leaderboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Leaderboard
              </Link>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link to="/settings" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                {user.username}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

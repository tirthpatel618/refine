import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">{user?.email}</p>

      <div className="space-y-8">
        <ChangeUsernameForm currentUsername={user?.username ?? ''} />
        <hr className="border-gray-200" />
        <ChangePasswordForm />
        <hr className="border-gray-200" />
        <DeleteAccountSection onDeleted={() => { logout(); navigate('/'); }} />
      </div>
    </div>
  );
}

function ChangeUsernameForm({ currentUsername }: { currentUsername: string }) {
  const [username, setUsername] = useState(currentUsername);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.changeUsername(username);
      setMessage('Username updated. Refresh to see changes.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Change Username</h2>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</div>}
      {message && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-3">{message}</div>}
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={20}
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading || username === currentUsername}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.changePassword(currentPassword, newPassword);
      setMessage('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Change Password</h2>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</div>}
      {message && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-3">{message}</div>}
      <div className="space-y-3">
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <input
          type="password"
          placeholder="New password (8+ characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

function DeleteAccountSection({ onDeleted }: { onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteAccount();
      onDeleted();
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-red-600 mb-2">Delete Account</h2>
      <p className="text-sm text-gray-500 mb-3">
        This permanently deletes your account and all your game history. This cannot be undone.
      </p>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
        >
          Delete my account
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Yes, delete everything'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

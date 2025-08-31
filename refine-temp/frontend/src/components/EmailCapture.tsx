import React, { useState } from 'react';
import { api } from '../services/api';

const EmailCapture: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!email) return;

    setStatus('loading');
    try {
      const result = await api.submitEmail(email);
      setStatus(result.success ? 'success' : 'error');
      setMessage(result.message);
      if (result.success) {
        setEmail('');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to submit email. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
      <h2 className="text-2xl font-semibold text-white mb-4">
        To get notified when Refine is available, enter your email here!
      </h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="your@email.com"
          className="flex-1 px-4 py-3 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
          disabled={status === 'loading'}
        />
        <button
          onClick={handleSubmit}
          disabled={status === 'loading'}
          className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Submitting...' : 'Notify Me'}
        </button>
      </div>
      {message && (
        <p className={`mt-4 text-sm ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EmailCapture;
import React, { useState } from 'react';

interface AdminAccessGateProps {
  onLogin: (payload: { username: string; password: string }) => Promise<void>;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!username.trim() || !password) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onLogin({ username: username.trim(), password });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? 'Authentication failed');
      setError(message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-gray-900 italic mb-2">Admin Access</h2>
        <p className="text-sm text-gray-500 mb-6">Sign in with an admin account to open the control panel.</p>

        <div className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <button
          onClick={() => {
            void submit();
          }}
          disabled={isSubmitting || !username.trim() || !password}
          className="mt-6 w-full rounded-2xl bg-primary py-3 text-sm font-black text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

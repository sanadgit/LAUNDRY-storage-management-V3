import React, { useState } from 'react';

interface DriverAccessGateProps {
  onLogin: (payload: { driverId: string; phone: string }) => Promise<void>;
}

export const DriverAccessGate: React.FC<DriverAccessGateProps> = ({ onLogin }) => {
  const [driverId, setDriverId] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!driverId.trim() || !phone.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onLogin({ driverId: driverId.trim(), phone: phone.trim() });
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
        <h2 className="text-2xl font-black text-gray-900 italic mb-2">Driver Access</h2>
        <p className="text-sm text-gray-500 mb-6">Sign in as a driver to open dispatch and mission controls.</p>

        <div className="space-y-4">
          <input
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            placeholder="Driver ID (e.g. DRV-001)"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Driver phone"
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
          disabled={isSubmitting || !driverId.trim() || !phone.trim()}
          className="mt-6 w-full rounded-2xl bg-primary py-3 text-sm font-black text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

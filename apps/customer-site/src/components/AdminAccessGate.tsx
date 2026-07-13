import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { SiteLanguage, localize } from '../lib/i18n';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from './ui';

interface AdminAccessGateProps {
  onLogin: (payload: { username: string; password: string }) => Promise<void>;
  language?: SiteLanguage;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({ onLogin, language = 'ar' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const t = (ar: string, en: string) => localize(language, ar, en);

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
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
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="border-b border-border bg-primary text-white">
          <div className="mb-4 grid size-12 place-items-center rounded-md bg-white/10">
            <ShieldCheck aria-hidden="true" className="size-6 text-accent" />
          </div>
          <CardTitle className="text-2xl text-white">{t('دخول الإدارة', 'Admin Access')}</CardTitle>
          <CardDescription className="text-white/70">
            {t('سجّل الدخول بحساب إداري لفتح الأسطح الداخلية.', 'Sign in with an admin account to open internal surfaces.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={(event) => void submit(event)} className="grid gap-4">
            <Input
              label={t('اسم المستخدم', 'Username')}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
            <Input
              label={t('كلمة المرور', 'Password')}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {error ? (
              <div className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger" role="alert">
                {error}
              </div>
            ) : null}

            <Button type="submit" variant="accent" size="lg" disabled={isSubmitting || !username.trim() || !password}>
              <LockKeyhole aria-hidden="true" className="size-5" />
              {isSubmitting ? t('جاري الدخول...', 'Signing in...') : t('دخول', 'Sign in')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

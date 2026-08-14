import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingBasket } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiErrorMessage } from '../lib/api';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen">
      {/* Identity panel */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-pine px-10 py-10 text-white md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <Store className="h-5 w-5 text-mustard" strokeWidth={2.25} />
          <p className="font-display text-lg font-bold tracking-tight">Grocery POS</p>
        </div>

        <div className="relative">
          <ShoppingBasket className="mb-6 h-10 w-10 text-mustard" strokeWidth={1.75} />
          <p className="font-display text-3xl font-bold leading-tight">
            Fast checkout,
            <br />
            honest numbers.
          </p>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            One terminal for scanning, stocking, and closing out the till — built to run
            with or without a connection.
          </p>
        </div>

        <p className="relative font-mono text-xs text-white/40">v1.0 · local &amp; cloud ready</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <div className="mb-2 flex items-center gap-2">
              <Store className="h-5 w-5 text-evergreen" strokeWidth={2.25} />
              <p className="font-display text-lg font-bold text-evergreen">Grocery POS</p>
            </div>
          </div>

          <p className="mb-1 font-display text-2xl font-bold">Sign in</p>
          <p className="mb-6 text-sm text-ink-soft">Enter your terminal credentials to start your shift.</p>

          <form onSubmit={handleSubmit} className="card space-y-4 p-6">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="tap-target w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition-colors focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="tap-target w-full rounded-md border border-ink/15 px-3 py-2 outline-none transition-colors focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
                required
              />
            </div>

            {error && (
              <p className="rounded-md bg-tomato-tint px-3 py-2 text-sm text-tomato">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="tap-target w-full rounded-md bg-evergreen px-4 py-2 font-medium text-white transition-colors hover:bg-evergreen-dim disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

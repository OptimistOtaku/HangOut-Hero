import { Link, useLocation } from "wouter";
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';

// Context for global login modal
const LoginModalContext = createContext<(() => void) | null>(null);
export function useLoginModal() {
  return useContext(LoginModalContext);
}

export function Header() {
  const [location, setLocation] = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user || null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else setShowAuth(false);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMode('login');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowAuth(false);
    setLocation('/');
  };

  return (
    <LoginModalContext.Provider value={() => setShowAuth(true)}>
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <i className="fas fa-map-marker-alt text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-heading font-bold text-text">Wanderplan</h1>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-primary transition-colors">How it works</a>
            <a href="#" className="text-gray-700 hover:text-primary transition-colors">Inspiration</a>
            <a href="#" className="text-gray-700 hover:text-primary transition-colors">About</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{user.email}</span>
                <Button onClick={handleLogout} className="ml-2">Logout</Button>
              </div>
            ) : (
              <Button onClick={() => setShowAuth(true)}>Login / Register</Button>
            )}
            
            {location === "/" ? (
              <Button 
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#FF6B85]"
              >
                Get Started
              </Button>
            ) : (
              <Link href="/">
                <Button 
                  variant="outline"
                  className="border border-gray-300 hover:border-primary text-text"
                >
                  Home
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              className="md:hidden text-gray-700 p-2"
            >
              <i className="fas fa-bars text-xl"></i>
            </Button>
          </div>
        </div>
      </div>
      {showAuth && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowAuth(false)}>
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">
              {mode === 'login' ? 'Login to your account' : 'Create an account'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
              </Button>
            </form>
            <div className="my-4 text-center text-gray-500">or</div>
            <Button onClick={handleGoogle} className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100" disabled={loading}>
              <i className="fab fa-google mr-2"></i> Continue with Google
            </Button>
            <div className="mt-4 text-center">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button className="text-primary underline" onClick={() => setMode('register')}>Register</button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button className="text-primary underline" onClick={() => setMode('login')}>Login</button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
    </LoginModalContext.Provider>
  );
}

import { useEffect, useState } from 'react';

export function useAuth(token: string) {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem('auth_token');
          setError('Session expired');
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError('Failed to verify token');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  return { user, loading, error };
}

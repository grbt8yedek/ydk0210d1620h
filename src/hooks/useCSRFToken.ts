'use client';

import { useEffect, useState } from 'react';

let csrfToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(csrfToken);
  const [loading, setLoading] = useState(!csrfToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      // Eğer token zaten varsa veya fetch ediliyorsa, tekrar fetch etme
      if (csrfToken) {
        setToken(csrfToken);
        setLoading(false);
        return;
      }

      if (tokenPromise) {
        try {
          const fetchedToken = await tokenPromise;
          setToken(fetchedToken);
          setLoading(false);
        } catch (err) {
          setError('CSRF token alınamadı');
          setLoading(false);
        }
        return;
      }

      // Yeni token fetch et
      setLoading(true);
      tokenPromise = fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          csrfToken = data.csrfToken;
          return data.csrfToken;
        });

      try {
        const fetchedToken = await tokenPromise;
        setToken(fetchedToken);
        setLoading(false);
      } catch (err) {
        setError('CSRF token alınamadı');
        setLoading(false);
        tokenPromise = null;
      }
    }

    fetchToken();
  }, []);

  return { token, loading, error };
}

// Global fetch'i override et
export function setupCSRFProtection() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    // GET, HEAD, OPTIONS isteklerinde CSRF token gerekmiyor
    const method = init?.method?.toUpperCase() || 'GET';
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return originalFetch(input, init);
    }

    // CSRF token'ı al
    if (!csrfToken && !tokenPromise) {
      tokenPromise = fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          csrfToken = data.csrfToken;
          return data.csrfToken;
        })
        .catch(() => {
          tokenPromise = null;
          return null;
        });
    }

    try {
      const token = csrfToken || await tokenPromise;
      
      if (token) {
        // CSRF token'ı header'a ekle
        const headers = new Headers(init?.headers);
        headers.set('x-csrf-token', token);
        
        return originalFetch(input, {
          ...init,
          headers,
        });
      }
    } catch (err) {
      console.error('CSRF token eklenemedi:', err);
    }

    return originalFetch(input, init);
  };
}

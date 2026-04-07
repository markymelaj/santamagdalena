"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { makeTechnicalEmail, normalizeIdentifier } from '@/lib/rut';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(searchParams.get('inactive') ? 'Tu acceso se encuentra desactivado.' : '');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const normalized = normalizeIdentifier(identifier);
      if (!normalized || !password) throw new Error('Debes ingresar tu RUT o usuario interno y la contraseña.');

      const { error } = await supabase.auth.signInWithPassword({
        email: makeTechnicalEmail(normalized),
        password
      });

      if (error) throw error;

      router.replace('/');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="label" htmlFor="identifier">RUT o usuario interno</label>
        <input
          autoComplete="username"
          className="input"
          id="identifier"
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="Ejemplo: 12.345.678-5 o admin"
          value={identifier}
        />
        <p className="muted text-xs">Si escribes tu RUT con puntos o guion, el sistema lo ajusta solo.</p>
      </div>

      <div className="space-y-2">
        <label className="label" htmlFor="password">Contraseña</label>
        <input
          autoComplete="current-password"
          className="input"
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          type="password"
          value={password}
        />
      </div>

      {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

      <button className="btn btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';

export function ChangePasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;

      const { error: rpcError } = await supabase.rpc('mark_password_changed');
      if (rpcError) throw rpcError;

      router.replace('/');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="label" htmlFor="new-password">Nueva contraseña</label>
        <input className="input" id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="label" htmlFor="confirm-password">Repetir contraseña</label>
        <input className="input" id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
      </div>
      {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
      <button className="btn btn-primary w-full" disabled={loading} type="submit">
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </form>
  );
}

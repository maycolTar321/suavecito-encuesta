'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions';
import Image from 'next/image';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-sage-light rounded-full blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-sage-light rounded-full blur-[100px] opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-2xl p-10 sm:p-14 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/50">
        <div className="flex justify-center mb-8">
          <Image src="/logo-suavecito.png" alt="SUAVECITO" width={180} height={60} className="object-contain" />
        </div>
        
        <h1 className="text-2xl font-black text-center text-brand-text mb-2">Panel Privado</h1>
        <p className="text-center text-gray-500 mb-8 font-medium">Ingresa tus credenciales de investigación</p>

        <form action={formAction} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña de acceso</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-brand-sage-light focus:border-brand-sage transition-all text-gray-800"
              required
            />
          </div>

          {state?.error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold text-center border border-rose-100">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={pending}
            className="w-full bg-brand-sage hover:bg-brand-sage-dark text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-brand-sage/30 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
          >
            {pending ? 'Verificando...' : 'Entrar al Dashboard'}
          </button>
        </form>
      </div>
    </main>
  );
}

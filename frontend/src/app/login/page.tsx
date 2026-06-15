'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Authentication failed.');
      }

      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data.user));

      // Trigger a storage sync event for the header
      window.dispatchEvent(new Event('storage'));

      // Redirect based on role
      if (loginEmail.includes('seller')) {
        router.push('/orders');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to auth service.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'seller' | 'buyer') => {
    if (role === 'seller') {
      setEmail('seller@amazonresell.com');
      setPassword('seller123');
      handleLogin(undefined, 'seller@amazonresell.com', 'seller123');
    } else {
      setEmail('buyer@amazonresell.com');
      setPassword('buyer123');
      handleLogin(undefined, 'buyer@amazonresell.com', 'buyer123');
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-black flex flex-col items-center justify-start pt-10 px-4">
      {/* Amazon Resell Logo */}
      <div className="mb-6 text-center">
        <Link href="/" className="flex flex-col items-center select-none">
          <span className="text-3xl font-black tracking-tight text-gray-900 flex items-center">
            amazon<span className="text-[#e47911] font-medium text-sm pt-2">.in</span>
          </span>
          <span className="text-xs text-[#e47911] font-bold tracking-widest uppercase -mt-1 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> resell program
          </span>
        </Link>
      </div>

      {/* Sign-In Card Box */}
      <div className="border border-gray-300 rounded-md p-6 max-w-sm w-full space-y-5 shadow-sm bg-white">
        <h2 className="text-2xl font-normal text-gray-900">Sign-In</h2>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-650 p-3 rounded text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-750">
              Email or mobile phone number
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full border border-gray-400 focus:border-[#e47911] focus:ring-1 focus:ring-[#e47911] rounded px-3 py-1.5 text-sm outline-none transition-all"
              placeholder="e.g. seller@amazonresell.com"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-750">Password</label>
              <a href="#" className="text-xs text-[#007185] hover:text-[#c45500] hover:underline">
                Forgot Password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full border border-gray-400 focus:border-[#e47911] focus:ring-1 focus:ring-[#e47911] rounded px-3 py-1.5 text-sm outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f0c14b] hover:bg-[#ebd082] hover:from-[#f5d78e] hover:to-[#eeb933] border border-[#a88734] rounded shadow-sm text-xs py-2 font-semibold text-gray-900 flex items-center justify-center gap-1.5 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-[10px] text-gray-500 leading-normal">
          By continuing, you agree to Amazon's Conditions of Use and Privacy Notice, and the 
          <strong> Amazon Resell Protection Guidelines</strong>.
        </p>

        <div className="border-t border-gray-250 pt-4 space-y-3">
          <span className="block text-xs text-gray-500 font-bold text-center">
            Demo Tester Accounts
          </span>

          <div className="grid grid-cols-2 gap-3 text-center">
            <button
              onClick={() => handleQuickLogin('seller')}
              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded py-2 text-xs font-bold text-gray-800 transition-all flex flex-col items-center justify-center leading-tight cursor-pointer"
            >
              <span className="text-[#007185]">Seller Mode</span>
              <span className="text-[9px] text-gray-400 font-normal">seller@amazonresell.com</span>
            </button>
            <button
              onClick={() => handleQuickLogin('buyer')}
              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded py-2 text-xs font-bold text-gray-800 transition-all flex flex-col items-center justify-center leading-tight cursor-pointer"
            >
              <span className="text-emerald-700">Buyer Mode</span>
              <span className="text-[9px] text-gray-400 font-normal">buyer@amazonresell.com</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <footer className="mt-16 text-center text-xs text-gray-500 space-y-2 pb-10">
        <div className="flex justify-center gap-4 text-[#007185] font-semibold">
          <a href="#" className="hover:underline">Conditions of Use</a>
          <a href="#" className="hover:underline">Privacy Notice</a>
          <a href="#" className="hover:underline">Help</a>
        </div>
        <p>© 1996-2026, Amazon.com, Inc. or its affiliates. Resell program partner MVP.</p>
      </footer>
    </div>
  );
}

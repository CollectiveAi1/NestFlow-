import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../lib/api';
import { useStore } from '../store/useStore';
import { Logo } from '../components/Logo';
import { UserRole } from '../types';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, showToast } = useStore();
  const [role, setRole] = useState<UserRole>(UserRole.PARENT);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        email,
        password,
        role,
        firstName,
        lastName,
      }),
    onSuccess: (response) => {
      const { user, token } = response.data;
      login(user, token);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error || 'Registration failed', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-brand-teal flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-12 rounded-[64px] shadow-3xl w-full max-w-lg border border-white/50 animate-in zoom-in duration-500">
        <div className="mb-10">
          <Logo size={180} showTagline={false} />
          <h2 className="text-2xl font-black text-slate-800 mt-4">Create an Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-50 rounded-3xl p-1.5 border border-slate-100 mb-4">
            {(['ADMIN', 'TEACHER', 'PARENT'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${
                  role === r
                    ? 'bg-white text-brand-teal shadow-xl shadow-brand-teal/10'
                    : 'text-slate-400'
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-1/2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-slate-900 placeholder:text-slate-300"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-1/2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-slate-900 placeholder:text-slate-300"
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-slate-900 placeholder:text-slate-300"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-slate-900 placeholder:text-slate-300"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-5 mt-2 bg-brand-teal text-white font-black text-xl rounded-[24px] shadow-2xl shadow-brand-teal/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {registerMutation.isPending ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-brand-teal font-bold hover:underline"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

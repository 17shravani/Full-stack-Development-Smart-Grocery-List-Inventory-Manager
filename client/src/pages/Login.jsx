import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Mail, Lock, User, Eye, Cpu, Database } from 'lucide-react';

export default function Login() {
  const { login, register, serverStatus } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name) {
          setError('Name is required.');
          setIsLoading(false);
          return;
        }
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cyber-bg">
      
      {/* Background visual neon orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-cyber-indigo/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyber-violet/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logo Brand Brand */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyber-indigo to-cyber-violet flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">AetherGro</h1>
          <p className="text-xs text-cyber-violet font-extrabold uppercase tracking-widest mt-1">Autonomous Pantry & Supply Engine</p>
        </div>

        {/* Auth Box glass-panel */}
        <div className="glass-panel rounded-2xl p-8 border border-gray-800 shadow-2xl relative">
          
          <h2 className="text-xl font-bold tracking-tight text-white text-center mb-6">
            {isRegister ? 'Initialize Enterprise Account' : 'Secure System Sign-In'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyber-indigo font-semibold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="jane@aethergro.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyber-indigo font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Access Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyber-indigo font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyber-indigo to-cyber-violet hover:from-indigo-600 hover:to-violet-600 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(99,102,241,0.35)]"
            >
              {isLoading ? 'Decrypting Security...' : isRegister ? 'Launch Account' : 'Authenticate Session'}
            </button>

          </form>

          {/* Toggle login register */}
          <div className="mt-6 text-center text-xs text-gray-400">
            {isRegister ? (
              <p>Already registered? <button onClick={() => setIsRegister(false)} className="text-cyber-indigo font-bold hover:underline">Sign In</button></p>
            ) : (
              <p>First time here? <button onClick={() => setIsRegister(true)} className="text-cyber-indigo font-bold hover:underline">Create Account (Auto Seeds Data!)</button></p>
            )}
          </div>

        </div>

        {/* Database connectivity telemetry status footer */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-cyber-indigo" />
            Backend Mode: {serverStatus === 'online' ? (
              <span className="text-emerald-400">Active Express Gateway</span>
            ) : (
              <span className="text-amber-400">Standalone Resilient Sandbox</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

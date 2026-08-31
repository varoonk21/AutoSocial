import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../../lib/auth-client'

export function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function getCurrentYear() {
    return new Date().getFullYear()
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await signIn.email({
        email,
        password,
      })

      if (authError) {
        setError(authError.message || 'Failed to sign in')
        return
      }

      if (data) {
        navigate('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative bg-white text-neutral-900 font-[Inter] selection:bg-blue-100 selection:text-blue-900 antialiased">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
          `,
          backgroundSize: '50px 50px',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 80%)',
        }}
      />

      <div className="relative z-10 flex min-h-screen w-full">
        <div className="hidden w-1/2 flex-col justify-between p-12 md:flex">
          <div
            className="flex items-center gap-2.5 font-semibold tracking-tight text-xl cursor-pointer text-neutral-900"
            onClick={() => navigate('/')}
          >
            <img src="/Icon.png" alt="AutoSocial Icon" className="w-9 h-9 object-contain rounded-lg" />
            <span>AutoSocial</span>
          </div>

          <div className="max-w-lg mb-20">
            <h1 className="mb-6 text-5xl font-semibold tracking-tight leading-tight text-neutral-900">
              Unlock limitless <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 font-semibold">content.</span>
            </h1>
            <p className="text-lg text-neutral-500 font-normal leading-relaxed">
              Turn ideas into posts with an AI partner that understands context, tone, and brand voice. The smartest way to write, schedule, and grow
              is right here.
            </p>
          </div>

          <div className="text-xs text-neutral-400 font-normal">&copy; {getCurrentYear()} AutoSocial Inc. All rights reserved.</div>
        </div>

        <div className="flex w-full flex-col items-center justify-center p-4 md:w-1/2">
          <div className="md:hidden flex flex-col items-center mb-8 text-center space-y-2">
            <div className="flex items-center gap-2 font-bold tracking-tight text-2xl text-neutral-900">
              <img src="/Icon.png" alt="AutoSocial Icon" className="w-9 h-9 object-contain rounded-lg" />
              <span>AutoSocial</span>
            </div>
            <p className="text-sm text-neutral-500 font-normal">Turn ideas into posts with an AI partner.</p>
          </div>

          <div className="w-full max-w-sm flex justify-center">
            <div className="w-full bg-white rounded-2xl border border-gray-200/70 shadow-[0_18px_64px_-14px_rgba(0,0,0,0.2)] p-8 space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Sign in to AutoSocial</h2>
                <p className="text-sm text-neutral-500 font-normal">Welcome back! Please sign in to continue</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-neutral-700">Password</label>
                    <a
                      href="#forgot"
                      onClick={(e) => e.preventDefault()}
                      className="text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all pr-12 shadow-2xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-medium p-1 cursor-pointer"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-black text-white text-sm font-medium rounded-xl shadow-xs transition-all duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Sign In</span>}
                </button>
              </form>

              <div className="pt-4 border-t border-neutral-100 text-center">
                <span className="text-xs text-neutral-400 font-normal flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Secured by Better Auth
                </span>
              </div>
            </div>
          </div>

          <div className="md:hidden mt-8 text-xs text-neutral-400 font-normal">&copy; {getCurrentYear()} AutoSocial Inc.</div>
        </div>
      </div>
    </div>
  )
}
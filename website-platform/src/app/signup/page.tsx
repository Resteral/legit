import { signup } from '@/app/login/actions'
import Link from 'next/link'
import { Bot, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SignupPage({ searchParams }: { searchParams: { error?: string, message?: string, ref?: string } }) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
          <Bot className="w-10 h-10 text-primary" />
          <span className="text-2xl font-bold tracking-tight text-foreground">Resolve.bet</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Create your account</h2>
        <p className="text-muted-foreground text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-secondary/20 py-8 px-4 shadow sm:rounded-3xl sm:px-10 border border-border/50">
          
          {searchParams?.error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {searchParams.error}
            </div>
          )}

          {searchParams?.message && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {searchParams.message}
            </div>
          )}

          <form className="space-y-6" action={signup}>
            <input type="hidden" name="ref" value={searchParams?.ref || ''} />
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-border/50 rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-border/50 rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-colors"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

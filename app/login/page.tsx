import { login } from './actions'

// In Next.js 15+ App Router, searchParams is asynchronous
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const message = resolvedParams?.message;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <form className="flex flex-col gap-4" action={login}>
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Aplus HRMS</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="username">
              Username or Email
            </label>
            <input
              className="rounded-md px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="email"
              type="text"
              placeholder="username"
              required
            />
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-md px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2 transition-colors">
            Sign In
          </button>

          {message && (
            <p className="mt-2 p-3 bg-red-50 text-red-600 text-sm text-center rounded-md border border-red-200">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
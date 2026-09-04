"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthBrandPanel from "@/components/AuthBrandPanel";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(mapAuthError(err.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Sign in to your facility
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            Monitor your storage node and check today&rsquo;s infestation status.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@retailer.ph"
                className="w-full rounded-lg border border-ink-100 bg-husk px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-grain-400 focus:ring-2 focus:ring-grain-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-ink-100 bg-husk px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-grain-400 focus:ring-2 focus:ring-grain-100"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md bg-critical/10 px-3 py-2 text-sm text-critical">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-grain-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-grain-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            Setting up a new facility account?{" "}
            <Link href="/register" className="font-medium text-grain-600 hover:text-grain-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function mapAuthError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password combination doesn't match our records.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Couldn't sign in. Please check your details and try again.";
  }
}

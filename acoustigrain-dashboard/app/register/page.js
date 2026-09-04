"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthBrandPanel from "@/components/AuthBrandPanel";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, fullName, facilityName);
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            Set up monitoring for your rice retail storage in a few seconds.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
                Full name
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juana Dela Cruz"
                className="w-full rounded-lg border border-ink-100 bg-husk px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-grain-400 focus:ring-2 focus:ring-grain-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
                Store / facility name
              </label>
              <input
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="Dela Cruz Rice Trading"
                className="w-full rounded-lg border border-ink-100 bg-husk px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-grain-400 focus:ring-2 focus:ring-grain-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="w-full rounded-lg border border-ink-100 bg-husk px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-grain-400 focus:ring-2 focus:ring-grain-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-grain-600 hover:text-grain-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function mapAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists with that email.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    default:
      return "Couldn't create your account. Please try again.";
  }
}

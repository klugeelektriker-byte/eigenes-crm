"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Home() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Anmeldefehler: ${error.message} | Code: ${error.code ?? error.name} | HTTP: ${error.status ?? "unbekannt"}`);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <p className="text-sm text-zinc-400">Eigenes CRM</p>

        <h1 className="mt-2 text-3xl font-semibold">
          Willkommen zurück
        </h1>

        <p className="mt-2 mb-8 text-zinc-400">
          Melde dich mit deinem CRM-Zugang an.
        </p>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@firma.de"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Anmeldung läuft..." : "Anmelden"}
          </button>

          {message && (
            <p className="text-sm text-red-400">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}

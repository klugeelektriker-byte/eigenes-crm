"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function updatePassword() {
    if (password.length < 8) {
      setMessage("Das Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    if (password !== passwordRepeat) {
      setMessage("Die beiden Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("Passwort konnte nicht geändert werden.");
      setLoading(false);
      return;
    }

    setMessage("Passwort erfolgreich geändert. Du kannst dich jetzt anmelden.");
    setLoading(false);

    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-sm text-zinc-400">Eigenes CRM</p>

        <h1 className="mt-2 text-3xl font-semibold">
          Neues Passwort
        </h1>

        <p className="mt-2 mb-8 text-zinc-400">
          Lege ein neues Passwort für deinen CRM-Zugang fest.
        </p>

        <div className="space-y-5">
          <input
            type="password"
            placeholder="Neues Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
          />

          <input
            type="password"
            placeholder="Passwort wiederholen"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
          />

          <button
            onClick={updatePassword}
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black disabled:opacity-50"
          >
            {loading ? "Wird gespeichert..." : "Passwort speichern"}
          </button>

          {message && (
            <p className="text-sm text-zinc-300">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}

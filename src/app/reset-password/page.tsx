"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [message, setMessage] = useState("Reset-Link wird geprüft...");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepareRecoverySession() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            setMessage("Der Reset-Link ist ungültig oder abgelaufen.");
            return;
          }

          window.history.replaceState({}, "", "/reset-password");
          setReady(true);
          setMessage("");
          return;
        }

        const hash = new URLSearchParams(
          window.location.hash.startsWith("#")
            ? window.location.hash.substring(1)
            : window.location.hash
        );

        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setMessage("Der Reset-Link ist ungültig oder abgelaufen.");
            return;
          }

          window.history.replaceState({}, "", "/reset-password");
          setReady(true);
          setMessage("");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setReady(true);
          setMessage("");
        } else {
          setMessage(
            "Keine gültige Passwort-Reset-Sitzung gefunden. Bitte einen neuen Reset-Link anfordern."
          );
        }
      } catch {
        setMessage("Der Reset-Link konnte nicht verarbeitet werden.");
      }
    }

    prepareRecoverySession();
  }, [supabase]);

  async function updatePassword() {
    if (!ready) {
      setMessage("Bitte zuerst einen gültigen Reset-Link öffnen.");
      return;
    }

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
      setMessage("Passwort konnte nicht geändert werden: " + error.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setMessage("Passwort erfolgreich geändert. Du wirst zum Login weitergeleitet.");

    setTimeout(() => {
      window.location.href = "/";
    }, 1800);
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
            disabled={!ready}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none disabled:opacity-50"
          />

          <input
            type="password"
            placeholder="Passwort wiederholen"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            disabled={!ready}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none disabled:opacity-50"
          />

          <button
            onClick={updatePassword}
            disabled={loading || !ready}
            className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black disabled:opacity-50"
          >
            {loading ? "Wird gespeichert..." : "Passwort speichern"}
          </button>

          {message && (
            <p className="text-sm text-zinc-300">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

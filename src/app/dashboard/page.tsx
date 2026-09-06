"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type Company = {
  id: string;
  name: string;
  legal_name: string | null;
  short_name: string | null;
};

type Membership = {
  role: string;
  companies: Company | null;
};

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/";
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("company_members")
        .select(`
          role,
          companies (
            id,
            name,
            legal_name,
            short_name
          )
        `)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) {
        setMessage("Firmen konnten nicht geladen werden: " + error.message);
        setLoading(false);
        return;
      }

      const memberships = (data ?? []) as unknown as Membership[];

      const companyList = memberships
        .map((entry) => entry.companies)
        .filter((company): company is Company => company !== null);

      setCompanies(companyList);

      if (companyList.length > 0) {
        setActiveCompanyId(companyList[0].id);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const activeCompany = companies.find(
    (company) => company.id === activeCompanyId
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Dashboard wird geladen...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div>
            <p className="text-sm text-zinc-400">Eigenes CRM</p>
            <h1 className="text-xl font-semibold">
              {activeCompany?.short_name ||
                activeCompany?.name ||
                "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={activeCompanyId}
              onChange={(e) => setActiveCompanyId(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>

            <div className="hidden text-right md:block">
              <p className="text-sm text-zinc-300">{email}</p>
              <p className="text-xs text-zinc-500">Angemeldet</p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <nav className="space-y-2">
            {[
              "Übersicht",
              "Kunden",
              "Projekte",
              "Angebote",
              "Aufträge",
              "Mitarbeiter",
              "Dokumente",
              "Einstellungen",
            ].map((item, index) => (
              <button
                key={item}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm ${
                  index === 0
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-6">
          <div>
            <p className="text-sm text-zinc-500">Aktive Firma</p>
            <h2 className="mt-1 text-3xl font-semibold">
              {activeCompany?.legal_name ||
                activeCompany?.name ||
                "Keine Firma gefunden"}
            </h2>
          </div>

          {message && (
            <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
              {message}
            </div>
          )}

          {companies.length === 0 && !message && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-zinc-300">
                Für diesen Benutzer wurde noch keine aktive Firma gefunden.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Offene Projekte", "0"],
              ["Offene Angebote", "0"],
              ["Aktive Kunden", "0"],
              ["Aufgaben heute", "0"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <p className="text-sm text-zinc-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-lg font-semibold">Willkommen im CRM</h3>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Die Grundstruktur steht. Als Nächstes verbinden wir Kunden,
              Projekte, Angebote, Mitarbeiter und Dokumente mit der aktuell
              ausgewählten Firma.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

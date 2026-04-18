"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";

const ENTRY_PRICE = 30;
const ORGANIZER_PERCENT = 0.2;

const PRIZES = [
  { place: 1, percent: 0.5 },
  { place: 2, percent: 0.2 },
  { place: 3, percent: 0.12 },
  { place: 4, percent: 0.1 },
  { place: 5, percent: 0.08 },
];

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getPlaceLabel(place: number, language: string) {
  if (language === "es") return `${place}° lugar`;
  if (place === 1) return "1st place";
  if (place === 2) return "2nd place";
  if (place === 3) return "3rd place";
  return `${place}th place`;
}

function getPlaceStyles(place: number) {
  if (place === 1) {
    return {
      card: "border-yellow-300/40 bg-gradient-to-r from-yellow-400/20 via-amber-300/10 to-white/5 shadow-[0_0_30px_rgba(250,204,21,0.15)]",
      label: "text-yellow-100",
      amount: "text-yellow-300",
      badge: "bg-yellow-300 text-green-950",
      icon: "🏆",
    };
  }

  if (place === 2) {
    return {
      card: "border-slate-200/20 bg-gradient-to-r from-slate-200/10 to-white/5",
      label: "text-white",
      amount: "text-slate-200",
      badge: "bg-slate-200 text-green-950",
      icon: "🥈",
    };
  }

  if (place === 3) {
    return {
      card: "border-amber-600/30 bg-gradient-to-r from-amber-700/15 to-white/5",
      label: "text-white",
      amount: "text-amber-300",
      badge: "bg-amber-500 text-white",
      icon: "🥉",
    };
  }

  return {
    card: "border-white/10 bg-white/5",
    label: "text-white/90",
    amount: "text-green-200",
    badge: "bg-white/10 text-white/90",
    icon: "⚽",
  };
}

export default function PrizePoolCard() {
  const { language, mounted } = useLanguage();
  const [paidEntries, setPaidEntries] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPaidEntriesCount() {
      const { count, error } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .eq("paid", true);

      if (error) {
        console.error("Error loading paid entries count:", error);
        setPaidEntries(0);
      } else {
        setPaidEntries(count || 0);
      }

      setLoading(false);
    }

    loadPaidEntriesCount();
  }, []);

  if (!mounted) return null;

  const totalCollected = paidEntries * ENTRY_PRICE;
  const organizerFee = totalCollected * ORGANIZER_PERCENT;
  const prizePool = totalCollected - organizerFee;
  const topPrize = prizePool * PRIZES[0].percent;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-green-400/20 bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 p-5 sm:p-6 shadow-2xl shadow-black/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.16),transparent_35%)]" />
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-yellow-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-green-400/10 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-yellow-300/30 bg-yellow-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200">
            {language === "es" ? "Zona de premios" : "Prize Zone"}
          </span>

          {!loading && topPrize > 0 && (
            <span className="inline-flex items-center rounded-full border border-green-300/20 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-100">
              {language === "es" ? "Premio mayor" : "Top prize"}: {formatMoney(topPrize)}
            </span>
          )}
        </div>

        <div className="mb-5">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {language === "es" ? "Premios actuales" : "Current Prizes"}
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
            {loading
              ? language === "es"
                ? "Cargando premios..."
                : "Loading prizes..."
              : language === "es"
              ? "Los premios aumentan automáticamente según la cantidad de entradas pagadas. Compite por estar entre los 5 mejores."
              : "Prizes increase automatically based on the number of paid entries. Compete to finish in the top 5."}
          </p>
        </div>

        <div className="mb-5 rounded-2xl border border-yellow-300/25 bg-gradient-to-r from-yellow-400/15 via-yellow-300/10 to-transparent p-4 shadow-[0_0_25px_rgba(250,204,21,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200/90">
                {language === "es" ? "Premio destacado" : "Featured prize"}
              </p>
              <h3 className="mt-1 text-lg font-bold text-white sm:text-xl">
                {language === "es" ? "1° lugar se lleva la gloria" : "1st place takes the glory"}
              </h3>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.15em] text-yellow-100/70">
                {language === "es" ? "Ganancia actual" : "Current payout"}
              </p>
              <p className="text-2xl font-extrabold text-yellow-300 sm:text-3xl">
                {loading ? "—" : formatMoney(topPrize)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {PRIZES.map((item) => {
            const amount = prizePool * item.percent;
            const styles = getPlaceStyles(item.place);

            return (
              <div
                key={item.place}
                className={`group relative overflow-hidden rounded-2xl border px-4 py-4 transition-transform duration-200 hover:scale-[1.01] sm:px-5 ${styles.card}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/10 text-lg shadow-inner">
                      <span>{styles.icon}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-base font-bold sm:text-lg ${styles.label}`}>
                          {getPlaceLabel(item.place, language)}
                        </span>

                        {item.place === 1 && (
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${styles.badge}`}>
                            {language === "es" ? "Más buscado" : "Most wanted"}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-white/60 sm:text-sm">
                        {item.place === 1
                          ? language === "es"
                            ? "El gran premio de la quiniela."
                            : "The grand prize of the pool."
                          : item.place <= 3
                          ? language === "es"
                            ? "Puesto de podio con premio."
                            : "Podium finish with prize."
                          : language === "es"
                          ? "También entra en premios."
                          : "Still finishes in the money."}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">
                      {language === "es" ? "Premio" : "Prize"}
                    </p>
                    <p className={`text-lg font-extrabold sm:text-xl ${styles.amount}`}>
                      {loading ? "—" : formatMoney(amount)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && paidEntries > 0 && (
          <p className="mt-5 text-center text-xs text-white/55 sm:text-sm">
            {language === "es"
              ? `Calculado automáticamente con ${paidEntries} ${paidEntries === 1 ? "entrada pagada" : "entradas pagadas"}.`
              : `Automatically calculated from ${paidEntries} paid ${paidEntries === 1 ? "entry" : "entries"}.`}
          </p>
        )}
      </div>
    </section>
  );
}
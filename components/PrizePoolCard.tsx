"use client";

import { useLanguage } from "@/components/LanguageProvider";

const PAID_ENTRIES = 20; // <-- update this manually
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

export default function PrizePoolCard() {
  const { language } = useLanguage();

  const totalCollected = PAID_ENTRIES * ENTRY_PRICE;
  const organizerFee = totalCollected * ORGANIZER_PERCENT;
  const prizePool = totalCollected - organizerFee;

  return (
    <section className="border border-white/20 rounded-2xl p-5 sm:p-6 bg-white/5">
      <h2 className="text-2xl font-bold mb-3">
        {language === "es" ? "Premios actuales" : "Current Prize Pool"}
      </h2>

      <p className="text-white/80 text-sm sm:text-base mb-4">
        {language === "es"
          ? `Basado en ${PAID_ENTRIES} entradas pagadas de ${formatMoney(
              ENTRY_PRICE
            )} cada una.`
          : `Based on ${PAID_ENTRIES} paid entries at ${formatMoney(
              ENTRY_PRICE
            )} each.`}
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <span className="font-medium">
            {language === "es" ? "Total recaudado" : "Total collected"}
          </span>
          <span className="font-semibold text-green-300">
            {formatMoney(totalCollected)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <span className="font-medium">
            {language === "es"
              ? "Organización y administración (20%)"
              : "Organizer / management fee (20%)"}
          </span>
          <span className="font-semibold text-yellow-300">
            {formatMoney(organizerFee)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <span className="font-medium">
            {language === "es" ? "Pozo de premios" : "Prize pool"}
          </span>
          <span className="font-semibold text-green-300">
            {formatMoney(prizePool)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {PRIZES.map((item) => {
          const amount = prizePool * item.percent;

          return (
            <div
              key={item.place}
              className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-3"
            >
              <span className="font-medium">
                {getPlaceLabel(item.place, language)}
              </span>
              <span className="font-semibold text-green-300">
                {formatMoney(amount)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-white/60 mt-4">
        {language === "es"
          ? "Los montos se actualizan manualmente según la cantidad de entradas pagadas."
          : "Amounts are updated manually based on the number of paid entries."}
      </p>
    </section>
  );
}
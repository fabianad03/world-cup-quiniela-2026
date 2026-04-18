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
    <section className="rounded-2xl border border-white/20 bg-white/5 p-5 sm:p-6">
      <h2 className="text-2xl font-bold mb-4">
        {language === "es" ? "Premios actuales" : "Current Prizes"}
      </h2>

      <p className="text-white/80 text-sm sm:text-base mb-5">
        {language === "es"
          ? "Los premios se actualizan según la cantidad de entradas pagadas."
          : "Prizes are updated based on the number of paid entries."}
      </p>

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
    </section>
  );
}
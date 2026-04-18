import { supabase } from "@/lib/supabase";
import HomePageClient from "@/components/HomePageClient";
import PrizePoolCard from "@/components/PrizePoolCard";

export default async function Home() {
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff", { ascending: true });

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <PrizePoolCard />
      </div>

      <HomePageClient matches={matches || []} />
    </>
  );
}
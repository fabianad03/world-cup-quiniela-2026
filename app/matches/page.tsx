export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
import MatchesPageClient from "@/components/MatchesPageClient";

export default async function MatchesPage() {
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff", { ascending: true });

  return <MatchesPageClient matches={matches || []} />;
}
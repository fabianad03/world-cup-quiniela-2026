export function translateRoundName(
  roundName: string,
  language: "en" | "es"
) {
  if (language === "en") return roundName;

  const roundTranslations: Record<string, string> = {
    "Group Stage": "Fase de Grupos",
    "Round of 32": "Dieciseisavos de Final",
    "Round of 16": "Octavos de Final",
    Quarterfinals: "Cuartos de Final",
    Semifinals: "Semifinales",
    "Third Place": "Tercer Lugar",
    Final: "Final",
  };

  return roundTranslations[roundName] || roundName;
}

export function translateTeamName(
  teamName: string,
  language: "en" | "es"
) {
  if (language === "en") return teamName;

  const teamTranslations: Record<string, string> = {
    Argentina: "Argentina",
    Mexico: "México",
    Senegal: "Senegal",
    Portugal: "Portugal",
    Brazil: "Brasil",
    Spain: "España",
    Germany: "Alemania",
    France: "Francia",
    England: "Inglaterra",
    Netherlands: "Países Bajos",
    Croatia: "Croacia",
    Belgium: "Bélgica",
    Uruguay: "Uruguay",
    Colombia: "Colombia",
    Ecuador: "Ecuador",
    Chile: "Chile",
    Peru: "Perú",
    Paraguay: "Paraguay",
    Bolivia: "Bolivia",
    Venezuela: "Venezuela",
    "United States": "Estados Unidos",
    Canada: "Canadá",
    Morocco: "Marruecos",
    Japan: "Japón",
    "South Korea": "Corea del Sur",
    Australia: "Australia",
    Switzerland: "Suiza",
    Serbia: "Serbia",
    Poland: "Polonia",
    Denmark: "Dinamarca",
    Sweden: "Suecia",
    Norway: "Noruega",
    Italy: "Italia",
  };

  return teamTranslations[teamName] || teamName;
}
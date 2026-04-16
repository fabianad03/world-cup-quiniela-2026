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
    Mexico: "México",
    "South Africa": "Sudáfrica",
    "South Korea": "Corea del Sur",
    Czechia: "Chequia",
    Canada: "Canadá",
    "Bosnia and Herzegovina": "Bosnia y Herzegovina",
    USA: "Estados Unidos",
    Paraguay: "Paraguay",
    Qatar: "Catar",
    Switzerland: "Suiza",
    Brazil: "Brasil",
    Morocco: "Marruecos",
    Haiti: "Haití",
    Scotland: "Escocia",
    Australia: "Australia",
    Türkiye: "Turquía",
    Germany: "Alemania",
    Curaçao: "Curazao",
    Netherlands: "Países Bajos",
    Japan: "Japón",
    "Ivory Coast": "Costa de Marfil",
    Ecuador: "Ecuador",
    Sweden: "Suecia",
    Tunisia: "Túnez",
    Spain: "España",
    "Cape Verde": "Cabo Verde",
    Belgium: "Bélgica",
    Egypt: "Egipto",
    "Saudi Arabia": "Arabia Saudita",
    Uruguay: "Uruguay",
    Iran: "Irán",
    "New Zealand": "Nueva Zelanda",
    France: "Francia",
    Senegal: "Senegal",
    Iraq: "Irak",
    Norway: "Noruega",
    Argentina: "Argentina",
    Algeria: "Argelia",
    Austria: "Austria",
    Jordan: "Jordania",
    Portugal: "Portugal",
    "DR Congo": "República Democrática del Congo",
    England: "Inglaterra",
    Croatia: "Croacia",
    Ghana: "Ghana",
    Panama: "Panamá",
    Uzbekistan: "Uzbekistán",
    Colombia: "Colombia",
  };

  return teamTranslations[teamName] || teamName;
}
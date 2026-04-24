export const KNOCKOUT_ROUNDS = [
  "round of 32",
  "round of 16",
  "quarterfinals",
  "quarter-finals",
  "quarter finals",
  "semifinals",
  "semi-finals",
  "semi finals",
  "third place",
  "third-place",
  "final",
];

export function isKnockoutRound(roundName: string) {
  if (!roundName) return false;
  const normalized = roundName.trim().toLowerCase();
  return KNOCKOUT_ROUNDS.includes(normalized);
}

export function getActualAdvancingTeam(match: any): "team_a" | "team_b" | null {
  if (!match?.is_finished) return null;
  if (!isKnockoutRound(match.round_name)) return null;

  if (Number(match.score_a) > Number(match.score_b)) return "team_a";
  if (Number(match.score_b) > Number(match.score_a)) return "team_b";

  return match.penalty_winner || null;
}

export function getPredictedAdvancingTeam(pred: any): "team_a" | "team_b" | null {
  if (Number(pred.pred_a) > Number(pred.pred_b)) return "team_a";
  if (Number(pred.pred_b) > Number(pred.pred_a)) return "team_b";

  return pred.advance_pick || null;
}

export function calculatePoints(pred: any, match: any) {
  if (!match.is_finished) return 0;

  const actualA = Number(match.score_a);
  const actualB = Number(match.score_b);
  const predA = Number(pred.pred_a);
  const predB = Number(pred.pred_b);

  const isKnockout = isKnockoutRound(match.round_name);

  let points = 0;

  if (!isKnockout) {
    if (predA === actualA && predB === actualB) {
      points = 5;
    } else if (
      (actualA > actualB && predA > predB) ||
      (actualA < actualB && predA < predB)
    ) {
      points = 3;
    } else if (actualA === actualB && predA === predB) {
      points = 2;
    }

    return pred.joker ? points * 2 : points;
  }

  const actualAdvancingTeam = getActualAdvancingTeam(match);
  const predictedAdvancingTeam = getPredictedAdvancingTeam(pred);

  const exactScore = predA === actualA && predB === actualB;
  const predictedTie = predA === predB;
  const actualTie = actualA === actualB;

  const correctAdvancingTeam =
    actualAdvancingTeam !== null &&
    predictedAdvancingTeam !== null &&
    actualAdvancingTeam === predictedAdvancingTeam;

  if (exactScore && correctAdvancingTeam) {
    points = 5;
  } else if (predictedTie && actualTie && correctAdvancingTeam) {
    points = 4;
  } else if (correctAdvancingTeam) {
    points = 3;
  } else if (exactScore) {
    points = 2;
  } else {
    points = 0;
  }

  return pred.joker ? points * 2 : points;
}

export function getResultReason(pred: any, match: any, language: "en" | "es") {
  if (!match.is_finished) {
    return language === "es" ? "Pendiente" : "Pending";
  }

  const points = calculatePoints(pred, match);
  const basePoints = pred.joker ? points / 2 : points;
  const isKnockout = isKnockoutRound(match.round_name);

  if (!isKnockout) {
    if (basePoints === 5) return language === "es" ? "Marcador exacto" : "Exact score";
    if (basePoints === 3) return language === "es" ? "Ganador correcto" : "Correct winner";
    if (basePoints === 2) return language === "es" ? "Empate correcto" : "Correct draw";
    return language === "es" ? "Sin puntos" : "No points";
  }

  if (basePoints === 5) {
    return language === "es"
      ? "Marcador exacto y equipo clasificado correcto"
      : "Exact score and correct advancing team";
  }

  if (basePoints === 4) {
    return language === "es"
      ? "Empate correcto y equipo clasificado correcto"
      : "Correct draw and correct advancing team";
  }

  if (basePoints === 3) {
    return language === "es"
      ? "Equipo clasificado correcto"
      : "Correct advancing team";
  }

  if (basePoints === 2) {
    return language === "es"
      ? "Marcador exacto, pero equipo clasificado incorrecto"
      : "Exact score, but wrong advancing team";
  }

  return language === "es" ? "Sin puntos" : "No points";
}
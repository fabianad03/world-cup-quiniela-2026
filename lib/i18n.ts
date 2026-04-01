export type Language = "en" | "es";

export type TranslationSchema = {
  navbar: {
    home: string;
    entries: string;
    leaderboard: string;
    admin: string;
  };
  common: {
    english: string;
    spanish: string;
    save: string;
    saving: string;
    saved: string;
    paid: string;
    unpaid: string;
    yes: string;
    no: string;
  };
  entries: {
    title: string;
    createTitle: string;
    placeholder: string;
    create: string;
    used: string;
    maxError: string;
    emptyName: string;
    success: string;
  };
  predictions: {
    title: string;
    joker: string;
    locked: string;
    unpaidBlocked: string;
    negativeError: string;
    teamAScore: string;
    teamBScore: string;
    enterScores: string;
  };
  leaderboard: {
    title: string;
    rank: string;
    entry: string;
    points: string;
    noEntries: string;
    empty: string;
  };
  admin: {
    title: string;
    createMatch: string;
    setScores: string;
    markFinished: string;
    togglePaid: string;
    password: string;
    enter: string;
  };
};

export const translations: Record<Language, TranslationSchema> = {
  en: {
    navbar: {
      home: "Home",
      entries: "Entries",
      leaderboard: "Leaderboard",
      admin: "Admin",
    },
    common: {
      english: "English",
      spanish: "Español",
      save: "Save",
      saving: "Saving...",
      saved: "Saved!",
      paid: "Paid",
      unpaid: "Not paid",
      yes: "Yes",
      no: "No",
    },
    entries: {
      title: "My Entries",
      createTitle: "Create New Entry",
      placeholder: "Entry name",
      create: "Create",
      used: "entries used",
      maxError: "Maximum of 5 entries allowed.",
      emptyName: "Please enter an entry name.",
      success: "Entry created successfully.",
    },
    predictions: {
      title: "Predictions",
      joker: "Joker",
      locked: "This match is locked because it has already started.",
      unpaidBlocked: "Only paid entries can submit predictions.",
      negativeError: "Scores cannot be negative.",
      teamAScore: "Team A score",
      teamBScore: "Team B score",
      enterScores: "Please enter both scores.",
    },
    leaderboard: {
      title: "Leaderboard",
      rank: "Rank",
      entry: "Entry",
      points: "Points",
      noEntries: "No paid entries yet.",
      empty: "No scored predictions yet.",
    },
    admin: {
      title: "Admin Panel",
      createMatch: "Create Match",
      setScores: "Set Final Scores",
      markFinished: "Mark as Finished",
      togglePaid: "Toggle Paid Status",
      password: "Password",
      enter: "Enter",
    },
  },
  es: {
    navbar: {
      home: "Inicio",
      entries: "Entradas",
      leaderboard: "Tabla",
      admin: "Admin",
    },
    common: {
      english: "English",
      spanish: "Español",
      save: "Guardar",
      saving: "Guardando...",
      saved: "¡Guardado!",
      paid: "Pagado",
      unpaid: "No pagado",
      yes: "Sí",
      no: "No",
    },
    entries: {
      title: "Mis Entradas",
      createTitle: "Crear nueva entrada",
      placeholder: "Nombre de la entrada",
      create: "Crear",
      used: "entradas usadas",
      maxError: "Máximo de 5 entradas permitidas.",
      emptyName: "Por favor ingresa un nombre para la entrada.",
      success: "Entrada creada exitosamente.",
    },
    predictions: {
      title: "Predicciones",
      joker: "Comodín",
      locked: "Este partido está bloqueado porque ya comenzó.",
      unpaidBlocked: "Solo las entradas pagadas pueden enviar predicciones.",
      negativeError: "Los marcadores no pueden ser negativos.",
      teamAScore: "Marcador del Equipo A",
      teamBScore: "Marcador del Equipo B",
      enterScores: "Por favor ingresa ambos marcadores.",
    },
    leaderboard: {
      title: "Tabla de Posiciones",
      rank: "Posición",
      entry: "Entrada",
      points: "Puntos",
      noEntries: "Todavía no hay entradas pagadas.",
      empty: "Todavía no hay predicciones con puntos.",
    },
    admin: {
      title: "Panel de Admin",
      createMatch: "Crear Partido",
      setScores: "Definir Marcadores Finales",
      markFinished: "Marcar como Finalizado",
      togglePaid: "Cambiar Estado de Pago",
      password: "Contraseña",
      enter: "Entrar",
    },
  },
};
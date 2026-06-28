// ===========================================================
// Chaveamento / jornada (NÃO ABRO MÃO — Lipy)
// Carregado como <script> (não fetch) pra funcionar abrindo
// o index.html direto (file://), sem servidor.
//
// status de fase: "andamento" | "possivel" | "eliminado" | "campeao"
// status de jogo: "finalizado" | "confirmado" | "possivel"
// resultado: "v" (vitória) | "e" (empate) | "d" (derrota)
//
// HOJE só o Brasil tem jornada real (dados espelhados do
// essediatemjogo.com.br). As outras seleções usam um modelo
// genérico até o bracket real de todas entrar.
// ===========================================================
window.BRACKET = {
  meta: { updated: "2026-06-24", tz: "BRT" },

  stagesOrder: ["grupos", "dezesseis", "oitavas", "quartas", "semi", "final"],

  stageNames: {
    grupos: "Fase de grupos",
    dezesseis: "16 avos de final",
    oitavas: "Oitavas de final",
    quartas: "Quartas de final",
    semi: "Semifinal",
    terceiro: "Disputa de 3º lugar",
    final: "Final"
  },

  // datas/sedes/transmissão padrão por fase do mata-mata
  // (representativo, do caminho do Brasil — vira real com o bracket completo)
  defaults: {
    dezesseis: { date: "29/06", city: "a definir", tv: ["Globo", "SBT", "CazéTV"] },
    oitavas:   { date: "04 a 05/07", city: "a definir", tv: ["Globo", "SBT", "CazéTV"] },
    quartas:   { date: "09 a 11/07", city: "a definir", tv: ["Globo", "SBT", "CazéTV"] },
    semi:      { date: "14 a 15/07", city: "a definir", tv: ["Globo", "SBT", "CazéTV"] },
    final:     { date: "19/07", city: "Nova York/NJ", tv: ["Globo", "SBT", "CazéTV"] }
  },

  journeys: {
    br: [
      {
        stage: "grupos", status: "andamento",
        matches: [
          { date: "13/06", opp: "Marrocos", oppCode: "ma", status: "finalizado", score: "1-1", result: "e", stadium: "MetLife Stadium", city: "Nova York/NJ", tv: ["Globo", "SBT"] },
          { date: "19/06", opp: "Haiti", oppCode: "ht", status: "finalizado", score: "3-0", result: "v", stadium: "Lincoln Financial Field", city: "Filadélfia", tv: ["Globo", "SBT"] },
          { date: "24/06", opp: "Escócia", oppCode: "gb-sct", status: "confirmado", time: "16h", stadium: "Hard Rock Stadium", city: "Miami", tv: ["Globo", "SBT", "CazéTV"] }
        ]
      },
      {
        stage: "dezesseis", status: "possivel", tv: ["Globo", "SBT", "CazéTV"],
        scenarios: [
          { date: "29/06", time: "14h", opp: "2º do Grupo F", stadium: "Houston Stadium", city: "Houston" },
          { date: "29/06", time: "17h30", opp: "1º do Grupo E", stadium: "Boston Stadium", city: "Boston" },
          { date: "29/06", time: "22h", opp: "1º do Grupo F", stadium: "Estadio Monterrey", city: "Monterrey" }
        ]
      },
      {
        stage: "oitavas", status: "possivel", tv: ["Globo", "SBT", "CazéTV"],
        scenarios: [
          { date: "04/07", time: "14h", opp: "Vencedor da Partida 73", stadium: "NRG Stadium", city: "Houston" },
          { date: "04/07", time: "18h", opp: "Vencedor da Partida 77", stadium: "Lincoln Financial Field", city: "Filadélfia" },
          { date: "05/07", time: "17h", opp: "Vencedor da Partida 78", stadium: "New York New Jersey Stadium", city: "Nova York/NJ" }
        ]
      },
      {
        stage: "quartas", status: "possivel", tv: ["Globo", "SBT", "CazéTV"],
        scenarios: [
          { date: "09/07", time: "17h", opp: "Vencedor da Partida 89", stadium: "Boston Stadium", city: "Boston" },
          { date: "11/07", time: "18h", opp: "Vencedor da Partida 92", stadium: "Hard Rock Stadium", city: "Miami" }
        ]
      },
      {
        stage: "semi", status: "possivel", tv: ["Globo", "SBT", "CazéTV"],
        scenarios: [
          { date: "14/07", time: "16h", opp: "Vencedor da Partida 98", stadium: "Dallas Stadium", city: "Dallas" },
          { date: "15/07", time: "16h", opp: "Vencedor da Partida 100", stadium: "Atlanta Stadium", city: "Atlanta" }
        ]
      },
      {
        stage: "final", status: "possivel", tv: ["Globo", "SBT", "CazéTV"],
        scenarios: [
          { date: "19/07", time: "16h", opp: "a definir", stadium: "New York New Jersey Stadium", city: "Nova York/NJ" }
        ]
      }
    ],

    ar: [
      { stage: "grupos", status: "andamento", matches: [
        { date: "16/06", opp: "Argélia", oppCode: "dz", status: "finalizado", score: "3-0", result: "v", city: "Kansas City", tv: ["Globo", "SporTV", "CazéTV"] },
        { date: "22/06", opp: "Áustria", oppCode: "at", status: "finalizado", score: "2-0", result: "v", city: "Dallas", tv: ["SBT", "CazéTV"] },
        { date: "27/06", opp: "Jordânia", oppCode: "jo", status: "confirmado", time: "23h", city: "Dallas", tv: ["Globo", "SporTV", "CazéTV"] }
      ] },
      { stage: "dezesseis", status: "possivel", tv: ["Globo", "SporTV", "CazéTV"], scenarios: [
        { date: "03/07", time: "19h", opp: "2º do Grupo H", stadium: "Hard Rock Stadium", city: "Miami" }
      ] },
      { stage: "oitavas", status: "possivel", tv: ["Globo", "SporTV", "CazéTV"], scenarios: [
        { date: "07/07", time: "13h", opp: "Vencedor da Partida 88", stadium: "Mercedes-Benz Stadium", city: "Atlanta" }
      ] },
      { stage: "quartas", status: "possivel", tv: ["Globo", "SporTV", "CazéTV"], scenarios: [
        { date: "11/07", time: "22h", opp: "Vencedor da Partida 96", stadium: "Kansas City Stadium", city: "Kansas City" }
      ] },
      { stage: "semi", status: "possivel", tv: ["Globo", "SBT", "SporTV", "CazéTV"], scenarios: [
        { date: "15/07", time: "16h", opp: "Vencedor da Partida 99", stadium: "Atlanta Stadium", city: "Atlanta" }
      ] },
      { stage: "final", status: "possivel", tv: ["Globo", "SBT", "SporTV", "CazéTV"], scenarios: [
        { date: "19/07", time: "16h", opp: "Vencedor da Partida 101", stadium: "New York New Jersey Stadium", city: "Nova York/NJ" }
      ] }
    ],

    fr: [
      { stage: "grupos", status: "andamento", matches: [
        { date: "16/06", opp: "Senegal", oppCode: "sn", status: "finalizado", score: "3-1", result: "v", city: "Nova York/NJ", tv: ["SBT", "CazéTV"] },
        { date: "22/06", opp: "Iraque", oppCode: "iq", status: "finalizado", score: "3-0", result: "v", city: "Filadélfia", tv: ["Globo", "SporTV", "CazéTV"] },
        { date: "26/06", opp: "Noruega", oppCode: "no", status: "confirmado", time: "16h", city: "Boston", tv: ["Globo", "SporTV", "CazéTV"] }
      ] },
      { stage: "dezesseis", status: "possivel", tv: ["Globo", "SporTV", "CazéTV"], scenarios: [
        { date: "30/06", time: "14h", opp: "2º do Grupo E", stadium: "Dallas Stadium", city: "Dallas" },
        { date: "30/06", time: "18h", opp: "3º do Grupo C/D/F/G/H", stadium: "New York New Jersey Stadium", city: "Nova York/NJ" }
      ] },
      { stage: "oitavas", status: "possivel", tv: ["Globo", "SporTV", "CazéTV"], scenarios: [
        { date: "04/07", time: "18h", opp: "Vencedor da Partida 74", stadium: "Lincoln Financial Field", city: "Filadélfia" },
        { date: "05/07", time: "17h", opp: "Vencedor da Partida 76", stadium: "New York New Jersey Stadium", city: "Nova York/NJ" }
      ] },
      { stage: "quartas", status: "possivel", tv: ["Globo", "SporTV", "CazéTV"], scenarios: [
        { date: "09/07", time: "17h", opp: "Vencedor da Partida 90", stadium: "Boston Stadium", city: "Boston" },
        { date: "11/07", time: "18h", opp: "Vencedor da Partida 92", stadium: "Hard Rock Stadium", city: "Miami" }
      ] },
      { stage: "semi", status: "possivel", tv: ["Globo", "SBT", "SporTV", "CazéTV"], scenarios: [
        { date: "14/07", time: "16h", opp: "Vencedor da Partida 98", stadium: "Dallas Stadium", city: "Dallas" },
        { date: "15/07", time: "16h", opp: "Vencedor da Partida 100", stadium: "Atlanta Stadium", city: "Atlanta" }
      ] },
      { stage: "final", status: "possivel", tv: ["Globo", "SBT", "SporTV", "CazéTV"], scenarios: [
        { date: "19/07", time: "16h", opp: "Vencedor da Partida 102", stadium: "New York New Jersey Stadium", city: "Nova York/NJ" }
      ] }
    ],

    pt: [
      { stage: "grupos", status: "andamento", matches: [
        { date: "17/06", opp: "RD Congo", oppCode: "cd", status: "finalizado", score: "1-1", result: "e", city: "Houston", tv: ["Globo", "SporTV", "CazéTV"] },
        { date: "23/06", opp: "Uzbequistão", oppCode: "uz", status: "finalizado", score: "5-0", result: "v", city: "Houston", tv: ["Globo", "SporTV", "CazéTV"] },
        { date: "27/06", opp: "Colômbia", oppCode: "co", status: "confirmado", time: "20h30", city: "Miami", tv: ["Globo", "SporTV", "CazéTV"] }
      ] },
      { stage: "dezesseis", status: "possivel", tv: ["Globo", "SporTV", "CazéTV"], scenarios: [
        { date: "02/07", time: "20h", opp: "2º do Grupo L", stadium: "BMO Field", city: "Toronto" },
        { date: "03/07", time: "22h30", opp: "3º do Grupo D/E/I/J/L", stadium: "Kansas City Stadium", city: "Kansas City" }
      ] },
      { stage: "oitavas", status: "possivel", tv: ["Globo", "SporTV", "CazéTV"], scenarios: [
        { date: "06/07", time: "16h", opp: "Vencedor da Partida 84", stadium: "Dallas Stadium", city: "Dallas" },
        { date: "07/07", time: "17h", opp: "Vencedor da Partida 85", stadium: "BC Place", city: "Vancouver" }
      ] },
      { stage: "quartas", status: "possivel", tv: ["Globo", "SporTV", "CazéTV"], scenarios: [
        { date: "10/07", time: "16h", opp: "Vencedor da Partida 94", stadium: "SoFi Stadium", city: "Los Angeles" },
        { date: "11/07", time: "22h", opp: "Vencedor da Partida 95", stadium: "Kansas City Stadium", city: "Kansas City" }
      ] },
      { stage: "semi", status: "possivel", tv: ["Globo", "SBT", "SporTV", "CazéTV"], scenarios: [
        { date: "14/07", time: "16h", opp: "Vencedor da Partida 97", stadium: "Dallas Stadium", city: "Dallas" },
        { date: "15/07", time: "16h", opp: "Vencedor da Partida 99", stadium: "Atlanta Stadium", city: "Atlanta" }
      ] },
      { stage: "final", status: "possivel", tv: ["Globo", "SBT", "SporTV", "CazéTV"], scenarios: [
        { date: "19/07", time: "16h", opp: "Vencedor da Partida 101", stadium: "New York New Jersey Stadium", city: "Nova York/NJ" }
      ] }
    ]
  },

  // Possibilidades reais de cada confronto "a definir" (preencher com o chaveamento real).
  // Ex: "1º do Grupo F": ["fr","es","cr"]  |  "Vencedor da Partida 73": ["pt","uy"]
  // Preenchido => o popup mostra essas seleções (clicáveis). Vazio => só explica.
  possibilities: {},

  // ===== SEMENTE (ilustrativa) — o gerador (football-data.org) sobrescreve com o real =====
  // Composição dos 12 grupos (códigos de bandeira). Usada p/ deduzir as seleções
  // possíveis num confronto "a definir" do mata-mata.
  groups: {
    A: ["br", "ma", "ht", "gb-sct"],
    B: ["ar", "dz", "at", "jo"],
    C: ["fr", "sn", "iq", "no"],
    D: ["pt", "cd", "uz", "co"],
    E: ["mx", "es", "ch", "za"],
    F: ["ca", "nl", "gh", "qa"],
    G: ["us", "de", "eg", "nz"],
    H: ["gb-eng", "ir", "jp", "pa"],
    I: ["uy", "be", "kr", "cv"],
    J: ["hr", "ci", "ec", "sa"],
    K: ["tr", "se", "au", "cw"],
    L: ["cz", "tn", "py", "ba"]
  },

  // Chaveamento OFICIAL do mata-mata (FIFA). Cada slot é:
  //   "1A"/"2A" = 1º/2º do Grupo A
  //   "3:ABCDF" = melhor 3º colocado vindo de um destes grupos (A,B,C,D,F)
  //   "W73" = vencedor do Jogo 73   |   "L101" = perdedor do Jogo 101 (3º lugar)
  // Datas/cidades reais; horários vêm do gerador (API). Times caem nos slots conforme os grupos terminam.
  knockout: [
    { id: 73, stage: "dezesseis", a: "2A", b: "2B", date: "28/06", time: "16h", city: "Los Angeles" },
    { id: 74, stage: "dezesseis", a: "1E", b: "3:ABCDF", date: "29/06", time: "17h30", city: "Boston" },
    { id: 75, stage: "dezesseis", a: "1F", b: "2C", date: "29/06", time: "22h", city: "Monterrey" },
    { id: 76, stage: "dezesseis", a: "1C", b: "2F", date: "29/06", time: "14h", city: "Houston" },
    { id: 77, stage: "dezesseis", a: "1I", b: "3:CDFGH", date: "30/06", time: "18h", city: "Nova York/NJ" },
    { id: 78, stage: "dezesseis", a: "2E", b: "2I", date: "30/06", time: "14h", city: "Dallas" },
    { id: 79, stage: "dezesseis", a: "1A", b: "3:CEFHI", date: "30/06", time: "22h", city: "Cidade do México" },
    { id: 80, stage: "dezesseis", a: "1L", b: "3:EHIJK", date: "01/07", time: "13h", city: "Atlanta" },
    { id: 81, stage: "dezesseis", a: "1D", b: "3:BEFIJ", date: "01/07", time: "21h", city: "San Francisco" },
    { id: 82, stage: "dezesseis", a: "1G", b: "3:AEHIJ", date: "01/07", time: "17h", city: "Seattle" },
    { id: 83, stage: "dezesseis", a: "2K", b: "2L", date: "02/07", time: "20h", city: "Toronto" },
    { id: 84, stage: "dezesseis", a: "1H", b: "2J", date: "02/07", time: "16h", city: "Los Angeles" },
    { id: 85, stage: "dezesseis", a: "1B", b: "3:EFGIJ", date: "03/07", time: "0h", city: "Vancouver" },
    { id: 86, stage: "dezesseis", a: "1J", b: "2H", date: "03/07", time: "19h", city: "Miami" },
    { id: 87, stage: "dezesseis", a: "1K", b: "3:DEIJL", date: "03/07", time: "22h30", city: "Kansas City" },
    { id: 88, stage: "dezesseis", a: "2D", b: "2G", date: "03/07", time: "15h", city: "Dallas" },

    { id: 89, stage: "oitavas", a: "W74", b: "W77", date: "04/07", time: "18h", city: "Filadélfia" },
    { id: 90, stage: "oitavas", a: "W73", b: "W75", date: "04/07", time: "14h", city: "Houston" },
    { id: 91, stage: "oitavas", a: "W76", b: "W78", date: "05/07", time: "17h", city: "Nova York/NJ" },
    { id: 92, stage: "oitavas", a: "W79", b: "W80", date: "05/07", time: "21h", city: "Cidade do México" },
    { id: 93, stage: "oitavas", a: "W83", b: "W84", date: "06/07", time: "16h", city: "Dallas" },
    { id: 94, stage: "oitavas", a: "W81", b: "W82", date: "06/07", time: "21h", city: "Seattle" },
    { id: 95, stage: "oitavas", a: "W86", b: "W88", date: "07/07", time: "13h", city: "Atlanta" },
    { id: 96, stage: "oitavas", a: "W85", b: "W87", date: "07/07", time: "17h", city: "Vancouver" },

    { id: 97, stage: "quartas", a: "W89", b: "W90", date: "09/07", time: "17h", city: "Boston" },
    { id: 98, stage: "quartas", a: "W93", b: "W94", date: "10/07", time: "16h", city: "Los Angeles" },
    { id: 99, stage: "quartas", a: "W91", b: "W92", date: "11/07", time: "18h", city: "Miami" },
    { id: 100, stage: "quartas", a: "W95", b: "W96", date: "11/07", time: "22h", city: "Kansas City" },

    { id: 101, stage: "semi", a: "W97", b: "W98", date: "14/07", time: "16h", city: "Dallas" },
    { id: 102, stage: "semi", a: "W99", b: "W100", date: "15/07", time: "16h", city: "Atlanta" },

    { id: 103, stage: "terceiro", a: "L101", b: "L102", date: "18/07", time: "18h", city: "Miami" },
    { id: 104, stage: "final", a: "W101", b: "W102", date: "19/07", time: "16h", city: "Nova York/NJ" }
  ],

  // Visão geral do mata-mata (igual pra todos, não por seleção).
  calendar: [
    { round: "16 avos de final", dates: "29/06 a 03/07", games: 16, tv: ["Globo", "SBT", "SporTV", "CazéTV"] },
    { round: "Oitavas de final", dates: "04 a 07/07", games: 8, tv: ["Globo", "SBT", "SporTV", "CazéTV"] },
    { round: "Quartas de final", dates: "09 a 11/07", games: 4, tv: ["Globo", "SBT", "SporTV", "CazéTV"] },
    { round: "Semifinais", dates: "14 e 15/07", games: 2, tv: ["Globo", "SBT", "SporTV", "CazéTV"] },
    { round: "Disputa de 3º lugar", dates: "18/07", games: 1, tv: ["Globo", "SporTV", "CazéTV"] },
    { round: "Final", dates: "19/07", games: 1, place: "Nova York/NJ · MetLife Stadium", tv: ["Globo", "SBT", "SporTV", "CazéTV"] }
  ]

  // ELIMINAÇÃO: pra cortar os jogos futuros de uma seleção, marque a fase em que
  // ela caiu com status:"eliminado" na journey dela. O site para a jornada ali.
};

// Dados REAIS gerados pela API (gerar_bracket.js -> bracket-live.js) sobrescrevem a semente.
// Função reutilizável: o app chama de novo quando rebusca os dados ao vivo (placar etc.).
window.applyBracketLive = function (LIVE) {
  if (!LIVE) return;
  if (LIVE.groups) window.BRACKET.groups = LIVE.groups;
  if (LIVE.standings) window.BRACKET.standings = LIVE.standings;
  if (LIVE.groupsDone) window.BRACKET.groupsDone = LIVE.groupsDone;
  if (LIVE.groupsStarted) window.BRACKET.groupsStarted = LIVE.groupsStarted;
  if (LIVE.groupTable) window.BRACKET.groupTable = LIVE.groupTable;
  if (LIVE.groupMatches) window.BRACKET.groupMatches = LIVE.groupMatches;
  if (LIVE.knockout) window.BRACKET.knockout = LIVE.knockout;
  // jogos reais do Brasil na fase de grupos (resultado/ao vivo/próximo)
  if (LIVE.brGroupMatches && LIVE.brGroupMatches.length &&
      window.BRACKET.journeys && window.BRACKET.journeys.br && window.BRACKET.journeys.br[0]) {
    window.BRACKET.journeys.br[0].matches = LIVE.brGroupMatches;
  }
  // todos os jogos do Brasil (qualquer fase) p/ o card de jogo (ao vivo/próximo/último)
  if (LIVE.brMatches) window.BRACKET.brMatches = LIVE.brMatches;
  // CAMINHO 2: um time só entra no mata-mata quando o GRUPO DELE já terminou.
  // Assim cada grupo que fecha já atualiza, sem esperar todos (e evita seleção
  // pré-posicionada pela API antes do grupo dela acabar).
  if (LIVE.knockoutTeams) {
    var _kt = LIVE.knockoutTeams;
    var _gd = window.BRACKET.groupsDone || {};
    var _grp = window.BRACKET.groups || {};
    var _grpOf = function (code) { for (var g in _grp) { if (_grp[g] && _grp[g].indexOf(code) >= 0) return g; } return null; };
    var _ok = function (code) { var g = _grpOf(code); return g && _gd[g]; };
    (window.BRACKET.knockout || []).forEach(function (k) {
      var d = _kt[k.id]; if (!d) return;
      if (d.a && _ok(d.a)) k.aCode = d.a;
      if (d.b && _ok(d.b)) k.bCode = d.b;
    });
  }
  // placar / status (ao vivo, encerrado) / vencedor de cada jogo do mata-mata
  if (LIVE.koMatches) {
    var _km = LIVE.koMatches;
    (window.BRACKET.knockout || []).forEach(function (k) {
      var r = _km[k.id]; if (!r) return;
      if (r.st) k.status = r.st;
      if (r.sc) k.score = r.sc; else delete k.score;
      if (r.pen) k.pen = r.pen; else delete k.pen;
      if (r.w) k.winner = r.w; else delete k.winner;
    });
  }
  // datas/horários do mata-mata: usamos os OFICIAIS fixos (FIFA, em BRT) acima.
  // O override da API foi desligado porque a ordem dela embaralhava o horário entre
  // jogos do mesmo dia. (Mantido só venue/estádio, se a API trouxer.)
  if (false && LIVE.knockoutDates) {
    var _kd = LIVE.knockoutDates;
    (window.BRACKET.knockout || []).forEach(function (k) {
      var d = _kd[k.id]; if (!d) return;
      if (d.date) k.date = d.date;
      if (d.time) k.time = d.time;
      if (d.stadium) k.stadium = d.stadium;
    });
  }
};
window.applyBracketLive(window.BRACKET_LIVE);


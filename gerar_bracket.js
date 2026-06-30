/* ===========================================================
   NÃO ABRO MÃO — Lipy  |  GERADOR AUTOMÁTICO de dados
   Fonte CONFIÁVEL: football-data.org (API oficial).
   Preenche sozinho: teams.js (seleções) + bracket-live.js (grupos reais).
   O front-end (infográfico + "possíveis seleções") usa esses dados.

   COMO USAR:
   1) Crie uma chave grátis em https://www.football-data.org/client/register
   2) Rode (na pasta do site):
        FOOTBALL_DATA_KEY=suachave node gerar_bracket.js
      (Windows PowerShell:  $env:FOOTBALL_DATA_KEY="suachave"; node gerar_bracket.js)
   3) Pronto: teams.js e bracket-live.js são reescritos com o dado real.
      Recarregue o site.

   AUTOMÁTICO (depois): agendar este script (ex.: GitHub Action) em janela de
   jogo, commitar/republicar. O cron entra quando o site estiver hospedado.

   OBS: requer Node 18+ (usa fetch nativo). Códigos de bandeira = flagcdn (ISO-2;
   exceções gb-eng/gb-sct/gb-wls). Nomes sem mapeamento são listados no fim —
   é só me mandar a lista que eu completo o NAME2 abaixo.
   =========================================================== */

"use strict";
var fs = require("fs");
var path = require("path");

var KEY = process.env.FOOTBALL_DATA_KEY || process.argv[2];
if (!KEY) {
  console.error("Falta a chave. Use: FOOTBALL_DATA_KEY=xxxx node gerar_bracket.js");
  process.exit(1);
}
var COMP = "WC";                  // FIFA World Cup
var BASE = "https://api.football-data.org/v4";
var DIR = __dirname;

// nome (inglês, como vem da API) -> { code: bandeira flagcdn, pt: nome em PT-BR }
var NAME2 = {
  "Brazil": { code: "br", pt: "Brasil" },
  "Argentina": { code: "ar", pt: "Argentina" },
  "France": { code: "fr", pt: "França" },
  "Portugal": { code: "pt", pt: "Portugal" },
  "Spain": { code: "es", pt: "Espanha" },
  "Germany": { code: "de", pt: "Alemanha" },
  "England": { code: "gb-eng", pt: "Inglaterra" },
  "Scotland": { code: "gb-sct", pt: "Escócia" },
  "Wales": { code: "gb-wls", pt: "País de Gales" },
  "Netherlands": { code: "nl", pt: "Holanda" },
  "Belgium": { code: "be", pt: "Bélgica" },
  "Italy": { code: "it", pt: "Itália" },
  "Croatia": { code: "hr", pt: "Croácia" },
  "Switzerland": { code: "ch", pt: "Suíça" },
  "Austria": { code: "at", pt: "Áustria" },
  "Norway": { code: "no", pt: "Noruega" },
  "Sweden": { code: "se", pt: "Suécia" },
  "Denmark": { code: "dk", pt: "Dinamarca" },
  "Poland": { code: "pl", pt: "Polônia" },
  "Czech Republic": { code: "cz", pt: "República Tcheca" },
  "Czechia": { code: "cz", pt: "República Tcheca" },
  "Slovakia": { code: "sk", pt: "Eslováquia" },
  "Serbia": { code: "rs", pt: "Sérvia" },
  "Turkey": { code: "tr", pt: "Turquia" },
  "Türkiye": { code: "tr", pt: "Turquia" },
  "Greece": { code: "gr", pt: "Grécia" },
  "Georgia": { code: "ge", pt: "Geórgia" },
  "Bosnia and Herzegovina": { code: "ba", pt: "Bósnia e Herzegovina" },
  "Bosnia-Herzegovina": { code: "ba", pt: "Bósnia e Herzegovina" },
  "Cape Verde Islands": { code: "cv", pt: "Cabo Verde" },
  "Congo DR": { code: "cd", pt: "RD Congo" },
  "Ukraine": { code: "ua", pt: "Ucrânia" },
  "Portugal ": { code: "pt", pt: "Portugal" },
  "United States": { code: "us", pt: "Estados Unidos" },
  "USA": { code: "us", pt: "Estados Unidos" },
  "Mexico": { code: "mx", pt: "México" },
  "Canada": { code: "ca", pt: "Canadá" },
  "Costa Rica": { code: "cr", pt: "Costa Rica" },
  "Panama": { code: "pa", pt: "Panamá" },
  "Honduras": { code: "hn", pt: "Honduras" },
  "Jamaica": { code: "jm", pt: "Jamaica" },
  "Curaçao": { code: "cw", pt: "Curaçau" },
  "Haiti": { code: "ht", pt: "Haiti" },
  "Uruguay": { code: "uy", pt: "Uruguai" },
  "Colombia": { code: "co", pt: "Colômbia" },
  "Ecuador": { code: "ec", pt: "Equador" },
  "Paraguay": { code: "py", pt: "Paraguai" },
  "Peru": { code: "pe", pt: "Peru" },
  "Chile": { code: "cl", pt: "Chile" },
  "Bolivia": { code: "bo", pt: "Bolívia" },
  "Venezuela": { code: "ve", pt: "Venezuela" },
  "Japan": { code: "jp", pt: "Japão" },
  "South Korea": { code: "kr", pt: "Coreia do Sul" },
  "Korea Republic": { code: "kr", pt: "Coreia do Sul" },
  "IR Iran": { code: "ir", pt: "Irã" },
  "Iran": { code: "ir", pt: "Irã" },
  "Iraq": { code: "iq", pt: "Iraque" },
  "Saudi Arabia": { code: "sa", pt: "Arábia Saudita" },
  "Qatar": { code: "qa", pt: "Catar" },
  "Jordan": { code: "jo", pt: "Jordânia" },
  "Uzbekistan": { code: "uz", pt: "Uzbequistão" },
  "Australia": { code: "au", pt: "Austrália" },
  "New Zealand": { code: "nz", pt: "Nova Zelândia" },
  "Morocco": { code: "ma", pt: "Marrocos" },
  "Senegal": { code: "sn", pt: "Senegal" },
  "Tunisia": { code: "tn", pt: "Tunísia" },
  "Algeria": { code: "dz", pt: "Argélia" },
  "Egypt": { code: "eg", pt: "Egito" },
  "Ghana": { code: "gh", pt: "Gana" },
  "Ivory Coast": { code: "ci", pt: "Costa do Marfim" },
  "Côte d'Ivoire": { code: "ci", pt: "Costa do Marfim" },
  "Cameroon": { code: "cm", pt: "Camarões" },
  "Nigeria": { code: "ng", pt: "Nigéria" },
  "South Africa": { code: "za", pt: "África do Sul" },
  "DR Congo": { code: "cd", pt: "RD Congo" },
  "Cape Verde": { code: "cv", pt: "Cabo Verde" },
  "Cabo Verde": { code: "cv", pt: "Cabo Verde" },
  "Palestine": { code: "ps", pt: "Palestina" }
};

var GROUP_LETTERS = "ABCDEFGHIJKL".split("");

// faixas de IDs do chaveamento-semente por fase (bracket.js)
function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
var KO_IDS = { dezesseis: range(73, 88), oitavas: range(89, 96), quartas: range(97, 100), semi: [101, 102], terceiro: [103], final: [104] };

// ISO (UTC) -> { date:"29/06", time:"14h"|"14h30" } no horário de Brasília.
// BRT = UTC-3 fixo (o Brasil não tem horário de verão desde 2019). Cálculo MANUAL
// (não depende do timeZone do Node/ICU, que pode estar incompleto e deixar em UTC).
function pad2(n) { return (n < 10 ? "0" : "") + n; }
function brt(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  var b = new Date(d.getTime() - 3 * 3600 * 1000);   // desloca 3h pra trás
  var hh = b.getUTCHours(), mi = b.getUTCMinutes();
  return {
    date: pad2(b.getUTCDate()) + "/" + pad2(b.getUTCMonth() + 1),
    time: (mi === 0) ? (hh + "h") : (hh + "h" + pad2(mi))
  };
}

function sleep(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
function api(endpoint, _try) {
  _try = _try || 1;
  return fetch(BASE + endpoint, { headers: { "X-Auth-Token": KEY } }).then(function (r) {
    return r.text().then(function (t) {
      if (!r.ok) {
        // 429 (limite) ou 5xx (instabilidade momentânea) -> espera e tenta de novo
        if ((r.status === 429 || r.status >= 500) && _try < 4) {
          console.error("HTTP " + r.status + " (tentativa " + _try + "), repetindo...");
          return sleep(_try * 6000).then(function () { return api(endpoint, _try + 1); });
        }
        throw new Error("HTTP " + r.status + " em " + endpoint + " -> " + t.slice(0, 200));
      }
      try { return JSON.parse(t); } catch (e) { throw new Error("Resposta não-JSON de " + endpoint); }
    });
  }).catch(function (e) {
    // erro de rede (não foi HTTP) -> espera e tenta de novo
    if (_try < 4 && !/^HTTP |não-JSON/.test(String(e.message))) {
      console.error("Falha de rede (tentativa " + _try + "): " + e.message + ", repetindo...");
      return sleep(_try * 6000).then(function () { return api(endpoint, _try + 1); });
    }
    throw e;
  });
}

function mapTeam(name, unknown) {
  if (!name) return null;   // jogo do mata-mata ainda sem time (TBD) -> ignora, não loga
  var hit = NAME2[name] || NAME2[name.trim()];
  if (!hit) { unknown[name] = (unknown[name] || 0) + 1; return null; }
  return hit;
}

(function main() {
  var unknown = {};
  api("/competitions/" + COMP + "/matches")
    .then(function (data) {
      var matches = data.matches || [];
      if (!matches.length) throw new Error("A API não retornou jogos do Mundial. Pode ser que o Mundial não esteja no seu plano free, ou o calendário ainda não foi publicado. (Se persistir, a gente troca pra API-Football.)");
      var groups = {};      // { A: ["br",...] }
      var teamsByCode = {}; // code -> pt
      function add(g, team) {
        var hit = mapTeam(team && team.name, unknown);
        if (!hit) return;
        teamsByCode[hit.code] = hit.pt;
        if (g) { groups[g] = groups[g] || []; if (groups[g].indexOf(hit.code) < 0) groups[g].push(hit.code); }
      }
      matches.forEach(function (m) {
        var g = (m.stage === "GROUP_STAGE") ? (m.group || "").replace("GROUP_", "").trim() : null;
        if (g && GROUP_LETTERS.indexOf(g) < 0) g = null;
        add(g, m.homeTeam);
        add(g, m.awayTeam);
      });

      var nGroups = Object.keys(groups).length;
      var nTeams = Object.keys(teamsByCode).length;
      if (!nGroups) throw new Error("Vieram " + matches.length + " jogos, mas sem grupos com times definidos ainda (sorteio não publicado?). Tente quando os grupos estiverem montados.");

      // ---- classificação por grupo (calculada dos resultados) p/ afunilar 1º/2º/3º ----
      var tbl = {}, finByGroup = {};
      matches.forEach(function (m) {
        if (m.stage !== "GROUP_STAGE") return;
        var g = (m.group || "").replace("GROUP_", "").trim(); if (GROUP_LETTERS.indexOf(g) < 0) return;
        var hh = mapTeam(m.homeTeam && m.homeTeam.name, {}), aa = mapTeam(m.awayTeam && m.awayTeam.name, {});
        if (!hh || !aa) return;
        tbl[g] = tbl[g] || {};
        tbl[g][hh.code] = tbl[g][hh.code] || { c: hh.code, pts: 0, j: 0, v: 0, e: 0, d: 0, gf: 0, ga: 0 };
        tbl[g][aa.code] = tbl[g][aa.code] || { c: aa.code, pts: 0, j: 0, v: 0, e: 0, d: 0, gf: 0, ga: 0 };
        var sc = m.score && m.score.fullTime;
        if (m.status === "FINISHED" && sc && sc.home != null) {
          finByGroup[g] = (finByGroup[g] || 0) + 1;
          var H = tbl[g][hh.code], A = tbl[g][aa.code];
          H.j++; A.j++;
          H.gf += sc.home; H.ga += sc.away; A.gf += sc.away; A.ga += sc.home;
          if (sc.home > sc.away) { H.pts += 3; H.v++; A.d++; }
          else if (sc.home < sc.away) { A.pts += 3; A.v++; H.d++; }
          else { H.pts++; A.pts++; H.e++; A.e++; }
        }
      });
      var standings = {}, groupsDone = {}, groupsStarted = {}, groupTable = {};
      Object.keys(tbl).forEach(function (g) {
        var arr = Object.keys(tbl[g]).map(function (c) { return tbl[g][c]; });
        arr.sort(function (a, b) { return (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf); });
        standings[g] = arr.map(function (x) { return x.c; });
        groupTable[g] = arr.map(function (x) { return { c: x.c, j: x.j, v: x.v, e: x.e, d: x.d, gf: x.gf, ga: x.ga, sg: x.gf - x.ga, pts: x.pts }; });
        groupsDone[g] = (finByGroup[g] || 0) >= 6;
        groupsStarted[g] = (finByGroup[g] || 0) > 0;   // já tem resultado -> dá pra mostrar "provável"
      });
      // mapa código -> grupo, p/ liberar cada seleção no mata-mata quando o grupo DELA terminar
      var codeToGroup = {};
      Object.keys(groups).forEach(function (g) { (groups[g] || []).forEach(function (c) { codeToGroup[c] = g; }); });

      // ---- coloca os times do mata-mata no JOGO CERTO da grade oficial ----
      // Casa cada jogo da API com o nosso ID pelo DIA+HORÁRIO (BRT) — único e igual à
      // grade oficial. (Antes era pela ordem cronológica, o que punha o time no horário
      // errado, pois nossa numeração não segue a ordem do calendário.)
      var KO_SCHEDULE = {
        "28/06|16h": 73, "29/06|17h30": 74, "29/06|22h": 75, "29/06|14h": 76,
        "30/06|18h": 77, "30/06|14h": 78, "30/06|22h": 79, "01/07|13h": 80,
        "01/07|21h": 81, "01/07|17h": 82, "02/07|20h": 83, "02/07|16h": 84,
        "03/07|0h": 85, "03/07|19h": 86, "03/07|22h30": 87, "03/07|15h": 88,
        "04/07|18h": 89, "04/07|14h": 90, "05/07|17h": 91, "05/07|21h": 92,
        "06/07|16h": 93, "06/07|21h": 94, "07/07|13h": 95, "07/07|17h": 96,
        "09/07|17h": 97, "10/07|16h": 98, "11/07|18h": 99, "11/07|22h": 100,
        "14/07|16h": 101, "15/07|16h": 102, "18/07|18h": 103, "19/07|16h": 104
      };
      var koDates = {}, koTeams = {}, koMatches = {}, koUnmatched = [];
      matches.forEach(function (m) {
        if (!m.stage || m.stage === "GROUP_STAGE") return;
        var t = brt(m.utcDate); if (!t) return;
        var id = KO_SCHEDULE[t.date + "|" + t.time];
        if (!id) { koUnmatched.push(t.date + " " + t.time + " (" + m.stage + ")"); return; }
        if (m.venue) koDates[id] = { date: t.date, time: t.time, stadium: m.venue };
        // CAMINHO 2: grava o time só se o GRUPO dele já terminou (atualiza grupo a grupo)
        var hh = mapTeam(m.homeTeam && m.homeTeam.name, {}), aa = mapTeam(m.awayTeam && m.awayTeam.name, {});
        var okH = hh && groupsDone[codeToGroup[hh.code]];
        var okA = aa && groupsDone[codeToGroup[aa.code]];
        if (okH || okA) { koTeams[id] = {}; if (okH) koTeams[id].a = hh.code; if (okA) koTeams[id].b = aa.code; }
        // placar / status (ao vivo, encerrado) / vencedor do jogo do mata-mata
        var st = (m.status === "FINISHED") ? "finalizado" : ((m.status === "IN_PLAY" || m.status === "PAUSED" || m.status === "LIVE") ? "aovivo" : "confirmado");
        var rec = { st: st };
        var ft = m.score && m.score.fullTime;
        if (ft && ft.home != null && ft.away != null) {
          var dur = m.score && m.score.duration, pen = m.score && m.score.penalties;
          var temPen = pen && pen.home != null && pen.away != null;
          var fin = m.status === "FINISHED" && hh && aa;
          if (dur === "PENALTY_SHOOTOUT" && temPen) {
            // a API soma os pênaltis no fullTime -> tira pra ter o placar normal (sempre empate)
            var nh = ft.home - pen.home, na = ft.away - pen.away;
            if (nh < 0 || na < 0) { nh = ft.home; na = ft.away; }   // se o fullTime já vinha sem os pênaltis
            rec.sc = nh + "-" + na;
            rec.pen = pen.home + "-" + pen.away;
            if (fin) rec.w = pen.home > pen.away ? hh.code : (pen.away > pen.home ? aa.code : null);
          } else {
            rec.sc = ft.home + "-" + ft.away;
            if (dur === "EXTRA_TIME") rec.aet = true;   // foi pra prorrogação (decidido lá, sem pênaltis)
            if (fin) rec.w = ft.home > ft.away ? hh.code : (ft.away > ft.home ? aa.code : null);
          }
        }
        koMatches[id] = rec;
      });

      // ---- jogos do BRASIL (todas as fases): resultado / ao vivo / próximo ----
      function statusOf(s) { return s === "FINISHED" ? "finalizado" : (s === "IN_PLAY" || s === "PAUSED" || s === "LIVE" ? "aovivo" : "confirmado"); }
      function brObj(m) {
        var hh = mapTeam(m.homeTeam && m.homeTeam.name, {}), aa = mapTeam(m.awayTeam && m.awayTeam.name, {});
        var brHome = hh && hh.code === "br", opp = brHome ? aa : hh;
        var t = brt(m.utcDate), o = { stage: m.stage, date: t ? t.date : "", time: t ? t.time : "", opp: opp ? opp.pt : "", oppCode: opp ? opp.code : "", status: statusOf(m.status) };
        var sc = m.score && m.score.fullTime;
        if (sc && sc.home != null && sc.away != null) {
          var bh = brHome ? sc.home : sc.away, bo = brHome ? sc.away : sc.home;
          o.score = bh + "-" + bo; o.result = bh > bo ? "v" : (bh < bo ? "d" : "e");
        }
        return o;
      }
      var brSrc = matches.filter(function (m) {
        var hh = mapTeam(m.homeTeam && m.homeTeam.name, {}), aa = mapTeam(m.awayTeam && m.awayTeam.name, {});
        return (hh && hh.code === "br") || (aa && aa.code === "br");
      }).sort(function (a, b) { return new Date(a.utcDate) - new Date(b.utcDate); });
      var brMatches = brSrc.map(brObj);
      // subconjunto da fase de grupos (mantém o formato da jornada)
      var brGroupMatches = brMatches.filter(function (o) { return o.stage === "GROUP_STAGE"; })
        .map(function (o) { var c = { date: o.date, time: o.time, opp: o.opp, oppCode: o.oppCode, status: o.status }; if (o.score) { c.score = o.score; c.result = o.result; } return c; });

      // ---- jogos de TODOS os grupos (pra tela "Os grupos"): resultado / ao vivo / próximo ----
      var groupMatches = {};
      matches.forEach(function (m) {
        if (m.stage !== "GROUP_STAGE") return;
        var g = (m.group || "").replace("GROUP_", "").trim(); if (GROUP_LETTERS.indexOf(g) < 0) return;
        var hh = mapTeam(m.homeTeam && m.homeTeam.name, {}), aa = mapTeam(m.awayTeam && m.awayTeam.name, {});
        if (!hh || !aa) return;
        var t = brt(m.utcDate);
        var o = { d: t ? t.date : "", t: t ? t.time : "", hc: hh.code, hn: hh.pt, ac: aa.code, an: aa.pt, st: statusOf(m.status) };
        var sc = m.score && m.score.fullTime;
        if (sc && sc.home != null && sc.away != null) o.sc = sc.home + "-" + sc.away;
        (groupMatches[g] = groupMatches[g] || []).push({ o: o, ts: new Date(m.utcDate).getTime() });
      });
      Object.keys(groupMatches).forEach(function (g) {
        groupMatches[g].sort(function (a, b) { return a.ts - b.ts; });
        groupMatches[g] = groupMatches[g].map(function (x) { return x.o; });
      });

      // ---- escreve bracket-live.js (grupos + datas + jogos do Brasil; o front faz merge) ----
      var liveOut =
        "// GERADO AUTOMATICAMENTE por gerar_bracket.js — NÃO editar à mão.\n" +
        "// Fonte: football-data.org. " + new Date().toISOString() + "\n" +
        "window.BRACKET_LIVE = {\n" +
        "  groups: " + JSON.stringify(groups, null, 2) + ",\n" +
        "  standings: " + JSON.stringify(standings, null, 2) + ",\n" +
        "  groupsDone: " + JSON.stringify(groupsDone, null, 2) + ",\n" +
        "  groupsStarted: " + JSON.stringify(groupsStarted, null, 2) + ",\n" +
        "  groupTable: " + JSON.stringify(groupTable, null, 2) + ",\n" +
        "  groupMatches: " + JSON.stringify(groupMatches, null, 2) + ",\n" +
        "  knockoutDates: " + JSON.stringify(koDates, null, 2) + ",\n" +
        "  knockoutTeams: " + JSON.stringify(koTeams, null, 2) + ",\n" +
        "  koMatches: " + JSON.stringify(koMatches, null, 2) + ",\n" +
        "  brGroupMatches: " + JSON.stringify(brGroupMatches, null, 2) + ",\n" +
        "  brMatches: " + JSON.stringify(brMatches, null, 2) + "\n};\n";
      fs.writeFileSync(path.join(DIR, "bracket-live.js"), liveOut, "utf8");

      // ---- reescreve teams.js (campo real, ordem alfabética PT, Brasil padrão) ----
      var arr = Object.keys(teamsByCode).map(function (code) { return { name: teamsByCode[code], code: code }; });
      arr.sort(function (a, b) { return a.name.localeCompare(b.name, "pt-BR"); });
      var teamsOut =
        "// Seleções do Mundial — GERADO por gerar_bracket.js (football-data.org).\n" +
        "// `code` = bandeira flagcdn.com. Status/form viram reais quando o gerador\n" +
        "// passar a ler resultados; por ora ficam neutros.\n" +
        "window.TEAMS = [\n" +
        arr.map(function (t) {
          var st = t.code === "br" ? "Classificado" : "Fase de grupos";
          return '  { name: "' + t.name + '", code: "' + t.code + '", status: "' + st + '", form: [] }';
        }).join(",\n") +
        "\n];\n\nwindow.DEFAULT_TEAM = \"br\";\n";
      fs.writeFileSync(path.join(DIR, "teams.js"), teamsOut, "utf8");

      console.log("OK: " + nGroups + " grupos, " + nTeams + " seleções, " + Object.keys(koDates).length + " jogos do mata-mata com data.");
      console.log(" -> bracket-live.js e teams.js atualizados.");
      if (koUnmatched.length) { console.log("⚠ Jogos do mata-mata sem dia/horário na grade oficial (confira o KO_SCHEDULE):"); koUnmatched.forEach(function (l) { console.log("   - " + l); }); }
      var miss = Object.keys(unknown);
      if (miss.length) {
        console.log("\n⚠ Sem mapeamento (me mande esta lista p/ eu completar o NAME2):");
        miss.forEach(function (n) { console.log("   - " + n); });
      }
    })
    .catch(function (e) { console.error("ERRO:", e.message); process.exitCode = 1; });
})();

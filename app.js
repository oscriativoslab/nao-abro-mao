/* ===========================================================
   NÃO ABRO MÃO — Lipy  |  lógica da home (escolha de torcida)
   =========================================================== */
(function () {
  "use strict";

  var TEAMS = window.TEAMS || [];
  var STORAGE_KEY = "naomao_team";

  // ---- helpers ----
  function flagUrl(code) {
    return "https://flagcdn.com/" + code + ".svg";
  }
  function indexByCode(code) {
    for (var i = 0; i < TEAMS.length; i++) if (TEAMS[i].code === code) return i;
    return -1;
  }
  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function saveTeam(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  }
  function loadTeam() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveScreen(s) { try { localStorage.setItem("naomao_screen", s); } catch (e) {} }
  function loadScreen() { try { return localStorage.getItem("naomao_screen"); } catch (e) { return null; } }

  // ---- estado ----
  // App focado no Brasil (campanha "não abro mão do Brasil").
  var current = indexByCode("br");
  if (current < 0) current = 0;

  // Frases do gag ao tentar trocar de seleção (variação).
  var FUNNY = [
    "Pode tentar... mas aqui a gente não abre mão do Brasil.",
    "Essa não, hein? É verde e amarelo até o fim!",
    "Outro time? Aqui é Brasil, parça! 🇧🇷",
    "Pode procurar... mas a gente só torce pro Brasil! 🐊",
    "Tá doido? Não abro mão da Seleção!",
    "Calma, traíra! Aqui é Brasil ou nada. 😂"
  ];

  // ---- elementos ----
  var el = {
    flag: document.getElementById("team-flag"),
    name: document.getElementById("team-name"),
    status: document.getElementById("team-status"),
    form: document.getElementById("team-form"),
    quip: document.getElementById("team-quip"),
    homeScore: document.getElementById("team-score"),
    teamCard: document.getElementById("team-card"),
    peekPrev: document.getElementById("peek-prev"),
    peekNext: document.getElementById("peek-next"),
    journeyTrack: document.getElementById("journey-track"),
    // navegação
    prev: document.getElementById("btn-prev"),
    next: document.getElementById("btn-next"),
    cta: document.getElementById("btn-cta"),
    // busca
    pesquisar: document.getElementById("btn-pesquisar"),
    overlay: document.getElementById("search-overlay"),
    closeSearch: document.getElementById("btn-close-search"),
    input: document.getElementById("search-input"),
    list: document.getElementById("search-list"),
    // telas
    screenHome: document.getElementById("screen-home"),
    screenJourney: document.getElementById("screen-journey"),
    back: document.getElementById("btn-back"),
    journeySearch: document.getElementById("btn-journey-search"),
    journeyFlag: document.getElementById("journey-flag"),
    journeyName: document.getElementById("journey-name"),
    jrnNext: document.getElementById("jrn-next"),
    jrnNav: document.getElementById("jrn-nav"),
    jrnTrack: document.getElementById("jrn-track"),
    jrnSlider: document.getElementById("jrn-slider"),
    jrnCounter: document.getElementById("jrn-counter"),
    prevPhase: document.getElementById("jrn-prev-phase"),
    nextPhase: document.getElementById("jrn-next-phase"),
    popup: document.getElementById("jrn-popup"),
    popupClose: document.getElementById("popup-close"),
    btnOverview: document.getElementById("btn-overview"),
    screenOverview: document.getElementById("screen-overview"),
    ovBack: document.getElementById("ov-back"),
    ovList: document.getElementById("ov-list"),
    funny: document.getElementById("funny"),
    funnyDim: document.getElementById("funny-dim"),
    funnyClose: document.getElementById("funny-close"),
    funnyText: document.getElementById("funny-text"),
    funnyMascot: document.getElementById("funny-mascot"),
    mascotStage: document.getElementById("mascot-stage")
  };

  var lastPose = "frente";
  var preGagPose = "frente";
  var walkTimer = null;
  var gagOpen = false;   // trava reações (scroll/slide) enquanto o gag está aberto
  var userMoved = false; // usuário arrastou o mascote -> não reposiciona sozinho até trocar de tela

  // mascote é UM elemento persistente (não recria, não some)
  function ensureChar() {
    if (!el.mascotStage) return null;
    var c = el.mascotStage.querySelector(".mascot-char");
    if (!c) {
      el.mascotStage.innerHTML = '<div class="mascot-char"><div class="mascot-inner"><img class="mascot-img" alt="mascote Lipy"><span class="mascot-fb" style="display:none">' + MASCOT_SVG + '</span></div></div>';
      c = el.mascotStage.querySelector(".mascot-char");
      var img = c.querySelector("img");
      img.onerror = function () {
        if (!this.dataset.fb) { this.dataset.fb = "1"; this.src = "assets/mascote-frente.png"; }
        else { this.style.display = "none"; this.nextElementSibling.style.display = "block"; }
      };
    }
    return c;
  }
  function setPose(pose) {
    var c = ensureChar(); if (!c) return;
    var img = c.querySelector("img");
    img.style.display = ""; if (img.nextElementSibling) img.nextElementSibling.style.display = "none";
    delete img.dataset.fb; img.src = "assets/mascote-" + pose + ".png";
    lastPose = pose;
  }
  function faceLeft(on) { var c = ensureChar(); if (c) c.style.transform = on ? "scaleX(-1)" : "scaleX(1)"; }
  function walking(on) { var c = ensureChar(); if (c) c.classList.toggle("walking", !!on); }
  function clearPos(c) { c.style.left = ""; c.style.right = ""; c.style.top = ""; c.style.bottom = ""; }
  function setStage(pos) {
    if (!el.mascotStage) return;
    el.mascotStage.classList.remove("on-home", "on-journey", "on-overview", "gag");
    el.mascotStage.classList.add(pos);
  }
  function mcCenter() { var w = (el.mascotStage && el.mascotStage.clientWidth) || 440; return Math.round((w - 150) / 2) + "px"; }
  function mcRight() { var w = (el.mascotStage && el.mascotStage.clientWidth) || 440; return (w - 150 + 6) + "px"; } // encostado à direita
  var MC_H = 188; // altura aproximada do mascote (px) p/ calcular posição vertical
  // HOME: à esquerda, apontando pro Brasil, entre o nome e o botão
  function placeHome() {
    var c = ensureChar(); if (!c) return;
    setStage("on-home"); clearPos(c); faceLeft(false);
    c.style.left = "-22px";
    setPose("apontando");
    positionHomeMascot();
  }
  function ovTop() { var vh = window.innerHeight || 780; return Math.max(vh - MC_H - 8, 60); }
  function placeOverview(instant) {
    var c = ensureChar(); if (!c) return;
    setStage("on-overview"); faceLeft(false);
    c.style.right = "auto"; c.style.bottom = "auto";
    if (instant) c.style.transition = "none";
    c.style.left = mcRight(); c.style.top = ovTop() + "px";
    if (instant) { void c.offsetWidth; c.style.transition = ""; }
    setPose("frente");
  }
  // entrada no mata-mata: anda da posição da HOME até o canto (igual a jornada)
  function overviewEnter(fromLeft, fromTop) {
    var c = ensureChar(); if (!c) return;
    clearTimeout(crossT1); clearTimeout(crossT2);
    var startLeft = fromLeft || "-170px";
    var startTop = fromTop || (ovTop() + "px");
    c.style.transition = "none"; c.style.right = "auto"; c.style.bottom = "auto"; c.style.top = startTop; c.style.left = startLeft;
    faceLeft(parseFloat(mcRight()) < parseFloat(startLeft));
    walking(true); setPose("andando");
    crossT1 = setTimeout(function () { c.style.transition = ""; c.style.top = ovTop() + "px"; c.style.left = mcRight(); }, 24);
    crossT2 = setTimeout(function () { walking(false); faceLeft(false); setPose("frente"); }, 600);
  }
  function positionHomeMascot() {
    if (!el.mascotStage || !el.mascotStage.classList.contains("on-home")) return;
    var c = el.mascotStage.querySelector(".mascot-char");
    if (!c || !el.name || !el.cta) return;
    var nameR = el.name.getBoundingClientRect();
    var ctaR = el.cta.getBoundingClientRect();
    var h = 188;
    var top = nameR.bottom + ((ctaR.top - nameR.bottom) - h) / 2;
    if (top < nameR.bottom + 4) top = nameR.bottom + 4;
    c.style.top = Math.round(top) + "px";
    c.style.bottom = "auto";
  }
  // JORNADA: âncora vertical conforme o scroll.
  // No topo -> ao lado do "próximo jogo", pose esperando.
  // Rolou pra baixo -> desce até os cards das fases, pose de contexto.
  function jrnAnchorTop() {
    var vh = window.innerHeight || 800;
    var sR = el.jrnSlider ? el.jrnSlider.getBoundingClientRect() : null;
    if (sR && sR.top < vh * 0.45) {
      var top = Math.round(sR.top) - 24;
      if (top < 60) top = 60;
      if (top > vh - MC_H - 10) top = vh - MC_H - 10;
      return { top: top, pose: mascotPoseForSlide(slideIndex) };
    }
    var nR = el.jrnNext ? el.jrnNext.getBoundingClientRect() : null;
    var ntop = nR ? Math.round(nR.top) + 18 : Math.round(vh * 0.26);
    return { top: ntop, pose: "esperando" };
  }
  var crossT1 = null, crossT2 = null;
  // posiciona parado na âncora atual (à direita)
  function journeyRest(instant) {
    var c = ensureChar(); if (!c) return;
    clearTimeout(crossT1); clearTimeout(crossT2);
    var a = jrnAnchorTop();
    if (instant) c.style.transition = "none";
    c.style.right = "auto"; c.style.bottom = "auto"; c.style.left = mcRight(); c.style.top = a.top + "px";
    if (instant) { void c.offsetWidth; c.style.transition = ""; }
    walking(false); faceLeft(false); setPose(a.pose);
  }
  // troca de fase: CRUZA a tela toda andando (vai até a ponta esquerda e volta pra direita),
  // sempre virado pra direção do passo; só troca pra pose final quando para.
  function walkCross(dir) {
    var c = ensureChar(); if (!c) return;
    clearTimeout(crossT1); clearTimeout(crossT2);
    var a = jrnAnchorTop();
    c.style.transition = ""; c.style.right = "auto"; c.style.bottom = "auto"; c.style.top = a.top + "px";
    walking(true); setPose("andando");
    faceLeft(true); c.style.left = "8px";                                  // cruza pra esquerda, virado pra esquerda
    crossT1 = setTimeout(function () { faceLeft(false); c.style.left = mcRight(); }, 470); // volta pra direita (após chegar na ponta)
    crossT2 = setTimeout(function () { walking(false); faceLeft(false); setPose(jrnAnchorTop().pose); }, 950); // andando até parar; pose final só no fim
  }
  // entrada na jornada: parte da posição em que ele estava na HOME (mesma altura) e
  // vai subindo/andando fluido até a âncora da jornada. (setTimeout em vez de FLIP — confiável no mobile)
  function journeyEnter(fromLeft, fromTop) {
    var c = ensureChar(); if (!c) return;
    clearTimeout(crossT1); clearTimeout(crossT2);
    var a = jrnAnchorTop();
    var startLeft = fromLeft || "-170px";
    var startTop = fromTop || (a.top + "px");
    c.style.transition = "none"; c.style.right = "auto"; c.style.bottom = "auto"; c.style.top = startTop; c.style.left = startLeft;
    faceLeft(parseFloat(mcRight()) < parseFloat(startLeft)); // vira pra direção do destino
    walking(true); setPose("andando");
    crossT1 = setTimeout(function () {
      c.style.transition = "";
      c.style.top = a.top + "px";   // sobe fluido até a altura da jornada
      c.style.left = mcRight();     // e anda até a direita
    }, 24);
    crossT2 = setTimeout(function () { walking(false); faceLeft(false); setPose(jrnAnchorTop().pose); }, 600);
  }

  var BRACKET = window.BRACKET || {};

  // Frases divertidas por torcida (aparecem na home ao selecionar)
  var QUIPS = {
    br: "o único penta 🏆",
    ar: "muchaaaachos",
    fr: "allez les bleus",
    pt: "e o Cristiano, hein?",
    "gb-eng": "it's coming home?",
    de: "máquina alemã",
    es: "tiki-taka",
    nl: "laranja mecânica",
    uy: "garra charrúa",
    us: "host com pressão"
  };

  // Mascote (placeholder do jacaré da Lipy — trocar pelo rig depois)
  var MASCOT_SVG = '<svg viewBox="0 0 70 70" aria-hidden="true"><ellipse cx="34" cy="50" rx="22" ry="15" fill="#8c8c8c"/><rect x="40" y="42" width="28" height="13" rx="6" fill="#8c8c8c"/><rect x="44" y="52" width="22" height="4" rx="2" fill="#fff"/><circle cx="30" cy="36" r="8" fill="#8c8c8c"/><circle cx="30" cy="35" r="4" fill="#fff"/><circle cx="31" cy="36" r="2" fill="#1A1420"/><path d="M14 30 Q30 16 50 26 L48 33 Q30 24 18 36 Z" fill="#FFC01F"/></svg>';
  // Usa o PNG real do mascote se existir em assets/; senão, cai pro SVG placeholder.
  // poses: frente | andando | comemorando | apontando | triste
  function mascotPose(pose) {
    // se a pose não existir, cai pro frente; se nem isso, mostra o SVG.
    var onerr = "if(!this.dataset.fb){this.dataset.fb='1';this.src='assets/mascote-frente.png';}else{this.style.display='none';this.nextElementSibling.style.display='block';}";
    return '<img class="mascot-img" src="assets/mascote-' + pose + '.png" alt="mascote Lipy" onerror="' + onerr + '">' +
      '<span class="mascot-fb" style="display:none">' + MASCOT_SVG + '</span>';
  }
  function mascotHTML() { return mascotPose("frente"); }

  // ---- render da torcida selecionada ----
  function render() {
    var t = TEAMS[current];
    var prevT = TEAMS[(current - 1 + TEAMS.length) % TEAMS.length];
    var nextT = TEAMS[(current + 1) % TEAMS.length];
    el.flag.src = flagUrl(t.code);
    el.flag.alt = "Bandeira " + t.name;
    // prévia fixa só pra dar a ideia de "trocar" (cai no gag): esquerda Alemanha, direita Argentina
    el.peekPrev.src = flagUrl("de");
    el.peekNext.src = flagUrl("ar");
    el.name.textContent = t.name.toUpperCase();

    var isGroup = t.status !== "Classificado";
    el.status.className = "team__status" + (isGroup ? " is-group" : "");
    el.status.querySelector("i").className = isGroup ? "ti ti-clock" : "ti ti-checks";
    el.status.querySelector("span").textContent = t.status;

    // forma recente (chips V/E/D); some quando não há dados
    el.form.innerHTML = "";
    if (t.form && t.form.length) {
      var lbl = document.createElement("span");
      lbl.className = "lbl";
      lbl.textContent = "ÚLTIMOS JOGOS";
      el.form.appendChild(lbl);
      t.form.forEach(function (r) {
        var k = ["v", "e", "d"].indexOf(r) >= 0 ? r : "e";
        var c = document.createElement("span");
        c.className = "chip " + k;
        c.textContent = String(r).toUpperCase();
        el.form.appendChild(c);
      });
      el.form.style.display = "flex";
    } else {
      el.form.style.display = "none";
    }

    el.quip.textContent = QUIPS[t.code] || "";
    renderHomeScore();

    // re-dispara a animação de troca
    el.teamCard.style.animation = "none";
    void el.teamCard.offsetWidth;
    el.teamCard.style.animation = "";

    saveTeam(t.code);
  }

  // placar na home: ao vivo se tiver jogo rolando; senão o último resultado do Brasil
  function renderHomeScore() {
    if (!el.homeScore) return;
    var all = getBrMatches();
    var live = all.filter(function (m) { return m.status === "aovivo"; })[0];
    var isLive = !!live, m = live;
    if (!m) { var fin = all.filter(function (x) { return x.status === "finalizado"; }); m = fin[fin.length - 1]; }
    if (!m) { el.homeScore.style.display = "none"; return; }
    el.homeScore.className = "team__score" + (isLive ? " is-live" : "");
    el.homeScore.innerHTML =
      '<span class="ts-tag">' + (isLive ? '<span class="live-dot"></span> ao vivo' : 'último resultado') + '</span>' +
      '<span class="ts-row"><img class="ts-flag" src="' + flagUrl("br") + '" alt="">' +
      '<b class="ts-score">' + (m.score || "0-0") + '</b>' +
      (m.oppCode ? '<img class="ts-flag" src="' + flagUrl(m.oppCode) + '" alt="">' : '<span>' + (m.opp || "") + '</span>') +
      '</span>';
    el.homeScore.style.display = "";
  }

  // Retorna a frase completa: "do Brasil", "da França", "dos Estados Unidos".
  function artigo(name) {
    var fem = ["França", "Espanha", "Holanda", "Argentina", "Austrália", "Áustria",
               "Bélgica", "Colômbia", "Coreia do Sul", "Croácia", "Noruega", "Suécia",
               "Suíça", "Tunísia", "Turquia", "Nova Zelândia", "Costa do Marfim",
               "Bósnia e Herzegovina", "Arábia Saudita", "África do Sul", "RD Congo",
               "República Tcheca", "Jordânia"];
    var plural = { "Estados Unidos": "dos" };
    if (plural[name]) return plural[name] + " " + name;
    if (fem.indexOf(name) >= 0) return "da " + name;
    return "do " + name;
  }

  function renderJourneyTeaser() {
    // teaser estático por enquanto (vai refletir os dados reais com o bracket.json)
    var cells = [
      { label: "grupos", node: "done" },
      { label: "16", node: "now" },
      { label: "8ª", node: "" },
      { label: "4ª", node: "" },
      { label: "final", node: "cup" }
    ];
    var segDone = [true, false, false, false];
    var html = "";
    cells.forEach(function (c, i) {
      var inner = c.node === "cup" ? '<span class="node cup"><i class="ti ti-trophy"></i></span>' : '<span class="node ' + c.node + '"></span>';
      html += '<div class="jt-cell">' + inner + '<span class="jt-lbl">' + c.label + '</span></div>';
      if (i < cells.length - 1) html += '<span class="seg' + (segDone[i] ? ' done" ' : '"') + '></span>';
    });
    el.journeyTrack.innerHTML = html;
  }

  // ---- navegação entre seleções ----
  // Brasil é fixo: tentar trocar dispara a brincadeira.
  function go(delta) { showFunny(); }
  function trySetTeam(code) {
    if (code !== "br") { showFunny(); return false; }
    return true;
  }
  // trava a rolagem da página (mobile inclusive) enquanto o gag está aberto
  function lockScroll(on) {
    document.body.style.overflow = on ? "hidden" : "";
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.touchAction = on ? "none" : "";
  }
  document.addEventListener("touchmove", function (e) { if (gagOpen) e.preventDefault(); }, { passive: false });

  // posiciona o mascote no gag: centralizado, com a metade de baixo atrás do quadro
  function gagTop() {
    var box = el.funny.querySelector(".funny__box");
    var r = box ? box.getBoundingClientRect() : null;
    if (!r) return Math.round((window.innerHeight || 800) * 0.18);
    return Math.round(r.top - MC_H + 86); // ~86px do corpo somem atrás do quadro
  }
  function showFunny() {
    el.funnyText.textContent = FUNNY[Math.floor(Math.random() * FUNNY.length)];
    preGagPose = lastPose;
    gagOpen = true;
    lockScroll(true);                       // trava a rolagem da página
    clearTimeout(scrollTimer);              // evita que um settle pendente do scroll troque a pose no meio do gag
    clearTimeout(crossT1); clearTimeout(crossT2);   // cancela qualquer cruzar de fase em andamento
    if (el.funnyDim) el.funnyDim.classList.add("is-open");
    el.funny.classList.add("is-open");      // quadro aparece (mede a posição dele)
    var c = ensureChar();
    if (c) {
      el.mascotStage.classList.add("gag");  // entre o escurecido (atrás) e o quadro (na frente)
      var cur = c.offsetLeft;               // posição atual (home: esquerda / jornada: direita)
      var target = parseFloat(mcCenter());
      c.style.transition = "";              // garante a transição ativa (desliza, não teleporta)
      c.style.right = "auto"; c.style.bottom = "auto";
      faceLeft(target < cur);               // anda na direção do alvo (a partir de ONDE ele está)
      walking(true); setPose("andando");
      c.style.top = gagTop() + "px";
      c.style.left = mcCenter();
      clearTimeout(walkTimer);
      walkTimer = setTimeout(function () { walking(false); faceLeft(false); setPose("confiante"); }, 460); // pose final pouco antes de parar
    }
  }
  function closeFunny() {
    gagOpen = false;
    lockScroll(false);                      // libera a rolagem
    clearTimeout(walkTimer); clearTimeout(crossT1); clearTimeout(crossT2);
    el.funny.classList.remove("is-open");
    if (el.funnyDim) el.funnyDim.classList.remove("is-open");
    if (el.mascotStage) el.mascotStage.classList.remove("gag");
    var c = ensureChar(); if (!c) return;
    var onHome = el.mascotStage.classList.contains("on-home");
    var onJourney = el.mascotStage.classList.contains("on-journey");
    if (!onHome && !onJourney) { placeOverview(); return; }   // overview não dispara gag; segurança
    // volta ANDANDO da posição do gag até a posição final
    c.style.transition = ""; c.style.right = "auto"; c.style.bottom = "auto";
    var curLeft = parseFloat(mcCenter());   // no gag ele está sempre no centro (offsetLeft congela no preview)
    var targetLeft, finalPose;
    if (onHome) {
      positionHomeMascot();                 // ajusta o top do ponto da home
      targetLeft = -22; finalPose = "apontando";
    } else {
      var a = jrnAnchorTop(); c.style.top = a.top + "px";
      targetLeft = parseFloat(mcRight()); finalPose = a.pose;
    }
    faceLeft(targetLeft < curLeft);         // vira pra direção da volta
    walking(true); setPose("andando");
    c.style.left = onHome ? "-22px" : mcRight();
    walkTimer = setTimeout(function () { walking(false); faceLeft(false); setPose(finalPose); }, 480);
  }

  // ---- overlay de busca ----
  function openSearch() {
    el.overlay.classList.add("is-open");
    el.overlay.setAttribute("aria-hidden", "false");
    el.input.value = "";
    buildList("");
    setTimeout(function () { el.input.focus(); }, 50);
  }
  function closeSearch() {
    el.overlay.classList.remove("is-open");
    el.overlay.setAttribute("aria-hidden", "true");
  }
  function buildList(query) {
    var q = normalize(query);
    var frag = document.createDocumentFragment();
    var count = 0;
    for (var i = 0; i < TEAMS.length; i++) {
      var t = TEAMS[i];
      if (q && normalize(t.name).indexOf(q) < 0) continue;
      count++;
      var btn = document.createElement("button");
      btn.className = "search-item" + (i === current ? " is-selected" : "");
      btn.innerHTML = '<img src="' + flagUrl(t.code) + '" alt=""><span>' + t.name + "</span>";
      (function (idx) {
        btn.addEventListener("click", function () {
          closeSearch();
          if (!trySetTeam(TEAMS[idx].code)) return;
          render();
          if (el.screenJourney.classList.contains("is-active")) showJourney();
        });
      })(i);
      frag.appendChild(btn);
    }
    el.list.innerHTML = "";
    if (count === 0) {
      var empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent = "Nenhuma seleção encontrada.";
      el.list.appendChild(empty);
    } else {
      el.list.appendChild(frag);
    }
  }

  // ---- Mapa da Jornada ----
  function findMatchWithSlot(slot) {
    var k = BRACKET.knockout || [];
    for (var i = 0; i < k.length; i++) if (k[i].a === slot || k[i].b === slot) return k[i];
    return null;
  }
  function brBaseSlot() {
    var gr = BRACKET.groups || {}, g = null;
    for (var key in gr) { if ((gr[key] || []).indexOf("br") >= 0) { g = key; break; } }
    if (!g) return null;
    var st = BRACKET.standings && BRACKET.standings[g];
    var pos = (st && st.indexOf("br") >= 0) ? st.indexOf("br") + 1 : 1;
    if (pos > 2) pos = 1;
    return pos + g;
  }
  // jornada do Brasil traçada na CHAVE OFICIAL (datas/cidades reais; adversário vem do slot)
  function brBracketJourney() {
    var grupos = (BRACKET.journeys && BRACKET.journeys.br && BRACKET.journeys.br[0])
      ? BRACKET.journeys.br[0] : { stage: "grupos", status: "andamento", matches: [] };
    var phases = [grupos];
    var slot = brBaseSlot();
    var m = slot ? findMatchWithSlot(slot) : null, guard = 0;
    while (m && guard++ < 8) {
      var oppSlot = (m.a === slot) ? m.b : m.a;
      phases.push({
        stage: m.stage, status: "possivel", date: m.date, time: m.time, city: m.city,
        scenarios: [{ date: m.date, time: m.time, city: m.city, stadium: m.stadium, opp: slotInfo(oppSlot).label, slot: oppSlot }]
      });
      slot = "W" + m.id;
      m = findMatchWithSlot(slot);
    }
    return phases;
  }
  function getJourney(code) {
    if (code === "br") return brBracketJourney();
    if (BRACKET.journeys && BRACKET.journeys[code]) return BRACKET.journeys[code];
    return (BRACKET.stagesOrder || []).map(function (s) {
      if (s === "grupos") return { stage: "grupos", status: "andamento", matches: [] };
      var d = (BRACKET.defaults && BRACKET.defaults[s]) || {};
      return { stage: s, status: "possivel", date: d.date || "a definir", city: d.city || "a definir", tv: d.tv || [], scenarios: [{ opp: "a definir" }] };
    });
  }
  function tvLine(tv) { return (tv && tv.length) ? tv.join(" · ") : ""; }

  // Dia da semana abreviado a partir de "DD/MM" (ano 2026). Em range usa o 1º dia.
  var WD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  function weekday(dateStr) {
    if (!dateStr) return "";
    var mm = dateStr.match(/\/(\d{1,2})/);
    var dd = dateStr.match(/(\d{1,2})/);
    if (!mm || !dd) return "";
    var d = new Date(2026, parseInt(mm[1], 10) - 1, parseInt(dd[1], 10));
    return WD[d.getDay()] || "";
  }
  function dateDay(dateStr) {
    var wd = weekday(dateStr);
    return wd ? (wd + " " + dateStr) : (dateStr || "");
  }
  function currentStageIndex(j) {
    for (var i = 0; i < j.length; i++) if (j[i].status === "andamento" || j[i].status === "eliminado") return i;
    return 0;
  }
  function badgeText(st) {
    return { andamento: "em andamento", possivel: "possível", eliminado: "eliminado", campeao: "campeão" }[st.status] || st.status;
  }
  function matchRow(m, selCode) {
    var right = (m.status === "finalizado")
      ? '<span class="mtc__score chip-res ' + (m.result || "e") + '">' + (m.score || "") + '</span>'
      : '<span class="mtc__vs">' + (m.time || "VS") + '</span>';
    var oppFlag = m.oppCode ? '<img class="mtc__flag" src="' + flagUrl(m.oppCode) + '" alt="">' : '<span class="scn__q">?</span>';
    var team = (m.oppCode ? '<span class="mtc__team" data-go="' + m.oppCode + '">' : '<span class="mtc__team">') +
      '<img class="mtc__flag" src="' + flagUrl(selCode) + '" alt="">' +
      '<span class="mtc__vs2">×</span>' + oppFlag +
      '<span class="mtc__opp">' + (m.opp || "") + '</span></span>';
    var place = [m.stadium, m.city].filter(Boolean).join(" · ");
    var meta = [place, tvLine(m.tv)].filter(Boolean).join(" · ");
    return '<div class="mtc"><span class="mtc__date"><b>' + weekday(m.date) + '</b><span>' + (m.date || "") + '</span></span>' +
      team + right +
      (meta ? '<div class="mtc__meta">' + meta + '</div>' : "") + '</div>';
  }
  // Cenário = confronto da seleção escolhida x possível adversário (bandeira x bandeira)
  function phNote(opp) {
    opp = opp || "";
    if (/grupo/i.test(opp)) return "Definido na fase de grupos: as seleções desse grupo disputam a vaga. Os times reais aparecem quando o grupo terminar.";
    if (/vencedor|partida/i.test(opp)) return "Sai do vencedor de uma partida anterior do mata-mata. O time real aparece quando aquele jogo acontecer.";
    return "Adversário ainda a definir.";
  }
  function scnRow(s, selCode, fallbackDate) {
    var date = s.date || fallbackDate || "";
    var slot = s.slot || (s.oppCode ? null : oppToSlot(s.opp));
    var sInfo = slot ? slotInfo(slot) : null;
    var exact = sInfo && sInfo.teams.length === 1 && !sInfo.provisional && !sInfo.derived;
    var oppCode = s.oppCode || (exact ? sInfo.teams[0] : null);
    var hasTeam = !!oppCode;
    var oppName = hasTeam ? ((teamByCode(oppCode) || {}).name || s.opp || "") : (s.opp || "a definir");
    var oppFlag = hasTeam ? '<img src="' + flagUrl(oppCode) + '" alt="">' : '<span class="scn__q">?</span>';
    var cardAttr = hasTeam ? ' data-go="' + oppCode + '"' : (slot ? ' data-slot="' + slot + '" data-opp="' + (s.opp || "") + '"' : '');
    var cardCls = "scn" + (hasTeam || slot ? " scn--click" : "");
    var oppCls = "scn__opp" + (hasTeam ? "" : " scn__opp--ph");
    var info = hasTeam ? "" : '<i class="ti ti-info-circle scn__info"></i>';
    var when = [];
    if (date) when.push(dateDay(date));
    if (s.time) when.push(s.time);
    var place = [s.stadium, s.city].filter(Boolean).join(" · ");
    return '<div class="' + cardCls + '"' + cardAttr + '><div class="scn__match">' +
      '<img class="scn__flag" src="' + flagUrl(selCode) + '" alt="">' +
      '<span class="scn__vs">x</span>' +
      '<span class="' + oppCls + '">' + oppFlag + '<span>' + oppName + '</span>' + info + '</span></div>' +
      (when.length ? '<div class="scn__when">' + when.join(" · ") + '</div>' : "") +
      (place ? '<div class="scn__city"><i class="ti ti-building-stadium"></i> ' + place + '</div>' : "") +
      '</div>';
  }
  var slideIndex = 0;
  var slideCount = 0;
  var jData = [], jCur = 0, jElim = false;

  function phaseBody(st, code) {
    var body = "";
    if (st.matches) {
      if (st.matches.length) st.matches.forEach(function (m) { body += matchRow(m, code); });
      else body += '<div class="stg__empty">Jogos da fase de grupos em breve.</div>';
    }
    if (st.scenarios) {
      if (st.tv && st.tv.length) body += '<div class="stg__meta"><i class="ti ti-device-tv"></i> ' + tvLine(st.tv) + '</div>';
      body += '<div class="scn-label">caminhos possíveis · se avançar</div>';
      st.scenarios.forEach(function (s) { body += scnRow(s, code, st.date); });
    }
    return body;
  }

  function stageSlide(st, idx, curIdx, code) {
    var names = BRACKET.stageNames || {};
    var isCurrent = idx === curIdx;
    var here = isCurrent ? '<div class="stg__here"><i class="ti ti-map-pin"></i> você está aqui</div>' : "";
    return '<div class="slide"><div class="phase-card' + (isCurrent ? ' phase-card--current' : '') + '">' +
      '<div class="phase-head"><span class="phase-name">' + (names[st.stage] || st.stage) + '</span><span class="stg__badge ' + st.status + '">' + badgeText(st) + '</span></div>' +
      here +
      '<div class="phase-body">' + phaseBody(st, code) + '</div>' +
      '</div></div>';
  }

  function goalSlide(code) {
    var goalSub = (code === "br") ? "Não abro mão do hexa" : "Não abro mão do título";
    return '<div class="slide"><div class="phase-card phase-card--goal"><div class="goal-cup"><i class="ti ti-trophy"></i></div><div class="goal-title">TÍTULO</div><div class="goal-sub">' + goalSub + '</div></div></div>';
  }

  var NAV_SHORT = { grupos: "grupos", dezesseis: "16 avos", oitavas: "oitavas", quartas: "quartas", semi: "semi", final: "final" };
  function navCell(cls, slide, inner, label) {
    return '<div class="navcell"><span class="navptr"><i class="ti ti-chevron-down"></i></span>' +
      '<button class="' + cls + '" data-slide="' + slide + '">' + inner + '</button>' +
      '<span class="navlbl">' + label + '</span></div>';
  }
  function buildPhaseNav(j, curIdx, eliminated) {
    var html = "";
    j.forEach(function (st, idx) {
      var isLast = idx === j.length - 1;
      var done = idx < curIdx, isCur = idx === curIdx;
      var elim = st.status === "eliminado";
      var cls = elim ? "navn navn--elim" : (isCur ? "navn navn--current" : (done ? "navn navn--done" : "navn navn--locked"));
      var inner = elim ? '<i class="ti ti-x"></i>' : (done ? '<i class="ti ti-check"></i>' : (idx > curIdx ? '<i class="ti ti-lock"></i>' : String(idx + 1)));
      html += navCell(cls, idx, inner, NAV_SHORT[st.stage] || st.stage);
      if (!(isLast && eliminated)) html += '<span class="navseg' + (done ? ' navseg--done' : '') + '"></span>';
    });
    if (!eliminated) html += navCell("navn navn--goal", j.length, '<i class="ti ti-trophy"></i>', "título");
    el.jrnNav.innerHTML = '<div class="nav-track">' + html + '</div>';
  }
  // ===== Resolução de possibilidades do mata-mata (grupos + chaveamento) =====
  function teamByCode(code) { var i = indexByCode(code); return i >= 0 ? TEAMS[i] : null; }
  function groupTeams(g) { return (BRACKET.groups && BRACKET.groups[g]) ? BRACKET.groups[g].slice() : []; }
  function findKo(n) { var k = BRACKET.knockout || []; for (var i = 0; i < k.length; i++) if (k[i].id === n) return k[i]; return null; }
  function uniqCodes(arr) { var o = [], s = {}; arr.forEach(function (c) { if (c && !s[c]) { s[c] = 1; o.push(c); } }); return o; }
  // slot -> { label, teams:[codes], third? }
  function slotInfo(slot) {
    if (!slot) return { label: "a definir", teams: [] };
    var m;
    if ((m = slot.match(/^([123])([A-L])$/))) {
      var pos = parseInt(m[1], 10), g = m[2];
      var lbl = (pos === 1 ? "1º" : pos === 2 ? "2º" : "3º") + " do Grupo " + g;
      var st = BRACKET.standings && BRACKET.standings[g];
      var done = !!(BRACKET.groupsDone && BRACKET.groupsDone[g]);
      var started = !!(BRACKET.groupsStarted && BRACKET.groupsStarted[g]);
      // grupo terminou -> time EXATO. grupo em andamento -> provável (classificação parcial).
      if (st && st[pos - 1] && (done || started)) {
        return { label: lbl, teams: [st[pos - 1]], provisional: !done, group: g, alt: groupTeams(g) };
      }
      return { label: lbl, teams: groupTeams(g), group: g };
    }
    if (slot === "3*") return { label: "Melhor 3º colocado", teams: [], third: true, fromGroups: [] };
    if ((m = slot.match(/^3:([A-L]+)$/))) {
      var grps = m[1].split(""), cands = [];
      grps.forEach(function (g) {
        var stg = BRACKET.standings && BRACKET.standings[g];
        var ok = (BRACKET.groupsDone && BRACKET.groupsDone[g]) || (BRACKET.groupsStarted && BRACKET.groupsStarted[g]);
        if (stg && stg[2] && ok) cands.push(stg[2]);
      });
      return { label: "Melhor 3º colocado", teams: cands, provisional: true, third: true, fromGroups: grps };
    }
    if ((m = slot.match(/^W(\d+)$/))) return { label: "Vencedor do Jogo " + m[1], teams: koTeams(parseInt(m[1], 10)), derived: true };
    if ((m = slot.match(/^L(\d+)$/))) return { label: "Perdedor do Jogo " + m[1], teams: koTeams(parseInt(m[1], 10)), derived: true };
    return { label: slot, teams: [] };
  }
  function koTeams(n) { var k = findKo(n); if (!k) return []; return uniqCodes(slotInfo(k.a).teams.concat(slotInfo(k.b).teams)); }
  function koGameTeams(k) { return uniqCodes(slotInfo(k.a).teams.concat(slotInfo(k.b).teams)); }
  // "2º do Grupo F" / "Vencedor da Partida 73" -> slot
  function oppToSlot(opp) {
    var m; opp = opp || "";
    if ((m = opp.match(/([123])º\s*do\s*Grupo\s*([A-L])/i))) return m[1] + m[2].toUpperCase();
    if ((m = opp.match(/Partida\s*(\d+)/i))) return "W" + m[1];
    return null;
  }
  function teamChip(c) { var t = teamByCode(c); return t ? '<span class="popup__team popup__team--info"><img src="' + flagUrl(c) + '" alt=""><span>' + t.name + '</span></span>' : ''; }
  function slotChips(info) {
    // vaga de melhor 3º colocado: explica a regra e mostra os candidatos
    if (info.third) {
      var h = '<p class="popup__note">Vaga de <b>melhor 3º colocado</b>. Dos 12 terceiros colocados, só os <b>8 melhores</b> avançam (por pontos e, em seguida, saldo de gols). Por isso fica como classificação parcial: depende de como os outros grupos terminarem.</p>';
      if (info.fromGroups && info.fromGroups.length) h += '<p class="popup__note">Pode vir de um destes grupos: <b>' + info.fromGroups.join(", ") + '</b>.</p>';
      if (info.teams && info.teams.length) h += '<div class="popup__slot">3º colocado de cada grupo (parcial)</div><div class="popup__teams">' + info.teams.map(teamChip).join("") + '</div>';
      return h;
    }
    // classificação parcial: mostra o atual líder do slot + os outros do grupo como alternativa
    if (info.provisional && info.teams.length === 1) {
      var h2 = '<p class="popup__note">Classificação parcial, ainda pode mudar.</p>' +
        '<div class="popup__teams">' + teamChip(info.teams[0]) + '</div>';
      var others = (info.alt || []).filter(function (c) { return c !== info.teams[0]; });
      if (others.length) h2 += '<div class="popup__slot">outros do grupo</div><div class="popup__teams">' + others.map(teamChip).join("") + '</div>';
      return h2;
    }
    if (!info.teams.length) return '<p class="popup__note">A definir.</p>';
    if (info.teams.length > 8) return '<p class="popup__note">' + info.teams.length + ' seleções ainda possíveis, depende dos resultados das fases anteriores.</p>';
    return '<div class="popup__teams">' + info.teams.map(teamChip).join("") + '</div>';
  }
  // popup de um confronto inteiro do mata-mata (os dois lados)
  function openKoPopup(k) {
    el.popup.querySelector(".popup__title").textContent = "Jogo " + k.id + " · " + (BRACKET.stageNames[k.stage] || "");
    var ai = slotInfo(k.a), bi = slotInfo(k.b);
    var html = "<p>Quem pode aparecer nesse jogo:</p>";
    html += '<div class="popup__slot">' + ai.label + '</div>' + slotChips(ai);
    html += '<div class="popup__slot">' + bi.label + '</div>' + slotChips(bi);
    el.popup.querySelector(".popup__body").innerHTML = html;
    el.popup.classList.add("is-open");
  }
  // popup de um slot só (usado na jornada do Brasil)
  function openSlotPopup(slot, label) {
    var info = slotInfo(slot);
    el.popup.querySelector(".popup__title").textContent = label || info.label;
    el.popup.querySelector(".popup__body").innerHTML = "<p>Quem pode cair nesse confronto:</p>" + slotChips(info);
    el.popup.classList.add("is-open");
  }

  function openPhPopup(opp) {
    el.popup.querySelector(".popup__title").textContent = opp || "Adversário a definir";
    var bodyEl = el.popup.querySelector(".popup__body");
    // Quando o chaveamento real entrar, BRACKET.possibilities["1º do Grupo F"] = ["fr","es",...]
    var opts = (BRACKET.possibilities && BRACKET.possibilities[opp]) || null;
    var html = "<p>" + phNote(opp) + "</p>";
    if (opts && opts.length) {
      html += '<div class="popup__teams">';
      opts.forEach(function (c) {
        var t = TEAMS[indexByCode(c)];
        if (t) html += '<button class="popup__team" data-go="' + c + '"><img src="' + flagUrl(c) + '" alt=""><span>' + t.name + '</span></button>';
      });
      html += "</div>";
    }
    bodyEl.innerHTML = html;
    el.popup.classList.add("is-open");
  }
  function closePhPopup() { el.popup.classList.remove("is-open"); }

  function buildSlider(code) {
    var j = getJourney(code);
    // se foi eliminado, corta os jogos futuros (não mostra possibilidades depois da queda)
    var elimIdx = -1;
    for (var e = 0; e < j.length; e++) if (j[e].status === "eliminado") { elimIdx = e; break; }
    var eliminated = elimIdx >= 0;
    if (eliminated) j = j.slice(0, elimIdx + 1);

    var curIdx = currentStageIndex(j);
    jData = j; jCur = curIdx; jElim = eliminated;
    var html = "";
    j.forEach(function (st, idx) { html += stageSlide(st, idx, curIdx, code); });
    if (!eliminated) html += goalSlide(code);
    el.jrnTrack.innerHTML = html;
    slideCount = j.length + (eliminated ? 0 : 1);
    buildPhaseNav(j, curIdx, eliminated);
    goSlide(curIdx, true);
  }
  function mascotPoseForSlide(i) {
    if (jElim) return "triste";
    if (i >= jData.length) return "comemorando";
    var st = jData[i];
    if (i === jCur) return (st.matches && st.matches.some(function (m) { return m.result === "v"; })) ? "comemorando" : "frente";
    if (i > jCur) return "esperando";
    return "comemorando";
  }

  function goSlide(i, instant) {
    if (i < 0) i = 0;
    if (i > slideCount - 1) i = slideCount - 1;
    var prevSlide = slideIndex;
    slideIndex = i;
    if (instant) el.jrnTrack.style.transition = "none";
    el.jrnTrack.style.transform = "translateX(" + (-i * 100) + "%)";
    if (instant) { void el.jrnTrack.offsetWidth; el.jrnTrack.style.transition = ""; }
    var slides = el.jrnTrack.children;
    for (var s = 0; s < slides.length; s++) slides[s].classList.toggle("is-active", s === i);
    var cells = el.jrnNav.querySelectorAll(".navcell");
    for (var n = 0; n < cells.length; n++) cells[n].classList.toggle("is-sel", n === i);
    // a trilha desliza pro lado mantendo a fase selecionada em ênfase (centralizada)
    var selCell = cells[i];
    if (selCell && el.jrnNav) {
      var navR = el.jrnNav.getBoundingClientRect(), cellR = selCell.getBoundingClientRect();
      el.jrnNav.scrollBy({ left: (cellR.left + cellR.width / 2) - (navR.left + navR.width / 2), behavior: "smooth" });
    }
    el.prevPhase.disabled = i === 0;
    el.nextPhase.disabled = i === slideCount - 1;
    if (el.jrnCounter) el.jrnCounter.textContent = (i + 1) + "/" + slideCount;
    // troca de fase pelo usuário "reassume o controle" do mascote (mesmo se ele tinha sido arrastado)
    if (!instant) userMoved = false;
    if (!gagOpen && !userMoved && el.mascotStage && el.mascotStage.classList.contains("on-journey")) {
      if (instant) journeyRest(true);
      else walkCross(i >= prevSlide ? 1 : -1);
    }
  }

  // jogo "herói": AO VIVO tem prioridade; senão o próximo confirmado; senão fase possível; senão o último jogo
  // lista plana dos jogos do Brasil: dados reais (todas as fases) se houver; senão a semente dos grupos
  function getBrMatches(j) {
    if (BRACKET.brMatches && BRACKET.brMatches.length) return BRACKET.brMatches;
    var all = []; (j || getJourney("br")).forEach(function (st) { if (st.matches) st.matches.forEach(function (m) { all.push(m); }); });
    return all;
  }
  function getHeroMatch(j) {
    var all = getBrMatches(j);
    var live = all.filter(function (m) { return m.status === "aovivo"; })[0];
    if (live) return { kind: "live", m: live };
    var next = all.filter(function (m) { return m.status === "confirmado"; })[0];
    if (next) return { kind: "next", m: next };
    for (var n = 0; n < j.length; n++) if (j[n].status === "possivel") return { kind: "possible", possible: j[n] };
    var fin = all.filter(function (m) { return m.status === "finalizado"; });
    if (fin.length) return { kind: "last", m: fin[fin.length - 1] };
    return null;
  }
  // ---- próximo jogo (hero da jornada) ----
  function getNextMatch(j) {
    for (var i = 0; i < j.length; i++) {
      if (j[i].matches) {
        for (var k = 0; k < j[i].matches.length; k++) {
          if (j[i].matches[k].status === "confirmado") return { m: j[i].matches[k], stage: j[i].stage };
        }
      }
    }
    for (var n = 0; n < j.length; n++) if (j[n].status === "possivel") return { possible: j[n] };
    return null;
  }
  function buildHud(code) {
    var j = getJourney(code);
    var t = TEAMS[current];
    var names = BRACKET.stageNames || {};
    var idx = currentStageIndex(j);
    var total = j.length;
    var pct = Math.round(((idx + 1) / total) * 100);
    var goal = (code === "br") ? "rumo ao hexa" : "rumo ao título";
    var curName = (names[j[idx].stage] || "").toLowerCase();
    var nx = getHeroMatch(j);

    var html = '<div class="hud">';
    html += '<div class="hud__head"><span class="hud__lbl"><i class="ti ti-target-arrow"></i> sua missão</span><span class="hud__goal">' + goal + '</span></div>';
    html += '<div class="hud__bar"><span style="width:' + pct + '%"></span></div>';
    html += '<div class="hud__phase">fase ' + (idx + 1) + '/' + total + ' · ' + curName + '</div>';
    html += '<div class="hud__div"></div>';

    if (nx && nx.m) {
      var m = nx.m;
      var lbl = nx.kind === "live" ? '<span class="live-dot"></span> agora · ao vivo'
        : nx.kind === "last" ? 'último jogo · ' + dateDay(m.date)
          : 'próximo jogo · ' + dateDay(m.date) + (m.time ? (" · " + m.time) : "");
      html += '<div class="hud__nx' + (nx.kind === "live" ? " hud__nx--live" : "") + '">' + lbl + '</div>';
      var showScore = (nx.kind === "live" || nx.kind === "last") && m.score;
      var mid = showScore ? '<div class="battle__vs battle__score">' + m.score + '</div>' : '<div class="battle__vs">VS</div>';
      html += '<div class="battle"><div class="battle__side"><img src="' + flagUrl(t.code) + '" alt=""><span>' + t.name + '</span></div>' + mid;
      html += '<div class="battle__side"' + (m.oppCode ? ' data-go="' + m.oppCode + '"' : '') + '>' + (m.oppCode ? '<img src="' + flagUrl(m.oppCode) + '" alt="">' : '<span class="battle__q">?</span>') + '<span>' + (m.opp || "") + '</span></div></div>';
      var meta = [m.stadium, m.city, tvLine(m.tv)].filter(Boolean).join(" · ");
      if (meta) html += '<div class="battle__meta"><i class="ti ti-building-stadium"></i> ' + meta + '</div>';
    } else if (nx && nx.possible) {
      var p = nx.possible;
      var sc = (p.scenarios && p.scenarios[0]) || {};
      var pw = sc.date ? (dateDay(sc.date) + (sc.time ? (" · " + sc.time) : "")) : (p.date || "a definir");
      html += '<div class="hud__nx">próximo jogo · ' + (names[p.stage] || "") + ' · ' + pw + '</div>';
      var oi = sc.slot ? slotInfo(sc.slot) : null;
      var oppExact = (oi && oi.teams.length === 1 && !oi.provisional && !oi.derived) ? oi.teams[0] : null;
      var sideAttr = oppExact ? ' data-go="' + oppExact + '"' : (sc.slot ? ' data-slot="' + sc.slot + '" data-opp="' + (sc.opp || "") + '"' : '');
      html += '<div class="battle"><div class="battle__side"><img src="' + flagUrl(t.code) + '" alt=""><span>' + t.name + '</span></div>';
      html += '<div class="battle__vs">VS</div>';
      html += '<div class="battle__side"' + sideAttr + '>' + (oppExact ? '<img src="' + flagUrl(oppExact) + '" alt="">' : '<span class="battle__q">?</span>') + '<span>' + (sc.opp || "a definir") + '</span></div></div>';
      var meta2 = sc.city || "";
      if (meta2) html += '<div class="battle__meta"><i class="ti ti-building-stadium"></i> ' + meta2 + '</div>';
    }
    html += '</div>';
    el.jrnNext.innerHTML = html;
  }

  // ---- compartilhar (gera o print e envia) ----
  function shareTextFallback(t) {
    var url = location.href.split("#")[0];
    var quip = QUIPS[t.code] ? (" " + QUIPS[t.code]) : "";
    var text = "Eu não abro mão " + artigo(t.name) + "!" + quip + " Acompanha a jornada:";
    if (navigator.share) navigator.share({ title: "NÃO ABRO MÃO", text: text, url: url }).catch(function () {});
    else { try { navigator.clipboard.writeText(text + " " + url); } catch (e) {} alert("Link copiado! Cola no seu story 😉"); }
  }
  function cleanQuip(q) { return (q || "").replace(/[^0-9A-Za-zÀ-ÿ \-?!.,]/g, "").trim(); }
  function buildStoryCard() {
    var t = TEAMS[current];
    var j = getJourney(t.code);
    var nx = getNextMatch(j);
    var goal = (t.code === "br") ? "RUMO AO HEXA" : "RUMO AO TÍTULO";
    var nextHtml = '<div class="st-nlabel">PRÓXIMO JOGO</div>';
    if (nx && nx.m) {
      var m = nx.m;
      nextHtml += '<div class="st-match"><img src="' + flagUrl(t.code) + '"><span class="st-x">×</span>' +
        (m.oppCode ? '<img src="' + flagUrl(m.oppCode) + '">' : '<span class="st-q">?</span>') + '</div>' +
        '<div class="st-when">' + dateDay(m.date) + (m.time ? " · " + m.time : "") + '</div>' +
        '<div class="st-city">' + [m.stadium, m.city].filter(Boolean).join(" · ") + '</div>';
    } else if (nx && nx.possible) {
      nextHtml += '<div class="st-when">' + (nx.possible.date || "a definir") + '</div><div class="st-city">adversário a definir</div>';
    }
    var q = cleanQuip(QUIPS[t.code]);
    el.shareCard.innerHTML =
      '<div class="story">' +
        '<div class="st-top"><span class="st-logo">Lipy</span><span class="st-tag">NÃO ABRO MÃO</span></div>' +
        '<div class="st-mid">' +
          '<div class="st-flagwrap"><img class="st-flag" src="' + flagUrl(t.code) + '"></div>' +
          '<div class="st-team">' + t.name.toUpperCase() + '</div>' +
          (q ? '<div class="st-quip">' + q + '</div>' : "") +
          '<div class="st-goal">' + goal + '</div>' +
        '</div>' +
        '<div class="st-next">' + nextHtml + '</div>' +
        '<div class="st-foot">feito no site <b>NÃO ABRO MÃO</b> · @salgadinhoslipy</div>' +
      '</div>';
  }
  function shareJourney() {
    var t = TEAMS[current];
    if (typeof html2canvas === "undefined") { shareTextFallback(t); return; }
    buildStoryCard();
    var orig = el.shareBtn.innerHTML;
    el.shareBtn.innerHTML = '<i class="ti ti-loader-2"></i> gerando story...';
    el.shareBtn.disabled = true;
    html2canvas(el.shareCard.firstChild, { useCORS: true, scale: 3, backgroundColor: null })
      .then(function (canvas) {
        el.shareBtn.innerHTML = orig; el.shareBtn.disabled = false; el.shareCard.innerHTML = "";
        canvas.toBlob(function (blob) {
          if (!blob) { shareTextFallback(t); return; }
          var file = new File([blob], "nao-abro-mao-" + t.code + ".png", { type: "image/png" });
          var data = { title: "NÃO ABRO MÃO", text: "Eu não abro mão " + artigo(t.name) + "! @salgadinhoslipy", files: [file] };
          if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share(data).catch(function () {});
          else { var u = URL.createObjectURL(blob); var a = document.createElement("a"); a.href = u; a.download = file.name; a.click(); URL.revokeObjectURL(u); alert("Story baixado! Posta no seu Instagram 😉"); }
        }, "image/png");
      })
      .catch(function () { el.shareBtn.innerHTML = orig; el.shareBtn.disabled = false; el.shareCard.innerHTML = ""; shareTextFallback(t); });
  }

  // ---- troca de tela ----
  function showJourney() {
    var t = TEAMS[current];
    // captura a posição atual (da HOME) ANTES de trocar de tela, p/ entrar fluido de lá
    var c = ensureChar();
    var fromLeft = c && c.style.left ? c.style.left : null;
    var fromTop = c && c.style.top ? c.style.top : null;
    userMoved = false;
    el.journeyFlag.src = flagUrl(t.code);
    el.journeyName.textContent = t.name.toUpperCase();
    el.screenHome.classList.remove("is-active");
    el.screenJourney.classList.add("is-active");
    setStage("on-journey");
    document.documentElement.classList.add("snap-journey");   // scroll com 2 paradas
    buildHud(t.code);
    buildSlider(t.code);
    journeyEnter(fromLeft, fromTop);        // sobe andando da posição da home
    saveScreen("journey");
    window.scrollTo(0, 0);
  }
  // volta pra home ANDANDO da posição atual (jornada/reta final -> home)
  function homeEnter(fromLeft, fromTop) {
    var c = ensureChar(); if (!c) { placeHome(); return; }
    clearTimeout(crossT1); clearTimeout(crossT2);
    setStage("on-home");
    c.style.transition = "none"; c.style.right = "auto"; c.style.bottom = "auto";
    if (fromLeft) c.style.left = fromLeft;
    if (fromTop) c.style.top = fromTop;
    faceLeft(-22 < parseFloat(fromLeft || "999"));   // vindo da direita -> anda pra esquerda
    walking(true); setPose("andando");
    crossT1 = setTimeout(function () { c.style.transition = ""; c.style.left = "-22px"; positionHomeMascot(); }, 24);
    crossT2 = setTimeout(function () { walking(false); faceLeft(false); setPose("apontando"); }, 600);
  }
  function showHome() {
    var c = ensureChar();
    var fromLeft = c && c.style.left ? c.style.left : null;
    var fromTop = c && c.style.top ? c.style.top : null;
    userMoved = false;
    document.documentElement.classList.remove("snap-journey");
    el.screenJourney.classList.remove("is-active");
    el.screenOverview.classList.remove("is-active");
    el.screenHome.classList.add("is-active");
    setStage("on-home");
    homeEnter(fromLeft, fromTop);
    saveScreen("home");
    window.scrollTo(0, 0);
  }

  // ---- Visão geral do mata-mata ----
  // lado de um confronto do mata-mata: bandeira (se já definido) ou "?" + rótulo do slot
  // lado "final" = 100% definido (time real da API, ou grupo encerrado). Provável NÃO é final.
  function sideFinal(slot, code) {
    if (code) return true;
    var info = slotInfo(slot);
    return info.teams.length === 1 && !info.provisional && !info.derived;
  }
  function koSide(slot, code) {
    if (code) {
      var td = teamByCode(code);
      return '<div class="ko-side"><img class="ko-flag" src="' + flagUrl(code) + '" alt=""><span class="ko-lbl">' + (td ? td.name : code) + '</span></div>';
    }
    var info = slotInfo(slot);
    if (!info.derived && info.teams.length === 1) {
      var t = teamByCode(info.teams[0]);
      var prov = info.provisional ? '<span class="ko-prov">parcial</span>' : '';
      return '<div class="ko-side' + (info.provisional ? ' ko-side--prov' : '') + '"><img class="ko-flag" src="' + flagUrl(info.teams[0]) + '" alt=""><span class="ko-lbl">' + (t ? t.name : info.label) + prov + '</span></div>';
    }
    return '<div class="ko-side ko-side--open"><span class="ko-q">?</span><span class="ko-lbl">' + info.label + '</span></div>';
  }
  function koCard(k) {
    var when = [dateDay(k.date), k.time].filter(Boolean).join(" · ");
    var place = [k.stadium, k.city].filter(Boolean).join(" · ");
    var open = !(sideFinal(k.a, k.aCode) && sideFinal(k.b, k.bCode));
    var inner =
      '<div class="ko-card__top"><span class="ko-num">Jogo ' + k.id + '</span>' + (when ? '<span class="ko-when">' + when + '</span>' : '') + '</div>' +
      koSide(k.a, k.aCode) + '<span class="ko-vs">×</span>' + koSide(k.b, k.bCode) +
      (place ? '<div class="ko-place"><i class="ti ti-map-pin"></i> ' + place + '</div>' : '') +
      (open ? '<span class="ko-tap"><i class="ti ti-hand-finger"></i> ver quem pode cair aqui</span>' : '');
    // indefinido = botão clicável (abre possíveis); definido = card estático
    if (open) return '<button class="ko-card ko-card--open" data-ko="' + k.id + '">' + inner + '</button>';
    return '<div class="ko-card ko-card--set">' + inner + '</div>';
  }
  var STAGE_ICON = { dezesseis: "ti-grid-dots", oitavas: "ti-layout-grid", quartas: "ti-tournament", semi: "ti-medal", terceiro: "ti-award", final: "ti-trophy" };
  var OV_ORDER = ["dezesseis", "oitavas", "quartas", "semi", "terceiro", "final"];
  var ovStage = null;   // nada aberto por padrão; só abre ao clicar numa fase
  function koByStage() {
    var ko = BRACKET.knockout || [], byStage = {};
    ko.forEach(function (k) { (byStage[k.stage] = byStage[k.stage] || []).push(k); });
    return byStage;
  }
  // tabs construídas UMA vez; trocar de fase só atualiza classe + jogos (scroll não reseta)
  function buildOverview() {
    var byStage = koByStage();
    var tabs = '<div class="ph-tabs" id="ph-tabs">';
    OV_ORDER.forEach(function (st) {
      var list = byStage[st]; if (!list || !list.length) return;
      tabs += '<button class="ph-tab' + (st === ovStage ? ' is-sel' : '') + '" data-ph-tab="' + st + '">' +
        '<span class="ph-tab__ic"><i class="ti ' + (STAGE_ICON[st] || "ti-ball-football") + '"></i></span>' +
        '<span class="ph-tab__name">' + (BRACKET.stageNames[st] || st) + '</span>' +
        '<span class="ph-tab__n">' + list.length + (list.length > 1 ? ' jogos' : ' jogo') + '</span>' +
        '</button>';
    });
    tabs += '</div>';
    el.ovList.innerHTML = tabs + '<div id="ph-games-host"></div>';
    renderOvGames();
  }
  function renderOvGames() {
    var host = document.getElementById("ph-games-host"); if (!host) return;
    if (!ovStage) { host.innerHTML = '<div class="ph-hint"><i class="ti ti-hand-finger"></i> toque numa fase pra ver os jogos</div>'; return; }
    var sel = koByStage()[ovStage] || [];
    host.innerHTML = '<div class="ko-grid' + (sel.length === 1 ? ' ko-grid--one' : '') + '" id="ph-games">' +
      sel.map(koCard).join("") + '</div>';
  }
  function selectOvStage(st) {
    ovStage = st;
    var tabs = document.getElementById("ph-tabs");
    if (tabs) [].forEach.call(tabs.querySelectorAll(".ph-tab"), function (b) { b.classList.toggle("is-sel", b.getAttribute("data-ph-tab") === st); });
    renderOvGames();
    centerOvTab();
  }
  // centraliza a tab selecionada no scroll lateral (rola suave a partir da posição atual)
  function centerOvTab() {
    var tabs = document.getElementById("ph-tabs"); if (!tabs) return;
    var sel = tabs.querySelector(".is-sel"); if (!sel) return;
    var target = sel.offsetLeft - (tabs.clientWidth - sel.offsetWidth) / 2;
    tabs.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }
  function showOverview() {
    var c = ensureChar();
    var fromLeft = c && c.style.left ? c.style.left : null;
    var fromTop = c && c.style.top ? c.style.top : null;
    userMoved = false;
    document.documentElement.classList.remove("snap-journey");
    ovStage = null;
    buildOverview();
    el.screenHome.classList.remove("is-active");
    el.screenJourney.classList.remove("is-active");
    el.screenOverview.classList.add("is-active");
    setStage("on-overview");
    overviewEnter(fromLeft, fromTop);
    saveScreen("overview");
    window.scrollTo(0, 0);
  }

  // ---- listeners ----
  el.prev.addEventListener("click", function () { go(-1); });
  el.next.addEventListener("click", function () { go(1); });
  el.peekPrev.addEventListener("click", function () { go(-1); });
  el.peekNext.addEventListener("click", function () { go(1); });
  if (el.pesquisar) el.pesquisar.addEventListener("click", openSearch);
  el.closeSearch.addEventListener("click", closeSearch);
  el.overlay.addEventListener("click", function (e) { if (e.target === el.overlay) closeSearch(); });
  el.input.addEventListener("input", function () { buildList(el.input.value); });
  el.cta.addEventListener("click", showJourney);
  el.back.addEventListener("click", showHome);
  if (el.journeySearch) el.journeySearch.addEventListener("click", openSearch);
  el.btnOverview.addEventListener("click", showOverview);
  el.ovBack.addEventListener("click", showHome);
  el.funnyClose.addEventListener("click", closeFunny);
  el.funny.addEventListener("click", function (e) { if (e.target === el.funny) closeFunny(); });
  if (el.funnyDim) el.funnyDim.addEventListener("click", closeFunny);
  // cliques dentro da jornada
  el.screenJourney.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    // 1) confronto indefinido -> card todo clicável -> popup com as possíveis seleções
    var slotCard = e.target.closest("[data-slot]");
    if (slotCard) { openSlotPopup(slotCard.getAttribute("data-slot"), slotCard.getAttribute("data-opp")); return; }
    // 2) confronto/seleção definida -> troca a torcida
    var go = e.target.closest("[data-go]");
    if (go) { trySetTeam(go.getAttribute("data-go")); return; }
    // 3) legado (adversário a definir sem slot mapeado)
    var ph = e.target.closest("[data-ph]");
    if (ph) { openPhPopup(ph.getAttribute("data-opp")); }
  });

  // cliques no infográfico do mata-mata -> popup com quem pode cair em cada jogo
  el.screenOverview.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    // tab de fase -> troca os jogos exibidos e centraliza a tab
    var tab = e.target.closest("[data-ph-tab]");
    if (tab) { selectOvStage(tab.getAttribute("data-ph-tab")); return; }
    // card de jogo -> popup com as possíveis seleções
    var card = e.target.closest("[data-ko]");
    if (card) { var k = findKo(parseInt(card.getAttribute("data-ko"), 10)); if (k) openKoPopup(k); }
  });

  // slider de fases
  el.prevPhase.addEventListener("click", function () { goSlide(slideIndex - 1); });
  el.nextPhase.addEventListener("click", function () { goSlide(slideIndex + 1); });
  el.jrnNav.addEventListener("click", function (e) {
    var n = e.target.closest ? e.target.closest("[data-slide]") : null;
    if (n) goSlide(parseInt(n.getAttribute("data-slide"), 10));
  });
  el.popupClose.addEventListener("click", closePhPopup);
  el.popup.addEventListener("click", function (e) {
    if (e.target === el.popup) { closePhPopup(); return; }
    var go = e.target.closest ? e.target.closest("[data-go]") : null;
    if (go) { closePhPopup(); trySetTeam(go.getAttribute("data-go")); }
  });

  var sx = null;
  el.jrnSlider.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  el.jrnSlider.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 45) goSlide(slideIndex + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });

  // swipe lateral pra trocar de torcida (mobile)
  var touchX = null;
  var selector = document.querySelector(".selector");
  selector.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  selector.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  // teclado (desktop)
  document.addEventListener("keydown", function (e) {
    if (el.overlay.classList.contains("is-open")) {
      if (e.key === "Escape") closeSearch();
      return;
    }
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  // ---- tela de carregamento: some quando tudo carregar (abertura rápida) ----
  (function boot() {
    var b = document.getElementById("boot"); if (!b) return;
    var done = false, start = Date.now();
    function hide() {
      if (done) return; done = true;
      var wait = Math.max(0, 500 - (Date.now() - start));   // splash mínimo de 0,5s
      setTimeout(function () {
        b.classList.add("is-hidden");
        setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 400);
      }, wait);
    }
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide);
    setTimeout(hide, 2500);   // teto: nunca trava mais que 2,5s
  })();

  // ---- init ----
  // pré-carrega as poses (senão, no mobile, o deslize "arrasta" na pose antiga
  // enquanto a nova imagem ainda não baixou)
  ["frente", "andando", "comemorando", "apontando", "triste", "esperando", "confiante"].forEach(function (p) {
    var im = new Image(); im.src = "assets/mascote-" + p + ".png";
  });
  render();
  renderJourneyTeaser();
  var saved = loadScreen();
  if (saved === "journey") showJourney();
  else if (saved === "overview") showOverview();
  else { placeHome(); }

  window.addEventListener("resize", function () {
    positionHomeMascot();
    if (el.mascotStage && el.mascotStage.classList.contains("on-journey")) journeyRest(true);
  });

  // ---- mascote ARRASTÁVEL (mouse + toque) ----
  (function () {
    var st = el.mascotStage; if (!st) return;
    var c, dragging = false, moved = false, sx, sy, sl, stp;
    function pt(e) { var t = e.touches && e.touches[0] ? e.touches[0] : e; return { x: t.clientX, y: t.clientY }; }
    function down(e) {
      if (gagOpen) return;
      c = ensureChar(); if (!c) return;
      var p = pt(e), r = c.getBoundingClientRect(), sr = st.getBoundingClientRect();
      sl = r.left - sr.left; stp = r.top - sr.top; sx = p.x; sy = p.y;
      dragging = true; moved = false;
      clearTimeout(crossT1); clearTimeout(crossT2); clearTimeout(scrollTimer); clearTimeout(walkTimer);
      c.classList.add("dragging"); c.style.right = "auto"; c.style.bottom = "auto";
    }
    function move(e) {
      if (!dragging || !c) return;
      var p = pt(e), dx = p.x - sx, dy = p.y - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) > 4) { moved = true; walking(true); faceLeft(false); setPose("andando"); }
      if (moved) { c.style.left = (sl + dx) + "px"; c.style.top = (stp + dy) + "px"; if (e.cancelable) e.preventDefault(); }
    }
    function up() {
      if (!dragging) return; dragging = false;
      if (!c) return;
      c.classList.remove("dragging");   // reativa a transição (.45s) -> volta suave se precisar
      if (!moved) return;
      userMoved = true; walking(false); faceLeft(false);
      // se foi solto pra fora da área visível, traz de volta suavemente
      var sw = st.clientWidth || 440, sh = st.clientHeight || 700;
      var cw = c.offsetWidth || 150, chh = c.offsetHeight || 188;
      var L = parseFloat(c.style.left) || 0, T = parseFloat(c.style.top) || 0;
      var nL = Math.max(8, Math.min(sw - cw - 8, L));
      var nT = Math.max(8, Math.min(sh - chh - 8, T));
      if (nL !== L || nT !== T) { c.style.left = nL + "px"; c.style.top = nT + "px"; }
      // pose referente à tela/posição onde foi solto
      var rp = el.mascotStage.classList.contains("on-journey") ? mascotPoseForSlide(slideIndex)
             : (el.mascotStage.classList.contains("on-overview") ? "frente" : "apontando");
      setPose(rp);
    }
    st.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    st.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  })();

  // jornada: 2 paradas (próximo jogo / fases) — encaixa na âncora mais próxima ao parar de rolar
  var snapTimer = null;
  function snapJourney() {
    if (!document.documentElement.classList.contains("snap-journey")) return;
    if (gagOpen) return;
    var wrap = document.querySelector(".slider-wrap"); if (!wrap) return;
    var y = window.scrollY || window.pageYOffset || 0;
    var maxScroll = Math.max(0, (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight);
    // âncora das fases = trazer o slider pro topo, mas sem passar do limite rolável
    var a2 = Math.min(maxScroll, Math.max(0, Math.round(y + wrap.getBoundingClientRect().top - 8)));
    var nearest = (Math.abs(0 - y) <= Math.abs(a2 - y)) ? 0 : a2;
    if (Math.abs(nearest - y) > 6) window.scrollTo({ top: nearest, behavior: "smooth" });
  }
  window.addEventListener("scroll", function () {
    if (!document.documentElement.classList.contains("snap-journey")) return;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snapJourney, 140);
  }, { passive: true });

  // ao rolar a jornada, o mascote anda e acompanha (sobe/desce); quando para, assume a pose da âncora
  var scrollTimer = null;
  window.addEventListener("scroll", function () {
    if (gagOpen || userMoved) return;   // gag aberto ou mascote arrastado = não mexe
    if (!el.mascotStage || !el.mascotStage.classList.contains("on-journey")) return;
    var c = ensureChar(); if (!c) return;
    var a = jrnAnchorTop();
    walking(true); setPose("andando"); c.style.top = a.top + "px"; c.style.left = mcRight();
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      if (gagOpen) return;   // não mexe na pose se o gag está aberto
      walking(false); setPose(jrnAnchorTop().pose);
    }, 500);   // > .45s da transição: só assume a pose parada depois de chegar (senão arrasta na pose errada)
  }, { passive: true });
})();

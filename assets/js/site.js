/* Teatro Januzzi · Stagione 1975 · behaviour for the programme */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- prefs */

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  var live = document.getElementById("live");
  function announce(msg) {
    if (!live) return;
    live.textContent = "";
    setTimeout(function () { live.textContent = msg; }, 60);
  }

  /* -------------------------------------------------------------- audio */

  var audio = { on: false, ctx: null };

  function ctx() {
    if (!audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio.ctx = new AC();
    }
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    return audio.ctx;
  }

  // A dissonant string stab: tritone, sawtooths through a lowpass, with vibrato.
  function sting(intensity) {
    if (!audio.on) return;
    var c = ctx(); if (!c) return;
    var t = c.currentTime, k = intensity || 1;
    var out = c.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.16 * k, t + 0.02);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    var lp = c.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.setValueAtTime(3800, t); lp.frequency.exponentialRampToValueAtTime(600, t + 1.4);
    lp.connect(out); out.connect(c.destination);
    var lfo = c.createOscillator(), lfoGain = c.createGain();
    lfo.frequency.value = 6.2; lfoGain.gain.value = 5; lfo.connect(lfoGain);
    [440, 622.25, 466.16].forEach(function (f, i) {
      [-7, 7].forEach(function (det) {
        var o = c.createOscillator();
        o.type = "sawtooth"; o.frequency.value = f; o.detune.value = det + i * 3;
        lfoGain.connect(o.frequency);
        o.connect(lp); o.start(t); o.stop(t + 1.7);
      });
    });
    lfo.start(t); lfo.stop(t + 1.7);
  }

  function bark() {
    if (!audio.on) return;
    var c = ctx(); if (!c) return;
    [0, 0.22].forEach(function (d) {
      var t = c.currentTime + d;
      var o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = "square";
      o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(170, t + 0.13);
      f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 1.2;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(f); f.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.18);
    });
  }

  /* ------------------------------------------------------------ toggles */

  var eyeBtn = document.querySelector("[data-toggle='seeing-eye']");
  var audioBtn = document.querySelector("[data-toggle='audio']");

  function setSeeingEye(on, quiet) {
    root.classList.toggle("seeing-eye", on);
    if (eyeBtn) eyeBtn.setAttribute("aria-pressed", String(on));
    store("tsedwstm-eye", on ? "1" : "0");
    if (!quiet) announce(on
      ? "Seeing Eye Mode on. Effects are off, and Ziggy will describe the pictures."
      : "Seeing Eye Mode off.");
  }
  if (eyeBtn) {
    setSeeingEye(store("tsedwstm-eye") === "1", true);
    eyeBtn.addEventListener("click", function () {
      setSeeingEye(!root.classList.contains("seeing-eye"));
    });
  }

  if (audioBtn) {
    audioBtn.addEventListener("click", function () {
      audio.on = !audio.on;
      audioBtn.setAttribute("aria-pressed", String(audio.on));
      audioBtn.querySelector(".state").textContent = audio.on ? "on" : "off";
      if (audio.on) sting(0.7);
    });
  }

  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ------------------------------------------------------------ curtains */

  var hero = document.querySelector(".hero");
  if (hero) {
    requestAnimationFrame(function () {
      setTimeout(function () { hero.classList.add("curtains-open"); }, reduceMotion ? 0 : 450);
    });
  }

  /* ----------------------------------------- in-view: fades, subs, gels */

  var gelTargets = document.querySelectorAll("[data-gel]");
  var gels = {
    magenta: "#c2187a", teal: "#19b3a4", amber: "#e08a1e",
    green: "#3d9b4a", violet: "#6b2fb3", red: "#a3101a"
  };

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll(".fade, .mvt, .sub-trigger").forEach(function (el) { io.observe(el); });

    var gelIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var g = gels[en.target.getAttribute("data-gel")];
          if (g) root.style.setProperty("--gel", g);
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    gelTargets.forEach(function (el) { gelIo.observe(el); });
  } else {
    root.classList.add("no-dub");
  }

  /* -------------------------------------------------- dubbed dialogue */

  var dub = document.querySelector(".dub");
  if (dub) {
    var lines = [
      ["La prima sedia è mia.", "The first chair is mine.", "Lei"],
      ["Chi c'era in quella stanza?", "Who was in the room?", "Il commissario"],
      ["Nessuno. Solo il cane.", "No one. Only the dog.", "Lei"],
      ["Il cane ha visto troppo.", "The dog has seen too much.", "Il commissario"],
      ["Guanti neri. Sempre guanti neri.", "Black gloves. It is always the black gloves.", "Il maestro"],
      ["Suona, cara. Suona come se nessuno ti guardasse.", "Play, darling. Play like nobody is watching you.", "Il maestro"],
      ["Bau.", "[barks, in Italian]", "Ziggy"]
    ];
    var it = dub.querySelector(".it"), en = dub.querySelector(".en"), sp = dub.querySelector(".speaker");
    var i = 0;
    function say() {
      var l = lines[i % lines.length]; i++;
      dub.classList.remove("speaking", "subbed");
      setTimeout(function () {
        sp.textContent = l[2]; it.textContent = "«" + l[0] + "»"; en.textContent = l[1];
        dub.classList.add("speaking");
        // the dub never quite lines up
        setTimeout(function () { dub.classList.add("subbed"); }, root.classList.contains("seeing-eye") ? 0 : 650 + Math.random() * 500);
      }, 350);
    }
    say();
    if (!reduceMotion) setInterval(say, 4600);
  }

  /* ------------------------------------------------ restoration wipes */

  function initRestore(el) {
    var input = el.querySelector("input[type='range']");
    if (!input || input.dataset.ready) return;
    input.dataset.ready = "1";
    function update() { el.style.setProperty("--pos", input.value + "%"); }
    input.addEventListener("input", update);
    update();
  }
  document.querySelectorAll(".restore").forEach(initRestore);

  /* ---------------------------------------------------- seating chart */

  var stage = document.getElementById("stage");
  if (stage) buildOrchestra(stage);

  function buildOrchestra(stage) {
    var paw = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><ellipse cx="12" cy="16" rx="5" ry="4.2"/><ellipse cx="5.5" cy="10" rx="2.2" ry="2.8"/><ellipse cx="18.5" cy="10" rx="2.2" ry="2.8"/><ellipse cx="9" cy="5.6" rx="2.1" ry="2.7"/><ellipse cx="15" cy="5.6" rx="2.1" ry="2.7"/></g></svg>';

    // Who sits where. row 0 is nearest the podium; seat index runs left → right.
    var cast = [
      { row: 0, seat: 1, star: true, label: "1", fake: "Guiseppina Montesdeoca", real: "Gabrielle Montes De Oca", imdb: "nm12621861",
        role: "Primo Violino", roleEn: "First Chair, Violin",
        note: "Blind since childhood. First chair since Tuesday. Plays as if someone were listening at the door." },
      { row: 0, seat: 0, dog: true, fake: "«Ziggy»", real: "Ziggy (as herself)",
        role: "Cane Guida", roleEn: "Seeing-Eye Dog",
        note: "The orchestra's only witness. Refuses to make a statement without a biscuit present." },
      { row: 1, seat: 2, label: "2", fake: "Ernesto Edenzolio", real: "Ethan Edenburg", imdb: "nm6034869",
        role: "Secondo Violino", roleEn: "Second Violin",
        note: "Has waited eleven seasons for first chair. Has an alibi. It is a very good alibi." },
      { row: 0, seat: 6, label: "3", fake: "Tommaso Michelangeli", real: "Thomas McGovern", imdb: "nm6223838",
        role: "Violoncello", roleEn: "Cello",
        note: "Owns an unusually large cello case. Nobody has seen the cello." },
      { row: 0, seat: 4, label: "4", fake: "Annina Garcinio", real: "Anna Garcia",
        role: "Viola", roleEn: "Viola",
        note: "Knows everything about everyone in the string section. Says nothing. Smiles." },
      { row: 1, seat: 7, label: "5", fake: "Marina Villacorona", real: "Melissa Villaseñor", imdb: "nm3830257",
        role: "Flauto", roleEn: "Flute",
        note: "Saw a gloved hand in the wings on the night of the dress rehearsal. Has told only the dog." },
      { row: 2, seat: 11, label: "6", fake: "Michael Colangelo", real: "Michael Colangelo",
        role: "Contrabbasso", roleEn: "Double Bass",
        note: "Stands at the back. Sees everything. Hears nothing over the double bass." },
      { row: 3, seat: 7, label: "7", fake: "Constanzo Mastroduzzio", real: "Colton Mastro", imdb: "nm8040857",
        role: "Timpani", roleEn: "Timpani",
        note: "Also the executive producer. Hits things for a living, in both capacities." },
      { row: 3, seat: 10, label: "8", fake: "T. Piatti", real: "Trapper Piatt",
        role: "Piatti", roleEn: "Cymbals",
        note: "Plays the cymbals. His name is Piatti. He would rather not discuss it." },
      { podium: true, label: "M", fake: "Enrico Januzzi", real: "Eric Jackowitz", imdb: "nm8506208",
        role: "Il Maestro · Regia e Musica", roleEn: "The Maestro · Director & Composer",
        note: "Directs. Composes. Conducts. Edits. Will not say where he was on the night of the 14th." }
    ];

    // The unlucky. Unnamed members of the orchestra, removed one by one as you scroll.
    var victims = [
      { row: 1, seat: 4, role: "Oboe", how: "strangolato con una corda di Mi", en: "strangled with an E string" },
      { row: 2, seat: 3, role: "Seconda Viola", how: "colpito alla nuca da un metronomo", en: "struck by a metronome" },
      { row: 0, seat: 3, role: "Arpa", how: "trafitto da un archetto", en: "run through with a bow" },
      { row: 2, seat: 8, role: "Clarinetto", how: "avvelenato con la colofonia", en: "poisoned with rosin" },
      { row: 3, seat: 13, role: "Tuba", how: "chiuso nella custodia del violoncello", en: "locked in the cello case" },
      { row: 1, seat: 9, role: "Fagotto", how: "causa ancora ignota", en: "cause of death unknown" }
    ];

    var rows = [
      { r: 18, n: 8 }, { r: 28, n: 11 }, { r: 38, n: 14 }, { r: 47.5, n: 17 }
    ];
    var podium = { x: 50, y: 88 };
    var seats = {};
    var total = 0;

    var frag = document.createDocumentFragment();

    rows.forEach(function (row, ri) {
      for (var s = 0; s < row.n; s++) {
        var a = Math.PI * (1.08 + (0.84 * s) / (row.n - 1)); // ~194° → 346°
        var x = podium.x + row.r * Math.cos(a);
        var y = podium.y + row.r * 1.75 * Math.sin(a);
        var key = ri + "-" + s;
        var el = document.createElement("span");
        el.className = "seat";
        el.setAttribute("aria-hidden", "true");
        el.style.setProperty("--x", x.toFixed(2) + "%");
        el.style.setProperty("--y", y.toFixed(2) + "%");
        el.style.setProperty("--r", (Math.random() * 60 - 30).toFixed(0) + "deg");
        seats[key] = el;
        frag.appendChild(el);
        total++;
      }
    });
    stage.appendChild(frag);

    var card = document.getElementById("seat-card");
    var list = document.getElementById("cast-list");
    var buttons = [];

    function show(c, btn) {
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn || b._twin === btn || btn && btn._twin === b)); });
      var truth = c.imdb
        ? '<a href="https://www.imdb.com/name/' + c.imdb + '/" target="_blank" rel="noopener">' + c.real + "</a>"
        : c.real;
      card.innerHTML =
        '<div class="role">' + c.role + '</div>' +
        '<span class="sub in-view" lang="en">' + c.roleEn + "</span>" +
        '<div class="name">' + c.fake + "</div>" +
        '<p class="note">' + c.note + "</p>" +
        '<div class="truth"><span lang="it">In realtà</span> / actually: ' + truth + "</div>";
    }

    cast.forEach(function (c, idx) {
      var btn;
      if (c.podium) {
        btn = document.createElement("button");
        btn.className = "seat cast podium";
        btn.style.setProperty("--x", podium.x + "%");
        btn.style.setProperty("--y", podium.y + "%");
        stage.appendChild(btn);
      } else {
        btn = seats[c.row + "-" + c.seat];
        var b = document.createElement("button");
        b.className = btn.className + " cast" + (c.star ? " star" : "");
        b.style.cssText = btn.style.cssText;
        btn.replaceWith(b);
        seats[c.row + "-" + c.seat] = b;
        btn = b;
      }
      btn.type = "button";
      btn.removeAttribute("aria-hidden");
      btn.setAttribute("aria-label", c.role + ": " + c.fake);
      btn.innerHTML = c.dog ? paw : '<span aria-hidden="true">' + (c.label || "") + "</span>";
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () { show(c, btn); });
      btn.addEventListener("mouseenter", function () { show(c, btn); });
      buttons.push(btn);

      if (list) {
        var li = document.createElement("li");
        var lb = document.createElement("button");
        lb.type = "button";
        lb.textContent = c.role.split(" ·")[0];
        lb.setAttribute("aria-pressed", "false");
        lb._twin = btn; btn._twin = lb;
        lb.addEventListener("click", function () { show(c, lb); });
        li.appendChild(lb); list.appendChild(li);
        buttons.push(lb);
      }

      if (idx === 0) show(c, btn);
    });

    victims.forEach(function (v) {
      var el = seats[v.row + "-" + v.seat];
      if (el) { el.title = v.role; v.el = el; }
    });

    // Body count, driven by how far you've scrolled through the hall.
    var counter = document.getElementById("bodycount");
    var section = document.getElementById("orchestra");
    var killed = 0;
    if (counter) counter.textContent = total;

    function kill(v) {
      v.el.classList.add("dead");
      v.el.title = v.role + " — " + v.how + " (" + v.en + ")";
      killed++;
      counter.textContent = total - killed;
      counter.classList.remove("drop"); void counter.offsetWidth; counter.classList.add("drop");
      var log = document.getElementById("obit");
      if (log) log.innerHTML = '<span lang="it">' + v.role + ": " + v.how + '.</span> <span class="sub in-view" lang="en" style="display:inline">' + v.en + "</span>";
      sting(0.8);
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var r = section.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.75 - r.top) / (r.height * 0.8);
        var want = Math.max(0, Math.min(victims.length, Math.floor(p * (victims.length + 1))));
        while (killed < want) kill(victims[killed]);
        if (killed === victims.length) window.removeEventListener("scroll", onScroll);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --------------------------------------------------------- lightbox */

  var lb = document.getElementById("lightbox");
  var stills = Array.prototype.slice.call(document.querySelectorAll(".still"));
  if (lb && stills.length && typeof lb.showModal === "function") {
    var lbImgs = lb.querySelectorAll(".restore img");
    var lbRange = lb.querySelector("input[type='range']");
    var lbTitle = lb.querySelector(".lb-title");
    var lbDog = lb.querySelector(".lb-dog");
    var current = 0;

    function open(i) {
      current = (i + stills.length) % stills.length;
      var s = stills[current];
      var img = s.querySelector("img");
      lbImgs.forEach(function (im) { im.src = s.dataset.full; im.alt = ""; });
      lbImgs[0].alt = img.alt;
      lbTitle.innerHTML = s.dataset.mvt + "<small>" + img.alt + "</small>";
      lbDog.textContent = "Ziggy: " + s.querySelector(".dog-desc").textContent;
      lbRange.value = 50; lbRange.dispatchEvent(new Event("input"));
      if (!lb.open) lb.showModal();
    }

    stills.forEach(function (s, i) { s.addEventListener("click", function () { open(i); }); });
    lb.querySelector("[data-lb='prev']").addEventListener("click", function () { open(current - 1); });
    lb.querySelector("[data-lb='next']").addEventListener("click", function () { open(current + 1); });
    lb.querySelector("[data-lb='close']").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.target === lbRange) return;
      if (e.key === "ArrowRight") open(current + 1);
      if (e.key === "ArrowLeft") open(current - 1);
    });
  }

  /* ------------------------------------------------ credits: the truth */

  var revealBtn = document.getElementById("reveal");
  if (revealBtn) {
    var credits = document.getElementById("locandina");
    credits.querySelectorAll(".flip").forEach(function (f, i) { f.style.setProperty("--i", i); });
    revealBtn.addEventListener("click", function () {
      var on = credits.classList.toggle("reveal");
      revealBtn.setAttribute("aria-pressed", String(on));
      revealBtn.querySelector(".lang-it").textContent = on ? "Torna al 1975" : "Rivela i veri nomi";
      revealBtn.querySelector(".sub").textContent = on ? "Back to 1975" : "Reveal the real names";
      credits.querySelectorAll(".flip").forEach(function (f) {
        f.querySelector(".fake").setAttribute("aria-hidden", String(on));
        f.querySelector(".real").setAttribute("aria-hidden", String(!on));
      });
      if (on) sting(0.6);
    });
  }

  /* ---------------------------------------------------- tour: in corso */

  var now = new Date();
  var ym = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  document.querySelectorAll(".tour-month[data-month='" + ym + "'] li").forEach(function (li) { li.classList.add("now"); });

  /* ------------------------------------------------- Ziggy easter egg */

  var egg = document.getElementById("egg");
  if (egg) {
    var lastFocus = null;
    function showEgg() {
      lastFocus = document.activeElement;
      egg.classList.add("on");
      egg.setAttribute("aria-hidden", "false");
      egg.querySelector("button").focus();
      bark();
      announce("The witness has come forward.");
    }
    function hideEgg() {
      egg.classList.remove("on");
      egg.setAttribute("aria-hidden", "true");
      if (lastFocus) lastFocus.focus();
    }
    var typed = "";
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && egg.classList.contains("on")) return hideEgg();
      if (e.target.closest("input, textarea")) return;
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-5);
      if (typed === "ziggy") { typed = ""; showEgg(); }
    });
    egg.addEventListener("click", hideEgg);
    var callBtn = document.getElementById("call-witness");
    if (callBtn) callBtn.addEventListener("click", showEgg);
  }
})();

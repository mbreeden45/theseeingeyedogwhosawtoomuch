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
})();

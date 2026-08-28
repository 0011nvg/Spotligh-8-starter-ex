(function () {
  "use strict";

  const DATA = window.COURSE_DATA;
  const STORAGE_KEY = "septemberEnglishLevelUp:v1";
  const defaultState = {
    completedEpisodes: [],
    tasks: {},
    vocab: {},
    currentEpisode: 1,
    drafts: {},
    genericHome: {},
    identity: { online: "", real: "", usual: "", now: "" },
    home: { checks: {}, note: "" },
    selectedView: "home"
  };

  const state = loadState();
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return stored ? {
        ...defaultState,
        ...stored,
        tasks: { ...defaultState.tasks, ...(stored.tasks || {}) },
        vocab: { ...defaultState.vocab, ...(stored.vocab || {}) },
        identity: { ...defaultState.identity, ...(stored.identity || {}) },
        home: { ...defaultState.home, ...(stored.home || {}), checks: { ...(stored.home?.checks || {}) } }
      } : structuredClone(defaultState);
    } catch {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateProgressUI();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function setFeedback(id, message, type = "success") {
    const node = typeof id === "string" ? $(id) : id;
    if (!node) return;
    node.textContent = message;
    node.className = `feedback ${type}`;
  }

  function markTask(name, value = true) {
    state.tasks[name] = value;
    saveState();
  }

  function showView(name, shouldScroll = true) {
    $$(".view").forEach(view => view.classList.toggle("is-visible", view.dataset.view === name));
    $$(".nav-link").forEach(button => button.classList.toggle("is-active", button.dataset.go === name));
    state.selectedView = name;
    saveState();
    $(".main-nav")?.classList.remove("is-open");
    $("#menu-button")?.setAttribute("aria-expanded", "false");
    if (shouldScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateProgressUI() {
    const completed = state.completedEpisodes.length;
    const percent = Math.round((completed / 18) * 100);
    const taskCount = Object.values(state.tasks).filter(Boolean).length;
    const lessonPercent = Math.min(100, Math.round((taskCount / 12) * 100));
    const assignments = {
      "#header-progress-text": `${completed} / 18`,
      "#home-completed": String(completed),
      "#home-percent": `${percent}%`,
      "#map-progress-text": `${completed} / 18`,
      "#progress-completed": String(completed)
    };
    Object.entries(assignments).forEach(([selector, value]) => { const el = $(selector); if (el) el.textContent = value; });
    const mapCurrent = $("#map-current"); if (mapCurrent) mapCurrent.textContent = `EPISODE ${String(state.currentEpisode || 1).padStart(2, "0")}`;
    ["#header-progress-fill", "#map-progress-fill", "#progress-total-fill"].forEach(selector => { const el = $(selector); if (el) el.style.width = `${percent}%`; });
    ["#lesson-meter-fill", "#home-lesson-fill"].forEach(selector => { const el = $(selector); if (el) el.style.width = `${lessonPercent}%`; });
    const progressMessage = $("#progress-message");
    if (progressMessage) progressMessage.textContent = completed ? `${completed} episode${completed === 1 ? "" : "s"} complete. Your work is saved on this device.` : "Episode 01 is ready. Start with your online identity.";
    const saved = $("#saved-work-summary");
    if (saved) saved.textContent = taskCount ? `${taskCount} lesson milestones saved across the course.` : "No lesson answers saved yet.";
    renderSkills();
    renderCourseMap();
  }

  function renderHome() {
    const host = $("#home-next-episodes");
    host.innerHTML = "";
    DATA.episodes.slice(1, 4).forEach(ep => {
      const button = document.createElement("button");
      button.className = "next-stop";
      button.dataset.planned = ep.id;
      button.innerHTML = `<span>EPISODE ${String(ep.id).padStart(2, "0")}</span><strong>${ep.title}</strong><small>${ep.theme}</small>`;
      host.appendChild(button);
    });
  }

  function renderCourseMap() {
    const host = $("#course-map");
    if (!host) return;
    host.innerHTML = "";
    DATA.episodes.forEach(ep => {
      const complete = state.completedEpisodes.includes(ep.id);
      const button = document.createElement("button");
      const states = ["episode-node", ep.color];
      if (ep.id === state.currentEpisode && !complete) states.push("is-current");
      if (complete) states.push("is-complete");
      if (ep.status === "checkpoint") states.push("is-checkpoint");
      button.className = states.join(" ");
      button.dataset.episode = ep.id;
      const status = complete ? "✓ COMPLETE" : ep.id === state.currentEpisode ? "CURRENT" : ep.status === "checkpoint" ? "CHECKPOINT" : "READY";
      button.innerHTML = `<div class="node-number"><span>${String(ep.id).padStart(2, "0")}</span><span class="node-status">${status}</span></div><h3>${ep.title}</h3><p>${ep.theme}</p>`;
      host.appendChild(button);
    });
  }

  function renderVocabulary() {
    const host = $("#vocab-grid");
    const select = $("#vocab-episode");
    if (!select.dataset.ready) {
      select.innerHTML = DATA.episodes.map(ep => `<option value="${ep.id}">${String(ep.id).padStart(2,"0")} · ${ep.title}</option>`).join("");
      select.value = String(state.currentEpisode || 1);
      select.addEventListener("change", renderVocabulary);
      select.dataset.ready = "true";
    }
    host.innerHTML = "";
    const episodeId = Number(select.value || 1);
    const items = episodeId === 1 ? DATA.episode01.vocab : (window.LEVEL_UP_LESSONS.find(x => x.id === episodeId)?.words || []).map((x,index) => ({id:`e${episodeId}v${index}`,word:x[0],pronunciation:"",meaning:x[1],example:`Try it in a real sentence about ${DATA.episodes[episodeId-1].theme.split(" · ")[0]}.`,ru:""}));
    items.forEach(item => {
      const card = document.createElement("article");
      card.className = "vocab-card";
      const current = state.vocab[item.id] || "heard";
      card.innerHTML = `<div class="vocab-word-row"><h3>${item.word}</h3><span class="pron">${item.pronunciation}</span></div><p class="meaning">${item.meaning}</p><p class="example">${item.example}</p>${item.ru ? `<p class="ru">${item.ru}</p>`:""}<div class="vocab-states" role="group" aria-label="Learning state for ${item.word}"><button data-vocab="${item.id}" data-state="heard">HEARD IT</button><button data-vocab="${item.id}" data-state="know">KNOW IT</button><button data-vocab="${item.id}" data-state="use">CAN USE IT</button></div>`;
      $$("[data-vocab]", card).forEach(button => {
        button.classList.toggle("is-active", button.dataset.state === current);
        button.addEventListener("click", () => {
          state.vocab[item.id] = button.dataset.state; saveState();
          $$("[data-vocab]", card).forEach(x => x.classList.toggle("is-active", x === button));
        });
      });
      host.appendChild(card);
    });
  }

  function renderSkills() {
    const host = $("#skill-grid");
    if (!host) return;
    const base = Math.round(state.completedEpisodes.length / 18 * 100);
    const allTaskKeys = Object.keys(state.tasks).filter(key => state.tasks[key]);
    const boost = group => Math.min(100, base + allTaskKeys.filter(key => group.some(part => key.includes(part))).length * 2);
    const skills = [
      ["GRAMMAR", boost(["notice", "sort", "practice", "grammar"])],
      ["VOCABULARY", boost(["vocab", "realenglish"])],
      ["LISTEN / READ", boost(["listening", "oge"])],
      ["SPEAK / WRITE", boost(["speaking", "writing", "mission"])]
    ];
    host.innerHTML = skills.map(([name, value]) => `<article class="skill-card"><span>${name}</span><strong>${value}%</strong><div class="skill-bar"><i style="width:${value}%"></i></div></article>`).join("");
  }

  function initNavigation() {
    $$('[data-go]').forEach(button => button.addEventListener("click", () => showView(button.dataset.go)));
    $$('[data-start-episode="1"]').forEach(button => button.addEventListener("click", () => openEpisode(1)));
    document.addEventListener("click", event => {
      const planned = event.target.closest("[data-planned]");
      if (planned) openEpisode(Number(planned.dataset.planned));
      const episode = event.target.closest("[data-episode]");
      if (episode) openEpisode(Number(episode.dataset.episode));
    });
    $("#menu-button").addEventListener("click", event => {
      const open = $(".main-nav").classList.toggle("is-open");
      event.currentTarget.setAttribute("aria-expanded", String(open));
    });
  }

  function initWarmup() {
    $$("[data-warmup]").forEach(button => button.addEventListener("click", () => {
      $$("[data-warmup]").forEach(item => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      setFeedback("#warmup-feedback", "Good. Now add one example: what can people see, and what can’t they see?", "success");
      markTask("warmup");
    }));
    $$("[data-predict]").forEach(button => button.addEventListener("click", () => {
      $$("[data-predict]").forEach(item => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      state.tasks.prediction = button.dataset.predict;
      saveState();
    }));
  }

  class SpeechPlayer {
    constructor() {
      this.duration = DATA.episode01.audio.duration;
      this.elapsed = 0;
      this.playing = false;
      this.paused = false;
      this.interval = null;
      this.utterance = null;
      $("#audio-play").addEventListener("click", () => this.toggle());
      $("#audio-replay").addEventListener("click", () => this.replay());
      this.paint();
    }
    makeUtterance(text) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
      utterance.voice = voices.find(v => /female|samantha|victoria|serena|ava/i.test(v.name)) || voices[0] || null;
      utterance.lang = "en-GB";
      utterance.rate = .92;
      utterance.pitch = 1.03;
      utterance.onend = () => this.finish();
      utterance.onerror = () => { this.stop(); showToast("Audio could not start in this browser. The transcript will unlock after the gist attempt."); };
      return utterance;
    }
    start() {
      if (!("speechSynthesis" in window)) { showToast("This browser does not support speech playback."); return; }
      speechSynthesis.cancel();
      this.elapsed = 0;
      this.utterance = this.makeUtterance(DATA.episode01.audio.transcript);
      speechSynthesis.speak(this.utterance);
      this.playing = true;
      this.paused = false;
      this.tick();
      $("#audio-play").textContent = "Ⅱ";
    }
    toggle() {
      if (!this.playing) return this.start();
      if (this.paused) {
        speechSynthesis.resume(); this.paused = false; $("#audio-play").textContent = "Ⅱ"; this.tick();
      } else {
        speechSynthesis.pause(); this.paused = true; $("#audio-play").textContent = "▶"; clearInterval(this.interval);
      }
    }
    replay() { this.stop(); this.start(); }
    tick() {
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        if (!this.paused) { this.elapsed = Math.min(this.duration, this.elapsed + .25); this.paint(); }
      }, 250);
    }
    finish() { this.elapsed = this.duration; this.paint(); this.stop(false); }
    stop(reset = true) {
      clearInterval(this.interval);
      if (reset) { speechSynthesis.cancel(); this.elapsed = 0; this.paint(); }
      this.playing = false; this.paused = false; $("#audio-play").textContent = "▶";
    }
    paint() {
      const current = Math.floor(this.elapsed);
      $("#audio-progress").style.width = `${(this.elapsed / this.duration) * 100}%`;
      $("#audio-time").textContent = `0:${String(current).padStart(2, "0")} / 0:${this.duration}`;
    }
  }

  function unlockTranscript() {
    const button = $("#transcript-button");
    button.disabled = false;
    $("span", button).textContent = "UNLOCKED";
  }

  function initListening() {
    new SpeechPlayer();
    $$("[data-gist]").forEach(button => button.addEventListener("click", () => {
      $$("[data-gist]").forEach(item => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      unlockTranscript();
      if (button.dataset.gist === "science") {
        setFeedback("#gist-feedback", "Exactly. The contrast is music online vs a science project this week.", "success");
        state.tasks.gist = true; saveState();
      } else setFeedback("#gist-feedback", "Not quite. Listen for what she usually posts and what is different this week.", "error");
    }));
    const detailHost = $("#detail-statements");
    DATA.episode01.audio.details.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "detail-row";
      row.dataset.detail = index;
      row.innerHTML = `<p>${index + 1}. ${item.statement}</p><button data-value="true">TRUE</button><button data-value="false">FALSE</button>`;
      $$('button', row).forEach(button => button.addEventListener("click", () => {
        $$('button', row).forEach(item => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        row.dataset.selected = button.dataset.value;
      }));
      detailHost.appendChild(row);
    });
    $("#check-details").addEventListener("click", () => {
      const rows = $$(".detail-row");
      if (rows.some(row => !row.dataset.selected)) return setFeedback("#detail-feedback", "Choose TRUE or FALSE for all three statements first.", "hint");
      const wrong = rows.filter((row, index) => (row.dataset.selected === "true") !== DATA.episode01.audio.details[index].answer);
      if (!wrong.length) {
        setFeedback("#detail-feedback", "All three are correct. Nice detail listening.", "success");
        markTask("listening");
      } else setFeedback("#detail-feedback", `${wrong.length} answer${wrong.length > 1 ? "s" : ""} need another listen. Focus on alone / with classmates and confident / nervous.`, "error");
      unlockTranscript();
    });
    $("#transcript-button").addEventListener("click", event => {
      const transcript = $("#transcript");
      transcript.hidden = !transcript.hidden;
      transcript.textContent = DATA.episode01.audio.transcript;
      event.currentTarget.firstChild.textContent = transcript.hidden ? "SHOW TRANSCRIPT " : "HIDE TRANSCRIPT ";
    });
  }

  function initNotice() {
    const found = new Set();
    $$("[data-notice]").forEach(button => button.addEventListener("click", () => {
      button.classList.add("is-found"); found.add(button.dataset.notice);
      if (found.size === 2) { setFeedback("#notice-feedback", "Exactly. Time markers and verb forms work together.", "success"); markTask("notice"); }
      else setFeedback("#notice-feedback", "Good. Find the contrasting time view too.", "hint");
    }));
  }

  function initSort() {
    const host = $("#sort-bank");
    let selectedId = null;
    let draggedId = null;
    const placed = new Set();
    DATA.episode01.sort.forEach(item => {
      const chip = document.createElement("button");
      chip.className = "drag-chip"; chip.draggable = true; chip.dataset.sortId = item.id; chip.textContent = item.text;
      chip.addEventListener("dragstart", () => { draggedId = item.id; chip.classList.add("is-selected"); });
      chip.addEventListener("dragend", () => chip.classList.remove("is-selected"));
      chip.addEventListener("click", () => { if (placed.has(item.id)) return; $$(".drag-chip").forEach(x => x.classList.remove("is-selected")); selectedId = item.id; chip.classList.add("is-selected"); });
      host.appendChild(chip);
    });
    function attempt(id, target, zone) {
      if (!id || placed.has(id)) return;
      const item = DATA.episode01.sort.find(x => x.id === id);
      const chip = $(`[data-sort-id="${id}"]`);
      if (item.target === target) {
        placed.add(id); chip.classList.remove("is-selected"); chip.classList.add("is-correct"); chip.draggable = false; $(".drop-items", zone).appendChild(chip);
        setFeedback("#sort-feedback", placed.size === DATA.episode01.sort.length ? "Complete. You sorted meaning, not just verb shapes." : "Exactly. Notice the time phrase too.", "success");
        if (placed.size === DATA.episode01.sort.length) markTask("sort");
      } else {
        chip.classList.add("is-wrong"); setTimeout(() => chip.classList.remove("is-wrong"), 350);
        setFeedback("#sort-feedback", "Almost. Check the time marker: is it repeated, right now, or temporary around now?", "error");
      }
      selectedId = null; draggedId = null;
    }
    $$(".drop-zone").forEach(zone => {
      zone.addEventListener("dragover", event => { event.preventDefault(); zone.classList.add("is-over"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
      zone.addEventListener("drop", event => { event.preventDefault(); zone.classList.remove("is-over"); attempt(draggedId, zone.dataset.drop, zone); });
      zone.addEventListener("click", () => attempt(selectedId, zone.dataset.drop, zone));
      zone.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") attempt(selectedId, zone.dataset.drop, zone); });
    });
    let hint = 0;
    $('[data-hint-target="sort"]').addEventListener("click", () => {
      hint += 1;
      setFeedback("#sort-feedback", hint === 1 ? "Hint 1: usually and on Fridays point to repeated actions." : "Hint 2: right now / at the moment = now; this week = temporary around now.", "hint");
    });
  }

  function initGrammar() {
    $$("[data-grammar-tab]").forEach(button => button.addEventListener("click", () => {
      const tab = button.dataset.grammarTab;
      $$("[data-grammar-tab]").forEach(x => x.classList.toggle("is-active", x === button));
      $$("[data-grammar-panel]").forEach(panel => panel.classList.toggle("is-active", panel.dataset.grammarPanel === tab));
      if (tab === "rule" || tab === "mistake") markTask("grammar");
    }));
  }

  function initPractice() {
    const sentence = DATA.episode01.sentence;
    const bank = $("#sentence-bank"); const line = $("#sentence-line"); let sentenceSolved = false;
    function addTile(word, parent) {
      const tile = document.createElement("button"); tile.className = "word-tile"; tile.textContent = word;
      tile.addEventListener("click", () => (tile.parentElement === bank ? line : bank).appendChild(tile));
      parent.appendChild(tile);
    }
    sentence.words.forEach(word => addTile(word, bank));
    let sentenceAttempts = 0;
    $("#check-sentence").addEventListener("click", () => {
      const answer = $$(".word-tile", line).map(x => x.textContent.toLowerCase()).join(" ");
      if (answer === sentence.answer) { sentenceSolved = true; setFeedback("#sentence-feedback", "Correct: What do you usually post? Check the question word order.", "success"); checkPractice(); }
      else { sentenceAttempts++; setFeedback("#sentence-feedback", sentenceAttempts === 1 ? "Not quite. Start with the question word." : sentenceAttempts === 2 ? "Hint: What + do + subject + adverb + verb?" : "Answer: What do you usually post? Now rebuild it once without looking.", sentenceAttempts < 3 ? "error" : "hint"); }
    });
    $("#reset-sentence").addEventListener("click", () => { $$(".word-tile", line).forEach(tile => bank.appendChild(tile)); sentenceSolved = false; setFeedback("#sentence-feedback", "", "success"); });

    const typingHost = $("#typing-tasks"); const typingSolved = new Set();
    DATA.episode01.typing.forEach(item => {
      const wrap = document.createElement("div"); wrap.className = "typing-item"; wrap.dataset.typeId = item.id;
      wrap.innerHTML = `<p>${item.prompt}</p><div class="typing-row"><input autocomplete="off" aria-label="Answer for ${item.prompt}"><button class="btn btn-secondary">CHECK</button></div><div class="feedback" aria-live="polite"></div><div class="hint-stack"><button data-action="hint">NEED A HINT?</button><button data-action="answer" hidden>SHOW ANSWER</button></div>`;
      const input = $("input", wrap); const check = $(".btn", wrap); const feedback = $(".feedback", wrap); const hintButton = $('[data-action="hint"]', wrap); const answerButton = $('[data-action="answer"]', wrap);
      let attempts = 0; let hintIndex = 0;
      function evaluate() {
        const value = input.value.trim().toLowerCase().replace(/[.!?]+$/, "");
        if (item.answers.includes(value)) { typingSolved.add(item.id); input.disabled = true; check.disabled = true; setFeedback(feedback, `Correct. ${item.explanation}`, "success"); checkPractice(); }
        else { attempts++; setFeedback(feedback, attempts === 1 ? "Not quite. Check the time marker and the verb form." : item.hints[Math.min(attempts - 2, item.hints.length - 1)], attempts === 1 ? "error" : "hint"); if (attempts >= 3) answerButton.hidden = false; }
      }
      check.addEventListener("click", evaluate); input.addEventListener("keydown", event => { if (event.key === "Enter") evaluate(); });
      hintButton.addEventListener("click", () => { setFeedback(feedback, item.hints[Math.min(hintIndex, item.hints.length - 1)], "hint"); hintIndex++; if (hintIndex >= 2) answerButton.hidden = false; });
      answerButton.addEventListener("click", () => setFeedback(feedback, `Answer: ${item.answers[0]}. ${item.explanation}`, "hint"));
      typingHost.appendChild(wrap);
    });
    function checkPractice() { if (sentenceSolved && typingSolved.size === DATA.episode01.typing.length) markTask("practice"); }
  }

  function initRealEnglish() {
    $$("[data-natural]").forEach(button => button.addEventListener("click", () => {
      $$("[data-natural]").forEach(x => x.classList.remove("is-selected")); button.classList.add("is-selected");
      if (button.dataset.natural === "into") { setFeedback("#natural-feedback", "Yep — that sounds natural. “I really like…” is another good option.", "success"); markTask("realenglish"); }
      else setFeedback("#natural-feedback", "Meaning is clear, but English uses “really like”, not “very like”. Try the other sentence.", "error");
    }));
  }

  function speak(text, rate = .95) {
    if (!("speechSynthesis" in window)) return showToast("Speech playback is unavailable in this browser.");
    speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); const voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); utterance.voice = voices[0] || null; utterance.lang = "en-GB"; utterance.rate = rate; speechSynthesis.speak(utterance);
  }

  function initOge() {
    let index = 0;
    function paint() { $("#oge-count").textContent = `QUESTION ${index + 1} / ${DATA.episode01.ogeQuestions.length}`; $("#oge-question").textContent = DATA.episode01.ogeQuestions[index]; }
    $("#speak-question").addEventListener("click", () => speak(DATA.episode01.ogeQuestions[index], .9));
    $("#next-question").addEventListener("click", () => {
      if (index < DATA.episode01.ogeQuestions.length - 1) { index++; paint(); $$("[data-oge-check]").forEach(x => x.checked = false); }
      else { const checked = $$("[data-oge-check]").filter(x => x.checked).length; if (checked < 2) showToast("Use the self-check: direct answer + one detail."); else { markTask("oge"); showToast("Interview round complete. Direct answer + detail is the key pattern."); } }
    });
    paint();
  }

  class SpeakingTimer {
    constructor() { this.phase = "prepare"; this.remaining = 40; this.running = false; this.interval = null; $("#timer-start").addEventListener("click", () => this.start()); $("#timer-pause").addEventListener("click", () => this.pause()); $("#timer-reset").addEventListener("click", () => this.reset()); this.paint(); }
    start() { if (this.running) return; this.running = true; $("#timer-start").textContent = "RUNNING"; this.interval = setInterval(() => this.tick(), 1000); }
    pause() { this.running = false; clearInterval(this.interval); $("#timer-start").textContent = "CONTINUE"; }
    reset() { this.pause(); this.phase = "prepare"; this.remaining = 40; $("#timer-start").textContent = "START"; this.paint(); }
    tick() { this.remaining--; if (this.remaining <= 0) { if (this.phase === "prepare") { this.phase = "speak"; this.remaining = 120; showToast("Your turn. Speak for up to two minutes."); } else { this.pause(); this.remaining = 0; markTask("speaking"); showToast("Speaking time complete. Ask your tutor for one pronunciation note."); } } this.paint(); }
    paint() { $("#timer-phase").textContent = this.phase === "prepare" ? "PREPARE" : "SPEAK"; const minutes = Math.floor(this.remaining / 60); const seconds = String(this.remaining % 60).padStart(2, "0"); $("#timer-display").textContent = `${minutes}:${seconds}`; }
  }

  function initMission() {
    const fields = { online: $("#identity-online"), real: $("#identity-real"), usual: $("#identity-usual"), now: $("#identity-now") };
    Object.entries(fields).forEach(([key, input]) => { input.value = state.identity[key] || ""; input.addEventListener("input", () => { state.identity[key] = input.value; saveState(); }); });
    $("#build-identity").addEventListener("click", () => {
      const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value.trim()]));
      if (Object.values(values).filter(Boolean).length < 3) return showToast("Add short notes in at least three fields first.");
      const preview = $("#mission-preview"); preview.innerHTML = ""; const output = document.createElement("div"); output.className = "identity-card-output";
      [["ONLINE", values.online], ["REAL LIFE", values.real], ["USUALLY", values.usual], ["RIGHT NOW", values.now]].forEach(([label, value]) => { const cell = document.createElement("div"); const title = document.createElement("b"); title.textContent = label; const text = document.createElement("span"); text.textContent = value || "—"; cell.append(title, text); output.appendChild(cell); });
      preview.appendChild(output); markTask("mission");
    });
    new SpeakingTimer();
  }

  function initCheckpoint() {
    $$("#checkpoint-questions article").forEach(article => {
      $$('button', article).forEach(button => button.addEventListener("click", () => {
        $$('button', article).forEach(x => x.classList.remove("is-selected")); button.classList.add("is-selected"); article.dataset.selected = button.dataset.answer;
        article.classList.remove("is-correct", "is-wrong");
        const all = $$("#checkpoint-questions article");
        if (all.every(item => item.dataset.selected)) {
          const score = all.filter(item => item.dataset.selected === item.dataset.correct).length;
          all.forEach(item => item.classList.add(item.dataset.selected === item.dataset.correct ? "is-correct" : "is-wrong"));
          if (score === all.length) { setFeedback("#checkpoint-feedback", "3 / 3. Exactly — form and meaning are working together.", "success"); markTask("checkpoint"); }
          else setFeedback("#checkpoint-feedback", `${score} / 3. Review the red card(s), then choose again.`, "error");
        }
      }));
    });
  }

  function initHomework() {
    $$("[data-home]").forEach(box => { box.checked = Boolean(state.home.checks[box.dataset.home]); box.addEventListener("change", () => { state.home.checks[box.dataset.home] = box.checked; if (Object.values(state.home.checks).filter(Boolean).length >= 3) state.tasks.homework = true; saveState(); }); });
    const note = $("#home-note"); note.value = state.home.note || ""; note.addEventListener("input", () => { state.home.note = note.value; saveState(); });
  }

  function initComplete() {
    $("#complete-episode").addEventListener("click", () => {
      const core = ["warmup", "listening", "sort", "practice", "oge", "mission", "checkpoint"];
      const done = core.filter(key => state.tasks[key]).length;
      if (done < 5) return setFeedback("#complete-feedback", `Complete at least five core milestones first. You have ${done} / 7.`, "hint");
      if (!state.completedEpisodes.includes(1)) state.completedEpisodes.push(1);
      saveState(); setFeedback("#complete-feedback", "Episode 01 saved. Your course map and skills are updated.", "success"); showToast("Episode complete. Progress saved on this device.");
    });
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }

  function openEpisode(id) {
    state.currentEpisode = id;
    saveState();
    if (id === 1) return showView("lesson");
    const lesson = window.LEVEL_UP_LESSONS.find(item => item.id === id);
    if (!lesson) return showToast("This episode could not be loaded.");
    renderGenericLesson(lesson);
    showView("episode");
  }

  function genericTaskKey(id, task) { return `e${id}:${task}`; }

  function renderGenericLesson(lesson) {
    const host = $("#dynamic-lesson");
    const complete = state.completedEpisodes.includes(lesson.id);
    const categories = lesson.categories.map(x => `<div class="generic-sort-zone" data-g-zone="${esc(x)}"><strong>${esc(x.toUpperCase())}</strong><div></div></div>`).join("");
    const chips = lesson.sort.map((item,index) => `<button class="drag-chip generic-chip" data-g-chip="${index}">${esc(item[0])}</button>`).join("");
    const vocab = lesson.words.map((item,index) => `<button class="generic-match" data-g-word="${index}"><strong>${esc(item[0])}</strong><span>${esc(item[1])}</span></button>`).join("");
    const typing = lesson.type.map((item,index) => `<div class="typing-item" data-g-type="${index}"><p>${esc(item[0])}</p><div class="typing-row"><input autocomplete="off"/><button class="btn btn-secondary" data-g-check="${index}">CHECK</button></div><div class="feedback"></div><div class="hint-stack"><button data-g-hint="${index}">NEED A HINT?</button><button data-g-answer="${index}" hidden>SHOW ANSWER</button></div></div>`).join("");
    const ogeOptions = lesson.oge.options.map((item,index) => `<button data-g-oge="${index}">${esc(item)}</button>`).join("");
    const home = lesson.home.map((item,index) => `<label><input type="checkbox" data-g-home="${index}" ${state.genericHome[`${lesson.id}:${index}`] ? "checked":""}/><span><b>0${index+1}</b>${esc(item)}</span></label>`).join("");
    const nextId = lesson.id < 18 ? lesson.id + 1 : 1;
    host.innerHTML = `
      <div class="lesson-topbar"><button class="back-button" data-go="map">← BACK</button><div><strong>EPISODE ${String(lesson.id).padStart(2,"0")} / 18</strong><span>${esc(lesson.title)}</span></div><div class="lesson-meter"><span id="generic-meter"></span></div><button class="next-button" data-open-episode="${nextId}">${lesson.id < 18 ? "NEXT →":"HOME →"}</button></div>
      <article class="generic-hero lesson-shell accent-${esc(lesson.accent)}"><div><p class="eyebrow-line">MISSION ${String(lesson.id).padStart(2,"0")} · ${esc(lesson.theme.toUpperCase())}</p><h1 id="dynamic-title">${esc(lesson.title)}</h1><p>${esc(lesson.objective)}</p><div class="lesson-can-do"><span>LANGUAGE TOOLKIT</span><strong>${esc(lesson.grammar)}</strong><small>${esc(lesson.pronunciation)}</small></div></div><aside><div class="keks-stage generic-keks"></div><blockquote>“Your turn.”<small>— KEKS</small></blockquote></aside></article>
      <div class="lesson-content lesson-shell generic-content">
        <section class="lesson-block generic-context"><div class="block-label"><span>01</span><div><p>WARM-UP → DISCOVER</p><h2>THE SITUATION</h2></div></div><p class="context-lead">${esc(lesson.context)}</p><div class="generic-poll"><button data-g-poll="a">I can relate to this.</button><button data-g-poll="b">This would be new for me.</button><button data-g-poll="c">I already have an opinion.</button></div><div class="feedback" id="g-poll-feedback"></div><div class="audio-player"><button class="audio-main" data-g-listen>▶</button><button class="audio-small" data-g-replay>↺</button><div class="audio-track-wrap"><div class="audio-meta"><strong>LEVEL UP LAB · VOICE NOTE</strong><span>GIST → DETAIL</span></div><div class="audio-track"><span></span></div></div><button class="audio-small" data-g-transcript>SHOW TEXT</button></div><div class="generic-input" data-g-input hidden>${esc(lesson.input)}</div><div class="generic-gist"><strong>GIST:</strong> Explain the main situation in one sentence to your tutor.</div></section>
        <section class="lesson-block"><div class="block-label"><span>02</span><div><p>VOCABULARY · MATCH</p><h2>WORDS IN CONTEXT</h2></div></div><p class="instruction">Click each phrase to reveal its meaning. Then use two phrases in a true sentence.</p><div class="generic-vocab">${vocab}</div><div class="feedback" id="g-vocab-feedback"></div></section>
        <section class="lesson-block notice-block"><div class="block-label"><span>03</span><div><p>NOTICE</p><h2>WHAT DO YOU SEE?</h2></div></div><div class="quote-stack">${lesson.notice.map((x,i)=>`<button class="notice-sentence" data-g-notice="${i}">“${esc(x)}”</button>`).join("")}</div><p class="instruction">Find the repeated language pattern. Explain its meaning before opening the rule.</p><details class="generic-rule"><summary>OPEN THE RULE</summary><h3>${esc(lesson.grammar)}</h3><p>${esc(lesson.rule)}</p><div class="common-mistake"><b>COMMON MISTAKE</b><span>${esc(lesson.mistake)}</span></div></details></section>
        <section class="lesson-block"><div class="block-label"><span>04</span><div><p>SORT IT · TAP OR DRAG</p><h2>${esc(lesson.sortTitle)}</h2></div></div><div class="drag-bank" id="g-sort-bank">${chips}</div><div class="generic-sort-grid">${categories}</div><div class="feedback" id="g-sort-feedback"></div></section>
        <section class="lesson-block practice-block"><div class="block-label"><span>05</span><div><p>TYPE THE ANSWER</p><h2>TRY → HINT → CHECK</h2></div></div><div class="practice-split"><div class="practice-card">${typing}</div><aside class="pronunciation-card"><span>PRONUNCIATION</span><h3>${esc(lesson.pronunciation)}</h3><p>Listen to the input once more. Mark the stressed words, then shadow one sentence.</p><button class="btn btn-secondary" data-g-listen>HEAR AGAIN</button></aside></div></section>
        <section class="lesson-block real-english"><div class="real-english-title"><span>REAL</span><strong>ENGLISH</strong></div><div><p class="kicker">USEFUL LANGUAGE</p><h2>Say it naturally</h2><div class="useful-strip">${lesson.useful.map(x=>`<span>${esc(x)}</span>`).join("")}</div><p class="nuance">Choose two chunks. Adapt them — do not memorise a complete answer.</p></div></section>
        <section class="lesson-block oge-block"><div class="oge-header"><div><span>OGE MOMENT · ${esc(lesson.oge.kind)}</span><h2>STRATEGY IN CONTEXT</h2></div><strong>≈ 10–15 MIN</strong></div><div class="oge-grid"><div><div class="oge-question-card"><span>CHOOSE THE BEST ANSWER</span><h3>${esc(lesson.oge.task)}</h3><div class="stacked-options">${ogeOptions}</div><div class="feedback" id="g-oge-feedback"></div></div></div><aside class="exam-tip"><span>EXAM TIP · ПО-РУССКИ</span><h3>Сначала стратегия, затем ответ.</h3><p>${esc(lesson.oge.tip)}</p></aside></div></section>
        <section class="lesson-block mission-block"><div class="mission-number">MISSION<br/><strong>${String(lesson.id).padStart(2,"0")}</strong></div><div class="mission-main"><p class="kicker">PERSONALISE → COMMUNICATE</p><h2>YOUR TURN</h2><p>${esc(lesson.speaking)}</p><div class="useful-strip">${lesson.useful.map(x=>`<span>${esc(x)}</span>`).join("")}</div><div class="speaking-timer"><div><span id="g-timer-phase">PREPARE</span><strong id="g-timer-display">0:40</strong></div><button class="btn btn-primary" data-g-timer="start">START</button><button class="btn btn-ghost" data-g-timer="pause">PAUSE</button><button class="text-button" data-g-timer="reset">RESET</button></div></div></section>
        <section class="lesson-block"><div class="block-label"><span>06</span><div><p>WRITING · PLAN → WRITE → CHECK</p><h2>MAKE IT CLEAR</h2></div></div><p class="instruction">${esc(lesson.writing)}</p><div class="writing-scaffold"><div><b>PLAN</b><span>purpose · key points · example · ending</span></div><div><b>CHECK</b><span>task · grammar · linkers · spelling</span></div></div><textarea class="generic-writing" rows="8" placeholder="Write here — your draft is saved on this device.">${esc(state.drafts[lesson.id] || "")}</textarea><div class="word-count"><span>0 words</span><button class="btn btn-secondary" data-g-save>SAVE DRAFT</button></div></section>
        <section class="lesson-block home-mission"><div class="home-mission-heading"><span>HOME</span><strong>MISSION</strong><small>15–25 MIN</small></div><div class="home-task-list">${home}</div></section>
        <section class="episode-complete"><div class="keks-stage keks-complete"></div><div><p class="kicker">READY TO SAVE?</p><h2>EPISODE <mark>COMPLETE</mark></h2><p>Today you can ${esc(lesson.objective.charAt(0).toLowerCase()+lesson.objective.slice(1))}</p><blockquote>“${lesson.id===18 ? "That was a level up. Keep going." : "Not bad. Next stop?"}” <span>— Keks</span></blockquote><button class="btn btn-primary" data-g-complete>${complete ? "✓ EPISODE COMPLETE":"COMPLETE EPISODE"}</button><button class="btn btn-ghost" data-go="map">BACK TO MAP</button><div class="feedback" id="g-complete-feedback"></div></div></section>
      </div>`;
    initGenericLesson(lesson);
  }

  function initGenericLesson(lesson) {
    const done = name => markTask(genericTaskKey(lesson.id,name));
    const taskPercent = () => {
      const keys = ["warmup","listening","vocab","notice","sort","practice","oge","speaking","writing"];
      const count = keys.filter(k => state.tasks[genericTaskKey(lesson.id,k)]).length;
      const meter = $("#generic-meter"); if (meter) meter.style.width = `${Math.round(count/keys.length*100)}%`;
      return count;
    };
    $$('[data-go]', $("#dynamic-lesson")).forEach(button => button.addEventListener("click",()=>showView(button.dataset.go)));
    $('[data-open-episode]').addEventListener("click", e => lesson.id < 18 ? openEpisode(Number(e.currentTarget.dataset.openEpisode)) : showView("home"));
    $$('[data-g-poll]').forEach(button => button.addEventListener("click",()=>{ $$('[data-g-poll]').forEach(x=>x.classList.remove("is-selected")); button.classList.add("is-selected"); setFeedback("#g-poll-feedback","Good. Add one reason or example for your tutor.","success"); done("warmup"); taskPercent(); }));
    const playInput = () => { speak(lesson.input,.9); done("listening"); taskPercent(); };
    $$('[data-g-listen],[data-g-replay]').forEach(button=>button.addEventListener("click",playInput));
    $('[data-g-transcript]').addEventListener("click",e=>{ const box=$('[data-g-input]'); box.hidden=!box.hidden; e.currentTarget.textContent=box.hidden?"SHOW TEXT":"HIDE TEXT"; });
    const openedWords = new Set();
    $$('[data-g-word]').forEach(button=>button.addEventListener("click",()=>{ button.classList.toggle("is-open"); openedWords.add(button.dataset.gWord); if(openedWords.size>=4){setFeedback("#g-vocab-feedback","Nice. Now use two chunks in your own sentences.","success");done("vocab");taskPercent();} }));
    const noticed = new Set();
    $$('[data-g-notice]').forEach(button=>button.addEventListener("click",()=>{ button.classList.add("is-found"); noticed.add(button.dataset.gNotice); if(noticed.size===lesson.notice.length){done("notice");taskPercent();} }));
    $('.generic-rule').addEventListener("toggle",e=>{if(e.currentTarget.open){done("notice");taskPercent();}});
    let selectedChip = null; const placed = new Set();
    $$('[data-g-chip]').forEach(button=>button.addEventListener("click",()=>{ if(placed.has(button.dataset.gChip))return; $$('[data-g-chip]').forEach(x=>x.classList.remove("is-selected")); selectedChip=button.dataset.gChip;button.classList.add("is-selected"); }));
    $$('[data-g-zone]').forEach(zone=>zone.addEventListener("click",()=>{ if(selectedChip===null)return; const item=lesson.sort[Number(selectedChip)];const chip=$(`[data-g-chip="${selectedChip}"]`);if(item[1]===zone.dataset.gZone){placed.add(selectedChip);chip.className="drag-chip is-correct";$("div",zone).appendChild(chip);setFeedback("#g-sort-feedback",placed.size===lesson.sort.length?"Complete. Explain one choice to your tutor.":"Exactly.","success");if(placed.size===lesson.sort.length){done("sort");taskPercent();}}else{setFeedback("#g-sort-feedback","Almost. Check the meaning, not only the form.","error");chip.classList.add("is-wrong");setTimeout(()=>chip.classList.remove("is-wrong"),350);}selectedChip=null;}));
    const typeSolved = new Set();
    $$('[data-g-check]').forEach(button=>button.addEventListener("click",()=>{const i=Number(button.dataset.gCheck);const wrap=button.closest('[data-g-type]');const input=$("input",wrap);const feedback=$(".feedback",wrap);const attempt=input.value.trim().toLowerCase().replace(/[.!?]/g,"");const answer=lesson.type[i][1].toLowerCase();wrap.dataset.attempts=String(Number(wrap.dataset.attempts||0)+1);if(attempt===answer){typeSolved.add(i);input.disabled=true;button.disabled=true;setFeedback(feedback,`Correct. ${lesson.type[i][2]}`,"success");if(typeSolved.size===lesson.type.length){done("practice");taskPercent();}}else{const n=Number(wrap.dataset.attempts);setFeedback(feedback,n===1?"Not quite. Check meaning and form.":lesson.type[i][2],n===1?"error":"hint");if(n>=2)$('[data-g-answer]',wrap).hidden=false;}}));
    $$('[data-g-hint]').forEach(button=>button.addEventListener("click",()=>{const i=Number(button.dataset.gHint),wrap=button.closest('[data-g-type]');setFeedback($(".feedback",wrap),lesson.type[i][2],"hint");$('[data-g-answer]',wrap).hidden=false;}));
    $$('[data-g-answer]').forEach(button=>button.addEventListener("click",()=>{const i=Number(button.dataset.gAnswer);setFeedback($(".feedback",button.closest('[data-g-type]')),`Answer: ${lesson.type[i][1]}. ${lesson.type[i][2]}`,"hint");}));
    $$('[data-g-oge]').forEach(button=>button.addEventListener("click",()=>{ $$('[data-g-oge]').forEach(x=>x.classList.remove("is-selected"));button.classList.add("is-selected");if(Number(button.dataset.gOge)===lesson.oge.answer){setFeedback("#g-oge-feedback","Exactly. Now explain why the other options do not fit.","success");done("oge");taskPercent();}else setFeedback("#g-oge-feedback","Not quite. Use the exam tip and check the complete meaning.","error");}));
    let phase="prepare",remaining=40,running=false,timer=null; const paint=()=>{$("#g-timer-phase").textContent=phase.toUpperCase();$("#g-timer-display").textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}`;};
    const stop=()=>{running=false;clearInterval(timer);};
    $('[data-g-timer="start"]').addEventListener("click",()=>{if(running)return;running=true;timer=setInterval(()=>{remaining--;if(remaining<=0){if(phase==="prepare"){phase="speak";remaining=120;showToast("Your turn. Speak for up to two minutes.");}else{stop();remaining=0;done("speaking");taskPercent();showToast("Speaking complete. Ask your tutor for one useful note.");}}paint();},1000);});
    $('[data-g-timer="pause"]').addEventListener("click",stop);$('[data-g-timer="reset"]').addEventListener("click",()=>{stop();phase="prepare";remaining=40;paint();});paint();
    const textarea=$(".generic-writing");const count=$(".word-count span");const countWords=()=>{const n=textarea.value.trim()?textarea.value.trim().split(/\s+/).length:0;count.textContent=`${n} words`;};textarea.addEventListener("input",countWords);countWords();
    $('[data-g-save]').addEventListener("click",()=>{state.drafts[lesson.id]=textarea.value;saveState();done("writing");taskPercent();showToast("Draft saved on this device.");});
    $$('[data-g-home]').forEach(box=>box.addEventListener("change",()=>{state.genericHome[`${lesson.id}:${box.dataset.gHome}`]=box.checked;saveState();}));
    $('[data-g-complete]').addEventListener("click",e=>{const countDone=taskPercent();if(countDone<5)return setFeedback("#g-complete-feedback",`Complete at least five lesson milestones first. You have ${countDone} / 9.`,"hint");if(!state.completedEpisodes.includes(lesson.id))state.completedEpisodes.push(lesson.id);saveState();e.currentTarget.textContent="✓ EPISODE COMPLETE";setFeedback("#g-complete-feedback","Saved. Your course map and progress are updated.","success");});
    taskPercent();
  }

  function restoreView() {
    const safe = ["home", "map", "vocab", "progress", "lesson", "episode"].includes(state.selectedView) ? state.selectedView : "home";
    if (safe === "episode" && state.currentEpisode > 1) renderGenericLesson(window.LEVEL_UP_LESSONS.find(x=>x.id===state.currentEpisode));
    showView(safe, false);
  }

  function init() {
    renderHome(); renderVocabulary(); initNavigation(); initWarmup(); initListening(); initNotice(); initSort(); initGrammar(); initPractice(); initRealEnglish(); initOge(); initMission(); initCheckpoint(); initHomework(); initComplete(); updateProgressUI(); restoreView();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

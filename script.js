const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

// Quote reveal tuning: lower visible values start earlier while the text is lower onscreen.
const QUOTE_REVEAL_TIMING = {
  visibleRatio: .60,
  visibleLines: 2.2,
  viewportScrollDistance: .55,
  lineScrollDistance: 3.5
};

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-button");
const hero = document.querySelector(".hero");
const heroVideo = document.querySelector(".hero-video");
const storyVideo = document.querySelector(".story-video");
const concernExplorer = document.querySelector("[data-concern-explorer]");
const concernCore = document.querySelector(".concern-core");
const concernTitle = document.querySelector("[data-concern-title]");
const concernMessage = document.querySelector("[data-concern-message]");
const quoteStage = document.querySelector(".quote-stage");
const scrubQuote = document.querySelector("[data-scrub-text]");
const pathway = document.querySelector(".pathway");
const pathTrack = document.querySelector(".path-horizontal-track");
const pathCards = [...document.querySelectorAll("[data-path-card]")];
const pathProgress = document.querySelector(".path-progress span");
const pathCount = document.querySelector("[data-path-count]");
const pathPrev = document.querySelector("[data-path-prev]");
const pathNext = document.querySelector("[data-path-next]");
const parallaxElements = [...document.querySelectorAll("[data-parallax]")];
const bookingForm = document.querySelector(".booking-form");

const concerns = {
  "brain-fog": ["From fog to focus.", "When everything feels cloudy, the first step is not pressure. It is clarity. We slow the noise, organize what matters, and find a practical way forward."],
  anxiety: ["Make room to breathe.", "Anxiety can make every decision feel urgent. Together, we create enough space to understand the worry, steady your thinking, and choose the next useful step."],
  "career-uncertainty": ["Direction before speed.", "You do not need a perfect ten-year plan. We clarify what matters, make your options visible, and create movement without forcing certainty."],
  "job-hunting": ["Turn the search into a plan.", "A job search can drain confidence. We bring structure to applications, sharpen how you communicate your strengths, and keep the process moving."],
  "comfort-zone": ["Courage, made practical.", "Growth does not require one enormous leap. We turn avoidance into smaller, supported experiments that build confidence through experience."],
  fomo: ["Choose your own pace.", "Comparison can make somebody else's life feel like a deadline. We reconnect your choices to your values, not the noise around you."],
  presence: ["Come back to now.", "When your attention lives in what might happen or what others are doing, life can pass unnoticed. We build grounded ways to return to the present."],
  confidence: ["Build trust in yourself.", "Confidence grows as you understand yourself, keep small promises, and learn from action without judging every imperfect step."],
  habits: ["Change that can stay.", "Real change has to fit real life. We create routines that are realistic, flexible, and connected to what actually matters to you."],
  transitions: ["Find your footing in change.", "New chapters can hold excitement and uncertainty at once. Coaching gives you a steady place to understand what is ending and what comes next."],
  "young-pressure": ["A steady voice in a loud season.", "School, identity, family, friendships, and the future can pile up quickly. Gratitude offers age-aware support for making sense of the pressure."]
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("in-view");
  });
}, { threshold: 0.13 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

if (scrubQuote) {
  scrubQuote.innerHTML = scrubQuote.textContent.trim().split(/\s+/).map((word) => `<span class="word">${word}</span>`).join(" ");
}

let quoteLineHeight = 0;
function measureQuote() {
  if (!scrubQuote) return;
  const styles = window.getComputedStyle(scrubQuote);
  const measuredLineHeight = Number.parseFloat(styles.lineHeight);
  const measuredFontSize = Number.parseFloat(styles.fontSize);
  quoteLineHeight = Number.isFinite(measuredLineHeight) ? measuredLineHeight : measuredFontSize * 1.02;
}
measureQuote();
document.fonts?.ready.then(measureQuote);

function closeMenu() {
  header?.classList.remove("menu-open");
  document.body.classList.remove("menu-locked");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Open menu");
}

menuButton?.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  header?.classList.toggle("menu-open", !expanded);
  document.body.classList.toggle("menu-locked", !expanded);
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menuButton.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
});

header?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
document.addEventListener("pointerdown", (event) => {
  if (header?.classList.contains("menu-open") && !header.contains(event.target)) closeMenu();
});

function selectConcern(node) {
  const content = concerns[node.dataset.concern];
  if (!content) return;
  concernExplorer.querySelectorAll("[data-concern]").forEach((item) => {
    const active = item === node;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  concernCore?.classList.remove("is-changing");
  void concernCore?.offsetWidth;
  concernTitle.textContent = content[0];
  concernMessage.textContent = content[1];
  concernCore?.classList.add("is-changing");
}

concernExplorer?.querySelectorAll("[data-concern]").forEach((node) => {
  node.addEventListener("click", () => selectConcern(node));
  node.addEventListener("focus", () => selectConcern(node));
  node.addEventListener("pointerenter", () => { if (finePointer.matches) selectConcern(node); });
});

concernExplorer?.addEventListener("pointermove", (event) => {
  if (!finePointer.matches || reducedMotion || window.innerWidth <= 900) return;
  const rect = concernExplorer.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - .5) * 12;
  const y = ((event.clientY - rect.top) / rect.height - .5) * 12;
  concernCore.style.translate = `${x}px ${y}px`;
});
concernExplorer?.addEventListener("pointerleave", () => { if (concernCore) concernCore.style.translate = ""; });

document.querySelectorAll(".magnetic").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    if (reducedMotion || !finePointer.matches) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate3d(${x * .1}px, ${y * .1}px, 0)`;
  });
  element.addEventListener("pointerleave", () => { element.style.transform = ""; });
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (reducedMotion || !finePointer.matches || window.innerWidth < 901) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(1100px) rotateX(${-y * 2.5}deg) rotateY(${x * 3.5}deg) translateY(-3px)`;
    const glow = card.querySelector(".service-glow");
    if (glow) glow.style.transform = `translate3d(${x * 35}px, ${y * 35}px, 0)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
    const glow = card.querySelector(".service-glow");
    if (glow) glow.style.transform = "";
  });
});

document.querySelectorAll("[data-service-card]").forEach((card) => {
  const openCard = () => {
    document.querySelectorAll("[data-service-card]").forEach((item) => {
      const open = item === card;
      item.classList.toggle("is-open", open);
      item.querySelector(".service-trigger")?.setAttribute("aria-expanded", String(open));
    });
  };
  card.querySelector(".service-trigger")?.addEventListener("click", openCard);
  card.addEventListener("pointerenter", () => { if (finePointer.matches) openCard(); });
});

let currentPathIndex = 0;
function setCurrentPath(index) {
  currentPathIndex = Math.round(clamp(index, 0, pathCards.length - 1));
  pathCards.forEach((card, cardIndex) => card.classList.toggle("is-current", cardIndex === currentPathIndex));
  if (pathCount) pathCount.textContent = `${String(currentPathIndex + 1).padStart(2, "0")} / ${String(pathCards.length).padStart(2, "0")}`;
}

function goToPath(index) {
  const targetIndex = Math.round(clamp(index, 0, pathCards.length - 1));
  setCurrentPath(targetIndex);
  if (window.innerWidth <= 900 || reducedMotion) {
    const target = pathCards[targetIndex];
    const edge = window.innerWidth <= 560 ? 18 : 24;
    pathTrack?.scrollTo({ left: target.offsetLeft - edge, behavior: "smooth" });
    return;
  }
  const scrollable = pathway.offsetHeight - window.innerHeight;
  window.scrollTo({ top: pathway.offsetTop + (targetIndex / (pathCards.length - 1)) * scrollable, behavior: "smooth" });
}

pathPrev?.addEventListener("click", () => goToPath(currentPathIndex - 1));
pathNext?.addEventListener("click", () => goToPath(currentPathIndex + 1));

pathTrack?.addEventListener("scroll", () => {
  if (window.innerWidth > 900) return;
  const maxScroll = pathTrack.scrollWidth - pathTrack.clientWidth;
  const progress = maxScroll > 0 ? pathTrack.scrollLeft / maxScroll : 0;
  if (pathProgress) pathProgress.style.width = `${progress * 100}%`;
  const center = pathTrack.scrollLeft + pathTrack.clientWidth / 2;
  const nearest = pathCards.reduce((best, card, index) => {
    const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Infinity });
  setCurrentPath(nearest.index);
}, { passive: true });

function updateVideoRate(video) {
  if (!video || !Number.isFinite(video.duration)) return;
  const remaining = video.duration - video.currentTime;
  video.playbackRate = remaining > 0 && remaining <= 1 ? .18 + .62 * remaining : .8;
}

async function playHero({ restart = false } = {}) {
  if (!heroVideo || reducedMotion) return;
  if (restart) heroVideo.currentTime = 0;
  heroVideo.loop = true;
  heroVideo.playbackRate = .7;
  try { await heroVideo.play(); } catch { /* The first frame remains if autoplay is blocked. */ }
}

heroVideo?.addEventListener("loadedmetadata", () => { heroVideo.playbackRate = .7; });

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!heroVideo || reducedMotion) return;
    if (entry.isIntersecting && entry.intersectionRatio > .08) playHero();
    else heroVideo.pause();
  });
}, { threshold: [0, .08, .5] });
if (hero) heroObserver.observe(hero);

let storyCompleted = false;
storyVideo?.addEventListener("timeupdate", () => updateVideoRate(storyVideo));
storyVideo?.addEventListener("ended", () => {
  storyCompleted = true;
  storyVideo.currentTime = Math.max(0, storyVideo.duration - .04);
});

const storyObserver = new IntersectionObserver((entries) => {
  entries.forEach(async (entry) => {
    if (!storyVideo || reducedMotion) return;
    if (entry.isIntersecting && entry.intersectionRatio > .35) {
      if (storyCompleted) storyVideo.currentTime = 0;
      storyCompleted = false;
      storyVideo.playbackRate = .8;
      try { await storyVideo.play(); } catch { /* A still frame remains visible. */ }
    } else {
      storyVideo.pause();
    }
  });
}, { threshold: [0, .35, .75] });
if (storyVideo) storyObserver.observe(storyVideo);

function updateScrubbedQuote() {
  if (!quoteStage || !scrubQuote) return;
  const rect = scrubQuote.getBoundingClientRect();
  const visibleLines = quoteLineHeight * QUOTE_REVEAL_TIMING.visibleLines;
  const requiredVisible = Math.min(rect.height * QUOTE_REVEAL_TIMING.visibleRatio, visibleLines);
  const triggerTop = window.innerHeight - requiredVisible;
  const revealDistance = Math.max(
    window.innerHeight * QUOTE_REVEAL_TIMING.viewportScrollDistance,
    quoteLineHeight * QUOTE_REVEAL_TIMING.lineScrollDistance
  );
  const progress = clamp((triggerTop - rect.top) / revealDistance);
  const words = [...scrubQuote.querySelectorAll(".word")];
  const active = progress * (words.length + 3);
  words.forEach((word, index) => {
    word.classList.toggle("lit", index < active);
    word.classList.toggle("hot", index >= active - 2.8 && index < active);
    const glow = index >= active - 3.2 && index < active ? clamp(1 - Math.abs(active - index - 1) / 3, 0, 1) * .7 : 0;
    word.style.setProperty("--word-glow", glow.toFixed(2));
  });
}

function updatePathway() {
  if (!pathway || !pathTrack || window.innerWidth <= 900 || reducedMotion) return;
  const rect = pathway.getBoundingClientRect();
  const scrollable = pathway.offsetHeight - window.innerHeight;
  const progress = clamp(-rect.top / scrollable);
  const maxTravel = Math.max(0, pathTrack.scrollWidth - window.innerWidth + window.innerWidth * .05);
  pathTrack.style.transform = `translate3d(${-progress * maxTravel}px, 0, 0)`;
  if (pathProgress) pathProgress.style.width = `${progress * 100}%`;
  setCurrentPath(Math.round(progress * (pathCards.length - 1)));
}

function updateParallax() {
  if (reducedMotion) return;
  parallaxElements.forEach((element) => {
    const section = element.closest("section") || element;
    const rect = section.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
    const depth = Number.parseFloat(element.dataset.parallax) || 0;
    const distance = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const y = clamp(distance * depth, -110, 110);
    element.style.setProperty("--parallax-y", `${y}px`);
  });
}

function updateActiveNav() {
  const ids = ["top", "pathway", "services", "about", "faq", "book"];
  let current = "top";
  ids.forEach((id) => {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= window.innerHeight * .34) current = id;
  });
  header?.querySelectorAll("nav a").forEach((link) => link.classList.toggle("is-current", link.getAttribute("href") === `#${current}`));
}

function updateScroll() {
  header?.classList.toggle("scrolled", window.scrollY > 45);
  updateScrubbedQuote();
  updatePathway();
  updateParallax();
  updateActiveNav();
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateScroll(); ticking = false; });
}, { passive: true });

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
  if (window.innerWidth <= 900 && pathTrack) pathTrack.style.transform = "";
  measureQuote();
  updateScroll();
}, { passive: true });

window.addEventListener("pointermove", (event) => {
  if (!finePointer.matches || reducedMotion) return;
  document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
  document.body.classList.add("cursor-ready");
}, { passive: true });

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const required = [...bookingForm.querySelectorAll("[required]")];
  required.forEach((field) => field.classList.toggle("field-error", !field.checkValidity()));
  const invalid = required.find((field) => !field.checkValidity());
  const status = bookingForm.querySelector(".form-status");
  if (invalid) {
    status.textContent = "Please complete the highlighted fields so we know how to reach you.";
    invalid.focus();
    return;
  }
  const name = new FormData(bookingForm).get("name");
  status.textContent = `Thank you, ${name}. This form is ready to connect to Gratitude's live booking inbox.`;
});
bookingForm?.addEventListener("input", (event) => event.target.classList.remove("field-error"));

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details[open]").forEach((other) => { if (other !== detail) other.open = false; });
  });
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
setCurrentPath(0);
updateScroll();
playHero();

"use strict";

const photos = [
  ["12-2", "самый лучший выпуск который только мог быть", "Мы обнимаемся на фоне города и гор", "50% 46%"],
  ["12-6", "очень скучаю по нашим школьным дням", "Мы обнимаемся в школьном коридоре", "50% 40%"],
  ["13-5", "самая лучшая девушка на свете", "Наше селфи на фоне вечернего города"],
  ["12-1", "Там, где ты", "Мы лежим в обнимку на шезлонге", "60% 55%"],
  ["12-11", "обожаю эту фотку", "Мы стоим рядом у лестницы", "53% 43%"],
  ["13-0", "Дурачимся", "Наше смешное селфи со статуями лошадей", "55% 46%"],
  ["12-15", "в океанариуме", "Наше фото в зеркале у аквариума", "41% 41%"],
  ["12-14", "у меня такая же подушка", "Я целую тебя в щёку", "53% 50%"],
  ["12-0", "Ещё один поцелуй", "Ты целуешь меня в щёку"],
  ["12-4", "мы танцевали лучше всех", "Я держу тебя на руках во дворе школы", "49% 68%"],
  ["12-5", "жепость", "Мы в рубашках с надписями", "52% 34%"],
  ["12-7", "23 мая", "Мы с друзьями фотографируемся в классе", "63% 48%"],
  ["12-8", "Вместе с друзьями", "Четверо друзей сидят за партой", "61% 44%"],
  ["12-9", "Глаза в глаза", "Наши лица крупным планом"],
  ["12-10", "По дороге", "Смешное селфи рядом с окном"],
  ["12-12", "По лестнице", "Мы вдвоём спускаемся по лестнице", "50% 65%"],
  ["12-13", "Школьный кадр", "Наше фото в школьном коридоре", "50% 37%"],
  ["13-1", "На солнце", "Мы целуемся в солнечных очках"],
  ["13-2", "День у бассейна", "Наше селфи на лежаке под пальмами"],
  ["13-3", "Держу твою пятку", "Наши руки на фоне бассейна"],
  ["13-4", "Мандаринка", "Твой смешной портрет с долькой мандарина"],
  ["13-6", "В леруа", "Наш поцелуй в отражении зеркала", "62% 50%"],
  ["13-7", "Моя сладость", "Я целую тебя в висок", "48% 37%"],
];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const grid = document.querySelector("#photo-grid");
const more = document.querySelector("#more-photos");
const viewer = document.querySelector("#photo-viewer");
const viewerImage = document.querySelector("#viewer-image");
const viewerCaption = document.querySelector("#viewer-caption");
const viewerCount = document.querySelector("#photo-count");
const closePhoto = document.querySelector("#close-photo");
const swipeArea = document.querySelector("#viewer-swipe");
const initiallyVisible = 8;
let currentPhoto = 0;
let photoOpener;
let touchStart;

function photoPath(id) {
  return "./media/" + id + ".jpg";
}

function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  const [id, caption, alt] = photos[currentPhoto];
  viewerImage.src = photoPath(id);
  viewerImage.alt = alt;
  viewerCaption.textContent = caption;
  viewerCount.textContent = (currentPhoto + 1) + " / " + photos.length;
}

const photoCards = photos.map(([id, caption, alt, position], index) => {
  const card = document.createElement("a");
  card.className = "photo-card";
  card.href = photoPath(id);
  card.hidden = index >= initiallyVisible;
  const image = new Image();
  image.src = card.href;
  image.alt = alt;
  image.loading = "lazy";
  image.decoding = "async";
  if (position) image.style.objectPosition = position;

  const label = document.createElement("span");
  label.className = "photo-caption";
  const number = document.createElement("span");
  number.className = "photo-index";
  number.textContent = String(index + 1).padStart(2, "0");
  number.setAttribute("aria-hidden", "true");
  label.append(number, caption);
  card.append(image, label);

  card.addEventListener("click", event => {
    if (typeof viewer.showModal !== "function" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    photoOpener = card;
    showPhoto(index);
    viewer.showModal();
    document.body.classList.add("viewer-open");
  });
  return card;
});
grid.append(...photoCards);

more.addEventListener("click", () => {
  const expanded = more.getAttribute("aria-expanded") === "true";
  for (const card of photoCards.slice(initiallyVisible)) card.hidden = expanded;
  more.setAttribute("aria-expanded", String(!expanded));
  more.firstChild.nodeValue = expanded ? "Показать все 23 фото " : "Свернуть альбом ";
  if (!expanded) photoCards[initiallyVisible].focus();
});

closePhoto.addEventListener("click", () => viewer.close());
document.querySelector("#previous-photo").addEventListener("click", () => showPhoto(currentPhoto - 1));
document.querySelector("#next-photo").addEventListener("click", () => showPhoto(currentPhoto + 1));
viewer.addEventListener("click", event => {
  if (event.target === viewer) {
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  }
});
viewer.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(currentPhoto + (event.key === "ArrowLeft" ? -1 : 1));
  }
});
viewer.addEventListener("close", () => {
  document.body.classList.remove("viewer-open");
  photoOpener?.focus({ preventScroll: true });
});
swipeArea.addEventListener("touchstart", event => {
  touchStart = event.touches.length === 1 && event.target === viewerImage ? event.touches[0] : null;
}, { passive: true });
swipeArea.addEventListener("touchend", event => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.clientX;
  const dy = touch.clientY - touchStart.clientY;
  if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.35) showPhoto(currentPhoto + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });

const video = document.querySelector("#our-video");
const play = document.querySelector("#play-film");
play.hidden = false;
play.addEventListener("click", () => {
  play.hidden = true;
  const start = video.play();
  if (start) start.catch(() => video.focus({ preventScroll: true }));
});

function celebrate() {
  if (reducedMotion.matches) return;
  const confetti = document.querySelector("#confetti");
  const symbols = ["♡", "✦", "·", "♥"];
  const colors = ["#9d4a5c", "#b28057", "#bd6879", "#742a40"];
  const radius = Math.min(220, document.documentElement.clientWidth / 2 - 32);
  for (let index = 0; index < 30; index += 1) {
    const angle = index / 30 * Math.PI * 2;
    const distance = radius * (.45 + Math.random() * .55);
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.textContent = symbols[index % symbols.length];
    particle.style.setProperty("--particle-color", colors[index % colors.length]);
    particle.style.setProperty("--x", Math.cos(angle) * distance + "px");
    particle.style.setProperty("--y", Math.sin(angle) * distance * .72 - 36 + "px");
    particle.style.setProperty("--spin", (index * 27 % 180 - 90) + "deg");
    particle.style.setProperty("--delay", (index % 7) * 24 + "ms");
    particle.style.setProperty("--size", 13 + index % 10 + "px");
    confetti.append(particle);
  }
  window.setTimeout(() => confetti.replaceChildren(), 1500);
}

const unwrap = document.querySelector("#unwrap");
const giftNote = document.querySelector("#gift-note");
const giftLink = document.querySelector("#gift-link");
try {
  const url = new URL(window.GIFT_URL);
  if (url.protocol === "https:" || url.protocol === "http:") {
    giftLink.href = url.href;
    giftLink.hidden = false;
    document.querySelector("#gift-message").textContent = "Я приготовил для тебя сюрприз. Он ждёт тебя здесь ♡";
  }
} catch {
  // Пока ссылка не задана, внутри коробки видна открытка.
}
unwrap.addEventListener("click", () => {
  unwrap.classList.add("is-open");
  unwrap.setAttribute("aria-expanded", "true");
  unwrap.disabled = true;
  giftNote.hidden = false;
  giftNote.querySelector(".gift-note-title").focus({ preventScroll: true });
  celebrate();
  giftNote.scrollIntoView({ block: "nearest", behavior: reducedMotion.matches ? "auto" : "smooth" });
}, { once: true });

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove("waiting");
      reveal.unobserve(entry.target);
    }
  }, { threshold: .06 });
  for (const section of document.querySelectorAll(".reveal")) {
    if (section.getBoundingClientRect().top >= window.innerHeight) {
      section.classList.add("waiting");
      reveal.observe(section);
    }
  }
}

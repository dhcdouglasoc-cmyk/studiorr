// MENU MOBILE
const toggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

toggle.addEventListener("click", () => {
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
});

// SCROLL SUAVE
function scrollContato() {
  document.getElementById("contato").scrollIntoView({
    behavior: "smooth"
  });
}

// FORM
const form = document.getElementById("formContato");
const msg = document.getElementById("msg");

form.addEventListener("submit", function(e) {
  e.preventDefault();
  msg.innerText = "Mensagem enviada com sucesso 💖";
});

// CAROUSEL
const track = document.querySelector(".carousel-track");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

let index = 0;

next.addEventListener("click", () => {
  if (index < track.children.length - 1) {
    index++;
    track.style.transform = `translateX(-${index * 100}%)`;
  }
});

prev.addEventListener("click", () => {
  if (index > 0) {
    index--;
    track.style.transform = `translateX(-${index * 100}%)`;
  }
});

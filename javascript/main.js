
import Game from "./Game";

window.addEventListener("DOMContentLoaded", () => {
  const cvs = document.getElementById('ball-popcalypse');
  const ctx = cvs.getContext('2d');
  const game = new Game(cvs, ctx);
  window.game = game;
  
  game.initAssets();
  game.loop();
});
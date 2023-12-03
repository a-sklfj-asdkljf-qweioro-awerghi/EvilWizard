const player_img = new Image();
const zombie_img = new Image();
const map_img = new Image();
player_img.src = "player.png";
map_img.src = "map.png";
zombie_img.src = "zombie.png";
const button = document.getElementById("start");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const screen_x = canvas.width / 2;
const screen_y = canvas.height / 2;
let game_time = 1;
let map = {
  width: 2000,
  height: 2000,
  x: 0,
  y: 0,
};

let player = {
  width: 60,
  height: 60,
  angle: 0,
  speed: 5,
  isDead: 0,
};
let direction = { s: 0, a: 0, d: 0, w: 0 };
let zombie_kills = 0;
let bullets = [];
let zombies = [];
button.addEventListener("click", () => {
  button.style.display = "none";
  bullets = [];
  zombies = [];
  game_time = 1;
  player.isDead = false;
  zombie_kills = 0;
  map.x = 0;
  map.y = 0;
  generate_zombie();
  shoot();
  if (button.textContent === "retry") GameLoop();
});

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "w") direction["w"] = true;
  else if (key === "s") direction["s"] = true;
  else if (key === "d") direction["d"] = true;
  else if (key === "a") direction["a"] = true;
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  direction[key] = false;
});

window.addEventListener("mousemove", (e) => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const deltaX = e.x - centerX;
  const deltaY = e.y - centerY;
  player.angle = Math.atan2(deltaY, deltaX);
});

function GameLoop() {
  update();
  if (player.isDead) {
    GameOver();
    return;
  }
  drawCanvas();
  window.requestAnimationFrame(GameLoop);
}
function GameOver() {
  button.style.display = "block";
  button.textContent = "retry";
}
function shoot() {
  const start_x = 33 * Math.cos(player.angle + 0.5);
  const start_y = 33 * Math.sin(player.angle + 0.5);
  bullets.push({ x: start_x, y: start_y, org_x: map.x, org_y: map.y, angle: player.angle });
  if (!player.isDead) setTimeout(shoot, 1000 / (1 + game_time * 0.5));
}
function generate_zombie() {
  game_time = game_time * 1.01;
  const randomAngle = (Math.random() - 0.5) * 1e9;
  const radius = Math.random() * canvas.width + canvas.width;
  const start_x = Math.cos(randomAngle) * radius;
  const start_y = Math.sin(randomAngle) * radius;
  zombies.push({ x: start_x, y: start_y, org_x: map.x, org_y: map.y });
  if (!player.isDead) setTimeout(generate_zombie, 1000 / (1 + game_time));
}
function update() {
  const sum = direction["s"] + direction["w"] + direction["a"] + direction["d"];
  const devider = sum == 2 ? 1.5 : 1;
  if (direction["w"]) map.y += player.speed / devider;
  if (direction["s"]) map.y -= player.speed / devider;
  if (direction["a"]) map.x += player.speed / devider;
  if (direction["d"]) map.x -= player.speed / devider;
  let mod_x = 0;
  let mod_y = 0;
  if (map.x > map.width) mod_x = -map.width;
  else if (map.x < 0) mod_x = map.width;
  if (map.y > map.height) mod_y = -map.height;
  else if (map.y < 0) mod_y = map.height;
  map.x += mod_x;
  map.y += mod_y;
  bullets.forEach((bullet, i) => {
    bullet.x += 15 * Math.cos(bullet.angle);
    bullet.y += 15 * Math.sin(bullet.angle);
    bullet.org_x += mod_x;
    bullet.org_y += mod_y;
    if (Math.sqrt(bullet.x * bullet.x + bullet.y * bullet.y) > 800) bullets.splice(i, 1);
  });
  zombies.forEach((zombie, i) => {
    zombie.org_x += mod_x;
    zombie.org_y += mod_y;
    const pos_x = zombie.x + map.x - zombie.org_x;
    const pos_y = zombie.y + map.y - zombie.org_y;
    const zombie_angle = Math.atan2(-pos_y, -pos_x);
    zombie.x += 3 * Math.cos(zombie_angle);
    zombie.y += 3 * Math.sin(zombie_angle);
    bullets.forEach((bullet, j) => {
      const diff_x = pos_x - (bullet.x + map.x - bullet.org_x);
      const diff_y = pos_y - (bullet.y + map.y - bullet.org_y);
      if (Math.sqrt(diff_x * diff_x + diff_y * diff_y) < 60) {
        bullets.splice(j, 1);
        zombies.splice(i, 1);
        zombie_kills++;
      }
    });
    if (Math.sqrt(pos_x * pos_x + pos_y * pos_y) < 55) player.isDead = true;
  });
}
function drawCanvas() {
  ctx.clearRect(-map.width, -map.height, 2 * map.width, 2 * map.height); // clear canvas
  const render_x = map.x - map.width;
  const render_y = map.y - map.height;
  ctx.drawImage(map_img, map.x, map.y, map.width, map.height);
  ctx.drawImage(map_img, render_x, map.y, map.width, map.height);
  ctx.drawImage(map_img, map.x, render_y, map.width, map.height);
  ctx.drawImage(map_img, render_x, render_y, map.width, map.height);
  ctx.save();
  ctx.translate(screen_x, screen_y);
  ctx.rotate(player.angle);
  ctx.drawImage(player_img, -player.height / 2, -player.width / 2, player.width, player.height);
  ctx.restore();
  bullets.forEach((bullet) => {
    const diff_x = map.x - bullet.org_x;
    const diff_y = map.y - bullet.org_y;
    ctx.save();
    ctx.translate(screen_x + bullet.x + diff_x, screen_y + bullet.y + diff_y);
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });
  zombies.forEach((zombie) => {
    const diff_x = map.x - zombie.org_x;
    const diff_y = map.y - zombie.org_y;
    const zombie_angle = Math.atan2(-zombie.y - diff_y, -zombie.x - diff_x);
    ctx.save();
    ctx.translate(screen_x + zombie.x + diff_x, screen_y + zombie.y + diff_y);
    ctx.rotate(zombie_angle);
    ctx.drawImage(zombie_img, -35, -35, 70, 70);
    ctx.restore();
  });
  ctx.font = "24px serif";
  ctx.textAlign = "end";
  ctx.fillText(`Zombie kills: ${zombie_kills}`, canvas.width - 10, 30);
}
GameLoop();

import {Anima} from './model/anima.js';
import {Camera} from './model/camera.js';
import {Cursor} from './model/cursor.js';
import {EntityManager, EvilWizard, Player} from './model/entity.js';
import {Map, Tileset} from './model/map.js';
import {BossBar, TextManager, UIManager} from './model/UI.js';
import {sleep} from './utils.js';

const container = document.getElementById('canvasContainer');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cursor = new Cursor()
const player = new Player(32000, 32000, 64, 64, 24, 60, 0, 0, 100, 100, {
  idle_down: new Anima('assets/player/idle_down.png', 1, 0.15),
  idle_up: new Anima('assets/player/idle_up.png', 1, 0.15),
  idle_left: new Anima('assets/player/idle_left.png', 1, 0.15),
  idle_right: new Anima('assets/player/idle_right.png', 1, 0.15),
  walk_down: new Anima('assets/player/walk_down.png', 2, 0.15),
  walk_up: new Anima('assets/player/walk_up.png', 2, 0.15),
  walk_left: new Anima('assets/player/walk_left.png', 2, 0.15),
  walk_right: new Anima('assets/player/walk_right.png', 2, 0.15),
});
player.stat = 'idle_down';
const enemy =
    new EvilWizard(player, 32000, 31800, 512, 512, 24, 96, 0, 32, 100, 100, {
      idle: new Anima('assets/evil_wizard/Idle.png', 8, 0.15),
      run: new Anima('assets/evil_wizard/Run.png', 8, 0.15)
    });
enemy.hide()
enemy.stat = 'idle';

const entityManager = new EntityManager();
entityManager.add(player);
entityManager.add(enemy);
entityManager.add(cursor);

const camera = new Camera(player, canvas)

var plainList = [];
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    plainList.push(i + j * 8)
  }
}

var flowerList = [];
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    flowerList.push(i + 4 + j * 8)
  }
}

var brickList = [];
for (let i = 32; i < 62; i++) {
  brickList.push(i)
}


const map = new Map(
    1000,
    new Tileset(
        'assets/map/grass.png',
        32,
        {
          plain: plainList,
          flower: flowerList,
          brick: brickList,
        },
        {
          plain: 0.5,
          flower: 0.35,
          brick: 0.15,
        },
        ));

map.init()

const pressedMap = {};
const controlKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'];

const textManager = new TextManager(canvas);
const uiManager = new UIManager();
const bossBar = new BossBar(enemy);
uiManager.addUI(bossBar);

document.addEventListener('keydown', function(event) {
  if (event.code === 'Space' && !pressedMap['Space']) {
    player.shoot(camera, cursor, entityManager);
  }
  if (controlKeys.includes(event.code)) {
    event.preventDefault()
    pressedMap[event.code] = 1;
  }
});

document.addEventListener('keyup', function(event) {
  if (controlKeys.includes(event.code)) {
    pressedMap[event.code] = 0;
  }
})
container.addEventListener('mouseleave', () => {cursor.hide()});

container.addEventListener('mouseenter', () => {cursor.show()});
container.addEventListener('mousemove', function(event) {
  cursor.moveTo(
      event.clientX - container.offsetLeft,
      event.clientY - container.offsetTop);
  cursor.show();
});
container.addEventListener('mousedown', function(event) {

});

// handle window resize
function resize() {
  canvas.width = container.clientWidth;
  canvas.height = canvas.width / 16 * 9;
}
resize();
window.onresize = resize;



function update() {
  player.control(pressedMap);
  entityManager.update();
  camera.update();
};

function drawEntities() {
  entityManager.render(ctx, canvas, camera);
};

function drawMap() {
  map.render(ctx, canvas, camera)
};


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawEntities();
  uiManager.render(ctx, canvas)
  textManager.render(ctx);
  // cursor.render(ctx)
};

var fps = 60;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;
function gameLoop() {
  now = Date.now();
  delta = now - then;
  if (player.health <= 0) {
    // textManager.reset();
    const text = textManager.addText('你死了', 'red');
    text.progress = 1;
    textManager.render(ctx);
    return;
  }
  requestAnimationFrame(gameLoop);
  if (delta > interval) {
    then = now - (delta % interval);
    update();
    draw();
  }
}
requestAnimationFrame(gameLoop);
async function main() {
  // enemy.show();
  await sleep(2000);
  textManager.addText('第一關：青青草原');
  textManager.addText('Stage 1: Grass Land');
  await sleep(2000);
  textManager.addText('莫名其妙的紫色大法師');
  textManager.addText('The Mysterious Purple Mage');
  await sleep(1000);
  enemy.pos = player.pos.copy();
  enemy.pos.y -= 400;
  enemy.stat = 'run';
  camera.target = enemy;
  await sleep(1000);
  textManager.textList = [];
  await sleep(2000);
  enemy.show();
  await sleep(1000);
  bossBar.show()
  camera.target = player;
}

main().then()
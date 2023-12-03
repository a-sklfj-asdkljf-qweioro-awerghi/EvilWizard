import {Vector} from '../utils.js';

import {Anima} from './anima.js';

class Particle {
  constructor(x, y, anima) {
    this.pos = new Vector(x, y);
    this.anima = anima;
    this.duration = 0;
    this.repeat = false;
    this.end = false;
  }

  // render(ctx, camera) {}
}


class BloodParticle extends Particle {
  constructor(x, y) {
    super(x, y);
    this.anima = new Anima('assets/particle/blood.png', 22, 1);
  }
  render(ctx, camera) {
    this.anima.render(ctx, camera, this.pos.x, this.pos.y, 100, 1);
    if (this.anima.step === 0) {
      this.end = true;
    }
  }
}

export class Entity {
  constructor(x, y) {
    this.type = 'Entity';
    this.pos = new Vector(x, y);
    this.speed = new Vector(0, 0);
    this.visiable = true;
  }
  update() {
    this.pos = this.pos.add(this.speed);
  }
  hide() {
    this.visiable = false;
  }
  show() {
    this.visiable = true;
  }
};

export class Sprite extends Entity {
  constructor(
      x, y, width, height, boxW, boxH, boxOffsetX, boxOffsetY, maxHealth,
      maxEnergy, animaMap) {
    super(x, y);
    this.type = 'Sprite';

    this.width = width;
    this.height = height;
    this.boxW = boxW;
    this.boxH = boxH;
    this.boxOffsetX = boxOffsetX;
    this.boxOffsetY = boxOffsetY;
    this.stat = 'idle';
    this.animaMap = animaMap;
    this.direction = 1;


    this.maxHealth = maxHealth;
    this.maxEnergy = maxEnergy;
    this.health = this.maxHealth;
    this.energy = this.maxEnergy;
  }

  render(ctx, camera) {
    if (this.visiable) {
      this.animaMap[this.stat].render(
          ctx, camera, this.pos.x, this.pos.y, this.height, this.direction);
    }

    ctx.fillStyle = '#00FF0030';
    ctx.fillRect(
        (this.pos.x - camera.pos.x) - this.boxW / 2 + this.boxOffsetX,
        (this.pos.y - camera.pos.y) - this.boxH / 2 + this.boxOffsetY,
        this.boxW, this.boxH);
  }
  damage(amount) {
    this.health -= amount;
  }
}

export class Bullet extends Entity {
  constructor(x, y, owner, power, accerate) {
    super(x, y);
    this.type = 'Bullet';
    this.owner = owner;
    this.power = power;
    this.accerate = accerate;
    this.speed = this.accerate.normal().multiply(this.power);
  }
  update() {
    this.speed = this.speed.add(this.accerate);
    super.update();
  }
  checkCollision(entityManager) {
    entityManager.entityList.forEach(entity => {
      // is enemy
      if (entity.type === 'Sprite' && entity !== this.owner &&
          entity.visiable) {
        // have collision
        if (((entity.pos.x - entity.boxW / 2 + entity.boxOffsetX) <
             this.pos.x) &&
            (this.pos.x <
             (entity.pos.x + entity.boxW / 2 + entity.boxOffsetX)) &&
            ((entity.pos.y - entity.boxH / 2 + entity.boxOffsetY) <
             this.pos.y) &&
            (this.pos.y <
             (entity.pos.y + entity.boxH / 2 + entity.boxOffsetY))) {
          this.power /= 2;
          entityManager.add(new BloodParticle(this.pos.x, this.pos.y));
          entity.damage(this.power);
        }
      }
    });
  }
  // render(ctx, camera) {
  //   ctx.beginPath();
  //   ctx.strokeStyle = '#5252FF';
  //   ctx.moveTo(
  //       this.pos.x - this.speed.x - camera.pos.x,
  //       this.pos.y - this.speed.y - camera.pos.y);
  //   ctx.lineTo(this.pos.x - camera.pos.x, this.pos.y - camera.pos.y);
  //   ctx.lineWidth = 4;
  //   ctx.stroke();
  // }
}
const smallFireBallAnima =
    new Anima('assets/bullet/small_fire_ball.png', 4, 0.15);

export class SmallFireBall extends Bullet {
  constructor(...args) {
    super(...args);
    this.animation = smallFireBallAnima;
  }
  render(ctx, camera) {
    this.animation.render(
        ctx, camera, this.pos.x, this.pos.y, 32, 1,
        Math.atan2(this.speed.y, this.speed.x) - Math.PI / 2);
  }
}


export class EvilWizard extends Sprite {
  constructor(target, ...args) {
    super(...args);
    this.target = target;
    this.moveSpeed = 0.001;
  }
  update() {
    // this.speed = this.target.pos.add(this.pos.multiply(-1)).normal();
    super.update();
  }
}


export class Player extends Sprite {
  update() {
    super.update();
    this.energy += 0.1;
    this.energy = Math.min(this.maxEnergy, this.energy);
    this.health += 0.01;
    this.health = Math.min(this.maxHealth, this.health);
  }
  render(ctx, camera) {
    super.render(ctx, camera);
    if (this.health < this.maxHealth) {
      this.renderHealthBar(ctx, camera);
    }
    if (this.energy < this.maxEnergy) {
      this.renderEnergyBar(ctx, camera);
    }
  }
  renderHealthBar(ctx, camera) {
    const boxHeight = 4;
    const marginY = 1;
    const maxBoxWidth = this.width * 2 / 3;
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(
        this.pos.x - camera.pos.x - maxBoxWidth / 2,
        this.pos.y - camera.pos.y + marginY + this.height / 2,
        Math.max(maxBoxWidth * (this.health / this.maxHealth), 0), boxHeight);
    ctx.strokeStyle = '#121212';
    ctx.rect(
        this.pos.x - camera.pos.x - maxBoxWidth / 2,
        this.pos.y - camera.pos.y + marginY + this.height / 2, maxBoxWidth,
        boxHeight);
    ctx.stroke();
  }
  renderEnergyBar(ctx, camera) {
    const boxHeight = 4;
    const marginY = 1;
    const maxBoxWidth = this.width * 2 / 3;
    ctx.fillStyle = '#5252FF';
    ctx.fillRect(
        this.pos.x - camera.pos.x - maxBoxWidth / 2,
        this.pos.y - camera.pos.y + 2 * marginY + this.height / 2 + boxHeight,
        Math.max(maxBoxWidth * (this.energy / this.maxEnergy), 0), boxHeight);
    ctx.strokeStyle = '#121212';
    ctx.rect(
        this.pos.x - camera.pos.x - maxBoxWidth / 2,
        this.pos.y - camera.pos.y + 2 * marginY + this.height / 2 + boxHeight,
        maxBoxWidth, boxHeight)
    ctx.stroke();
  }
  control(pressedMap) {
    this.controlMovement(pressedMap);
  }
  shoot(camera, cursor, entityManager) {
    if (this.energy <= 0) {
      this.health -= 10;
    } else {
      this.energy -= 10;
    }
    entityManager.add(new SmallFireBall(
        this.pos.x, this.pos.y, this, 5,
        (this.pos.add(cursor.pos.add(camera.pos).multiply(-1)))
            .normal()
            .multiply(-0.1)))
  }
  controlMovement(pressedMap) {
    const speed = 5;
    var direction = new Vector(0, 0);
    this.stat = this.stat.replace('walk', 'idle');
    for (const key in pressedMap) {
      if (Object.hasOwnProperty.call(pressedMap, key)) {
        if (pressedMap[key]) {
          switch (key) {
            case 'KeyW':
              direction.y += -1 * speed;
              this.stat = 'walk_up';
              break;
            case 'KeyA':
              direction.x += -1 * speed;
              this.stat = 'walk_left';
              break;
            case 'KeyS':
              direction.y += 1 * speed;
              this.stat = 'walk_down';
              break;
            case 'KeyD':
              direction.x += 1 * speed;
              this.stat = 'walk_right';
              break;

            default:
              break;
          }
        }
      }
    }
    this.speed = direction.normal().multiply(speed);
  }
}

export class EntityManager {
  constructor() {
    this.entityList = [];
  }
  add(entity) {
    this.entityList.push(entity);
  }
  update() {
    this.entityList.forEach(entity => {
      if (typeof entity.update === 'function') {
        entity.update();
      }
    });
    this.entityList.forEach(entity => {
      if (typeof entity.checkCollision === 'function') {
        entity.checkCollision(this);
      }
    });
  }
  render(ctx, canvas, camera) {
    this.entityList.sort(
        (a, b) => (a.pos.y + a.boxH / 2 + a.boxOffsetY) -
            (b.pos.y + b.boxH / 2 + b.boxOffsetY));
    this.entityList = this.entityList.filter(
        (entity) =>
            (!(entity.type === 'Bullet' &&
               (Math.abs(entity.pos.x - camera.pos.x) > canvas.width * 3) &&
               (Math.abs(entity.pos.x - camera.pos.x) > canvas.height * 3)))

    );
    this.entityList = this.entityList.filter(entity => {
      // console.log(entity.hasOwnProperty('end'))
      if (entity.hasOwnProperty('end')) {
        if (entity.end) {
          return false;
        }
      }
      return true;
    });
    this.entityList.forEach(entity => {
      entity.render(ctx, camera);
    });
  }
}
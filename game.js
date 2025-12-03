/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

'use strict';

const levelSize = vec2(55, 30);
let sprite;
let hitbox;
let playerBullets = [];
let enemyBullet;
let bullets = [];
let bulletIntensity = .8;
let enemy;
let enemyHP = 1000;
let i = 0;
let expand = true;
let score = 0;
let lives = 3;
let playerPos = vec2(levelSize.x / 2, 3);
let enemyVel = vec2(.05, 0);
let speed = .5;
let miss = false;
let missCount = 0;
let sensitivity = .35;
let timer1 = new Timer(1.5);
let timer2 = new Timer(6);
let timer3 = new Timer(.2);
let timer4 = new Timer(.1);
let timer5 = new Timer(.8);
let patternChangeTimer = new Timer;
let patternChangeCooldown = true;
let despawnTimer = new Timer(.08);
let enemyBar;
let enemyBarLengthOriginal = 50;
let enemyBarLength = enemyBarLengthOriginal;
let deleteOnce = true;
let gameOver = false;
let bulletPosition = vec2(levelSize.x / 2, 29);
let extraBulletPosition1 = vec2(bulletPosition.x + 2, bulletPosition.y);
let extraBulletPosition2 = vec2(bulletPosition.x - 2, bulletPosition.y);
let aimX;

class player extends EngineObject
{
    update()
    {
        this.pos.x = playerPos.x;
        this.pos.x = clamp(this.pos.x, this.size.x / 2, levelSize.x - this.size.x / 2);
        this.pos.y = playerPos.y;
        this.pos.y = clamp(this.pos.y, this.size.y / 2, levelSize.y - this.size.y / 2);
    }
    constructor()
    {
        super(vec2(0, 1), vec2(2, 2));
    }
}

class hit extends EngineObject
{
    update()
    {
        this.pos.x = playerPos.x;
        this.pos.x = clamp(this.pos.x, this.size.x / 2, levelSize.x - this.size.x / 2);
        this.pos.y = playerPos.y;
        this.pos.y = clamp(this.pos.y, this.size.y / 2, levelSize.y - this.size.y / 2);
    }
    constructor()
    {
        super(vec2(0, 1), vec2(.2, .2));
        this.color = new Color(0, 1, 0, 1);
        this.setCollision();
        this.mass = 0;
    }
}

class playerBullet extends EngineObject
{
    constructor(pos)
    {
        super(pos, vec2(.5, 2.));
        this.velocity = vec2(0, 1.);
        this.setCollision();
        this.color = new Color(.8, 1, 1, .5);
    }
    collideWithObject(o)
    {
        if (o === enemy)
        {
            enemy.hp -= 2;
            enemyBarLength = enemyBarLengthOriginal * (.01 * (enemy.hp / (enemyHP * .01)));
            this.destroy();
            return true;
        }
        else
        {
            return false;
        }
    }
}

class enemySprite extends EngineObject
{
    update()
    {
        this.pos.x = bulletPosition.x;
        this.pos.y = bulletPosition.y;
    }
    constructor(hp)
    {
        super(bulletPosition, vec2(2));
        this.setCollision();
        this.hp = hp;
    }
}

class enBullet extends EngineObject
{
    constructor(pos, size, vel)
    {
        super(pos, vec2(size));
        this.velocity = vel;//vec2(Math.random() * (.2 + .2) - .2, Math.random() * (-.1 + .5) - .5);
        this.setCollision();
        this.color = new Color(1, 1, 0, 1);
        let aimX = vec2(playerPos.y - bulletPosition.y, playerPos.x - bulletPosition.x).angle();
        this.velocity = this.velocity.rotate(aimX);
    }
    collideWithObject(o)
    {
        if (o === hitbox)
        {
            miss = true;
            new ParticleEmitter(hitbox.pos, 0, 0, .1, 100, 3.14, 0, this.color, this.color, this.color.scale(1, 0), this.color.scale(1, 0), .5, .1, 1, .1, .1, 1, 1, 0, 3.14, .1, .2, 0, 0, 1);
        }else
        {
            return false;
        }
    }
}

class enmBar extends EngineObject
{
    update()
    {
        this.size.x = enemyBarLength;
    }
    constructor()
    {
        super(vec2(levelSize.x / 2, 30.5), vec2(enemyBarLength, .2));
    }
}

function movement()
{
    slowMovement();
    if (keyIsDown('ArrowUp') || gamepadIsDown('12') || gamepadStick('0').y > sensitivity)
    {
        playerPos.y += speed;
    }else if (keyIsDown('ArrowDown') || gamepadIsDown('13') || gamepadStick('0').y < -sensitivity)
    {
        playerPos.y -= speed;
    }
    if (keyIsDown('ArrowRight') || gamepadIsDown('15') || gamepadStick('0').x > sensitivity)
    {
        playerPos.x += speed;
    }else if (keyIsDown('ArrowLeft') || gamepadIsDown('14') || gamepadStick('0').x < -sensitivity)
    {
        playerPos.x -= speed;
    }
    playerPos.x = clamp(playerPos.x, sprite.size.x / 2, levelSize.x - sprite.size.x / 2);
    playerPos.y = clamp(playerPos.y, sprite.size.y / 2, levelSize.y - sprite.size.y / 2);
}

function slowMovement()
{
    if (keyIsDown('KeyI') || gamepadIsDown('2'))
    {
        speed = .15;
    }else
    {
        speed = .4;
    }
}

function fire()
{
    if (keyIsDown('KeyJ') || gamepadIsDown('0'))
    {
        if (timer4.elapsed())
        {
            playerBullets.push(new playerBullet(vec2(playerPos.x - .4, playerPos.y)));
            playerBullets.push(new playerBullet(vec2(playerPos.x + .4, playerPos.y)));
            playerBullets.push(new playerBullet(vec2(playerPos.x - 1., playerPos.y)));
            playerBullets.push(new playerBullet(vec2(playerPos.x + 1., playerPos.y)));
            timer4.set(.1);
        }
    }
}

function enemyMovement()
{
    bulletPosition.x += enemyVel.x;
    if (bulletPosition.x <= levelSize.x * 0.4 || bulletPosition.x >= levelSize.x * 0.6)
    {
        enemyVel.x = -enemyVel.x;
    }
}

function enemyPattern1()
{
    if (timer3.elapsed())
    {
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.5, i)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.5, -i)));
        if (i === .3)
        {
            expand = false;
        }else if (i < 0)
        {
            expand = true;
        }
        if (expand)
        {
            i += .05;
        } else
        {
            i -= .05;
        }
        timer3.set(.2);
    }
}

function enemyPattern2()
{
    if (timer1.elapsed())
    {
        timer1.set(1.5);
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.5, -.2)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.6, -.1)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.8, 0)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.6, .1)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.5, .2)));
    }
}

function enemyPattern3()
{
    if (timer5.elapsed())
    {
        timer5.set(.8);
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.6, 0)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.5, 0)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.4, 0)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.3, 0)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .5, vec2(.2, 0)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .8, vec2(1, .4)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .8, vec2(1, .6)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .8, vec2(1, .8)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .8, vec2(1, -.4)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .8, vec2(1, -.6)));
        bullets.push(enemyBullet = new enBullet(bulletPosition, .8, vec2(1, -.8)));
    }
}

function bulletOutOfBounds()
{
    if (despawnTimer.elapsed())
    {
        for (let i = 0; i < bullets.length; i++)
        {
            if (bullets[i])
            {
                if (bullets[i].pos.x < 0 || bullets[i].pos.y < 0 || bullets[i].pos.x > levelSize.x || bullets[i].pos.y > levelSize.y)
                {
                    bullets[i].destroy();
                    bullets[i] = 0;
                }
            }
        }
        for (let i = 0; i < playerBullets.length; i++)
        {
            if (playerBullets[i])
            {
                if (playerBullets[i].pos.x < 0 || playerBullets[i].pos.y < 0 || playerBullets[i].pos.x > levelSize.x || playerBullets[i].pos.y > levelSize.y)
                {
                    playerBullets[i].destroy();
                    playerBullets[i] = 0;
                }
            }
        }
        despawnTimer.set(.08);
    }
}

function bulletSpawner()
{
    if (enemy.hp > 0)
    {
        if (enemy.hp > enemyHP / 2)
        {
            enemyPattern1();
            enemyPattern2();
        }
        if (enemy.hp < enemyHP / 2)
        {
            if (patternChangeCooldown)
            {
                patternChangeTimer.set(1);
                patternChangeCooldown = false;
            }
            if (patternChangeTimer.elapsed())
            {
                enemyPattern3();
            }
        }
    }
}

function checkMiss()
{
    if (!miss)
    {
        movement();
        fire();
    }else
    {
        livesMinus();
    }
}

function livesMinus()
{
    sprite.destroy();
    hitbox.destroy();
    lives--;
    vibrate(500);
}

function checkEnemyHealth()
{
    if (enemy.hp > 0)
    {
        bulletSpawner();
        enemyMovement();
    }else
    {
        if (deleteOnce)
        {
            new ParticleEmitter(enemy.pos, 0, 0, .1, 100, 3.14, 0, enemy.color, enemy.color, enemy.color.scale(1, 0), enemy.color.scale(1, 0), .5, .1, 1, .1, .1, 1, 1, 0, 3.14, .1, .2, 0, 0, 1);
            enemy.destroy();
            enemyBar.destroy();
            deleteOnce = false;
        }
    }
}

function playerRespawner()
{
    if (!gameOver && !hitbox)
    {
        sprite = new player;
        hitbox = new hit;
    }
}

function setup()
{
    sprite = new player;
    hitbox = new hit;
    enemy = new enemySprite(enemyHP);
    enemyBar = new enmBar;
    bulletSpawner();
    setCanvasFixedSize(vec2(1920, 1080));
    setCameraPos(levelSize.scale(.5));
    vibrateStop();
}

function gameInit()
{
    setup();
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    checkMiss();
    checkEnemyHealth();
    bulletOutOfBounds();
    console.log(enemy.hp);
    
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
    
}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['tiles.png']);

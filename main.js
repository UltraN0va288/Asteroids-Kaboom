kaboom({
  global: true,
  fullscreen: true,
  scale: 1,
  debug: true,
  background: [0, 0, 0, 1],
})

const Pi = Math.PI

const BULLET_SPEED = 1000
const BULLET_TIME = 0.1 //0.1
const FRICTION = 0.005
const PLAYER_MAX_ACC = 1100

level = 0
score = 0
let highscore = localStorage.getItem("highscore")
if (highscore == null) {
    highscore = 0
}

asteroids = []
bombs = 10

loadSprite('asteroid1', 'https://codehs.com/uploads/73a068547a5c6124e30077f18a24efc9')
loadSprite('asteroid2', 'https://codehs.com/uploads/0c852166ede05863ce4e474952d13bcf')
loadSprite('asteroid3', 'https://codehs.com/uploads/24826a8eb3ea57831017aef5a6a96b0c')

loadFont('Anta', 'https://fonts.gstatic.com/s/anta/v1/gyBzhwQ3KsIyVCc7PWim.woff2')

console.log(center())

scene('title', () => {
    add([
        text("Asteroids", {
            font: 'Anta',
            size: 120,
        }),
        pos(width() / 2 - 300, height() / 2 - 220),
        color(255, 255, 255),
    ])
    
    add([
        text("Up: Thrust\nLeft/Right: Turn Left/Right\nSpace: Shoot", {
            font: "Anta",
            size: 40,
        }),
        pos(0, height() - 120),
        color(255, 255, 255)
    ])
    
    add([
        text("Space to start", {
            font: "Anta",
            size: 60,
        }),
        pos(width() / 2 - 250, height() / 2),
        color(255, 255, 255)
    ])
    
    onKeyPress('space', () => {
        go('game')
    })
})

scene('lose', () => {
    const loseText = add([
        text("You lose", {
            font: "Anta",
        }),
        pos(width() / 2 - 100, height() / 2 - 100),
        color(255, 255, 255),
    ])
    
    add([
        text("Press space to go to title", {
            font: "Anta"
        }),
        pos(width() / 2 - 200, height() / 2 + 250)
    ])
    
    const finalScoreText = add([
        text("Score: " + score, {
            font: "Anta"
        }),
        pos(width() / 2 - 100, height() / 2),
        color(255, 255, 255),
    ])
    
    // Save highscore if necessary
    if (score > highscore) {
        highscore = score;
        localStorage.setItem("highscore", highscore);
    }

    // Update the highscore text after saving
    const highscoreText = add([
        text("Highscore: " + highscore, {
            font: "Anta"
        }),
        pos(width() / 2 - 100, height() / 2 + 50),
        color(255, 255, 255),
    ])

    onKeyPress('space', () => {
        go('title')
    })
})

scene('game', () => {
    level = 0
    nextLevel()
    score = 0
    const player = add([
        pos(width() / 2 - 32, height() / 2 - 32),
        polygon([vec2(0,-15), vec2(10,10), vec2(5,5), vec2(-5,5), vec2(-10,10)]),
        area(),
        rotate(135),
        color(0,0,0),
        outline(2, rgb(255, 255, 255)),
        anchor("center"),
        "mobile",
        "friction",
        "wraps",
        "player",
        {
            x: width() / 2,
            y: height() / 2,
            dx: 0,
            dy: 0,
            vel: vec2(0, 0),
            acc: 12,
            fireCooldown: BULLET_TIME,
            rotVelTrue: true,
            rotVel: 0,
            lives: 3,
        },
    ])
    
    const flame = add([
        polygon([vec2(5,5), vec2(0,20), vec2(-5,5)]),
        pos(0,0),
        follow(player),
        color(0,0,0),
        outline(2, rgb(255, 255, 255)),
        anchor(player),
        opacity(0),
    ])
    
    onKeyDown("left", () => {
        player.rotVel -= 2.5 //1
    })
    
    onKeyDown("right", () => {
        player.rotVel += 2.5 //1
    })
    
    onKeyDown("up", () => {
        player.vel.y += player.acc * Math.sin(player.angle * Pi / 180 - Pi / 2)
        player.vel.x += player.acc * Math.cos(player.angle * Pi / 180 - Pi / 2)
        if (Math.random() * 2 < 1) {
            flame.opacity = 0
        } else {
            flame.opacity = 1
        }
    })
    
    onKeyRelease("up", () => {
        flame.opacity = 0
    })
    
    onKeyDown("space", () => {
        if (player.fireCooldown <= 0) {
            add([
                rect(2,4),
                rotate(player.angle),
                pos(player.pos),
                area(),
                "bullet",
                "mobile",
                "wraps",
                "expires",
                {
                    vel: vec2(
                        1000 * Math.cos(player.angle * Pi / 180 - Pi / 2), 
                        1000 * Math.sin(player.angle * Pi / 180 - Pi / 2)),
                    expirationTime: 0.7,
                },
            ])
            player.fireCooldown = BULLET_TIME
        } else {
            player.fireCooldown -= dt()
        }
    })
    
    onUpdate("mobile", (e) => {
        e.move(e.vel)
        if (e.rotVel) {
            e.angle += e.rotVel
        }
        flame.angle = player.angle
    })
    
    onUpdate("friction", (e) => {
        e.vel.x = e.vel.x * 0.995
        e.vel.y = e.vel.y * 0.995
        if (e.rotVelTrue) {
            e.rotVel *= 0.66
        }
    })
    
    onUpdate("wraps", (e) => {
        if (e.pos.x > width()) {
            e.pos.x = 0;
        }
        if (e.pos.x < 0) {
            e.pos.x = width();
        }
        if (e.pos.y > height()) {
            e.pos.y = 0;
        }
        if (e.pos.y < 0) {
            e.pos.y = height();
        }
    });
    
    onUpdate("expires", (e) => {
        e.expirationTime -= dt()
        if (e.expirationTime <= 0) {
            destroy(e)
        } 
    })
    
    function mag(vec) {
        return Math.sqrt(vec.x**2 + vec.y**2)
    }
    
    function randSign() {
        return rand() < 0.5 ? 1 : -1
    }
    
    function checkAsteroids() {
        if (asteroid.length == 0) {
            nextLevel()
        }
    }
    
    function spawnAsteroid(spawnPos, spriteG) {
        const speed = 100 + level * 10
        const angle = rand(0, 360) * (Pi / 180)  // convert degrees to radians
        const velVec = vec2(speed * Math.cos(angle), speed * Math.sin(angle))
        var a = add([
            sprite(spriteG),
            pos(spawnPos),
            color(255,255,255),
            outline(2, rgb(255, 255, 255)),
            rotate(rand(1,7)),
            anchor("center"),
            scale(0.66),
            area(),
            "asteroid",
            "mobile",
            "wraps",
            {
                vel: velVec,
                rotVelTrue: true,
                rotVel: rand(-0.5, 0.5),
                size: "large",
                initializing: true,
            }
        ]);
        
        for (let j = 0; j < get("asteroid").length; j++) {
            for (let i = 0; i < get("asteroid").length; i++) {
                if (a.isColliding(get("asteroid")[i])) {
                    a.pos = asteroidSpawnPoint()
                    a.initializing = false
                }
            }
        }
    }
    
    function spawnAsteroids(num) {
        for (let i = 0; i < num; i++) {
            spawnAsteroid(asteroidSpawnPoint(), "asteroid1")
        }
    }
    
    function asteroidSpawnPoint() {
        return choose([rand(vec2(0), vec2(width(), 0)),
             rand(vec2(0), vec2(0, height())),
             rand(vec2(0, height()), vec2(width(), height())),
             rand(vec2(width(), 0), vec2(width(), height()))]);
    }
    
    function nextLevel() {
        level += 1
        score += 1000 + 500 * level
        spawnAsteroids(Math.min(3 + level, 10))
    }
    
    function flash(magnitude) {
        add([
            pos(0, 0),
            rect(width(), height()),
            color(rgb(255, 255, 255)),
            "expires",
            {
                expirationTime: 0,
            }
        ])
        shake(magnitude)
    }
    
    function getAsteroidNumber() {
        return get("asteroid").length
    }
    
    onCollide("bullet", "asteroid", (b, a) => {
        if (a.size == "large") {
            flash(10)
            speed = randi(100, 200) + level * 10
            angles = [randi(b.angle - 50, b.angle), randi(b.angle, b.angle + 50)]
            for (let i = 0; i < 2; i++) {
                ast = add([
                    sprite("asteroid2"),
                    outline(5, rgb(255, 255, 255)),
                    pos(a.pos),
                    color(255,255,255),
                    outline(2, rgb(255, 255, 255)),
                    anchor("center"),
                    scale(0.66),
                    area(),
                    "asteroid",
                    "mobile",
                    "wraps",
                    {
                        vel: vec2(speed * Math.cos(angles[i]), speed * Math.sin(angles[i])),
                        size: "medium",
                        rotVelTrue: true,
                        rotVel: rand(-0.75, 0.75),
                    }
                ])
            }
            score += 100
            scoreText.text = "Score: " + score
        }
        if (a.size == "medium") {
            flash(5)
            speed = randi(200, 300) + level * 10
            angles = [randi(b.angle - 50, b.angle), b.angle, randi(b.angle, b.angle + 50)]
            for (let i = 0; i < 3; i++) {
                ast = add([
                    sprite("asteroid3"),
                    outline(5, rgb(255, 255, 255)),
                    pos(a.pos),
                    color(255,255,255),
                    outline(2, rgb(255, 255, 255)),
                    anchor("center"),
                    scale(0.66),
                    area(),
                    "asteroid",
                    "mobile",
                    "wraps",
                    {
                        vel: vec2(speed * Math.cos(angles[i]), speed * Math.sin(angles[i])),
                        size: "small",
                        rotVelTrue: true,
                        rotVel: rand(-1, 1),
                    }
                ])
            }
            score += 250
            scoreText.text = "Score: " + score
        }
        destroy(b)
        
        if (a.size == "small") {
            flash(3)
            score += 400
            scoreText.text = "Score: " + score
        }
        destroy(a)
        
        if (getAsteroidNumber() == 0) {
            nextLevel()
        }
    })
    
    scoreText = add([
        text("Score: " + score, {
            font: "Anta"
        }),
        pos(10, 10),
        color(255, 255, 255),
        { value: 0 }
    ])
    
    onCollide("asteroid", "player", (a, p) => {
        go('lose')
    })
})

go('title')

// ============== Builder Class ======= ///
// Parecido a class.js
// Misma logica que la clase, pero creamos los elementos dentro de la propia clase.
class Topo {
    constructor() {
        this.element = document.createElement("div")
        this.bg = new Image()
        this.image = new Image()
        this.assets = {
            background: "./assets/img/suelo.png",
            aliveImg: "./assets/img/topo.png",
            deadImg: "./assets/img/splash.png",
            hitAudio: new Audio("./assets/wav/splash.wav")
        }
        this.active = false
        this.scoreElement = undefined
        this.speed = undefined
        this.event = () => {
            if (this.active) {
                this.desactivar(this.speed)
                this._handleHit()
                if (this.scoreElement) {
                    this.scoreElement.textContent = Number(this.scoreElement.textContent) + 1
                }
                this.element.removeEventListener("click", this.event)
            }
        }
        this.init = this._init()
    }

    _init() {
        this.element.className = "casilla"
        this.bg.className = "bg"
        this.bg.src = this.assets.background
        this.image.className = "topo"
        this.image.src = this.assets.aliveImg
        this.element.appendChild(this.bg)
        this.element.appendChild(this.image)
    }

    _handleHit() {
        this.image.src = this.assets.deadImg
        this.assets.hitAudio.play()
        setTimeout(() => {
            this.assets.hitAudio.pause()
            this.assets.hitAudio.currentTime = 0
        })
    }

    appendTo(element) {
        if (element instanceof HTMLElement) {
            element.appendChild(this.element)
        }

        return this
    }

    activar(speed, done) {
        this.speed = speed
        this.image.style.animation = "goUp"
        this.image.style.animationDuration = `${speed}ms`
        this.image.src = this.assets.aliveImg
        this.element.addEventListener("click", this.event)
        this.active = true

        if (typeof done === "function") {
            setTimeout(() => {
                done.call(this)
            }, speed)
        }
        return this
    }

    desactivar(speed, before, done) {
        if (typeof before === "function") {
            before.call(this)
        }

        this.image.style.animationName = "goDown"
        this.image.style.animationDuration = `${speed}ms`

        setTimeout(() => {
            this.active = false
            if (typeof done === "function") {
                done.call(this)
            }
        }, speed)

        return this
    }

    bindScoreElement(element) {
        if (element instanceof HTMLElement) {
            this.scoreElement = element
        }
        return this
    }

    setWidth(width) {
        this.element.style.width = width
        return this
    }

}

//================== Javascript ============///

// AHORA PODEMOS MANIPULAR EL Nº DE CASILLAS
const ROWS = 5
const ELEMENT_WIDTH = (100 / ROWS) - 1 // -1 porque css width es raro

const juego = {
    root: document.querySelector("main"),
    score: document.querySelector("#score"),
    timer: document.querySelector("#time"),
    start: document.querySelector("#start"),
    mainAudio: new Audio("./assets/mp3/music.mp3"),
    isGameStarted: false,
    topoClass: new Array(ROWS * ROWS).fill().map(e => new Topo())
}

// init
juego.mainAudio.loop = true
juego.topoClass.forEach(e => {
    e.appendTo(juego.root)
        .bindScoreElement(juego.score)
        .setWidth(`${ELEMENT_WIDTH}%`)
})

function startGame() {
    if (!juego.isGameStarted) {
        juego.mainAudio.play()
        juego.isGameStarted = true
        juego.score.textContent = 0
        let time = 60

        // Intervals
        const gameInterval = game()
        const timeInterval = setInterval(() => {
            if (time === 0) {
                stopGame(gameInterval, timeInterval)
            } else {
                --time
            }
            juego.timer.textContent = time
        }, 1000)
    }
}

function stopGame(...intervals) {
    juego.isGameStarted = false
    juego.mainAudio.pause()
    juego.mainAudio.currentTime = 0
    intervals.forEach(e => clearInterval(e))
}

function game() {
    const pool = [...juego.topoClass]

    let speed = 1000

    const interval = setInterval(() => {
        const rando = Math.floor(Math.random() * pool.length)

        const removedElement = pool.splice(rando, 1)[0]

        // Callback hell here!
        removedElement.activar(speed, () => {
            removedElement.desactivar(speed, undefined, () => {
                pool.push(removedElement)
            })
        })

        speed *= speed > 350 ? 0.95 : 1

    }, speed)


    return interval
}

juego.start.addEventListener("click", startGame)
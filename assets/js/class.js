//============= CLASS ==========//
// Callback hell
class Topo {
    constructor(element) {
        this.element = element
        this.image = element.querySelector("img.topo")
        this.assets = {
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
    }

    /** ***_handleHitAudio*** - funcion interna para manejar el audio.
     */
    _handleHit() {
        this.image.setAttribute("src", this.assets.deadImg)
        this.assets.hitAudio.play()
        setTimeout(() => {
            this.assets.hitAudio.pause()
            this.assets.hitAudio.currentTime = 0
        }, 100)
    }

    /** 
     * ***activar*** - activa el elemento "Topo"
     * ### Metodods 
     * - "speed" (number) - Velocidad de la animacion.
     * - "done" (function) - Funcion a correr una vez termine la animacion, this vinculado a la instancia de la clase.
     * 
     * ### Returns:
     * -this para encadenar metodos
     */
    activar(speed, done) {
        this.speed = speed
        this.image.style.animationName = "goUp"
        this.image.style.animationDuration = `${speed}ms`
        this.image.setAttribute("src", this.assets.aliveImg)
        this.element.addEventListener("click", this.event)
        this.active = true

        if (typeof done === "function") {
            setTimeout(() => {
                done.call(this)
            }, speed)
        }

        return this
    }

    /** 
     * ***desactivar*** - desactiva el elemento "Topo"
     * ### Metodods 
     * - "speed" (number) - Velocidad de la animacion.
     * - "before" (function) - Funcion a correr antes de correr la animacion, this vinculado a la instancia de la clase.
     * - "done" (function) - Funcion a correr una vez termine la animacion, this vinculado a la instancia de la clase.
     * 
     * ### Returns:
     * -this para encadenar metodos
     */
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

    /** ***bindScoreElement*** - Vincula la clase al elemento que contiene la puntuacion para actualizacion automatica de la misma.
     * 
     */
    bindScoreElement(element) {
        if (element instanceof HTMLElement) {
            this.scoreElement = element
        }
        return this
    }
}

//============= JAVASCRIPT ============= //
const juego = {
    casillas: [...document.querySelectorAll(".casilla")],
    score: document.querySelector("#score"),
    timer: document.querySelector("#time"),
    start: document.querySelector("#start"),
    mainAudio: new Audio("./assets/mp3/music.mp3"),
    isGameStarted: false,
    topoClass: []
}

// inits
juego.mainAudio.loop = true
juego.topoClass = juego.casillas.map(e => new Topo(e))
juego.topoClass.forEach((e) => e.bindScoreElement(juego.score))

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
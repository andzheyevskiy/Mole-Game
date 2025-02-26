//============ Topo Class =============//
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

//=========== APP ===========//

class App {
    constructor() {
        this.root = document.querySelector("#root")
        // Header con HTML fijo y que no requiere su uso mas tarde
        this.header = {
            _self: document.createElement("header"),
            children: {
                scoreDiv: {
                    _self: document.createElement("div"),
                    children: {
                        p: {
                            _self: document.createElement("p"),
                        }
                    }
                },
                timeDiv: {
                    _self: document.createElement("div"),
                    children: {
                        p: {
                            _self: document.createElement("p"),
                        }
                    }
                },
                rowsDiv: {
                    _self: document.createElement("div"),

                }
            }
        }
        this.startButton = document.createElement("button")
        this.scoreElement = document.createElement("span")
        this.timeElement = document.createElement("span")
        this.rowsElement = document.createElement("input")

        // Juego
        this.gameContainer = document.createElement("main")
        this.rows = 4 // inicial
        this.topos = []
        this.MAX_TOPOS = 15
        this.isGameStarted = false
        this.score = 0
        this.time = 0
        this.SPEED = 1000
        this.timeInterval = undefined
        this.gameInterval = undefined

        //audio
        this.mainAudio = new Audio("./assets/mp3/music.mp3")

        this.init = this._init()
    }

    _init() {
        // Append a root
        this.root.appendChild(this.header._self)
        this.root.appendChild(this.gameContainer)

        //Append a header
        this._appendChildren(this.header._self, this.header.children)
        this.header._self.appendChild(this.startButton)

        // texto + elemnentos variables
        const pScoreDiv = this.header.children.scoreDiv.children.p._self
        pScoreDiv.textContent = "Score: "
        pScoreDiv.appendChild(this.scoreElement)
        this.scoreElement.textContent = 0

        const pTimeDiv = this.header.children.timeDiv.children.p._self
        pTimeDiv.textContent = "Time: "
        pTimeDiv.appendChild(this.timeElement)
        pTimeDiv.insertAdjacentHTML("beforeend", " seconds")
        this.timeElement.textContent = 0

        const rowsDiv = this.header.children.rowsDiv._self

        this.rowsElement.type = "number"
        rowsDiv.textContent = "Rows: "
        rowsDiv.appendChild(this.rowsElement)
        this.rowsElement.value = this.rows

        this.startButton.textContent = "JUGAR"

        //Audio
        this.mainAudio.loop = true

        // Primer render de game
        this._renderGame(this.rows)

        // Evento para reRender dependiendo del input de rows
        this.rowsElement.addEventListener("change", (event) => {
            if (!this.isGameStarted) {
                let value = Number(event.target.value)
                if (value > this.MAX_TOPOS) {
                    window.alert("Max rows is 15")
                    value = 15
                }
                this._renderGame(value)
            }
        })

        // Evento para iniciar el juego
        this.startButton.addEventListener("click", () => {
            this.startGame()
        })
    }

    /* Funcion recursiva para añadir hijos a los elementos padre siguiendo el formato de this.header */
    _appendChildren(parent, children) {
        for (const key in children) {
            if (children.hasOwnProperty(key)) {
                const child = children[key]._self
                parent.appendChild(child)
                if (children[key].children) {
                    this._appendChildren(child, children[key].children)
                }
            }
        }
    }

    _renderGame(rows) {
        this.gameContainer.innerHTML = ""
        this.rows = rows
        const width = (100 / this.rows) - 1
        // garbage collector deberia eliminar las instancias anteriores
        this.topos = new Array(rows * rows).fill().map(e => {
            return new Topo().appendTo(this.gameContainer)
                .bindScoreElement(this.scoreElement)
                .setWidth(`${width}%`)
        })
    }

    startGame() {
        this.mainAudio.play()
        this.isGameStarted = true
        this.score = 0
        this.scoreElement.textContent = 0
        this.time = 60

        //set intervals
        this._setGameInterval()
        this._setTimerInterval()

    }

    _stopGame(...intervals) {
        this.isGameStarted = false
        this.mainAudio.pause()
        this.mainAudio.currentTime = 0
        intervals.forEach(e => clearInterval(e))
    }

    _setGameInterval() {
        const pool = [...this.topos]
        let speed = this.SPEED

        this.gameInterval = setInterval(() => {
            const rando = Math.floor(Math.random() * pool.length)
            const removedElement = pool.splice(rando, 1)[0]

            removedElement.activar(speed, () => {
                removedElement.desactivar(speed, undefined, () => {
                    pool.push(removedElement)
                })
            })
            
            speed *= speed > 350 ? 0.95 : 1
        }, speed)
    }

    _setTimerInterval() {
        this.timeInterval = setInterval(() => {
            if (this.time === 0) {
                this._stopGame(this.timeInterval, this.gameInterval)
            } else {
                this.time--
                this.timeElement.textContent = this.time
            }
        }, 1000)
    }
}

new App
const juego = {
    casillas: document.querySelectorAll(".casilla"),
    imagenes: document.querySelectorAll("img.topo"),
    score: document.querySelector("#score"),
    timer: document.querySelector("#time"),
    start: document.querySelector("#start"),
}

let isGameStarted = false
let score

// Audio
const mainAudio = new Audio("./assets/mp3/music.mp3")
mainAudio.loop = true
const hitAudio = new Audio("./assets/wav/splash.wav")
function handleHit(){
    hitAudio.play()
    setTimeout(()=>{
        hitAudio.pause()
        hitAudio.currentTime = 0
    },100)
}

function startGame() {
    if (!isGameStarted) {
        mainAudio.play()
        score = 0
        isGameStarted = true
        const gameInterval = game()
        let time = 61
        const timeInterval = setInterval(() => {
            if (time === 0) {
                stopGame(gameInterval, timeInterval)
            } else {
                time--
            }
            juego.timer.textContent = time
        }, 1000)
    }
}

function stopGame(gameInterval, timeInterval) {
    isGameStarted = false
    mainAudio.pause()
    mainAudio.currentTime = 0
    clearInterval(timeInterval)
    clearInterval(gameInterval)
}

function game() {

    // Pool to avoid "rerun" on the same element
    const poolCasillas = [...juego.casillas]
    const poolImagenes = [...juego.imagenes]

    let speed = 1000

    const interval = setInterval(() => {
        // Handle randomness
        const rando = Math.floor(Math.random() * poolCasillas.length)
        const casilla = poolCasillas[rando]
        const imagen = poolImagenes[rando]

        // Remove the element from the pool
        const removedCasilla = poolCasillas.splice(rando, 1)[0]
        const removedImagen = poolImagenes.splice(rando, 1)[0]

        // handle event removal
        const controller = new AbortController()

        // Animation
        imagen.style.animationName = "goUp"
        imagen.style.animationDuration = `${speed}ms`
        imagen.setAttribute("src", "./assets/img/topo.png")

        // New var, becouse the return aniamtion should not be affected by the speed update
        const returnSpeed = speed * 2

        setTimeout(() => {
            imagen.style.animationName = "goDown"
        }, speed)
        setTimeout(() => {
            poolCasillas.push(removedCasilla)
            poolImagenes.push(removedImagen)
        }, (returnSpeed))

        function disparo() {
            handleHit()
            score++
            imagen.setAttribute("src", "./assets/img/splash.png")
            juego.score.textContent = score
            controller.abort()
        }

        casilla.addEventListener("click", disparo, { signal: controller.signal })

        speed *= speed > 350 ? 0.95 : 1
    }, speed)

    return interval
}

start.addEventListener("click", startGame)
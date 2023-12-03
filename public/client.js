const join = document.getElementById("join")
const leave = document.getElementById("leave")
const nameInput = document.getElementById("name-input")
const playerList = document.getElementById("player-list-wrapper")
const chatInput = document.getElementById("chat-input")
const sendChat = document.getElementById("send-chat")
const chat = document.getElementById("chat")
const joinErrors = document.getElementById("join-errors")
const wordList = document.getElementById("words-wrapper")
const wordCount = document.getElementById("wordCount")
const myScore = document.getElementById("myScore")
const userInfo = document.getElementById("user-info-container")
const username = document.getElementById("username")
const timerContainer = document.getElementById("timer-container")
const timer = document.getElementById("timer")
const start = document.getElementById("start")
const controls = document.getElementById("controls-container")
const gameWrapper = document.getElementById("game-wrapper")

import { isAlphanumeric } from "./help.js"
import { cfg } from "./cfg.js"
import { Game } from "./game.js"

const socket = io(cfg.URL)
const game = new Game()

let messageCount = 0

const bg = new Audio("./sounds/bg.mp3")
let bgVol = 0
const bad_word_sound = new Audio("./sounds/bad_word.mp3")
const good_word_sound = new Audio("./sounds/good_word.mp3")

/*



    Helper functions



*/

/*

    Send message to chat

*/
const sendMessage = () => {
    const name = game.name
    const message = chatInput.value
    let allowMessage = true
    if (allowMessage) {
        socket.emit("chatSent", {
            sender: name,
            message: message
        })
        chatInput.value = ""
    } 
}

/*

    Make request to server to join game

*/
const joinGame = () => {
    joinErrors.innerHTML = ""
    const name = nameInput.value
    if (name.length == 0) {
        joinErrors.innerHTML += `<p class="bad">Username must be at least 1 character long</p>`
    }
    else if (!isAlphanumeric(name)) {
        joinErrors.innerHTML += `<p class="bad">Name must be alphanumeric</p>`
    }
    else if (game.inGame) {
        joinErrors.innerHTML += `<p class="bad">Already connected to the game</p>`
    }
    else {
        socket.emit("requestJoin", {
            name: name
        })
    }
}

/*

    Request server check if word being played is valid

*/
const playWord = () => {
    if (game.midGame && game.anyLettersPlayed()) {
        const word = game.getWord()
        socket.emit("wordSubmit", {
            word: word
        })
    }
    else {
        declinedAnimation()
    }
}

/*

    Animation played when server responds that word 
    being played is not in dictionary 

*/
const declinedAnimation = () => {
    let empty = document.getElementsByClassName("empty")
    for (let i = 0; i < empty.length; i++) {
        empty[i].style.backgroundColor = "red"
    }
    setTimeout(() => {
        for (let i = 0; i < empty.length; i++) {
            empty[i].style.backgroundColor = "var(--purple)"
        }
    }, 500)
}

const updatePlayers = () => {
    playerList.innerHTML = ""
    game.players.forEach((player) => {
        playerList.innerHTML += `
            <div id="player-${player.name}" class="player wrapper">
                <div class="player-pfp">
                </div>
                <div class="player-info">
                    <div class="player-name">
                        ${player.name}
                    </div>
                    <div class="player-score">
                        Score: ${player.score}
                    </div>
                    <div class="player-wins">
                        Wins: ${player.wins}
                    </div>
                </div>
            </div>
        `
    })
}

const startTimer = () => {
    timerContainer.style.display = "flex"
    let countdown = 59
    const time = setInterval(() => {
        if (countdown < 0) {
            timerContainer.style.display = "none"
            timer.innerText = "1:00"
            clearInterval(time)
        }
        else if (countdown < 10) {
            timer.innerText = `0:${0}${countdown}`
        }
        else {
            timer.innerText = `0:${countdown}`
        }
        countdown -= 1
    }, 1000)
}

/*



    Button and input event listeners



*/


join.addEventListener("click", () => {
    joinGame()
})

leave.addEventListener("click", () => {
    socket.emit("leave")
    bg.pause()
    join.disabled = false
    leave.disabled = true
    nameInput.disabled = false
    chatInput.disabled = true
    sendChat.disabled = true
    gameWrapper.style.display = "none"
    wordCount.innerText = "Words: 0"
    myScore.innerText = "Score: 0"
    game.left()
    controls.style.display = "none"
    timerContainer.style.display = "none"
    updatePlayers()
    game.resetWordList()
})

start.addEventListener("click", () => {
    socket.emit("requestStart", {
        size: document.getElementById("select-word-size").value
    })
})

document.addEventListener("keydown", (evt) => {
    if (document.activeElement == document.body) {
        // focus game
        if (game.inGame) {
            if (game.lettersAvailable.includes(evt.key.toLowerCase())) {
                game.playLetter(evt.key)
            }
            else if (evt.key == "Enter" && game.midGame) {
                playWord()
            }
            else if (evt.key == "Backspace") {
                if (game.lettersUsed.length > 0) {
                    game.removeLetter()
                }
            }
            else if (evt.key == " " && game.lettersUsed.length > 0) {
                game.clearPlayedLetters()
            }
            else if (evt.key == ";" || evt.key == ":") {
                game.shuffleLetters()
            }
        }
    }
    else if (document.activeElement == chatInput) {
        // chat
        if (evt.key == "Enter") {
            sendMessage()
        }
    }
    else if (document.activeElement == nameInput) {
        // name
        if (evt.key == "Enter") {
            joinGame()
        }
    }
})

/*



    Socket event listeners



*/

socket.on("connect", () => {
    console.log(`connected to server with id: ${socket.id}`)
})

socket.on("joinAccepted", () => {
    console.log("successfully joined the game")
    bg.play()
    bg.volume = bgVol
    bg.loop = true
    game.joined(nameInput.value)
    join.disabled = true
    leave.disabled = false
    nameInput.disabled = true
    chatInput.disabled = false
    sendChat.disabled = false
    gameWrapper.style.display = "block"
    username.innerText = nameInput.value
    socket.emit("requestPlayers")
})

socket.on("joinDeclined", (data) => {
    joinErrors.innerHTML += `
        <p class="bad">${data.message}</p>
    `
})

socket.on("newHost", (data) => {
    if (game.inGame && data.id == socket.id) {
        controls.style.display = "flex"
    }
})

socket.on("updatePlayers", (data) => {
    if (game.inGame) {
        game.players = data.players
        updatePlayers()
    }
})

sendChat.addEventListener("click", sendMessage)

socket.on("newMessage", (data) => {
    const sender = data.sender
    const message = data.message
    const me = game.name
    messageCount += 1
    if (sender == "Server") {
        chat.innerHTML += `
            <p id="message-${messageCount}">
                <span class="server-message ${data.type}">${message}</span>
            </p>
        `
    }
    else if (sender == me) {
        chat.innerHTML += `
            <p id="message-${messageCount}">
                <span class="my-message">${me}: </span>
                <span class="chat-message">${message}</span>
            </p>
        `
    }
    else {
        chat.innerHTML += `
            <p id="message-${messageCount}">
                <span class="chat">${sender}: </span>
                <span class="chat-message">${message}</span>
            </p>
        `
    }
    document.getElementById(`message-${messageCount}`).scrollIntoView()
})

socket.on("startGame", (data) => {
    if (game.inGame) {
        game.reset()
        game.midGame = true
        wordCount.innerText = "Words: 0"
        myScore.innerText = "Score: 0"
        startTimer()
        game.newLetters(data.letters)
    }
})

socket.on("wordAccept", (data) => {
    console.log("word accept")
    good_word_sound.play()
    const word = data.word
    const me = data.player
    const score = data.score
    const length = word.length
    game.clearPlayedLetters()
    document.getElementById(`words-${length}`).innerHTML += `
        <div class="word" style="font-size:${10+(length*2)}pt">
            <p>${word}</p>
            <p>${score}</p>
        </div>
    `
    wordCount.innerText = `Words: ${me.words.length}`
    myScore.innerText = `Score: ${me.score}`
})

socket.on("wordDecline", (data) => {
    game.clearPlayedLetters()
    bad_word_sound.play()
    declinedAnimation()
})

socket.on("gameOver", (data) => {
    console.log("game over")
    game.players = data.players
    updatePlayers()
    game.reset()
    wordCount.innerText = `Words: 0`
    myScore.innerText = `Score: 0`
})
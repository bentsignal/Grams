const join = document.getElementById("join")
const leave = document.getElementById("leave")
const nameInput = document.getElementById("name-input")
const playerList = document.getElementById("player-list-wrapper")
const chatInput = document.getElementById("chat-input")
const sendChat = document.getElementById("send-chat")
const chat = document.getElementById("chat")
const chatWrapper = document.getElementById("chat-wrapper")
const joinErrors = document.getElementById("join-errors")
const availableWrapper = document.getElementById("letters-available-wrapper")
const usedWrapper = document.getElementById("letters-used-wrapper")
const start = document.getElementById("start")
const wordList = document.getElementById("words-wrapper")
const wordCount = document.getElementById("wordCount")
const myScore = document.getElementById("myScore")
const userInfo = document.getElementById("user-info-container")
const username = document.getElementById("username")

import { isAlphanumeric, shuffle } from "./help.js"
import { cfg } from "./cfg.js"

let socket = io(cfg.URL)
//let socket = io("http://grams.ddns.net")

let inGame = false
let messageCount = 0
let lettersAvailable = []
let lettersUsed = []
let totalLetters = 6

socket.on("connect", () => {
    console.log(`connected with id: ${socket.id}`)
    socket.emit("requestPlayers")
})

join.addEventListener("click", () => {
    joinGame()
})

const joinGame = () => {
    joinErrors.innerHTML = ""
    const name = nameInput.value
    if (name.length > 0 && isAlphanumeric(name) && !inGame) {
        socket.emit("requestJoin", {
            name: nameInput.value
        })
    }
}

socket.on("joinAccepted", () => {
    console.log("successfully joined the game")
    inGame = true
    join.disabled = true
    leave.disabled = false
    nameInput.disabled = true
    chatInput.disabled = false
    sendChat.disabled = false
    userInfo.style.display = "flex"
    username.innerText = nameInput.value
})

socket.on("joinDeclined", (data) => {
    const message = data.message
    joinErrors.innerHTML += `
        <p class="bad">${message}</p>
    `
})

leave.addEventListener("click", () => {
    socket.emit("leave", {
        name: nameInput.value
    })
    join.disabled = false
    leave.disabled = true
    nameInput.disabled = false
    chatInput.disabled = true
    sendChat.disabled = true
    inGame = false
    userInfo.style.display = "none"
    clearBoard()
})

socket.on("updatePlayers", (data) => {
    const players = data.players
    playerList.innerHTML = ""
    players.forEach((player) => {
        playerList.innerHTML += `
        <div id="player-${player.name}" class="player container">
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
})

document.addEventListener("keydown", (evt) => {
    if (document.activeElement == document.body) {
        // focus game
        if (inGame) {
            if (lettersAvailable.includes(evt.key.toLowerCase())) {
                playLetter(evt.key)
            }
            else if (evt.key == "Enter") {
                playWord()
            }
            else if (evt.key == "Backspace") {
                if (lettersUsed.length > 0) {
                    removeLetter()
                }
            }
            else if (evt.key == " " && lettersUsed.length > 0) {
                clearLetters()
            }
            else if (evt.key == ";" || evt.key == ":") {
                shuffle(lettersAvailable)
                updateDeck()
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

const sendMessage = () => {
    const name = nameInput.value
    const message = chatInput.value
    messageCount += 1
    let allowMessage = true
    /*

    This is good, but should be checked on character input 
    and then should toggle the send button on and off, with 
    an alert if a message is sent that doesnt meet the requirements

    let allowMessage = (message.length > 0 && message.length < 400 && message.split(" ").length < 100 && inGame)
    message.split(" ").forEach((word) => {
        if (word.length > 16) {
            allowMessage = false
        } 
    })

    */
    if (allowMessage) {
        socket.emit("chatSent", {
            sender: name,
            message: message
        })
        chatInput.value = ""
    } 
}

sendChat.addEventListener("click", sendMessage)

socket.on("newMessage", (data) => {
    const sender = data.sender
    const message = data.message
    const me = nameInput.value
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

const updateDeck = () => {
    availableWrapper.innerHTML = ""
    usedWrapper.innerHTML = ""
    for (let i = 1; i <= totalLetters; i++) {
        // letters available
        let available = ""
        if (i <= lettersAvailable.length) {
            available = lettersAvailable[i-1]
        }
        availableWrapper.innerHTML += `
            <p id="letters-available-${i}" class="letter-available">${available}</p>
        `
        // letters used
        if (i <= lettersUsed.length) {
            usedWrapper.innerHTML += `
                <p id="letter-used-${i}" class="letter-used filled">${lettersUsed[i-1]}</p>
            `
        }
        else {
            usedWrapper.innerHTML += `
                <p id="letter-used-${i}" class="letter-used empty"></p>
            `
        }
    }
}

const playLetter = (key) => {
    let i = lettersAvailable.indexOf(key)
    const letter = lettersAvailable.splice(i, 1)
    lettersUsed.push(key.toLowerCase())
    updateDeck()
}

const removeLetter = () => {
    const letter = lettersUsed.pop()
    lettersAvailable.unshift(letter)
    updateDeck()
}

socket.on("newLetters", (data) => {
    if (inGame) {
        const letters = data.letters
        totalLetters = letters.length
        lettersAvailable = letters
        updateDeck()
    }
})

start.addEventListener("click", () => {
    if (inGame) {
        socket.emit("startGame")
    }
})

const playWord = () => {
    if (lettersUsed.length > 0) {
        let word = ""
        lettersUsed.forEach((letter) => {
            word += letter
        })
        socket.emit("wordSubmit", {
            word: word
        })
    }
}

const clearLetters = () => {
    lettersUsed.forEach((letter) => {
        lettersAvailable.push(letter)
    })
    lettersUsed = []
    updateDeck()
}

socket.on("wordAccept", (data) => {
    const word = data.word
    const me = data.player
    const score = data.score
    const length = word.length
    console.log(length)
    clearLetters()
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
    clearLetters()
    declinedAnimation()
})

const clearBoard = () => {
    wordCount.innerText = "Words: 0"
    myScore.innerText = "Score: 0"
    wordList.innerHTML = ""
    clearLetters()
    lettersAvailable = []
    updateDeck()
}

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

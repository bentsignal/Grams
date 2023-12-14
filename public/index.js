const join = document.getElementById("join")
const leave = document.getElementById("leave")
const nameInput = document.getElementById("name-input")
const playerList = document.getElementById("player-list-wrapper")
const chatInput = document.getElementById("chat-input")
const sendChat = document.getElementById("send-chat")
const chat = document.getElementById("chat")
const joinErrors = document.getElementById("join-errors")
const wordCount = document.getElementById("wordCount")
const myScore = document.getElementById("myScore")
const username = document.getElementById("username")
const timerContainer = document.getElementById("timer-container")
const timer = document.getElementById("timer")
const start = document.getElementById("start")
const controls = document.getElementById("controls-container")
const gameWrapper = document.getElementById("game-wrapper")
const resultsWrapper = document.getElementById("results-wrapper")
const volumeButton = document.getElementById("volume")

import { isAlphanumeric } from "./utils.js"
import { cfg } from "./cfg.js"
import Game from "./game.js"
import Sound from "./sound.js"

const socket = io(cfg.URL)
const game = new Game()
const sound = new Sound()

let messageCount = 0

const emotePopup = new Popup({
    id:"send-emote",
    title: "Send emote to chat",
    content: `
        <div id="popup-wrapper">
            <div id="popup-container">
                <div class="choose-emote-row">
                    <img src="images/ben-face-1.jpg" class="emote-option" id="ben-face-1">
                    <img src="images/ben-face-2.jpg" class="emote-option" id="ben-face-2">
                    <img src="images/ben-face-3.jpg" class="emote-option" id="ben-face-3">
                    <img src="images/ben-face-4.jpg" class="emote-option" id="ben-face-4">
                </div>
                <div class="choose-emote-row">
                    <img src="images/ben-emote-1.jpg" class="emote-option" id="ben-emote-1">
                    <img src="images/ben-emote-2.jpg" class="emote-option" id="ben-emote-2">
                    <img src="images/ben-emote-3.jpg" class="emote-option" id="ben-emote-3">
                    <img src="images/ben-emote-4.jpg" class="emote-option" id="ben-emote-4">
                </div>
                <div class="choose-emote-row">
                    <img src="images/lukas-face-1.jpg" class="emote-option" id="lukas-face-1">
                    <img src="images/lukas-face-2.jpg" class="emote-option" id="lukas-face-2">
                    <img src="images/lukas-face-3.jpg" class="emote-option" id="lukas-face-3">
                    <img src="images/lukas-face-4.jpg" class="emote-option" id="lukas-face-4">
                </div>
            </div>
        </div>
    `,
    backgroundColor: "var(--charcoal)",
    titleColor: "white",
    textColor: "white",
    closeColor: "white",
    css: `

        .popup-title {
            font-size: 24pt;
            margin-top: 3vh;
        }

        .popup-content {
            background-color: var(--charcoal);
            opacity: 80%;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(10px);
        }

        .popup-body p {
            margin: 0 !important;
        }

    `,
    loadCallback: () => {
        Array.from(document.getElementsByClassName("emote-option")).forEach((emote) => {
            emote.addEventListener("click", sendEmote)
        })
    }

})

const pfpChangePopup = new Popup({
    id: "change-pfp",
    title: "Change your profile picture",
    content: `
    <div id="pfp-list-wrapper">
        <div class="pfp-list-row" id="pfp-list-row-ben">
        </div>
        <div class="pfp-list-row" id="pfp-list-row-lukas">
        </div>
    </div>
    `,
    backgroundColor: "var(--charcoal)",
    titleColor: "white",
    textColor: "white",
    closeColor: "white",
    css: `

        .popup-title {
            font-size: 24pt;
            margin-top: 3vh;
        }

        .popup-content {
            width: 50vw !important;
            background-color: var(--charcoal);
            opacity: 80%;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(10px);
        }

    `
})

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

const leaveGame = () => {
    socket.emit("leave")
    sound.music.pause()
    join.disabled = false
    leave.disabled = true
    nameInput.disabled = false
    chatInput.disabled = true
    sendChat.disabled = true
    wordCount.innerText = "Words: 0"
    myScore.innerText = "Score: 0"
    game.left()
    controls.style.display = "none"
    timerContainer.style.display = "none"
    document.getElementById("emote-button").style.display = "none"
    updatePlayers()
    game.resetWordList()
    switchToGame()
    gameWrapper.style.display = "none"
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
        if (player.id == socket.id) {
            document.getElementById("my-pfp").src = `images/${player.pfp}`
        }
        playerList.innerHTML += `
            <div id="player-${player.name}" class="player wrapper">
                <img src="images/${player.pfp}" class="pfp-player-list">
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

const startCountdown = (letters) => {
    sound.start.play()
    let countdown = 3
    const time = setInterval(() => {
        if (countdown <= 0) {
            clearInterval(time)
            startTimer(59)
            switchToGame()
            game.newLetters(letters)
        }
        countdown -= 1
    }, 1000)
}

const startTimer = (countdown) => {
    timerContainer.style.display = "flex"
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

const renderResults = () => {
    const resultsContainer = document.getElementById("results-container")
    if (game.players.length > 2) {
        resultsWrapper.style.justifyContent = ""
    }
    else {
        resultsWrapper.style.justifyContent = "center"
    }
    resultsContainer.innerHTML = ""
    game.players.forEach((player) => {
        let words = ""
        player.words.forEach((word) => {
            words += `
                <div class="word">
                    <p style="font-size:${10+(word.length*2)}pt">${word}</p>
                    <p style="font-size:${10+(word.length*2)}pt">${game.wordScore[word.length]}</p>
                </div>
            `
        })
        resultsContainer.innerHTML += `
            <div class="player-result wrapper">
                <div class="player-result-top-w">
                    <div class="player-result-top-c">
                        <div class="result-pfp-wrapper">
                            <img class="result-pfp" src="images/${player.pfp}">
                        </div>
                        <div class="result-info-wrapper">
                            <p class="result-name">${player.name}</p>
                            <p class="result-word-count">Words: ${player.words.length}</p>
                            <p class="result-score">Score: ${player.score}</p>
                        </div>
                    </div>
                </div>
                <div class="player-result-bottom-w">
                    <div class="player-result-bottom-c">
                        <p>Words</p>
                        <div class="result-word-list-w">
                            <div class="result-word-list-c">
                                <div class="result-words">
                                    ${words}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    })
}

const switchToResults = () => {
    gameWrapper.style.display = "none"
    resultsWrapper.style.display = "flex"
}

const switchToGame = () => {
    gameWrapper.style.display = "block"
    resultsWrapper.style.display = "none"
}

const pfpChange = (event) => {
    pfpChangePopup.hide()
    const pfpNew = `${event.target.id}.jpg`
    socket.emit("pfpRequestChange", {
        new: pfpNew
    })
}

const sendEmote = (event) => {
    if (game.inGame) {
        emotePopup.hide()
        const emote = event.target.id
        socket.emit("emoteSent", {
            emote: emote
        })
    }
}

/*



    Button and input event listeners



*/

join.addEventListener("click", () => {
    joinGame()
})

leave.addEventListener("click", () => {
    leaveGame()
})

start.addEventListener("click", () => {
    socket.emit("requestStart", {
        size: document.getElementById("select-word-size").value
    })
})

volumeButton.addEventListener("click", () => {
    sound.controls.show()
})

document.getElementById("my-pfp").addEventListener("click", () => {
    socket.emit("pfpLoadAvailable")
    pfpChangePopup.show()
})

document.addEventListener("keydown", (evt) => {
    if (document.activeElement == document.body) {
        // focus game
        if (game.inGame) {
            if (evt.key == "Backspace") {
                if (game.lettersUsed.length > 0) {
                    game.removeLetter()
                }
            }
            else if (evt.key == "Enter" && game.midGame) {
                playWord()
            }
            else if (game.midGame && game.isLetterAvailable(evt.key.toLowerCase())) {
                game.playLetter(evt.key)
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

document.getElementById("emote-button").addEventListener('click', () => {
    if (game.inGame) {
        emotePopup.show()
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
    sound.music.play()
    game.joined(nameInput.value)
    join.disabled = true
    leave.disabled = false
    nameInput.disabled = true
    chatInput.disabled = false
    sendChat.disabled = false
    gameWrapper.style.display = "block"
    document.getElementById("emote-button").style.display = "block"
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
    if (game.inGame) {
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
    }
})

socket.on("emoteReceived", (data) => {
    if (game.inGame) {
        const sender = data.sender
        const emote = data.emote
        messageCount += 1
        chat.innerHTML += `
            <p id="message-${messageCount}">
                <span class="chat">${sender}: </span>
            </p>
            <img src="images/${emote}.jpg" class="chat-emote">
        `
        document.getElementById(`message-${messageCount}`).scrollIntoView()
    }
})

socket.on("pfpAvailable", (data) => {
    const ben = data.ben
    const lukas = data.lukas
    let id = ""
    document.getElementById("pfp-list-row-ben").innerHTML = ""
    document.getElementById("pfp-list-row-lukas").innerHTML = ""
    ben.forEach((pfpBen) => {
        id = pfpBen.replace(".jpg", "")
        document.getElementById("pfp-list-row-ben").innerHTML += `
            <img src="images/${pfpBen}" class="pfp-list" id="${id}">
        `
    })
    lukas.forEach((pfpLukas) => {
        id = pfpLukas.replace(".jpg", "")
        document.getElementById("pfp-list-row-lukas").innerHTML += `
            <img src="images/${pfpLukas}" class="pfp-list" id="${id}">
        `
    })
    Array.from(document.getElementsByClassName("pfp-list")).forEach((pfp) => {
        pfp.addEventListener("click", pfpChange)
    })
})

socket.on("startGame", (data) => {
    if (game.inGame) {
        game.reset()
        game.midGame = true
        wordCount.innerText = "Words: 0"
        myScore.innerText = "Score: 0"
        startCountdown(data.letters)
    }
})

socket.on("wordAccept", (data) => {
    console.log("word accept")
    sound.validWord.play()
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
    sound.invalidWord.play()
    declinedAnimation()
})

socket.on("youWon", () => {
    sound.win.play()
})

socket.on("youLost", () => {
    sound.lose.play()
})

socket.on("gameOver", (data) => {
    if (game.inGame) {
        game.players = data.players
        updatePlayers()
        game.reset()
        wordCount.innerText = `Words: 0`
        myScore.innerText = `Score: 0`
        renderResults()
        switchToResults()
    }
})

socket.on("serverCrash", () => {
    game = new Game()
    updatePlayers()
})
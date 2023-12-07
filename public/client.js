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
const resultsWrapper = document.getElementById("results-wrapper")
const volumeButton = document.getElementById("volume")

import { isAlphanumeric } from "./help.js"
import { cfg } from "./cfg.js"
import { Game } from "./game.js"

const socket = io(cfg.URL)
const game = new Game()

let messageCount = 0

const music = new Audio("./sounds/george_st_shuffle.mp3")
const bad_word_sound = new Audio("./sounds/bad.mp3")
const good_word_sound = new Audio("./sounds/good.mp3")
const win_sound = new Audio("./sounds/win.mp3")
const lose_sound = new Audio("./sounds/lose.mp3")

const volume = {
    music: 0.1,
    sfx: 1
}

lose_sound.volume = volume.sfx
music.volume = volume.music

const volumeControls = new Popup({
    id: "volume-controls",
    title: "Volume",
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
            width: 30vw !important;
            background-color: var(--charcoal);
            opacity: 80%;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

    `,
    content: `
        <div id="sfx-controls-container">
            <div id="sfx-controls-wrapper">
                <p>SFX</p>
                <input type="range" min="0" max="100" value=${volume.sfx*100} id="sfx-slider" class="volume-slider">
            </div>
        </div>
        <div id="music-controls-container">
            <div id="music-controls-wrapper">
                <p>Music</p>
                <input type="range" min="0" max="100" value=${volume.music*100} id="music-slider" class="volume-slider">
            </div>
        </div>
    `,
    loadCallback: () => {
        const sfxSlider = document.getElementById("sfx-slider")
        const musicSlider = document.getElementById("music-slider")
        sfxSlider.addEventListener("input", () => {
            volume.sfx = document.getElementById("sfx-slider").value / 100
            win_sound.volume = volume.sfx
            lose_sound.volume = volume.sfx
            good_word_sound.volume = volume.sfx
            bad_word_sound.volume = volume.sfx
        })
        
        musicSlider.addEventListener("input", () => {
            volume.music = document.getElementById("music-slider").value / 100
            music.volume = volume.music
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

const renderResults = () => {
    resultsWrapper.innerHTML = ""
    game.players.forEach((player) => {
        let words = ""
        player.words.forEach((word) => {
            words += `
                <p>${word}</p>
            `
        })
        resultsWrapper.innerHTML += `
            <div>
                <div>
                    ${player.name}
                </div>
                <div>
                    ${words}
                </div>
            </div>
        `
    })
}

const switchToResults = () => {
    gameWrapper.style.display = "none"
    resultsWrapper.style.display = "block"
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

/*



    Button and input event listeners



*/


join.addEventListener("click", () => {
    joinGame()
})

leave.addEventListener("click", () => {
    socket.emit("leave")
    music.pause()
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

volumeButton.addEventListener("click", () => {
    volumeControls.show()
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
            else if (game.lettersAvailable.includes(evt.key.toLowerCase())) {
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

/*



    Socket event listeners



*/

socket.on("connect", () => {
    console.log(`connected to server with id: ${socket.id}`)
})

socket.on("joinAccepted", () => {
    console.log("successfully joined the game")
    music.play()
    music.volume = volume.music
    music.loop = true
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
        switchToGame()
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

socket.on("youWon", () => {
    win_sound.play()
})

socket.on("youLost", () => {
    lose_sound.play()
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
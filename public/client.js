const join = document.getElementById("join")
const leave = document.getElementById("leave")
const nameField = document.getElementById("name-input")
const playerList = document.getElementById("player-list-wrapper")
const chatInput = document.getElementById("chat-input")
const sendChat = document.getElementById("send-chat")
const chat = document.getElementById("chat")
const chatWrapper = document.getElementById("chat-wrapper")
const joinErrors = document.getElementById("join-errors")
const availableWrapper = document.getElementById("letters-available-wrapper")
const usedWrapper = document.getElementById("letters-used-wrapper")
const start = document.getElementById("start")
const wordList = document.getElementById("word-list")

let socket = io("http://localhost:5000")
//let socket = io("http://grams.ddns.net")

let inGame = false
let messageCount = 0
let lettersAvailable = ["f", "a", "r", "t", "e", "r"]
let lettersUsed = []
let totalLetters = 6

let isAlphanumeric = (str) => {
    return /^[a-zA-Z0-9]+$/.test(str)
}

socket.on("connect", () => {
    console.log(`connected with id: ${socket.id}`)
    socket.emit("requestPlayers")
})

join.addEventListener("click", () => {
    joinErrors.innerHTML = ""
    joinGame()
})

const joinGame = () => {
    const name = nameField.value
    if (name.length > 0 && isAlphanumeric(name) && !inGame) {
        socket.emit("requestJoin", {
            name: nameField.value
        })
    }
}

socket.on("joinAccepted", () => {
    console.log("successfully joined the game")
    inGame = true
    join.disabled = true
    leave.disabled = false
    nameField.disabled = true
    chatInput.disabled = false
    sendChat.disabled = false
})

socket.on("joinDeclined", (data) => {
    const message = data.message
    joinErrors.innerHTML += `
        <p class="bad">${message}</p>
    `
})

leave.addEventListener("click", () => {
    socket.emit("leave", {
        name: nameField.value
    })
    join.disabled = false
    leave.disabled = true
    nameField.disabled = false
    chatInput.disabled = true
    sendChat.disabled = true
    inGame = false
})

socket.on("updatePlayers", (data) => {
    const players = data.players
    playerList.innerHTML = ""
    players.forEach((player) => {
        playerList.innerHTML += `
        <div id="player-${player.name}" class="player">
            <div class="player-pfp">
            </div>
            <div class="player-info">
                <div class="player-name">
                    ${player.name}
                </div>
                <div class="player-score">
                    Score: ${player.score}
                </div>
            </div>
        </div>
        `
    })
})

document.addEventListener("keydown", (evt) => {
    const focusGame = chatInput != document.activeElement && nameField != document.activeElement
    if (evt.key == "Enter") {
        if (chatInput == document.activeElement) {
            sendMessage()
        }
        else if (nameField == document.activeElement) {
            joinErrors.innerHTML = ""
            joinGame()
        }
        else if (document.body = document.activeElement) {
            playWord()
        }
    }
    if ((evt.key == ";" || evt.key == ":") && focusGame && inGame) {
        shuffle()
    }
    if (lettersAvailable.includes(evt.key.toLowerCase()) && focusGame && inGame) {
        playLetter(evt.key)
    }
    if (evt.key == "Backspace" && focusGame && inGame) {
        if (lettersUsed.length > 0) {
            removeLetter()
        }
    }
})

const sendMessage = () => {
    const name = nameField.value
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
    const me = nameField.value
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

const shuffle = () => {

    let currentIndex = lettersAvailable.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [lettersAvailable[currentIndex], lettersAvailable[randomIndex]] = [
        lettersAvailable[randomIndex], lettersAvailable[currentIndex]];
    }

    let c = 1
    lettersAvailable.forEach((letter) => {
        document.getElementById(`letters-available-${c}`).innerText = letter
        c += 1
    })

}

const updateDeck = () => {
    availableWrapper.innerHTML = ""
    let i = 1
    lettersAvailable.forEach((letter) => {
        availableWrapper.innerHTML += `
            <p id="letters-available-${i}" class="letter-available">${letter}</p>
        `
        i += 1
    })
    usedWrapper.innerHTML = ""
    const played = lettersUsed.length
    for (i = 1; i <= totalLetters; i++) {
        if (i <= played) {
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
    const letters = data.letters
    totalLetters = letters.length
    lettersAvailable = letters
    updateDeck()
})

start.addEventListener("click", () => {
    socket.emit("startGame")
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

socket.on("wordAccept", (data) => {
    const word = data.word
    console.log("word accepted")
    lettersUsed.forEach((letter) => {
        lettersAvailable.push(letter)
    })
    lettersUsed = []
    updateDeck()
    wordList.innerHTML += `
        <div class="submitted-word">${word}</div>
    `
})

socket.on("wordDecline", (data) => {
    console.log(`Word Declined`)
})

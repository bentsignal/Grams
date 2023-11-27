const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const fs = require("fs")

// start server
app.use(express.static("public"))
const PORT = 5000
httpServer.listen(PORT)

// load dictionary
let dict = {}
fs.readFile("src/370k.json", "utf-8", (err, data) => {
    if (err) {
        console.log(`ERROR: Could not read dictionary file: ${err}`)
    }
    dict = JSON.parse(data)
})

const wordScore = {
    1: 1,
    2: 4, 
    3: 10,
    4: 40,
    5: 120,
    6: 200,
    7: 400,
    8: 1000
}

// game 
const max = 7
let game = {

    size: 8,
    letters: [],
    players: []

}

const shuffle = (list) => {

    let currentIndex = list.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [list[currentIndex], list[randomIndex]] = [
        list[randomIndex], list[currentIndex]];
    }

}

const chooseLetters = () => {
    let letters = []
    const s = game.size.toString()
    // choose random letter a-z
    const l = String.fromCharCode(97 + Math.floor(Math.random() * 26))
    // pick word from dictionary of length s starting with letter l
    if (Object.keys(dict).length === 0) {
        console.log("ERROR: Could not pick word, dictionary empty.")
    }
    else {
        const length = dict[s][l].length
        const w = dict[s][l][Math.floor(Math.random()*length)]
        for (let i = 0; i < w.length; i++) {
            letters.push(w.charAt(i))
        }
    }

    shuffle(letters)
    return letters
}

const inDict = (word) => {
    const l = word.charAt(0)
    const s = word.length
    const words = dict[s][l]
    return words.includes(word)
}

const getPlayerIndex = (id) => {
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].id == id) {
            return i
        }
    }
    return -1
}

const checkWord = (word, playerIndex) => {
    c1 = word.length <= game.size && word.length >= 1
    c2 = inDict(word)
    c3 = !game.players[playerIndex].words.includes(word)
    if (c1 && c2 && c3) {
        return true
    }
    else {
        return false
    }
}

const startGame = () => {
    game.letters = chooseLetters()
}


io.on("connection", socket => {

    console.log(`user connected with id: ${socket.id}`)

    socket.on("startGame", () => {
        startGame()
        io.sockets.emit("newLetters", {
            letters: game.letters
        })
    })

    socket.on("requestJoin", (data) => {

        const name = data.name
        let allowJoin = true

        game.players.forEach((player) => {
            // usename alrady taken
            if (player.name == name) {
                allowJoin = false
                socket.emit("joinDeclined", {
                    message: "Username taken."
                })
            }
            // socket already connected
            else if (player.id == socket.id) {
                allowJoin = false
                socket.emit("joinDeclined", {
                    message: "ERROR: Already connected to game, refresh page if error persists."
                })
            }
        })
        // max players reached
        if (game.players.length >= max) {
            allowJoin = false
            socket.emit("joinDeclined", {
                message: "Lobby is currently full."
            })
        }
        // username too long
        if (name.length > 15) {
            allowJoin = false
            socket.emit("joinDeclined", {
                message: "Username must not exceed 15 characters."
            })
        }

        // join accepted
        if (allowJoin) {

            let newPlayer = {
                name: data.name,
                id: socket.id,
                score: 0,
                wins: 0,
                losses: 0,
                words: []
            }
            game.players.push(newPlayer)

            socket.emit("joinAccepted")
            io.sockets.emit("updatePlayers", {
                players: game.players
            })
            if (game.letters.length > 0) {
                socket.emit("newLetters", {
                    letters: game.letters
                })
            }
            io.sockets.emit("newMessage", {
                sender: "Server",
                type: "good",
                message: `${data.name} has joined the game.`
            })

            console.log(`accepted user ${data.name} with socket id: ${socket.id}`)

        }
    })

    socket.on("requestPlayers", () => {
        socket.emit("updatePlayers", {
            players: game.players
        })
    })

    socket.on("chatSent", (data) => {
        const sender = data.sender
        const message = data.message
        let allowMessage = (message.length > 0 && message.length < 400 && message.split(" ").length < 100)
        if (allowMessage) {
            io.sockets.emit("newMessage", {
                sender: sender,
                message: message
            })
        }
        else {
            socket.emit("newMessage", {
                sender: "Server",
                type: "bad", 
                message: "Your message could not be sent."
            })
        }
    })

    let playerLeft = (name) => {
        console.log(`Player ${name} with id ${socket.id} has left the game.`)
        let updatedPlayers = []
        game.players.forEach((player) => {
            if (player.id != socket.id) {
                updatedPlayers.push(player)
            }
        })
        game.players = updatedPlayers
        io.sockets.emit("updatePlayers", {
            players: game.players
        })
        io.sockets.emit("newMessage", {
            sender: "Server",
            type: "bad",
            message: `${name} has left the game.`
        })
    }

    socket.on("disconnect", () => {
        game.players.forEach((player) => {
            if (player.id == socket.id) {
                playerLeft(player.name)
            }
        })
    })

    socket.on("leave", (data) => {
        playerLeft(data.name)
    })

    socket.on("wordSubmit", (data) => {
        const word = data.word
        const playerIndex = getPlayerIndex(socket.id)
        if (checkWord(word, playerIndex)) {
            game.players[playerIndex].words.push(word)
            game.players[playerIndex].score += wordScore[word.length]
            socket.emit("wordAccept", {
                word: word,
                player: game.players[playerIndex]
            })
            io.sockets.emit("updatePlayers", {
                players: game.players
            })
        }
        else {
            socket.emit("wordDecline")
        }
    })

})


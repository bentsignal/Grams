const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const game = require("./game")

// start server
app.use(express.static("public"))
const PORT = 5000
httpServer.listen(PORT)

io.on("connection", socket => {

    console.log(`user connected with id: ${socket.id}`)

    socket.on("startGame", () => {
        game.startGame()
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
        if (name.length > 20) {
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
        if (game.players.length == 0) {
            game.letters = []
        }
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
                score: wordScore[word.length],
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


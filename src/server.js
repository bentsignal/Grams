const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const Game = require("./game")
const cfg = require("./cfg.json")

// start server
app.use(express.static("public"))
httpServer.listen(cfg.PORT)

let game = new Game()
game.init(cfg.DICT)

io.on("connection", socket => {

    console.log(`user connected with id: ${socket.id}`)

    socket.on("startGame", () => {
        game.startGame()
        io.sockets.emit("newLetters", {
            letters: game.letters
        })
    })

    socket.on("requestJoin", (data) => {
        if (game.nameTaken(data.name)) {
            socket.emit("joinDeclined", {
                message: "Username taken."
            })
        }
        else if (game.dupConnection(socket.id)) {
            socket.emit("joinDeclined", {
                message: "ERROR: Already connected to game, refresh page if error persists."
            })
        }
        // max players reached
        else if (game.isFull()) {
            socket.emit("joinDeclined", {
                message: "Lobby is currently full."
            })
        }
        // username too long
        else if (name.length > 20) {
            socket.emit("joinDeclined", {
                message: "Username must not exceed 15 characters."
            })
        }
        else {

            game.addPlayer(data.name, socket.id)

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
        const charLim = message.length > 0 && message.length < 400
        const wordLim = message.split(" ").length < 100
        if (charLim && wordLim) {
            io.sockets.emit("newMessage", {
                sender: sender,
                message: message
            })
        }
        else {
            socket.emit("newMessage", {
                sender: "Server",
                type: "bad", 
                message: "Your message exceeded the maximum length."
            })
        }
    })

    let playerLeft = () => {
        console.log(`Player with id ${socket.id} has left the game.`)
        game.removePlayer(socket.id)
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
        playerLeft()
    })

    socket.on("leave", (data) => {
        playerLeft()
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


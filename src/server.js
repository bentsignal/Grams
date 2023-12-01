const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const Game = require("./game")
const cfg = require("./cfg.json")
const { isAlphanumeric } = require("./help")

// start server
app.use(express.static("public"))
httpServer.listen(cfg.PORT)

let game = new Game()
game.init(cfg.DICT)

io.on("connection", socket => {

    console.log(`user connected with id: ${socket.id}`)

    socket.on("requestJoin", (data) => {
        if (game.nameTaken(data.name)) {
            socket.emit("joinDeclined", {
                message: "Username taken."
            })
        }
        // socket already in game
        else if (game.socketInGame(socket.id)) {
            socket.emit("joinDeclined", {
                message: "ERROR: Already connected to game, refresh page if error persists."
            })
        }
        // max players reached
        else if (game.full()) {
            socket.emit("joinDeclined", {
                message: "Lobby is currently full."
            })
        }
        // bad username
        else if (!isAlphanumeric(data.name)) {
            socket.emit("joinDeclined", {
                message: "Username must be alphanumeric"
            })
        }
        // username too long
        else if (data.name.length > 20) {
            socket.emit("joinDeclined", {
                message: "Username must not exceed 20 characters."
            })
        }
        else {

            game.addPlayer(data.name, socket.id)

            socket.emit("joinAccepted")
            if (game.players.length == 1) {
                game.host = socket.id
                io.sockets.emit("newHost", {
                    id: game.host
                })
            }
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

            console.log(`User ${data.name} (${socket.id}) has joined the game (${game.players.length}/${game.maxPlayers})`)

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
        const charLim = message.length < 0 || message.length > 400
        const wordLim = message.split(" ").length > 100
        if (charLim) {
            socket.emit("newMessage", {
                sender: "Server",
                type: "bad", 
                message: "Message must be less than 400 characters"
            })
        }
        else if (wordLim) {
            socket.emit("newMessage", {
                sender: "Server",
                type: "bad", 
                message: "Message must be less than 100 words"
            })
        }
        else {
            io.sockets.emit("newMessage", {
                sender: sender,
                message: message
            })
        }
    })

    const playerLeft = (message) => {
        const name = game.removePlayer(socket.id)
        console.log(`Player ${name} with id ${socket.id} has ${message} the game.`)
        if (game.host == socket.id) {
            console.log("host left, choosing new host")
            if (game.players.length > 0) {
                game.host = game.players[0].id
                io.sockets.emit("newHost", {
                    id: game.host
                })
                console.log(`settings ${game.players[0].name} (${game.host}) to be new host`)
            }
            else {
                console.log("no players left, removing host data")
                game.host = ""
            }
        }
        io.sockets.emit("updatePlayers", {
            players: game.players
        })
        io.sockets.emit("newMessage", {
            sender: "Server",
            type: "bad",
            message: `${name} has ${message} the game.`
        })

    }

    socket.on("disconnect", () => {
        if (game.socketInGame(socket.id)) {
            playerLeft("disconnected from")
        }   
    })

    socket.on("leave", () => {
        if (game.socketInGame(socket.id)) {
            playerLeft("left")
        } 
    })

    socket.on("wordSubmit", (data) => {
        const word = data.word
        const playerIndex = game.getPlayerIndex(socket.id)
        if (game.playWord(word, socket.id)) {
            socket.emit("wordAccept", {
                word: word,
                score: game.wordScore[word.length],
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

    socket.on("requestStart", () => {
        if (game.host == socket.id) {
            console.log("host requested start")
            game.startGame()
            io.sockets.emit("startGame", {
                letters: game.letters
            })
        }
        else {
            console.log("start request by player that is not host")
        }
    })

})
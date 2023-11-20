const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.use(express.static("public"))

const PORT = 5000

httpServer.listen(PORT)

let game = {

    playerCount: 0,
    letters: 6,
    players: [],

    addPlayer: (name, id) => {

        let newPlayer = {
            name: name,
            id: id,
            score: 0,
            wins: 0,
            losses: 0,
            words: {}
        } 

    }

}

io.on("connection", socket => {

    console.log(`user connected with id: ${socket.id}`)

    socket.on("requestJoin", (data) => {
        let newPlayer = {
            name: data.name,
            id: data.id,
            score: 100,
            wins: 0,
            losses: 0,
            words: {}
        }
        game.players.push(newPlayer)
        socket.emit("joinAccepted")
        io.sockets.emit("newPlayer", {
            newPlayer: newPlayer
        })
        console.log(`accepted user ${data.name} with socket id: ${socket.id}`)
    })

    socket.on("requestPlayers", () => {
        socket.emit("playersSent", {
            game: game
        })
    })

    socket.on("chatSent", (data) => {
        socket.broadcast.emit("newMessage", {
            sender: data.sender,
            message: data.message
        })
    })

    socket.on("leave", () => {
        let updatedPlayers = []
        game.players.forEach((player) => {
            if (player.id != socket.id) {
                updatedPlayers.push(player)
            }
        })
        game.players = updatedPlayers
        socket.emit("playersSent", {
            game: game
        })
    })

})


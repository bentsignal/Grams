const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const { game } = require("./game")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.use(express.static("public"))

const PORT = 5000

httpServer.listen(PORT)

const players = {}

io.on("connection", socket => {

    console.log(`user connected with id: ${socket.id}`)

    socket.on("requestJoin", (data) => {
        players[socket.id] = data.name
        socket.emit("joinAccepted")
        io.sockets.emit("newPlayer", {
            newPlayer: data.name
        })
        console.log(`accepted user ${data.name} with socket id: ${socket.id}`)
    })

    

})


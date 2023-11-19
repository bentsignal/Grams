const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.use(express.static("public"))

const PORT = 5000

httpServer.listen(PORT)

let count = 0

io.on("connection", socket => {

    console.log(`user connected with id: ${socket.id}`)

    socket.on("requestCount", () => {
        console.log(`socket id: ${socket.id} requested count`)
        socket.emit("returnCount", {
            count: count
        })
    })

    socket.on("increaseCount", () => {
        console.log(`socket id: ${socket.id} requested the count be increased`)
        count += 1
        io.fetchSockets.emit("newCount", {
            newCount: count
        })
    })

    socket.on("resetCount", () => {
        console.log(`socket id: ${socket.id} requested the count be reset`)
        count = 0
        io.sockets.emit("newCount", {
            newCount: count
        })
    })

})


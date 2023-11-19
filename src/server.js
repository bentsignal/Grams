const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.use(express.static("public"))

const PORT = 5000

httpServer.listen(PORT)

io.on("connection", socket => {
    console.log(socket.id)
})

io.on("press", (message) => {
    console.log(`New message from client: ${message}`)
    socket.emit("press_received", {
        message: "This is the server, your button press was received"
    })
})
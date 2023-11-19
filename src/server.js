const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.use(express.static("public"))

const PORT = 5000
httpServer.listen(PORT)
io.listen(3000)

io.on("connection", socket => {
    console.log(socket.id)
})
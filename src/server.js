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

// game 
const max = 7
let game = {

    size: 6,
    letters: [],
    players: []

}


const chooseLetters = () => {
    let letters = []
    const s = game.size.toString()
    console.log(`length of word: ${s}`)
    // choose random letter a-z
    const l = String.fromCharCode(97 + Math.floor(Math.random() * 26))
    console.log(`starting letter: ${l}`)
    // pick word from dictionary of length s starting with letter l
    if (Object.keys(dict).length === 0) {
        console.log("ERROR: Could not pick word, dictionary empty.")
    }
    else {
        const length = dict[s][l].length
        console.log(`number of words len ${s} start ${l}: ${length}`)
        const w = dict[s][l][Math.floor(Math.random()*length)]
        console.log(`word choosen: ${w}`)
        for (let i = 0; i < w.length; i++) {
            letters.push(w.charAt(i))
        }
    }
    return letters
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
                words: {}
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
        message.split(" ").forEach((word) => {
            if (word.length > 25) {
                allowMessage = false
            } 
        })
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

})


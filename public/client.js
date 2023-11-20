const join = document.getElementById("join")
const leave = document.getElementById("leave")
const nameField = document.getElementById("name-input")
const playerList = document.getElementById("player-list-wrapper")
const chatInput = document.getElementById("chat-input")
const sendChat = document.getElementById("send-chat")
const chat = document.getElementById("chat")

let socket = io("http://localhost:5000")

join.addEventListener("click", () => {
    socket.emit("requestJoin", {
        name: nameField.value
    })
})

leave.addEventListener("click", () => {
    socket.emit("leave")
    join.disabled = false
    leave.disabled = true
})

sendChat.addEventListener("click", () => {
    socket.emit("chatSent", {
        sender: nameField.value,
        message: chatInput.value
    })
    chat.innerHTML += `
        <p>
            <span class="my-message">${nameField.value}: </span>
            <span class="chat-message">${chatInput.value}</span>
        </p>
    `
})

socket.on("newMessage", (data) => {
    const sender = data.sender
    const message = data.message
    chat.innerHTML += `
        <p>
            <span class="chat">${sender}: </span>
            <span class="chat-message">${message}</span>
        </p>
    `
})

socket.on("newPlayer", (data) => {
    console.log(`new player joined with name: ${data.newPlayer.name}`)
    playerList.innerHTML += `
    <div id="player-${data.name}" class="player">
        <div class="player-pfp">
            pfp
        </div>
        <div class="player-name">
            ${data.newPlayer.name}
        </div>
        <div class="player-score">
            ${data.newPlayer.score}
        </div>
    </div>
    `
})

socket.on("joinAccepted", () => {
    console.log("successfully joined the game")
    join.disabled = true
    leave.disabled = false
})

socket.on("connect", () => {
    console.log(`connected with id: ${socket.id}`)
    socket.emit("requestPlayers")
})

socket.on("playersSent", (data) => {
    const players = data.game.players
    players.forEach((player) => {
        playerList.innerHTML = ""
        playerList.innerHTML += `
        <div id="player-${player.name}" class="player">
            <div class="player-pfp">
                pfp
            </div>
            <div class="player-name">
                ${player.name}
            </div>
            <div class="player-score">
                ${player.score}
            </div>
        </div>
        `
    })
})

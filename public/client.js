const join = document.getElementById("join")
const leave = document.getElementById("leave")
const nameField = document.getElementById("name-input")

let socket = io("http://localhost:5000")

join.addEventListener("click", () => {
    socket.emit("requestJoin", {
        name: nameField.value
    })
})

socket.on("newPlayer", (data) => {
    console.log(`new player joined with name: ${data.newPlayer}`)
})

socket.on("joinAccepted", () => {
    console.log("successfully joined the game")
    join.disabled = true
    leave.disabled = false
})

socket.on("connect", () => {
    console.log(`connected with id: ${socket.id}`)
})

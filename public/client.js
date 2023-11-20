const increase = document.getElementById("increase")
const reset = document.getElementById("reset")
const countLabel = document.getElementById("count")
const pop = document.getElementById("pop")

const socket = io("http://localhost:5000")

socket.on("connect", () => {
    console.log(`connected with id: ${socket.id}`)
    socket.emit("requestCount")
})

increase.addEventListener("click", () => {
    console.log("Button has been pressed, sending message to server")
    socket.emit("increaseCount")
})



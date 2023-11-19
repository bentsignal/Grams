const increase = document.getElementById("increase")
const reset = document.getElementById("reset")
const countLabel = document.getElementById("count")

const socket = io("http://localhost:5000")

socket.on("connect", () => {
    console.log(`connected with id: ${socket.id}`)
    socket.emit("requestCount")
})

socket.on("returnCount", (data) => {
    console.log(`count received from server: ${data.count}`)
    countLabel.innerText = data.count
})

socket.on("newCount", (data) => {
    console.log(`server indicated that the count be changed to to ${data.newCount}`)
    countLabel.innerText = data.newCount
})

increase.addEventListener("click", () => {
    console.log("Button has been pressed, sending message to server")
    socket.emit("increaseCount")
})

reset.addEventListener("click", () => {
    console.log("Submitting request to reset count")
    socket.emit("resetCount")
})


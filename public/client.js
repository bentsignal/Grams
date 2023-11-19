const button = document.getElementById("test-button")

const socket = io("http://localhost:5000")

socket.on("connect", () => {
    console.log(`connected with id: ${socket.id}`)
})

button.addEventListener("click", () => {
    console.log("Button has been pressed, sending message to server")
    socket.emit("press", {
        message: "button has been pressed"
    })
})

socket.on("press_received", (message) => {
    console.log(`New message from server: ${message}`)
})
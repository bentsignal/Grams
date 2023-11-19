const button = document.getElementById("test-button")

const socket = io("http://localhost:5000")

socket.on("connect", () => {
    console.log("connected with id: ${socket.id}")
})

button.addEventListener("click", () => {
    console.log("yerrrrr")
})
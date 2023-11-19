import { io } from "socket.io-client"

const button = document.getElementById("test-button")

const socket = io("http://localhost:3000")

socket.on("connect", () => {
    console.log("connected with id: ${socket.id}")
})

button.addEventListener("click", () => {
    console.log("yerrrrr")
})
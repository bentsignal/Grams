class Game {
    
    constructor() {
        this.name = ""
        this.id = ""
        this.inGame = false
        this.messageCount = 0
        this.lettersAvailable = []
        this.lettersUsed = []
        this.wordSize = 6
        this.players = []
    }

    joined = (name) => {
        this.inGame = true
        this.name = name
    }

    left = () => {
        this.inGame = false
        this.clearBoard()
    }

    clearBoard = () => {
        this.lettersUsed = []
        this.lettersAvailable = []
    }

    clearPlayedLetters = () => {
        this.lettersUsed.forEach((letter) => {
            this.lettersAvailable.push(letter)
        })
        this.lettersUsed = []
    }


}

export { Game }
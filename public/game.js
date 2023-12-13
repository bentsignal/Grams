import { shuffle } from "./utils.js"

class Game {
    
    constructor() {
        this.name = ""
        this.id = ""
        this.inGame = false
        this.midGame = false
        this.lettersAvailable = []
        this.lettersUsed = []
        this.wordSize = 6
        this.wordScore = {
            1: 5,
            2: 10, 
            3: 50,
            4: 100,
            5: 300,
            6: 600,
            7: 1000,
            8: 2000
        }
        this.players = []
    }

    joined = (name) => {
        this.inGame = true
        this.name = name
    }

    left = () => {
        this.inGame = false
        this.lettersUsed = []
        this.lettersAvailable = []
        this.players = []
        this.updateDeck()
    }

    reset = () => {
        this.midGame = false
        this.lettersUsed = []
        this.lettersAvailable = []
        this.resetWordList()
        this.updateDeck()
    }

    resetWordList = () => {
        document.getElementById("words-wrapper").innerHTML = `
            <div id="words-8" class="word-class">
            </div>
            <div id="words-7">
            </div>
            <div id="words-6">
            </div>
            <div id="words-5">
            </div>
            <div id="words-4">
            </div>
            <div id="words-3">
            </div>
            <div id="words-2">
            </div>
            <div id="words-1">
            </div>
    `
    }

    updateDeck = () => {
        const availableWrapper = document.getElementById("letters-available-wrapper")
        const usedWrapper = document.getElementById("letters-used-wrapper")
        availableWrapper.innerHTML = ""
        usedWrapper.innerHTML = ""
        if (this.inGame && this.midGame) {
            for (let i = 1; i <= this.wordSize; i++) {
                // letters available
                if (i <= this.lettersAvailable.length) {
                    availableWrapper.innerHTML += `
                        <p id="letters-available-${i}" class="letter-available filled">${this.lettersAvailable[i-1]}</p>
                    `
                }
                else {
                    availableWrapper.innerHTML += `
                        <p id="letters-available-${i}" class="letter-available empty"></p>
                    `
                }
                // letters used
                if (i <= this.lettersUsed.length) {
                    usedWrapper.innerHTML += `
                        <p id="letter-used-${i}" class="letter-used filled">${this.lettersUsed[i-1]}</p>
                    `
                }
                else {
                    usedWrapper.innerHTML += `
                        <p id="letter-used-${i}" class="letter-used empty"></p>
                    `
                }
            }
        }
    }

    removeLetter = () => {
        const letter = this.lettersUsed.pop()
        this.lettersAvailable.unshift(letter)
        this.updateDeck()
    }

    newWord = (word) => {
        console.log("newWord")
    }

    refreshWords = () => {
        console.log("refreshWords")
    }

    newLetters = (letters) => {
        if (this.inGame) {
            this.wordSize = letters.length
            this.lettersAvailable = letters
            this.lettersUsed = []
            this.updateDeck()
        }
    }

    playLetter = (key) => {
        const index = this.lettersAvailable.indexOf(key)
        /*

            This might be a problem, splice returns a value 

        */
        this.lettersAvailable.splice(index, 1)
        this.lettersUsed.push(key.toLowerCase())
        this.updateDeck()
    }

    anyLettersPlayed = () => {
        return this.lettersUsed.length > 0
    }

    getWord = () => {
        let word = ""
        this.lettersUsed.forEach((letter) => {
            word += letter
        })
        return word
    }
    
    shuffleLetters = () => {
        shuffle(this.lettersAvailable)
        this.updateDeck()
    }

    clearPlayedLetters = () => {
        this.lettersUsed.forEach((letter) => {
            this.lettersAvailable.push(letter)
        })
        this.lettersUsed = []
        this.updateDeck()
    }


}

export default Game
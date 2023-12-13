import { shuffle } from "./utils.js"
import Letter from "./letter.js"

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
                if (this.lettersAvailable[i-1].available) {
                    availableWrapper.innerHTML += `
                        <p id="letters-available-${i}" class="letter-available filled">${this.lettersAvailable[i-1].value}</p>
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
        const letterRemoved = this.lettersUsed.pop()
        let found = false
        console.log(`removing letter ${letterRemoved}`)
        this.lettersAvailable.forEach((letter) => {
            if (!found && letter.value == letterRemoved && !letter.available) {
                console.log(`found the letter`)
                found = true
                letter.available = true
            }
        })
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
            letters.forEach((letter) => {
                this.lettersAvailable.push(new Letter(letter))
            })
            this.lettersUsed = []
            this.updateDeck()
        }
    }

    playLetter = (key) => {
        let found = false
        for (let i = 0; i < this.lettersAvailable.length; i++) {
            if (!found && this.lettersAvailable[i].value == key) {
                found = true
                this.lettersAvailable[i].available = false
                this.lettersUsed.push(key.toLowerCase())
                this.updateDeck()
            }
        }
        
    }

    isLetterAvailable = (key) => {
        /*

            for some reason the code is continuing after it should return true

        */
        let available = false
        this.lettersAvailable.forEach((letter) => {
            if (letter.value == key && letter.available) {
                available = true
            }
        })
        return available
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
        //shuffle(this.lettersAvailable)
        this.updateDeck()
    }

    clearPlayedLetters = () => {
        this.lettersUsed = []
        this.lettersAvailable.forEach((letter) => {
            letter.available = true
        })
        this.updateDeck()
    }


}

export default Game
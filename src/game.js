const fs = require("fs")
const { shuffle } = require("../public/help")

let game = {

    host: "",
    wordSize: 6,
    letters: [],
    players: [],
    maxPlayers: 8,
    wordScore: {
        1: 5,
        2: 10, 
        3: 50,
        4: 100,
        5: 300,
        6: 600,
        7: 1000,
        8: 2000
    },
    dict: {},
    letters: [],

    startGame: () => {
        this.loadDict()
        this.letters = chooseLetters()
    },

    loadDict: (fileName) => {
        fs.readFile(fileName, "utf-8", (err, data) => {
            if (err) {
                console.log(`ERROR: Could not read dictionary file: ${err}`)
            }
            this.dict = JSON.parse(data)
        })
    },

    inDict: (word) => {
        const l = word.charAt(0)
        const s = word.length
        const words = this.dict[s][l]
        return words.includes(word)
    },

    chooseLetters: () => {
        let letters = []
        const size = this.wordSize.toString()
        // choose random letter a-z
        const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26))
        // pick word from dictionary of length s starting with letter l
        if (Object.keys(this.dict).length === 0) {
            console.log("ERROR: Could not pick word, dictionary empty.")
        }
        else {
            const length = this.dict[size][letter].length
            const word = this.dict[size][letter][Math.floor(Math.random()*length)]
            for (let i = 0; i < word.length; i++) {
                this.letters.push(word.charAt(i))
            }
        }

        shuffle(this.letters)
        return this.letters
    },

    getPlayerIndex: (id) => {
        for (let i = 0; i < this.game.players.length; i++) {
            if (this.game.players[i].id == id) {
                return i
            }
        }
        return -1
    },

    checkWord: (word, playerIndex) => {
        c1 = word.length <= this.wordSize && word.length >= 1
        c2 = this.inDict(word)
        c3 = !this.players[playerIndex].words.includes(word)
        if (c1 && c2 && c3) {
            return true
        }
        else {
            return false
        } 
    }

}

module.exports = game
const fs = require("fs")
const { shuffle } = require("../public/help")

class Game {

    constructor() {
        this.host = ""
        this.wordSize = 6
        this.letters = []
        this.players = []
        this.maxPlayers = 8
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
        this.dict = {}
        this.letters = []
    }

    init = (dict) => {
        this.loadDict(dict)
    }

    loadDict = (fileName) => {
        fs.readFile(fileName, "utf-8", (err, data) => {
            if (err) {
                console.log(`ERROR: Could not read dictionary file: ${err}`)
            }
            this.dict = JSON.parse(data)
        })
    }

}

const game = {

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

    init: () => {
        this.loadDict("src/370k.json").bind(this)
    },

    startGame: () => {
        this.letters = this.chooseLetters()
    },

    reset: () => {
        // reset game info
        this.letters = [],
        this.wordSize = 6
    },

    addPlayer: (name, id) => {
        this.players.push({
            name: name,
            id: id,
            score: 0,
            wins: 0,
            words: []
        })
    },

    removePlayer: (id) => {
        let players = []
        this.players.forEach((player) => {
            if (player.id != id) {
                players.push(player)
            }
        })
        this.players = players
        if (this.players.length == 0) {
            game.reset()
        }
    },

    isFull: () => {
        return this.players.length >= this.maxPlayers
    },

    nameTaken: (name) => {
        this.players.forEach((player) => {
            if (player.name == name) {
                return true
            }
        })
        return false
    },

    dupConnection: (id) => {
        this.players.forEach((player) => {
            if (player.id == id) {
                return true
            }
        })
        return false
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

module.exports = Game
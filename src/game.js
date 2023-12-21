const fs = require("fs")
const { shuffle } = require("./utils")

class Game {

    constructor() {
        this.host = ""
        this.midGame = false
        this.wordSize = 6
        this.letters = []
        this.players = []
        this.maxPlayers = 8
        this.choose = {}
        this.allow = {}
        this.word = ""
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
        this.pfp = {
            "ben-face-1.jpg": true,
            "ben-face-2.jpg": true,
            "ben-face-3.jpg": true,
            "ben-face-4.jpg": true,
            "lukas-face-1.jpg": true,
            "lukas-face-2.jpg": true,
            "lukas-face-3.jpg": true,
            "lukas-face-4.jpg": true,
            "lukas-face-5.jpg": true,
        }
    }

    init = (choose, allow) => {
        this.loadDict(choose, allow)
    }

    startGame = () => {
        this.resetGame()
        this.midGame = true
        this.chooseLetters()
    }

    endGame = () => {
        this.midGame = false
        this.gameOver = true
        if (this.players.length > 0) {
            this.pickWinner()
        }
    }

    resetGame = () => {
        this.letters = []
        this.players.forEach((player) => {
            player.words = []
            player.score = 0
        })
    }

    addPlayer = (name, id) => {
        this.players.push({
            name: name,
            id: id,
            pfp: this.pfpInit(),
            score: 0,
            wins: 0,
            words: []
        })
    }

    removePlayer = (id) => {
        let name = ""
        let players = []
        this.players.forEach((player) => {
            if (player.id != id) {
                players.push(player)
            }
            else {
                name = player.name
                this.pfp[player.pfp] = true
            }
        })
        this.players = players
        if (this.players.length == 0) {
            this.resetGame()
        }
        return name
    }

    nameById = (id) => {
        let name = ""
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id == id) {
                name = this.players[i].name
                break
            }
        }
        return name
    }

    getPlayerIndex = (id) => {
        let index = -1
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id == id) {
                index = i
            }
        }
        if (index != -1) {
            return index
        }
        else {
            return -1
        }
    }

    pfpAvailable = (pfp) => {
        return this.pfp[pfp]
    }

    pfpInit = () => {
        for (const [key, value] of Object.entries(this.pfp)) {
            if (value) {
                this.pfp[key] = false
                return key
            }
        }
    }

    pfpChange = (pfp, id) => {
        const old = this.players[this.getPlayerIndex(id)].pfp
        console.log(old)
        this.pfp[old] = true
        this.pfp[pfp] = false
        this.players[this.getPlayerIndex(id)].pfp = pfp
    }

    full = () => {
        return this.players.length >= this.maxPlayers
    }

    nameTaken = (name) => {
        let found = false
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].name == name) {
                found = true
                break
            }
        }
        return found
    }

    socketInGame = (id) => {
        let found = false
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id == id) {
                found = true
                break
            }
        }
        return found
    }

    loadDict = (choose, allow) => {
        fs.readFile(choose, "utf-8", (err, data) => {
            if (err) {
                console.log(`ERROR: Could not read dictionary file: ${err}`)
            }
            this.choose = JSON.parse(data)
        })
        fs.readFile(allow, "utf-8", (err, data) => {
            if (err) {
                console.log(`ERROR: Could not read dictionary file: ${err}`)
            }
            this.allow = JSON.parse(data)
        })
    }

    inDict = (word) => {
        const l = word.charAt(0)
        const s = word.length
        const words = this.allow[s][l]
        try {
            return words.includes(word)
        }
        catch (error) {
            return false
        }
    }

    chooseLetters = () => {
        let good = false
        while (!good) {
            try {
                this.letters = []
                const size = this.wordSize.toString()
                // choose random letter a-z
                const letter = String.fromCharCode(97 + Math.floor(Math.random() * 25))
                // pick word from dictionary of length s starting with letter l
                const length = this.choose[size][letter].length
                this.word = this.choose[size][letter][Math.floor(Math.random()*length)]
                for (let i = 0; i < this.word.length; i++) {
                    this.letters.push(this.word.charAt(i))
                }
                shuffle(this.letters)
                good = true
            }
            catch (error) {
                console.log(`ERROR: dictionary error when picking with letter ${letter}`)
                good = false
            }
        }
        
    }

    playWord = (word, id) => {
        const playerIndex = this.getPlayerIndex(id)
        if (this.checkWord(word, playerIndex)) {
            this.players[playerIndex].words.push(word)
            this.players[playerIndex].score += this.wordScore[word.length]
            return true
        }
        else {
            return false
        }
    }

    checkWord = (word, playerIndex) => {
        const c1 = word.length <= this.wordSize && word.length >= 1
        const c2 = this.inDict(word)
        const c3 = !this.players[playerIndex].words.includes(word)
        if (c1 && c2 && c3) {
            return true
        }
        else {
            return false
        } 
    }

    startTimer = (s) => {
        let i = 0
        setInterval(() => {
            if (i >= s) {
                clearInterval(this.startTimer)
                this.endGame()
            }
            else {
                i += 1
            }
        }, 1000)
    }

    pickWinner = () => {
        let i, key, j;
        for (i = 1; i < this.players.length; i++) {  
            key = this.players[i];  
            j = i - 1;  
    
            /* Move elements of arr[0..i-1], that are  
            greater than key, to one position ahead  
            of their current position */
            while (j >= 0 && this.players[j].score > key.score) 
            {  
                this.players[j + 1] = this.players[j];  
                j = j - 1;  
            }  
            this.players[j + 1] = key;  
        }
        this.players.reverse()
        const highScore = this.players[0].score
        this.players.forEach((player) => {
            if (player.score == highScore) {
                player.wins += 1
            }
        })
    }
    

}

module.exports = Game
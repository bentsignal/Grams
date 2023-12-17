const states = {
    home: 0,
    preGame: 1,
    midGame: 2,
    postGame: 3,
    spectate: 4,
}

class State {

    constructor() {
        this.current = states.home
    }

    validState = (state) => {
        if (state == states.home) {
            return true
        }
        else if (state == states.preGame) {
            return true
        }
        else if (state == states.midGame) {
            return true
        }
        else if (state == states.postGame) {
            return true
        }
        else if (state == states.spectate) {
            return true
        }
        else {
            return false
        }
    }

    changeState = (state) => {
        if (this.validState(state)) {
            this.current = state
            this.render()
        }
    }

    render = () => {
        if (this.current == states.home) {
            console.log("render home")
        }
        else if (this.current == states.preGame) {
            console.log("render pre game")
        }
        else if (this.current == states.midGame) {
            console.log("render mid game")
        }
        else if (this.current == states.postGame) {
            console.log("render post game")
        }
        else if (this.current == states.spectate) {
            console.log("render spectate")
        }
        else {
            console.log("invalid state")
        }
    }

}

export default State
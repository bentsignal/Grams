const states = {
    home: 0,
    inGame: 1,
    preGame: 2,
    midGame: 3,
    postGame: 4,
    spectate: 5,
}

class State {

    constructor() {
        this.current = states.home
    }

    validState = (state) => {
        return true
    }

    render = () => {
        if (this.current = states.home) {
            console.log("home")
        }
        else {
            console.log("not home")
        }
    }

}

export default State
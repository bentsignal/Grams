class Binds {
    constructor() {
        this.toggleMuteAll = "1"
        this.shuffle = ";"
        this.clear = " "
        this.emote = "2"
        this.chat = "3",
        this.popup = new Popup({
            id: "keybinds-popup",
            title: "Keybinds",
            content: `
                <div id="keybinds-popup-wrapper">
                    <div>Press a key to change it</div>
                    <div id="keybinds-popup-container">
                        <div class="keybind" id="mute-keybind">
                        </div>
                        <div class="keybind" id="shuffle-keybind">
                        </div>
                        <div class="keybind" id="clear-keybind">
                        </div>
                        <div class="keybind" id="emote-keybind">
                        </div>
                        <div class="keybind" id="chat-keybind">
                        </div>
                    </div>
                </div>
            `,
            backgroundColor: "var(--charcoal)",
            titleColor: "white",
            textColor: "white",
            closeColor: "white",
        })

    }
}

export default Binds
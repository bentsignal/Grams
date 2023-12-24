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
                    <div id="keybinds-popup-container">
                        <div>Keybinds yer</div>
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
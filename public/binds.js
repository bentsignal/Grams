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
                    <div id="keybind-instructions">Press a key to change it</div>
                    <div id="keybinds-popup-container">
                        <div class="keybind" id="mute-keybind">
                            <p class="bind wrapper">${this.toggleMuteAll}</p>
                            <p>Toggle mute all sounds</p>
                        </div>
                        <div class="keybind" id="shuffle-keybind">
                            <p class="bind wrapper">${this.shuffle}</p>
                            <p>Shuffle letters</p>
                        </div>
                        <div class="keybind" id="clear-keybind">
                            <p class="bind wrapper">Space</p>
                            <p>Clear letters</p>
                        </div>
                        <div class="keybind" id="emote-keybind">
                           <p class="bind wrapper">${this.emote}</p>
                           <p>Open emote menu</p>
                        </div>
                        <div class="keybind" id="chat-keybind">
                            <p class="bind wrapper">${this.chat}</p>
                            <p>Quickchat</p>
                        </div>
                    </div>
                </div>
            `,
            backgroundColor: "var(--charcoal)",
            titleColor: "white",
            textColor: "white",
            closeColor: "white",
            css: `
                .popup-body {
                    margin: 0 !important
                }
            `,
            loadCallback: () => {
                const wrapper = document.getElementById("keybinds-popup-wrapper")
                wrapper.innerHTML = wrapper.innerHTML.replaceAll("<p></p>", "")
            }
        })
    }
}

export default Binds
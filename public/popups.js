class Popups {

    constructor(emoteCallback) {
        this.emote = new Popup({
            id:"send-emote",
            title: "Send emote to chat",
            content: `
                <div id="popup-wrapper">
                    <div id="popup-container">
                        <div class="choose-emote-row">
                            <img src="images/ben-face-1.jpg" class="emote-option" id="ben-face-1">
                            <img src="images/ben-face-2.jpg" class="emote-option" id="ben-face-2">
                            <img src="images/ben-face-3.jpg" class="emote-option" id="ben-face-3">
                            <img src="images/ben-face-4.jpg" class="emote-option" id="ben-face-4">
                        </div>
                        <div class="choose-emote-row">
                            <img src="images/ben-emote-1.jpg" class="emote-option" id="ben-emote-1">
                            <img src="images/ben-emote-2.jpg" class="emote-option" id="ben-emote-2">
                            <img src="images/ben-emote-3.jpg" class="emote-option" id="ben-emote-3">
                            <img src="images/ben-emote-4.jpg" class="emote-option" id="ben-emote-4">
                        </div>
                        <div class="choose-emote-row">
                            <img src="images/lukas-face-1.jpg" class="emote-option" id="lukas-face-1">
                            <img src="images/lukas-face-2.jpg" class="emote-option" id="lukas-face-2">
                            <img src="images/lukas-face-3.jpg" class="emote-option" id="lukas-face-3">
                            <img src="images/lukas-face-4.jpg" class="emote-option" id="lukas-face-4">
                        </div>
                    </div>
                </div>
            `,
            backgroundColor: "var(--charcoal)",
            titleColor: "white",
            textColor: "white",
            closeColor: "white",
            css: `
        
                .popup-body p {
                    margin: 0 !important;
                }
        
            `,
            loadCallback: () => {
                Array.from(document.getElementsByClassName("emote-option")).forEach((emote) => {
                    emote.addEventListener("click", emoteCallback)
                })
            }
        
        })
        this.pfp = new Popup({
            id: "change-pfp",
            title: "Change your profile picture",
            content: `
            <div id="pfp-list-wrapper">
                <div class="pfp-list-row" id="pfp-list-row-ben">
                </div>
                <div class="pfp-list-row" id="pfp-list-row-lukas">
                </div>
            </div>
            `,
            backgroundColor: "var(--charcoal)",
            titleColor: "white",
            textColor: "white",
            closeColor: "white"
        })
    }

}

export default Popups
window.alert = function(arg) {
    const div = document.createElement("div");
    div.style = "box-sizing: border-box; position: fixed; top: 50%; left: 50%; z-index: 3; transform: translate(-50%, -50%); transform-origin: center; max-width: 300px; width: calc(100% - 80px); border-radius: var(--rounded-l); background-color: var(--background); padding: 15px; box-shadow: 0px 0px 80px -25px rgba(0,0,0,0.75);";

    const h3 = document.createElement("h3");
    h3.textContent = arg.text;
    h3.style = "margin-top: 0; font-weight: bold;";
    div.appendChild(h3);

    const buttons = document.createElement("buttons");
    div.appendChild(buttons)

    if (arg.buttons.length === 1) {
        buttons.style = "display: flex; justify-content: flex-end;"
    } else if (arg.buttons.length >= 2) {
        buttons.style = "display: flex; justify-content: space-between;"
    }

    arg.buttons.forEach(item => {
        const button = document.createElement("button");

        button.textContent = item.text;
        button.style = "display: inline-block; color: white; background-color: var(--brand-green-accent); cursor: pointer; border: none; border-radius: var(--rounded-s); padding: 10px 15px;";

        if (item.danger) {
            button.style.backgroundColor = "red";
        }

        if (item.function === "close") {
            button.onclick = () => {
                div.remove();
            }
        }

        buttons.appendChild(button);
    });

    document.body.appendChild(div);
    div.animate([
        { opacity: 0, transform: "scale(0) translate(-50%, -50%)" },
        { opacity: 1, transform: "scale(1) translate(-50%, -50%)" },
    ], 150);
}
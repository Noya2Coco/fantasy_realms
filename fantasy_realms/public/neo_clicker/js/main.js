document.addEventListener("DOMContentLoaded", () => {
    const startMenu = document.getElementById("start-menu");
    const endMenu = document.getElementById("end-menu");
    const gameUI = document.getElementById("game-ui");

    function showOnly(section) {
        startMenu.classList.add("hidden");
        endMenu.classList.add("hidden");
        gameUI.classList.add("hidden");

        section.classList.remove("hidden");
    }

    document.getElementById("play-button").addEventListener("click", () => {
        showOnly(gameUI);
        startGame();
    });

    document.getElementById("replay-button").addEventListener("click", () => {
        showOnly(gameUI);
        restartGame();
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const music = document.getElementById("bg-music");
    const musicButton = document.getElementById("music-button");

    let isPlaying = false;

    musicButton.addEventListener("click", function() {
        if (isPlaying) {
            music.pause();
            musicButton.classList.remove("playing");
        } else {
            music.play();
            musicButton.classList.add("playing");
        }
        isPlaying = !isPlaying;
    });
});

const crosshair = document.getElementById("crosshair");

document.addEventListener("mousemove", (event) => {
    crosshair.style.left = `${event.clientX}px`;
    crosshair.style.top = `${event.clientY}px`;
});

gameContainer.addEventListener("mouseenter", () => {
    crosshair.classList.remove("hidden");
});

gameContainer.addEventListener("mouseleave", () => {
    crosshair.classList.add("hidden");
});

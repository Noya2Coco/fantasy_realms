// Sélection des éléments
const productItems = document.querySelectorAll('.product-item img');
const presentationImage = document.querySelector('.image-presentation img');
const playButton = document.getElementById('play-button');
const texteDiv = document.querySelector('.texte');
const hamburger = document.getElementById('hamburger-menu');
const overlay = document.getElementById('overlay');

let selectedGame = null;

// Gestion du menu hamburger
hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    overlay.style.right = overlay.style.right === "0px" ? "-400px" : "0";
});

// Fonction pour changer de thème
function changeTheme(theme) {
    document.querySelector('body').classList.remove('theme-vaisseaux', 'theme-headball', 'theme-cible');
    document.querySelector('body').classList.add(theme);
}

// Mise à jour du texte descriptif
function updateGameDescription(game) {
    const title = texteDiv.querySelector('h1');
    const paragraph = texteDiv.querySelector('p');

    if (game === 'vaisseaux') {
        title.textContent = '🚀🪐 Starfall: A Warfront Conflict';
        paragraph.innerHTML = `Plongez dans un univers intergalactique...<br><br><b>Votre mission commence maintenant. Êtes-vous prêt à naviguer dans les étoiles ?</b>`;
        changeTheme('theme-vaisseaux');
    } else if (game === 'headball') {
        title.textContent = '⚽️🥅 Ball 2 Goal';
        paragraph.innerHTML = `Entrez dans l'arène et montrez vos talents...<br><br><b>Prêt à faire trembler les filets ? C'est à vous de jouer !</b>`;
        changeTheme('theme-headball');
    } else if (game === 'cible') {
        title.textContent = '😼🎯 AimMiaw';
        paragraph.innerHTML = `Testez votre précision et votre concentration...<br><br><b>Avez-vous ce qu'il faut pour devenir le maître du tir ?</b>`;
        changeTheme('theme-cible');
    }
}

// Fonction pour définir le lien du bouton "Jouer"
function setPlayButtonAction(game) {
    let link = "#";
    if (game === 'vaisseaux') link = 'http://localhost:5173';
    else if (game === 'headball') link = '/headball/index.html';
    else if (game === 'cible') link = '/neo_clicker/index.html';

    playButton.onclick = () => window.location.href = link;
}

// Gestion des clics sur les images de jeu
productItems.forEach((item) => {
    item.addEventListener('click', (event) => {
        const clickedImage = event.target;

        // Image principale
        presentationImage.style.transition = 'opacity 0.5s ease-in-out';
        presentationImage.style.opacity = 0;

        setTimeout(() => {
            presentationImage.src = clickedImage.src;
            presentationImage.style.opacity = 1;
        }, 500);

        // Identifier le jeu
        if (clickedImage.classList.contains('vaisseaux')) selectedGame = 'vaisseaux';
        else if (clickedImage.classList.contains('headball')) selectedGame = 'headball';
        else if (clickedImage.classList.contains('cible')) selectedGame = 'cible';

        // Mise à jour de l'UI
        updateGameDescription(selectedGame);
        setPlayButtonAction(selectedGame);
        playButton.style.display = "inline-block";
    });
});

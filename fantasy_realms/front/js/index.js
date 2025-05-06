// Sélection des éléments
const productItems = document.querySelectorAll('.product-item img');
const presentationImage = document.querySelector('.image-presentation img');
const playButton = document.getElementById('play-button');
const hamburger = document.getElementById('hamburger-menu');
const overlay = document.getElementById('overlay');

// Nouveaux éléments pour titre et description
const titleElement = document.getElementById('game-title');
const descriptionElement = document.getElementById('game-description');

let selectedGame = null;

// Gestion du menu hamburger
hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    overlay.style.right = overlay.style.right === "0px" ? "-400px" : "0";
});

// Délégation du clic sur le bouton "Jouer"
document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'play-button') {
        const href = event.target.getAttribute('data-href');
        if (href) {
            console.log("Redirection vers :", href);
            window.location.href = href;
        }
    }
});

// Fonction pour changer de thème
function changeTheme(theme) {
    document.body.classList.remove('theme-vaisseaux', 'theme-headball', 'theme-cible');
    document.body.classList.add(theme);
}

// Fonction pour mettre à jour le contenu selon le jeu sélectionné
function updateGameContent(game) {
    if (game === 'vaisseaux') {
        titleElement.textContent = '🚀🪐 Starfall: A Warfront Conflict';
        descriptionElement.innerHTML = `
            <p>Plongez dans un univers intergalactique où la stratégie et la précision sont vos meilleures armes. Aux commandes de votre vaisseau, défiez des ennemis redoutables et explorez des galaxies inconnues. Préparez-vous pour des combats épiques et une aventure inoubliable.
            <br>Conçu par des étudiants en Licence 3 MIAGE, ce jeu vous transporte dans un univers où chaque instant est un défi à relever. Vous aurez l'occasion de tester vos compétences et votre détermination dans des environnements spatiaux variés et immersifs.
            <br><br><b>Votre mission commence maintenant. Êtes-vous prêt à naviguer dans les étoiles ?</b>
        `;
        playButton.setAttribute('data-href', 'http://localhost:5173');
        changeTheme('theme-vaisseaux');
    } else if (game === 'headball') {
        titleElement.textContent = '⚽️🥅 Ball 2 Goal';
        descriptionElement.innerHTML = `
            <p>Entrez dans l'arène et montrez vos talents en marquant des buts spectaculaires. Dans ce jeu dynamique, chaque coup de tête compte ! Défiez vos amis ou l'ordinateur et grimpez dans les classements pour devenir la légende de Ball 2 Goal.
            <br>Développé par des étudiants en Licence 3 MIAGE, ce jeu vous offre une expérience immersive et amusante, où chaque match est une occasion de surpasser vos adversaires. Affinez vos compétences et devenez le meilleur buteur de tous les temps.
            <br><br><b>Prêt à faire trembler les filets ? C'est à vous de jouer !</b>
        `;
        playButton.setAttribute('data-href', '/headball/index.html');
        changeTheme('theme-headball');
    } else if (game === 'cible') {
        titleElement.textContent = '😼🎯 AimMiaw';
        descriptionElement.innerHTML = `
            <p>Testez votre précision et votre concentration dans ce jeu captivant. Visez juste pour atteindre les cibles mouvantes et obtenir le meilleur score. Chaque niveau est un nouveau défi à relever, où vos compétences seront mises à l'épreuve.
            <br>Créé par des étudiants en Licence 3 MIAGE, ce jeu combine plaisir et technique pour offrir une expérience engageante. Explorez différents environnements et affinez vos talents de tir pour devenir un maître incontesté de la précision.
            <br><br><b>Avez-vous ce qu'il faut pour devenir le maître du tir ?</b>
        `;
        playButton.setAttribute('data-href', '/neo_clicker/index.html');
        changeTheme('theme-cible');
    }

    playButton.style.display = "inline-block";
}

// Gestion des clics sur les images de jeu
productItems.forEach((item) => {
    item.addEventListener('click', (event) => {
        const clickedImage = event.target;

        // Animation de transition d'image
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

        // Mettre à jour le contenu et bouton
        updateGameContent(selectedGame);
    });
});

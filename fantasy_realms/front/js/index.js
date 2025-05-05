// Sélection des éléments
const productItems = document.querySelectorAll('.product-item img');
const presentationImage = document.querySelector('.image-presentation img');
const playButton = document.getElementById('play-button');
const classementButton = document.getElementById('button2');
const texteDiv = document.querySelector('.texte'); // Sélection de la div texte
const hamburger = document.getElementById('hamburger-menu'); // Sélectionne le menu hamburger
const overlay = document.getElementById('overlay'); // Sélectionne l'overlay

// Gestion du menu hamburger
hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('open');
    overlay.style.right = overlay.style.right === "0px" ? "-400px" : "0";
});

// Fonction pour changer de thème
function changeTheme(theme) {
    document.querySelector('body').classList.remove('theme-vaisseaux', 'theme-headball', 'theme-cible');
    document.querySelector('body').classList.add(theme);
}

// Mise à jour du lien du bouton "Jouer" pour chaque jeu
function updateButtonLink(game) {
    let gameLink = '';
    if (game === 'vaisseaux') {
        gameLink = 'jeu_vaisseaux.html';
    } else if (game === 'headball') {
        gameLink = 'jeu_headball.html';
    } else if (game === 'cible') {
        gameLink = 'jeu_cible.html';
    }
    playButton.setAttribute('onclick', `window.location.href='${gameLink}'`);
}

// Gestion des images sélectionnées et mise à jour du contenu
productItems.forEach((item) => {
    item.addEventListener('click', (event) => {
        const clickedImage = event.target;
        presentationImage.style.transition = 'opacity 0.5s ease-in-out'; // Transition pour l'image
        presentationImage.style.opacity = 0; // Diminuer l'opacité pour l'animation

        setTimeout(() => {
            presentationImage.src = clickedImage.src;
            presentationImage.style.opacity = 1; // Rétablir l'opacité
        }, 500); // La durée de la transition correspond au délai

        // Affichage du bouton "Jouer" après sélection d'une image
        playButton.style.display = "block";

        // Mise à jour du contenu texte et des liens en fonction du jeu sélectionné
        if (clickedImage.classList.contains('vaisseaux')) {
            texteDiv.innerHTML = `
                <h1>🚀🪐 Starfall: A Warfront Conflict</h1>
                <p>Plongez dans un univers intergalactique où la stratégie et la précision sont vos meilleures armes. Aux commandes de votre vaisseau, défiez des ennemis redoutables et explorez des galaxies inconnues. Préparez-vous pour des combats épiques et une aventure inoubliable.
                <br>Conçu par des étudiants en Licence 3 MIAGE, ce jeu vous transporte dans un univers où chaque instant est un défi à relever. Vous aurez l'occasion de tester vos compétences et votre détermination dans des environnements spatiaux variés et immersifs.
                <br>
                <br><b>Votre mission commence maintenant. Êtes-vous prêt à naviguer dans les étoiles ?</b>
                </p>
                <div class="button-container">
                    <button id="play-button" class="play-button">Jouer</button>
                    <button id="button2" onclick="location.href='#classements'">Classements généraux</button>
                </div>
            `;
            updateButtonLink('vaisseaux');
            changeTheme('theme-vaisseaux');
        } else if (clickedImage.classList.contains('headball')) {
            texteDiv.innerHTML = `
                <h1>⚽️🥅 Ball 2 Goal</h1>
                <p>Entrez dans l'arène et montrez vos talents en marquant des buts spectaculaires. Dans ce jeu dynamique, chaque coup de tête compte ! Défiez vos amis ou l'ordinateur et grimpez dans les classements pour devenir la légende de Ball 2 Goal.
                <br>Développé par des étudiants en Licence 3 MIAGE, ce jeu vous offre une expérience immersive et amusante, où chaque match est une occasion de surpasser vos adversaires. Affinez vos compétences et devenez le meilleur buteur de tous les temps.
                <br>
                <br><b>Prêt à faire trembler les filets ? C'est à vous de jouer !</b>
                </p>
                <div class="button-container">
                    <button id="play-button" class="play-button">Jouer</button>
                    <button id="button2" onclick="location.href='#classements'">Classements généraux</button>
                </div>
            `;
            updateButtonLink('headball');
            changeTheme('theme-headball');
        } else if (clickedImage.classList.contains('cible')) {
            texteDiv.innerHTML = `
                <h1>😼🎯 AimMiaw</h1>
                <p>Testez votre précision et votre concentration dans ce jeu captivant. Visez juste pour atteindre les cibles mouvantes et obtenir le meilleur score. Chaque niveau est un nouveau défi à relever, où vos compétences seront mises à l'épreuve.
                <br>Créé par des étudiants en Licence 3 MIAGE, ce jeu combine plaisir et technique pour offrir une expérience engageante. Explorez différents environnements et affinez vos talents de tir pour devenir un maître incontesté de la précision.
                <br>
                <br><b>Avez-vous ce qu'il faut pour devenir le maître du tir ? Montrez-le-nous !</b>
                </p>
                <div class="button-container">
                    <button id="play-button" class="play-button">Jouer</button>
                    <button id="button2" onclick="location.href='#classements'">Classements généraux</button>
                </div>
            `;
            updateButtonLink('cible');
            changeTheme('theme-cible');
        }
    });
});

const hamburger = document.getElementById('hamburger-menu'); // Sélectionne le menu hamburger
const overlay = document.getElementById('overlay'); // Sélectionne l'overlay

hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('open');
    if (overlay.style.right === "0px") {
        overlay.style.right = "-400px";
    } else {
        overlay.style.right = "0";
    }
});

// Sélection des éléments
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const loginContainer = document.getElementById("loginContainer");
const signupContainer = document.getElementById("signupContainer");

// Changer d'onglet
tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    loginContainer.classList.remove("hidden");  // Affiche Connexion
    signupContainer.classList.add("hidden");    // Cache Inscription
});

tabSignup.addEventListener("click", () => {
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
    signupContainer.classList.remove("hidden"); // Affiche Inscription
    loginContainer.classList.add("hidden");     // Cache Connexion
});


const productItems = document.querySelectorAll('.product-item img');
const presentationImage = document.querySelector('.image-presentation img');

// Vérifier que les éléments sont bien sélectionnés
console.log('Product items:', productItems, 'Presentation image:', presentationImage);

productItems.forEach((item) => {
    item.addEventListener('click', () => {
        console.log('Image clicked:', item.src);  // Vérifier l'URL de l'image
        presentationImage.style.transition = 'opacity 0.5s ease-in-out'; // Ajout d'une transition
        presentationImage.style.opacity = 0; // Début de la transition d'opacité

        setTimeout(() => {
            presentationImage.src = item.src; // Change la source de l'image
            presentationImage.style.opacity = 1; // Transition vers opacité 1
        }, 500); // Le délai doit correspondre à la durée de la transition
    });
});

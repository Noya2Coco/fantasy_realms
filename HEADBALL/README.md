# HeadBall - Jeu de Football 2D

Un jeu de football 2D dynamique développé en JavaScript utilisant la bibliothèque Matter.js pour la physique.

## 🎮 Description

HeadBall est un jeu de football 2D où deux joueurs s'affrontent dans un match endiablé. Le jeu propose une expérience de jeu fluide avec des mécaniques de physique réalistes et des contrôles intuitifs.

## 🚀 Fonctionnalités

- **Mode 2 Joueurs** : Affrontez un ami en local
- **Physique Réaliste** : Utilisation de Matter.js pour des mouvements et collisions naturels
- **Contrôles Intuitifs** :
  - Hôte : ZQSD
    - Z : Sauter
    - Q : Aller à gauche
    - D : Aller à droite
    - S : Tirer (uniquement vers la droite)
  - Invité : Flèches directionnelles
    - ↑ : Sauter
    - ← : Aller à gauche
    - → : Aller à droite
    - ↓ : Tirer (uniquement vers la gauche)
- **Système de Score** : Compteur de buts pour chaque équipe
- **Chronomètre** : Temps de jeu limité à 90 secondes par match
- **Effets Sonores** : Sons pour les buts
- **Interface Utilisateur** : Scoreboard et messages de but

## 🛠️ Technologies Utilisées

- JavaScript
- Matter.js (moteur physique)
- HTML5 Canvas
- CSS3

## 🎯 Règles du Jeu

- Chaque joueur ne peut tirer que dans une direction (Hôte vers la droite, Invité vers la gauche)
- La balle ne peut pas rester bloquée sur les barres transversales grâce aux barres de protection verticales
- Le match se termine lorsque le temps est écoulé
- Le joueur avec le plus de buts remporte la partie

## 🎨 Structure du Projet

```
├── js/
│   ├── game/
│   │   ├── ball.js      # Gestion de la balle
│   │   ├── engine.js    # Moteur de jeu
│   │   ├── goals.js     # Gestion des buts
│   │   ├── input.js     # Gestion des entrées
│   │   ├── players.js   # Gestion des joueurs
│   │   ├── score.js     # Gestion du score
│   │   └── ui.js        # Interface utilisateur
│   └── main.js          # Point d'entrée
├── assets/             # Images et sons
├── css/               # Styles
└── index.html         # Page principale
```

## 🎮 Comment Jouer

1. Cliquez sur "Démarrer" pour commencer une partie
2. Utilisez les contrôles ZQSD pour l'Hôte et les flèches pour l'Invité
3. Marquez des buts en tirant la balle dans le but adverse
4. Le joueur avec le plus de buts à la fin du temps remporte la partie

## 🎯 Objectifs de Développement

- [✓] Système de physique réaliste
- [✓] Contrôles des joueurs
- [✓] Système de score
- [✓] Barres de protection pour éviter les blocage
- [✓] Restriction des directions de tir
- [x] Mode solo contre l'IA
- [x] Power-ups et bonus
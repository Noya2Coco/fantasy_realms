document.addEventListener('DOMContentLoaded', () => {
    // Attendre que accountManager soit disponible
    const checkAccountManager = setInterval(() => {
        if (window.accountManager) {
            clearInterval(checkAccountManager);
            initializeLeaderboards();
        }
    }, 100);

    function initializeLeaderboards() {
        // Liste des jeux à afficher
        const games = ['starfall', 'aim_miaw', 'headball'];
        
        // Mettre à jour les classements pour chaque jeu
        games.forEach(game => {
            updateLeaderboard(game);
        });
    }

    function updateLeaderboard(game) {
        const leaderboardElement = document.getElementById(`${game}-leaderboard`);
        if (!leaderboardElement) return;

        // Récupérer les scores pour ce jeu
        const scores = window.accountManager.getAllScores(game);
        
        if (scores.length === 0) {
            leaderboardElement.innerHTML = `<p>Aucun score enregistré</p>`;
            return;
        }

        // Limiter à 10 scores maximum
        const topScores = scores.slice(0, 10);
        
        // Générer le HTML du classement
        let html = '<table class="scores-table">';
        html += '<thead><tr><th>Rang</th><th>Joueur</th><th>Score</th></tr></thead>';
        html += '<tbody>';
        
        topScores.forEach((entry, index) => {
            // Masquer partiellement l'email pour la confidentialité
            const obscuredEmail = obscureEmail(entry.email);
            
            html += `
                <tr class="score-entry ${index < 3 ? 'top-' + (index + 1) : ''}">
                    <td>${index + 1}</td>
                    <td>${obscuredEmail}</td>
                    <td>${entry.score}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        leaderboardElement.innerHTML = html;
    }

    // Fonction pour masquer partiellement l'email
    function obscureEmail(email) {
        if (!email) return 'Joueur anonyme';
        
        const parts = email.split('@');
        if (parts.length !== 2) return email;
        
        let name = parts[0];
        const domain = parts[1];
        
        if (name.length > 3) {
            name = name.substring(0, 2) + '*'.repeat(name.length - 2);
        }
        
        return `${name}@${domain}`;
    }

    // Mettre à jour les classements toutes les 30 secondes
    setInterval(() => {
        if (window.accountManager) {
            initializeLeaderboards();
        }
    }, 30000);
});

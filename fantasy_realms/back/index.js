const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

app.use(express.json());

app.use(express.static(path.join(__dirname, "../front")));

// Servir les fichiers JavaScript du dossier front/js
app.use('/front/js', express.static(path.join(__dirname, '../front/js')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../front/index.html"));
});

// Nouvel endpoint pour enregistrer les scores
app.post("/newScore", (req, res) => {
    const { game, user, score } = req.body;

    if (!game || !user || score === undefined) {
        return res.status(400).json({ success: false, message: "Données incomplètes" });
    }

    const scoreNum = parseInt(score);
    if (isNaN(scoreNum)) {
        return res.status(400).json({ success: false, message: "Le score doit être un nombre" });
    }

    console.log(`Score reçu - Jeu: ${game}, Utilisateur: ${user}, Score: ${scoreNum}`);

    // Simuler une base de données avec localStorage
    const storedUser = JSON.parse(localStorage.getItem(user)) || { scores: {} };
    const existingScore = storedUser.scores[game] || 0;

    if (scoreNum > existingScore) {
        storedUser.scores[game] = scoreNum;
        localStorage.setItem(user, JSON.stringify(storedUser));
        return res.json({ success: true, message: "Score mis à jour avec succès" });
    }

    res.json({ success: false, message: "Le nouveau score n'est pas supérieur au score existant." });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
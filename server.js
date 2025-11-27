// server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Variables d'environnement
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Connexion MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB connecté"))
    .catch(err => console.error("❌ Erreur MongoDB :", err));

// Schéma utilisateur
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model("User", userSchema);

// Route racine
app.get("/", (req, res) => {
    res.send("Backend Ecobank est en ligne !");
});

// Route login (avec création automatique)
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Merci de fournir username et password" });
    }

    try {
        let user = await User.findOne({ username });

        // ❗ Si l’utilisateur n’existe pas → on le crée automatiquement
        if (!user) {
            user = new User({ username, password });
            await user.save();
        }

        // Vérification mot de passe
        if (user.password !== password) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        // Générer un token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: "3h" }
        );

        res.json({ success: true, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
});

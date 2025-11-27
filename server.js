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
const JWT_SECRET = process.env.JWT_SECRET || 'FAKE_SECRET';

// Connexion à MongoDB Atlas
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connecté'))
    .catch(err => console.error('❌ Erreur MongoDB :', err));

// Schéma utilisateur simple
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

// Route racine
app.get('/', (req, res) => {
    res.send('Backend Ecobank est en ligne !');
});

// Route login : enregistre tous les utilisateurs
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Merci de fournir username et password' });
    }

    try {
        // Enregistrement dans la base MongoDB
        const newUser = new User({ username, password });
        await newUser.save();

        // Génération du token JWT
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Backend Ecobank en ligne sur le port ${PORT}`);
});

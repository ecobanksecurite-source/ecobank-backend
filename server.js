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
const MONGO_URI = process.env.MONGO_URI; // MongoDB Atlas URI
const JWT_SECRET = process.env.JWT_SECRET || 'changeme123'; // Remplace par ton secret sécurisé

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

// Route login (création automatique si utilisateur n'existe pas)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Merci de fournir username et password' });
    }

    try {
        // Cherche l'utilisateur dans MongoDB
        let user = await User.findOne({ username });

        if (!user) {
            // Création automatique si l'utilisateur n'existe pas
            user = new User({ username, password });
            await user.save();
            console.log('Nouvel utilisateur créé :', username);
        } else if (user.password !== password) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        // Génère un token JWT
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

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

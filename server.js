// server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*' // Autorise toutes les origines pour tester, à sécuriser plus tard
}));

// Variables d'environnement
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme123';

// Connexion MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connecté'))
    .catch(err => console.error('❌ Erreur MongoDB :', err));

// Schéma utilisateur
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

// Route racine
app.get('/', (req, res) => {
    res.send('Backend Ecobank est en ligne !');
});

// Route création d'utilisateur (POST /users)
app.post('/users', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username et password requis' });

    try {
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ error: 'Utilisateur déjà existant' });

        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ success: true, message: 'Utilisateur créé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username et password requis' });

    try {
        let user = await User.findOne({ username });

        if (!user) {
            // Création automatique si pas existant
            user = new User({ username, password });
            await user.save();
            console.log('Nouvel utilisateur créé :', username);
        } else if (user.password !== password) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`🚀 Backend Ecobank en ligne sur le port ${PORT}`);
});

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis.' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Utilisateur déjà existant.' });

    const hash = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hash });
    await user.save();

    return res.status(201).json({ message: 'Compte créé.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Identifiants invalides.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Identifiants invalides.' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '12h' });

    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;

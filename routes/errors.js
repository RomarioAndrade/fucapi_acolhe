const express = require('express');
const router = express.Router();

router.post('/simulate-error', (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'O campo de texto não pode estar vazio.' });
  }

  // Simula sucesso
  res.status(200).json({ message: 'Dados recebidos com sucesso!' });
});

module.exports = router;

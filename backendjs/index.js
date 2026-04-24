const express = require('express');
const pacienteRoutes = require('./src/routes/pacienteRoutes');
const helmet = require('helmet');

const app = express();

app.use(helmet());

app.use((req, res, next) => {
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next(); 
});

app.use(express.json());

app.use('/api/v1/pacientes', pacienteRoutes);

app.use((req, res) => {
    res.status(404).json({ mensagem: "Rota de pacientes não encontrada." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Node.js a correr na porta ${PORT}`);
});
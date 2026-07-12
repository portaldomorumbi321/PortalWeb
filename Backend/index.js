const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // A porta do seu frontend Vite
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Servidor do WhatsApp está rodando.');
});

io.on('connection', (socket) => {
  console.log('Frontend conectado via Socket.IO');
  socket.emit('message', 'Conectado ao servidor. Aguardando inicialização do WhatsApp...');
  socket.emit('message', 'Iniciando cliente do WhatsApp no servidor...');

  // Inicializa o cliente do WhatsApp
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('loading_screen', (percent, message) => {
    console.log('CARREGANDO WHATSAPP:', percent, message);
    socket.emit('message', `Carregando: ${message}`);
  });

  client.on('qr', (qr) => {
    console.log('QR Code recebido, enviando para o frontend...');
    qrcode.generate(qr, { small: true }); // Mostra o QR no terminal também
    socket.emit('qr', qr); // Envia o valor do QR para o frontend
  });

  client.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
    socket.emit('ready', 'Cliente conectado com sucesso!');
  });

  client.on('auth_failure', (msg) => {
    console.error('FALHA NA AUTENTICAÇÃO', msg);
    socket.emit('message', `Falha na autenticação: ${msg}`);
  });

  console.log('Inicializando cliente do WhatsApp...');
  client.initialize();
});

server.listen(PORT, () => console.log(`Servidor ouvindo na porta ${PORT}`));

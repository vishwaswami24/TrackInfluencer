const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
require('./db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Attach io to app so routes can emit events
app.set('io', io);

io.on('connection', socket => {
  const { brand_id, role } = socket.handshake.query;
  if (brand_id) socket.join(`brand_${brand_id}`);
  if (role === 'admin' || role === 'finance') socket.join('admins');
  socket.on('disconnect', () => {});
});

app.use(cors());
app.use(express.json());

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/brands',      require('./routes/brands'));
app.use('/api/influencers', require('./routes/influencers'));
app.use('/api/sales',       require('./routes/sales'));
app.use('/api/payments',    require('./routes/payments'));
app.use('/api/analytics',   require('./routes/analytics'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

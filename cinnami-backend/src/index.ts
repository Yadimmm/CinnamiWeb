import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet'; 
import authRoute from './routes/auth.routes';
import connectDBMongo from './config/db';


dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// PERMITE SOLO LOCALHOST:3001 (React) Y 127.0.0.1:3001
const allowedOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://172.20.30.248:3001', 
];

// Helmet primero para proteger los headers HTTP
app.use(helmet());

// CORS configurado
app.use(cors({
  origin: function (origin, callback) {
    // Permite herramientas como Postman/curl sin origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('No permitido por CORS: ' + origin), false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
  res.send('¡API de Cinnami funcionando! Para usar la API, visita /api/auth/*');
});

// Conexion a la base de datos y arranque del servidor
connectDBMongo().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`El servidor funciona en el puerto: ${PORT}`);
    console.log(`Puedes acceder desde:`);
    console.log(`- http://localhost:${PORT}/`);
  });
}).catch((error) => {
  console.error("Error al conectar a la base de datos:", error);
  process.exit(1);
});

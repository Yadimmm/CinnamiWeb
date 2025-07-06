import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoute from './routes/auth.routes';
import connectDBMongo from './config/db';

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true // si usas cookies
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoute);

// ---> AGREGA ESTO ANTES DEL connectDBMongo
app.get('/', (req, res) => {
  res.send('¡API de Cinnami funcionando! Para usar la API, visita /api/auth/*');
});

connectDBMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`El servidor funciona en el puerto: ${PORT}`);
  });
});

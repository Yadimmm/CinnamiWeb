import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoute from './routes/auth.routes';
import connectDBMongo from './config/db';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Permite CUALQUIER ORIGEN SOLO en desarrollo (no para producción)
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); // Permitir cualquier origen (solo para pruebas/desarrollo)
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoute);

// Mensaje de bienvenida (root)
app.get('/', (req, res) => {
  res.send('¡API de Cinnami funcionando! Para usar la API, visita /api/auth/*');
});

// Conectar DB y levantar servidor
connectDBMongo().then(() => {
  // 0.0.0.0 => Escucha en todas las IPs
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`El servidor funciona en el puerto: ${PORT}`);
    console.log(`Puedes acceder desde:`);
    console.log(`- http://localhost:${PORT}/`);
    console.log(`- 172.20.103.230:${PORT}/`);
  });
}).catch((error) => {
  console.error("Error al conectar a la base de datos:", error);
  process.exit(1); // Detener si falla la base de datos
});

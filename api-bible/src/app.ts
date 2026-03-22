import express from 'express';
import cors from 'cors';
import bibleRoutes from './routes/bibleRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/bible', bibleRoutes);

export default app;
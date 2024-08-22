import express, { Application } from 'express';
import DatabaseConnection from './services/foxy/database/DatabaseManager';
import { logger } from './utils/logger';
import { RestManager } from './services/foxy/RestManager';
import MercadoPagoClient from './utils/integrations/MercadoPago/MercadoPagoClient';

const app: Application = express();
const database = new DatabaseConnection();
const rest = new RestManager();
const mercadoPago = new MercadoPagoClient();

app.use(express.json());

require('dotenv').config();

/* Route Handlers */
app.use('/', require('./routes/PaymentHandler'));
app.get('/', (req, res) => { res.send('uwu'); });

/* Static Files */
app.use(express.static('./public'));

app.listen(process.env.PORT, () => {
    logger.info(`[READY] - Server is running at http://localhost:${process.env.PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('[UNHANDLED REJECTION] Reason: ', reason);
});

process.on('uncaughtException', (error) => {
    logger.criticalError('[UNCAUGHT EXCEPTION] Error: ', error);
});

export { database, rest, mercadoPago };
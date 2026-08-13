import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './shared/errors/errorHandler';
import { authRouter } from './features/auth/presentation/auth.routes';
import { productRouter } from './features/products/presentation/product.routes';
import { categoryRouter } from './features/categories/presentation/category.routes';
import { supplierRouter } from './features/suppliers/presentation/supplier.routes';
import { saleRouter } from './features/sales/presentation/sale.routes';
import { settingsRouter } from './features/settings/presentation/settings.routes';
import { reportRouter } from './features/reports/presentation/report.routes';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', mode: config.deployMode, env: config.nodeEnv });
});

// Feature routes — one mount point per feature, added here as each ships.
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/sales', saleRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reports', reportRouter);

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` } });
});

// Error handler must be registered last.
app.use(errorHandler);

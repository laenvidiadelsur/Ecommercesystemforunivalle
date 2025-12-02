import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';

// Import routes
import authRoutes from './routes/auth.tsx';
import productRoutes from './routes/products.tsx';
import categoryRoutes from './routes/categories.tsx';
import cartRoutes from './routes/cart.tsx';
import orderRoutes from './routes/orders.tsx';
import adminRoutes from './routes/admin.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'unimarket' });
});

// Mount routes under function root
app.route('/auth', authRoutes);
app.route('/products', productRoutes);
app.route('/categories', categoryRoutes);
app.route('/cart', cartRoutes);
app.route('/orders', orderRoutes);
app.route('/admin', adminRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

Deno.serve(app.fetch);

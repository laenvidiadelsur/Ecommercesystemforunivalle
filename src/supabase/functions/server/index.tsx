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
app.get('/make-server-7ff09ef6/health', (c) => {
  return c.json({ status: 'ok', service: 'univalle-shop' });
});

// Mount routes
app.route('/make-server-7ff09ef6/auth', authRoutes);
app.route('/make-server-7ff09ef6/products', productRoutes);
app.route('/make-server-7ff09ef6/categories', categoryRoutes);
app.route('/make-server-7ff09ef6/cart', cartRoutes);
app.route('/make-server-7ff09ef6/orders', orderRoutes);
app.route('/make-server-7ff09ef6/admin', adminRoutes);

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

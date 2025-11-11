import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireAuth, requireRole } from '../middleware/auth.tsx';

const admin = new Hono();

// Get system statistics
admin.get('/stats', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true);

    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Total revenue
    const { data: orders } = await supabase
      .from('orders')
      .select('total')
      .in('estado', ['confirmada', 'enviada', 'entregada']);

    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente');

    // Low stock products (stock <= 5)
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('id, nombre, stock')
      .eq('activo', true)
      .lte('stock', 5)
      .order('stock');

    return c.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts
    });

  } catch (error: any) {
    console.error('Get stats error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all users
admin.get('/users', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get users error:', error);
      return c.json({ error: 'Error al obtener usuarios' }, 500);
    }

    return c.json(data);

  } catch (error: any) {
    console.error('Users fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all orders (with filters)
admin.get('/orders', requireAuth, requireRole(['admin', 'vendedor']), async (c) => {
  try {
    const estado = c.req.query('estado');
    const limite = parseInt(c.req.query('limite') || '100');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let query = supabase
      .from('orders')
      .select(`
        *,
        usuario:user_profiles(id, nombre, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limite);

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get orders error:', error);
      return c.json({ error: 'Error al obtener órdenes' }, 500);
    }

    return c.json(data);

  } catch (error: any) {
    console.error('Orders fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update user role
admin.put('/users/:id/role', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const userId = c.req.param('id');
    const { rol } = await c.req.json();

    const validRoles = ['estudiante', 'vendedor', 'admin'];
    if (!validRoles.includes(rol)) {
      return c.json({ error: `Rol inválido. Válidos: ${validRoles.join(', ')}` }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: user, error } = await supabase
      .from('user_profiles')
      .update({ rol })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update user role error:', error);
      return c.json({ error: 'Error al actualizar rol del usuario' }, 500);
    }

    return c.json(user);

  } catch (error: any) {
    console.error('Update role error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default admin;

import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireAuth, requireRole } from '../middleware/auth.tsx';

const orders = new Hono();

// Get user's orders
orders.get('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });

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

// Get single order with items
orders.get('/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const orderId = c.req.param('id');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return c.json({ error: 'Orden no encontrada' }, 404);
    }

    // Check permission (own order or admin/vendedor)
    if (order.usuario_id !== userId && !['admin', 'vendedor'].includes(userRole)) {
      return c.json({ error: 'No tienes permiso para ver esta orden' }, 403);
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        producto:products(id, nombre, imagen_url)
      `)
      .eq('orden_id', orderId);

    if (itemsError) {
      console.error('Get order items error:', itemsError);
      return c.json({ error: 'Error al obtener items de la orden' }, 500);
    }

    return c.json({
      ...order,
      items
    });

  } catch (error: any) {
    console.error('Order fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create order (checkout)
orders.post('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { direccion_entrega, telefono_contacto, notas } = await c.req.json();

    if (!direccion_entrega || !telefono_contacto) {
      return c.json({ error: 'Dirección de entrega y teléfono son requeridos' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user's cart
    const { data: userCart } = await supabase
      .from('carts')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    if (!userCart) {
      return c.json({ error: 'Carrito no encontrado' }, 404);
    }

    // Get cart items with product info
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        producto:products(id, nombre, precio, stock, activo)
      `)
      .eq('carrito_id', userCart.id);

    if (cartError || !cartItems || cartItems.length === 0) {
      return c.json({ error: 'Carrito vacío' }, 400);
    }

    // Verify stock for all items
    for (const item of cartItems) {
      if (!item.producto.activo) {
        return c.json({ error: `Producto ${item.producto.nombre} no está disponible` }, 400);
      }
      if (item.producto.stock < item.cantidad) {
        return c.json({ 
          error: `Stock insuficiente para ${item.producto.nombre}. Disponible: ${item.producto.stock}` 
        }, 400);
      }
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

    // Start transaction by creating order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        usuario_id: userId,
        total,
        estado: 'pendiente',
        direccion_entrega,
        telefono_contacto,
        notas
      })
      .select()
      .single();

    if (orderError) {
      console.error('Create order error:', orderError);
      return c.json({ error: `Error al crear orden: ${orderError.message}` }, 500);
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
      orden_id: order.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Create order items error:', itemsError);
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return c.json({ error: 'Error al crear items de la orden' }, 500);
    }

    // Update product stock
    for (const item of cartItems) {
      const newStock = item.producto.stock - item.cantidad;
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.producto_id);

      if (stockError) {
        console.error('Update stock error:', stockError);
        // Continue anyway - don't rollback the entire order
      }
    }

    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('carrito_id', userCart.id);

    return c.json({
      message: 'Orden creada exitosamente',
      order: {
        ...order,
        items: orderItems
      }
    }, 201);

  } catch (error: any) {
    console.error('Create order error:', error);
    return c.json({ error: `Error al procesar orden: ${error.message}` }, 500);
  }
});

// Update order status (admin only)
orders.put('/:id/status', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const orderId = c.req.param('id');
    const { estado } = await c.req.json();

    const validStates = ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'];
    if (!validStates.includes(estado)) {
      return c.json({ error: `Estado inválido. Válidos: ${validStates.join(', ')}` }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: order, error } = await supabase
      .from('orders')
      .update({ estado })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Update order status error:', error);
      return c.json({ error: 'Error al actualizar estado de la orden' }, 500);
    }

    return c.json(order);

  } catch (error: any) {
    console.error('Update order status error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default orders;

import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireAuth } from '../middleware/auth.tsx';

const cart = new Hono();

// Get current user's cart
cart.get('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get or create cart
    let { data: userCart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    if (cartError && cartError.code === 'PGRST116') {
      // Cart doesn't exist, create it
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ usuario_id: userId })
        .select()
        .single();

      if (createError) {
        console.error('Create cart error:', createError);
        return c.json({ error: 'Error al crear carrito' }, 500);
      }
      userCart = newCart;
    }

    // Get cart items
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        producto:products(id, nombre, descripcion, precio, stock, imagen_url, activo)
      `)
      .eq('carrito_id', userCart!.id);

    if (itemsError) {
      console.error('Get cart items error:', itemsError);
      return c.json({ error: 'Error al obtener items del carrito' }, 500);
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

    return c.json({
      carrito_id: userCart!.id,
      items,
      total,
      cantidad_items: items.length
    });

  } catch (error: any) {
    console.error('Cart fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Add item to cart
cart.post('/items', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { producto_id, cantidad = 1 } = await c.req.json();

    if (!producto_id || cantidad <= 0) {
      return c.json({ error: 'producto_id y cantidad válida son requeridos' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify product exists and has stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, precio, stock, activo')
      .eq('id', producto_id)
      .single();

    if (productError || !product) {
      return c.json({ error: 'Producto no encontrado' }, 404);
    }

    if (!product.activo) {
      return c.json({ error: 'Producto no disponible' }, 400);
    }

    if (product.stock < cantidad) {
      return c.json({ error: `Stock insuficiente. Disponible: ${product.stock}` }, 400);
    }

    // Get or create cart
    let { data: userCart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    if (cartError && cartError.code === 'PGRST116') {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ usuario_id: userId })
        .select()
        .single();

      if (createError) {
        console.error('Create cart error:', createError);
        return c.json({ error: 'Error al crear carrito' }, 500);
      }
      userCart = newCart;
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, cantidad')
      .eq('carrito_id', userCart!.id)
      .eq('producto_id', producto_id)
      .single();

    if (existingItem) {
      // Update quantity
      const newCantidad = existingItem.cantidad + cantidad;

      if (product.stock < newCantidad) {
        return c.json({ error: `Stock insuficiente. Disponible: ${product.stock}` }, 400);
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({ cantidad: newCantidad })
        .eq('id', existingItem.id)
        .select(`
          *,
          producto:products(id, nombre, precio, imagen_url)
        `)
        .single();

      if (updateError) {
        console.error('Update cart item error:', updateError);
        return c.json({ error: 'Error al actualizar item' }, 500);
      }

      return c.json(updatedItem);
    } else {
      // Add new item
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          carrito_id: userCart!.id,
          producto_id,
          cantidad,
          precio_unitario: product.precio
        })
        .select(`
          *,
          producto:products(id, nombre, precio, imagen_url)
        `)
        .single();

      if (insertError) {
        console.error('Add cart item error:', insertError);
        return c.json({ error: 'Error al agregar item al carrito' }, 500);
      }

      return c.json(newItem, 201);
    }

  } catch (error: any) {
    console.error('Add to cart error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update cart item quantity
cart.put('/items/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const itemId = c.req.param('id');
    const { cantidad } = await c.req.json();

    if (cantidad <= 0) {
      return c.json({ error: 'Cantidad debe ser mayor a 0' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify ownership
    const { data: item } = await supabase
      .from('cart_items')
      .select('*, carrito:carts(usuario_id), producto:products(stock)')
      .eq('id', itemId)
      .single();

    if (!item || item.carrito.usuario_id !== userId) {
      return c.json({ error: 'Item no encontrado' }, 404);
    }

    // Verify stock
    if (item.producto.stock < cantidad) {
      return c.json({ error: `Stock insuficiente. Disponible: ${item.producto.stock}` }, 400);
    }

    const { data: updatedItem, error } = await supabase
      .from('cart_items')
      .update({ cantidad })
      .eq('id', itemId)
      .select(`
        *,
        producto:products(id, nombre, precio, imagen_url)
      `)
      .single();

    if (error) {
      console.error('Update cart item error:', error);
      return c.json({ error: 'Error al actualizar item' }, 500);
    }

    return c.json(updatedItem);

  } catch (error: any) {
    console.error('Update cart item error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete cart item
cart.delete('/items/:id', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const itemId = c.req.param('id');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify ownership
    const { data: item } = await supabase
      .from('cart_items')
      .select('*, carrito:carts(usuario_id)')
      .eq('id', itemId)
      .single();

    if (!item || item.carrito.usuario_id !== userId) {
      return c.json({ error: 'Item no encontrado' }, 404);
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Delete cart item error:', error);
      return c.json({ error: 'Error al eliminar item' }, 500);
    }

    return c.json({ message: 'Item eliminado del carrito' });

  } catch (error: any) {
    console.error('Delete cart item error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Clear cart
cart.delete('/clear', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: userCart } = await supabase
      .from('carts')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    if (!userCart) {
      return c.json({ message: 'Carrito ya está vacío' });
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('carrito_id', userCart.id);

    if (error) {
      console.error('Clear cart error:', error);
      return c.json({ error: 'Error al vaciar carrito' }, 500);
    }

    return c.json({ message: 'Carrito vaciado exitosamente' });

  } catch (error: any) {
    console.error('Clear cart error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default cart;

import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireAuth, requireRole } from '../middleware/auth.tsx';

const products = new Hono();

// Get all products (with filters)
products.get('/', async (c) => {
  try {
    const categoria = c.req.query('categoria');
    const busqueda = c.req.query('busqueda');
    const orden = c.req.query('orden') || 'created_at';
    const limite = parseInt(c.req.query('limite') || '50');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    let query = supabase
      .from('products')
      .select(`
        *,
        categoria:categories(id, nombre),
        vendedor:user_profiles(id, nombre)
      `)
      .eq('activo', true);

    // Filter by category
    if (categoria) {
      query = query.eq('categoria_id', categoria);
    }

    // Search by name or description
    if (busqueda) {
      query = query.or(`nombre.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    // Order
    const orderMap: any = {
      'reciente': { column: 'created_at', ascending: false },
      'precio_asc': { column: 'precio', ascending: true },
      'precio_desc': { column: 'precio', ascending: false },
      'nombre': { column: 'nombre', ascending: true },
    };

    const orderBy = orderMap[orden] || orderMap['reciente'];
    query = query.order(orderBy.column, { ascending: orderBy.ascending });

    query = query.limit(limite);

    const { data, error } = await query;

    if (error) {
      console.error('Get products error:', error);
      return c.json({ error: 'Error al obtener productos' }, 500);
    }

    return c.json(data);

  } catch (error: any) {
    console.error('Products fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get single product
products.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categoria:categories(id, nombre),
        vendedor:user_profiles(id, nombre, telefono)
      `)
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      console.error('Get product error:', error);
      return c.json({ error: 'Producto no encontrado' }, 404);
    }

    return c.json(data);

  } catch (error: any) {
    console.error('Product fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create product (vendedor/admin only)
products.post('/', requireAuth, requireRole(['vendedor', 'admin']), async (c) => {
  try {
    const userId = c.get('userId');
    const { nombre, descripcion, precio, stock, categoria_id, imagen_url, imagenes_adicionales } = await c.req.json();

    if (!nombre || precio === undefined || stock === undefined) {
      return c.json({ error: 'Nombre, precio y stock son requeridos' }, 400);
    }

    if (precio < 0 || stock < 0) {
      return c.json({ error: 'Precio y stock deben ser positivos' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        nombre,
        descripcion,
        precio,
        stock,
        categoria_id,
        vendedor_id: userId,
        imagen_url,
        imagenes_adicionales,
        activo: true
      })
      .select(`
        *,
        categoria:categories(id, nombre),
        vendedor:user_profiles(id, nombre)
      `)
      .single();

    if (error) {
      console.error('Create product error:', error);
      return c.json({ error: `Error al crear producto: ${error.message}` }, 500);
    }

    return c.json(product, 201);

  } catch (error: any) {
    console.error('Product creation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update product
products.put('/:id', requireAuth, requireRole(['vendedor', 'admin']), async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const updates = await c.req.json();

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.created_at;
    delete updates.vendedor_id;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check ownership (unless admin)
    if (userRole !== 'admin') {
      const { data: existing } = await supabase
        .from('products')
        .select('vendedor_id')
        .eq('id', id)
        .single();

      if (!existing || existing.vendedor_id !== userId) {
        return c.json({ error: 'No tienes permiso para editar este producto' }, 403);
      }
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        categoria:categories(id, nombre),
        vendedor:user_profiles(id, nombre)
      `)
      .single();

    if (error) {
      console.error('Update product error:', error);
      return c.json({ error: 'Error al actualizar producto' }, 500);
    }

    return c.json(product);

  } catch (error: any) {
    console.error('Product update error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete product (soft delete)
products.delete('/:id', requireAuth, requireRole(['vendedor', 'admin']), async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check ownership (unless admin)
    if (userRole !== 'admin') {
      const { data: existing } = await supabase
        .from('products')
        .select('vendedor_id')
        .eq('id', id)
        .single();

      if (!existing || existing.vendedor_id !== userId) {
        return c.json({ error: 'No tienes permiso para eliminar este producto' }, 403);
      }
    }

    // Soft delete (set activo = false)
    const { error } = await supabase
      .from('products')
      .update({ activo: false })
      .eq('id', id);

    if (error) {
      console.error('Delete product error:', error);
      return c.json({ error: 'Error al eliminar producto' }, 500);
    }

    return c.json({ message: 'Producto eliminado exitosamente' });

  } catch (error: any) {
    console.error('Product deletion error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get vendor's products
products.get('/vendor/my-products', requireAuth, requireRole(['vendedor', 'admin']), async (c) => {
  try {
    const userId = c.get('userId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categoria:categories(id, nombre)
      `)
      .eq('vendedor_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get vendor products error:', error);
      return c.json({ error: 'Error al obtener productos' }, 500);
    }

    return c.json(data);

  } catch (error: any) {
    console.error('Vendor products fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default products;

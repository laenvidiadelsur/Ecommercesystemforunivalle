import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireAuth, requireRole } from '../middleware/auth.tsx';

const categories = new Hono();

// Get all categories
categories.get('/', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Get categories error:', error);
      return c.json({ error: 'Error al obtener categorías' }, 500);
    }

    return c.json(data);

  } catch (error: any) {
    console.error('Categories fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create category (admin only)
categories.post('/', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const { nombre, descripcion, imagen_url } = await c.req.json();

    if (!nombre) {
      return c.json({ error: 'Nombre es requerido' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        nombre,
        descripcion,
        imagen_url,
        activo: true
      })
      .select()
      .single();

    if (error) {
      console.error('Create category error:', error);
      return c.json({ error: `Error al crear categoría: ${error.message}` }, 500);
    }

    return c.json(category, 201);

  } catch (error: any) {
    console.error('Category creation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update category (admin only)
categories.put('/:id', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    delete updates.id;
    delete updates.created_at;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: category, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update category error:', error);
      return c.json({ error: 'Error al actualizar categoría' }, 500);
    }

    return c.json(category);

  } catch (error: any) {
    console.error('Category update error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default categories;

import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireAuth } from '../middleware/auth.tsx';

const auth = new Hono();

// Sign up
auth.post('/signup', async (c) => {
  try {
    const { email, password, nombre, rol = 'estudiante', carnet, telefono, direccion } = await c.req.json();

    if (!email || !password || !nombre) {
      return c.json({ error: 'Email, password y nombre son requeridos' }, 400);
    }

    // Validate rol
    if (!['estudiante', 'vendedor', 'admin'].includes(rol)) {
      return c.json({ error: 'Rol inválido. Debe ser: estudiante, vendedor o admin' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server hasn't been configured
      user_metadata: { nombre }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return c.json({ error: `Error al crear usuario: ${authError.message}` }, 400);
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user!.id,
        email,
        nombre,
        rol,
        carnet,
        telefono,
        direccion
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authData.user!.id);
      return c.json({ error: `Error al crear perfil: ${profileError.message}` }, 500);
    }

    return c.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: profile.id,
        email: profile.email,
        nombre: profile.nombre,
        rol: profile.rol
      }
    }, 201);

  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: `Error en registro: ${error.message}` }, 500);
  }
});

// Get current user profile
auth.get('/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      return c.json({ error: 'Error al obtener perfil' }, 500);
    }

    return c.json(profile);

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update user profile
auth.put('/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const updates = await c.req.json();

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.email;
    delete updates.created_at;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return c.json({ error: 'Error al actualizar perfil' }, 500);
    }

    return c.json(profile);

  } catch (error: any) {
    console.error('Profile update error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default auth;

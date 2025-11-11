import { createClient } from 'jsr:@supabase/supabase-js@2';

export const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'No authorization token provided' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Attach user to context
  c.set('userId', user.id);
  c.set('userEmail', user.email);
  
  await next();
};

export const requireRole = (allowedRoles: string[]) => {
  return async (c: any, next: any) => {
    const userId = c.get('userId');
    
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('rol')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    if (!allowedRoles.includes(profile.rol)) {
      return c.json({ error: `Access denied. Required role: ${allowedRoles.join(' or ')}` }, 403);
    }

    c.set('userRole', profile.rol);
    await next();
  };
};

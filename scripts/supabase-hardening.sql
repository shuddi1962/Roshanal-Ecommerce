-- Roshanal Supabase hardening: expose tables to Data API + RLS + storage
-- Run as postgres (bypasses RLS)

-- 1. Grants for Data API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

-- 2. RLS on every public table (defense in depth)
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- 3. Public read on all NON-sensitive tables (catalog, content, config)
-- Sensitive tables keep their existing owner-only policies:
-- users, staff, orders, cart_items, wallet_transactions, loyalty_transactions, notifications, api_vault
DO $$
DECLARE t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN (
        'users','staff','orders','cart_items',
        'wallet_transactions','loyalty_transactions',
        'notifications','api_vault'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS public_read ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY public_read ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      t
    );
  END LOOP;
END $$;

-- 4. Storage: products bucket (public read, service_role writes via RLS bypass)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public read products" ON storage.objects;
CREATE POLICY "public read products"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "authenticated upload products" ON storage.objects;
CREATE POLICY "authenticated upload products"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "authenticated update products" ON storage.objects;
CREATE POLICY "authenticated update products"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

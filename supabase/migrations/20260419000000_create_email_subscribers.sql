CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS email_subscribers_email_idx
  ON public.email_subscribers (lower(email));

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert"
  ON public.email_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);
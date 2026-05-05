CREATE TABLE feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  user_email text,
  page_url text,
  user_agent text,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Anonymous (anon role) inserts allowed; the route handler uses the
-- service role server-side, so this policy makes either role acceptable.
CREATE POLICY "Anyone can insert feedback"
  ON feedback_submissions FOR INSERT
  WITH CHECK (true);

-- Reads only via service role (the admin page calls getSupabaseAdmin()).
-- No public select policy → anon clients cannot enumerate feedback.

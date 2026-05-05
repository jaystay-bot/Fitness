-- N=015: fulfillment_clicks table. Logs clicks on the Amazon Fulfill
-- button so future cycles can analyze conversion. Additive — does not
-- touch the prior 3 migrations (subscriptions, lab_uploads + bottle_scans,
-- feedback_submissions).

CREATE TABLE fulfillment_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_name text NOT NULL,
  affiliate_url text NOT NULL,
  user_id text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fulfillment_clicks ENABLE ROW LEVEL SECURITY;

-- Anonymous (anon role) inserts allowed; the route handler uses the
-- service role server-side, so this policy makes either role acceptable.
CREATE POLICY "Anyone can insert fulfillment clicks"
  ON fulfillment_clicks FOR INSERT
  WITH CHECK (true);

-- Reads only via service role. No public select policy → anon clients
-- cannot enumerate fulfillment clicks. Conversion-analysis queries run
-- through the service role (admin tooling, future cycles).

CREATE TABLE lab_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL REFERENCES subscriptions(clerk_user_id),
  upload_date timestamptz DEFAULT now(),
  extracted_values jsonb NOT NULL,
  file_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lab uploads"
  ON lab_uploads FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE TABLE bottle_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL REFERENCES subscriptions(clerk_user_id),
  scan_date timestamptz DEFAULT now(),
  identified_compound text,
  identified_dose_mg integer,
  matched_protocol_pick boolean,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bottle_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bottle scans"
  ON bottle_scans FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

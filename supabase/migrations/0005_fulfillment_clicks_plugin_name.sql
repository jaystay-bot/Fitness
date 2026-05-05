-- N=016: extend fulfillment_clicks with a plugin_name discriminator so
-- both Amazon (N=015) and telehealth (this cycle) clicks share the same
-- conversion-analysis surface. Existing rows from N=015 default to
-- 'amazon' so nothing is mis-classified after the migration applies.
--
-- RLS policies and the column set otherwise are unchanged.

ALTER TABLE fulfillment_clicks
  ADD COLUMN plugin_name text NOT NULL DEFAULT 'amazon';

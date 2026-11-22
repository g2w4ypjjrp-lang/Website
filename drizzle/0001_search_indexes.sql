CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION search_norm(t text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT translate(lower(translate(coalesce(t, ''), 'İIÇĞÖŞÜÂÎÛ', 'iıçğöşüâîû')), 'çğıöşüâîû', 'cgiosuaiu')
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION arr_text(a text[]) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$ SELECT array_to_string(a, ' ') $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS services_search_trgm ON services USING gin (search_norm(title || ' ' || summary || ' ' || arr_text(tags)) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS providers_search_trgm ON provider_profiles USING gin (search_norm(display_name || ' ' || headline || ' ' || arr_text(skills)) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS projects_search_trgm ON projects USING gin (search_norm(title || ' ' || description) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS categories_search_trgm ON categories USING gin (search_norm(name || ' ' || short_description) gin_trgm_ops);

-- ------------- Users ------------- --
-- unique index for tax ID, but only for non-null values
CREATE UNIQUE INDEX idx_unique_tax_id
ON users (tax_id)
WHERE tax_id IS NOT NULL;

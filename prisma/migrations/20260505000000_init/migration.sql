CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE resident_status AS ENUM ('active', 'inactive');

CREATE TABLE resident_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE residents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  unit text NOT NULL,
  resident_type_id uuid NOT NULL REFERENCES resident_types(id),
  monthly_contribution_in_cents integer NOT NULL DEFAULT 0,
  status resident_status NOT NULL DEFAULT 'active',
  is_administrator boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES residents(id),
  month date NOT NULL,
  description text,
  amount_in_cents integer NOT NULL DEFAULT 0,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount_in_cents integer NOT NULL DEFAULT 0,
  paid_at timestamptz NOT NULL
);

CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid REFERENCES receipts(id) ON DELETE CASCADE,
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE,
  preview_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attachments_exactly_one_owner CHECK (
    (receipt_id IS NOT NULL AND expense_id IS NULL)
    OR (receipt_id IS NULL AND expense_id IS NOT NULL)
  )
);

CREATE TABLE initial_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL,
  description text NOT NULL,
  amount_in_cents integer NOT NULL DEFAULT 0
);

CREATE INDEX resident_types_active_idx ON resident_types(active);
CREATE INDEX residents_name_idx ON residents(name);
CREATE INDEX residents_unit_idx ON residents(unit);
CREATE INDEX residents_status_idx ON residents(status);
CREATE INDEX residents_resident_type_id_idx ON residents(resident_type_id);
CREATE INDEX receipts_resident_id_idx ON receipts(resident_id);
CREATE INDEX receipts_month_idx ON receipts(month);
CREATE INDEX receipts_resident_id_month_idx ON receipts(resident_id, month);
CREATE INDEX expenses_month_idx ON expenses(month);
CREATE INDEX expenses_category_idx ON expenses(category);
CREATE INDEX expenses_month_category_idx ON expenses(month, category);
CREATE INDEX expenses_paid_at_idx ON expenses(paid_at);
CREATE INDEX attachments_receipt_id_idx ON attachments(receipt_id);
CREATE INDEX attachments_expense_id_idx ON attachments(expense_id);
CREATE INDEX initial_balances_month_idx ON initial_balances(month);

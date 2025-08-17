-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text UNIQUE NOT NULL,
  name text NOT NULL,
  price numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  "interval" text NOT NULL CHECK ("interval" IN ('month', 'year')),
  features jsonb DEFAULT '[]'::jsonb,
  limits jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'cancelled', 'pending', 'past_due', 'incomplete')),
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_provider text NOT NULL DEFAULT 'paypal',
  external_subscription_id text,
  next_billing_date timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent numeric(5, 2) NOT NULL,
  active boolean DEFAULT true,
  expires_at timestamptz,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Allow public read access to active plans"
  ON subscription_plans FOR SELECT
  TO public
  USING (active = true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for coupons
CREATE POLICY "Allow authenticated users to view active coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);

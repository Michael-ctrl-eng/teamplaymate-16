const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const config = require('./env');

// Simple logger to avoid circular dependency
const dbLogger = {
  info: (msg, meta) => console.log(`[INFO]: ${msg}`, meta || ''),
  warn: (msg, meta) => console.warn(`[WARN]: ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[ERROR]: ${msg}`, meta || '')
};

// Supabase configuration from config
const supabaseUrl = config.dbConfig.supabase.url;
const supabaseKey = config.dbConfig.supabase.anonKey;
const supabaseServiceKey = config.dbConfig.supabase.serviceRoleKey;

if (!supabaseUrl || !supabaseKey) {
  dbLogger.warn('Missing Supabase configuration. Some features may not work properly.');
}

// Create Supabase clients
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
}

// PostgreSQL direct connection pool (for complex queries)
let pool = null;

if (config.dbConfig.postgres.host) {
  const poolConfig = {
    host: config.dbConfig.postgres.host,
    port: config.dbConfig.postgres.port,
    database: config.dbConfig.postgres.database,
    user: config.dbConfig.postgres.user,
    password: config.dbConfig.postgres.password,
    ssl: config.dbConfig.postgres.ssl ? { rejectUnauthorized: false } : false,
    max: config.dbConfig.postgres.pool.max,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  pool = new Pool(poolConfig);
}

// Database connection health check
const checkDatabaseConnection = async () => {
  const health = {
    supabase: { status: 'unknown', error: null },
    postgresql: { status: 'unknown', error: null }
  };

  try {
    // Test Supabase connection
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
        health.supabase.status = 'unhealthy';
        health.supabase.error = error.message;
      } else {
        health.supabase.status = 'healthy';
      }
    } else {
      health.supabase.status = 'not_configured';
    }

    // Test PostgreSQL pool connection
    if (pool) {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      health.postgresql.status = 'healthy';
    } else {
      health.postgresql.status = 'not_configured';
    }

    dbLogger.info('Database connection check completed', health);
    return health;
  } catch (error) {
    dbLogger.error('Database connection check failed', { error: error.message });
    if (health.supabase.status === 'unknown') {
      health.supabase.status = 'unhealthy';
      health.supabase.error = error.message;
    }
    if (health.postgresql.status === 'unknown') {
      health.postgresql.status = 'unhealthy';
      health.postgresql.error = error.message;
    }
    return health;
  }
};

// Database schema initialization
const initializeDatabase = async () => {
  try {
    dbLogger.info('Initializing database schema...');

    if (!pool) {
      dbLogger.warn('PostgreSQL pool not configured, skipping schema initialization');
      return;
    }

    // Create extensions
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    
    // Create enum types
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('player', 'coach', 'manager', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled', 'postponed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'pending', 'cancel_at_period_end');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tables
    await createTables();
    
    // Create indexes
    await createIndexes();
    
    // Create triggers
    await createTriggers();

    dbLogger.info('Database schema initialized successfully');
  } catch (error) {
    dbLogger.error('Database initialization failed', { error: error.message });
    throw error;
  }
};

const createTables = async () => {
  const tables = [
    // Users table
    `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        avatar_url TEXT,
        role user_role DEFAULT 'player',
        is_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        google_id VARCHAR(255) UNIQUE,
        stripe_customer_id VARCHAR(255),
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Teams table
    `
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        logo_url TEXT,
        founded_year INTEGER,
        home_venue VARCHAR(200),
        website VARCHAR(255),
        social_media JSONB,
        settings JSONB DEFAULT '{}',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Players table
    `
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        jersey_number INTEGER,
        position VARCHAR(50),
        height_cm INTEGER,
        weight_kg INTEGER,
        date_of_birth DATE,
        nationality VARCHAR(100),
        preferred_foot VARCHAR(10),
        contract_start DATE,
        contract_end DATE,
        salary DECIMAL(10,2),
        market_value DECIMAL(12,2),
        bio TEXT,
        achievements TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(team_id, jersey_number)
      )
    `,
    
    // Matches table
    `
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        opponent_team VARCHAR(100) NOT NULL,
        opponent_logo_url TEXT,
        match_date TIMESTAMP NOT NULL,
        venue VARCHAR(200),
        is_home_match BOOLEAN DEFAULT true,
        competition VARCHAR(100),
        season VARCHAR(20),
        match_week INTEGER,
        status match_status DEFAULT 'scheduled',
        home_score INTEGER DEFAULT 0,
        away_score INTEGER DEFAULT 0,
        lineup JSONB,
        substitutions JSONB,
        events JSONB,
        statistics JSONB,
        weather JSONB,
        referee VARCHAR(100),
        attendance INTEGER,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Training sessions table
    `
      CREATE TABLE IF NOT EXISTS training_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        session_date TIMESTAMP NOT NULL,
        duration_minutes INTEGER,
        location VARCHAR(200),
        session_type VARCHAR(50),
        intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10),
        objectives TEXT[],
        drills JSONB,
        attendance JSONB,
        performance_ratings JSONB,
        notes TEXT,
        weather JSONB,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Analytics table
    `
      CREATE TABLE IF NOT EXISTS analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        player_id UUID REFERENCES players(id) ON DELETE CASCADE,
        match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
        training_session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
        metric_type VARCHAR(100) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(10,4),
        metric_unit VARCHAR(20),
        additional_data JSONB,
        recorded_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Chat channels table
    `
      CREATE TABLE IF NOT EXISTS chat_channels (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private', 'direct')),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        created_by UUID REFERENCES users(id),
        archived BOOLEAN DEFAULT false,
        last_activity_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Chat channel members table
    `
      CREATE TABLE IF NOT EXISTS chat_channel_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
        joined_at TIMESTAMP DEFAULT NOW(),
        last_read_at TIMESTAMP,
        muted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(channel_id, user_id)
      )
    `,
    
    // Chat messages table
    `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
        file_url TEXT,
        file_name VARCHAR(255),
        file_size INTEGER,
        reply_to UUID REFERENCES chat_messages(id),
        metadata JSONB,
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Chat message reactions table
    `
      CREATE TABLE IF NOT EXISTS chat_message_reactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        emoji VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(message_id, user_id, emoji)
      )
    `,
    
    // Subscriptions table
    `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        plan_id VARCHAR(50) NOT NULL,
        status subscription_status DEFAULT 'pending',
        billing_cycle VARCHAR(20) DEFAULT 'monthly',
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        payment_provider VARCHAR(20),
        external_subscription_id VARCHAR(255),
        payment_method_id VARCHAR(255),
        coupon_id UUID,
        next_billing_date TIMESTAMP,
        activated_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT false,
        cancellation_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Subscription invoices table
    `
      CREATE TABLE IF NOT EXISTS subscription_invoices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
        external_invoice_id VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'pending',
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Coupons table
    `
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
        discount_amount DECIMAL(10,2),
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // API keys table
    `
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        key_hash VARCHAR(255) NOT NULL,
        permissions TEXT[],
        last_used_at TIMESTAMP,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    
    // Audit logs table
    `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        team_id UUID REFERENCES teams(id),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
  ];

  for (const table of tables) {
    await pool.query(table);
  }
};

const createIndexes = async () => {
  const indexes = [
    // Users indexes
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',
    'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
    
    // Players indexes
    'CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id)',
    'CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_players_position ON players(position)',
    
    // Matches indexes
    'CREATE INDEX IF NOT EXISTS idx_matches_team_id ON matches(team_id)',
    'CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date)',
    'CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status)',
    'CREATE INDEX IF NOT EXISTS idx_matches_season ON matches(season)',
    
    // Training sessions indexes
    'CREATE INDEX IF NOT EXISTS idx_training_team_id ON training_sessions(team_id)',
    'CREATE INDEX IF NOT EXISTS idx_training_date ON training_sessions(session_date)',
    
    // Analytics indexes
    'CREATE INDEX IF NOT EXISTS idx_analytics_team_id ON analytics(team_id)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_player_id ON analytics(player_id)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_match_id ON analytics(match_id)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_metric_type ON analytics(metric_type)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON analytics(recorded_at)',
    
    // Chat indexes
    'CREATE INDEX IF NOT EXISTS idx_chat_channels_team_id ON chat_channels(team_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_channels_type ON chat_channels(type)',
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_chat_channel_members_user_id ON chat_channel_members(user_id)',
    
    // Subscriptions indexes
    'CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_subscriptions_team_id ON subscriptions(team_id)',
    'CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)',
    'CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date)',
    
    // Audit logs indexes
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_team_id ON audit_logs(team_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)'
  ];

  for (const index of indexes) {
    await pool.query(index);
  }
};

const createTriggers = async () => {
  // Updated_at trigger function
  await pool.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Apply updated_at trigger to relevant tables
  const tablesWithUpdatedAt = [
    'users', 'teams', 'players', 'matches', 'training_sessions',
    'chat_channels', 'chat_channel_members', 'chat_messages',
    'subscriptions', 'coupons', 'api_keys'
  ];

  for (const table of tablesWithUpdatedAt) {
    await pool.query(`
      DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
      CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  // Audit log trigger function
  await pool.query(`
    CREATE OR REPLACE FUNCTION create_audit_log()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'DELETE' THEN
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values)
            VALUES (OLD.updated_by, TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
            VALUES (NEW.updated_by, TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
            RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
            VALUES (NEW.created_by, TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
            RETURN NEW;
        END IF;
        RETURN NULL;
    END;
    $$ language 'plpgsql';
  `);
};

// Close database connections
const closeDatabase = async () => {
  try {
    dbLogger.info('Closing database connections...');
    
    if (pool) {
      await pool.end();
      dbLogger.info('PostgreSQL pool closed');
    }
    
    // Supabase client doesn't need explicit closing
    dbLogger.info('Database connections closed successfully');
  } catch (error) {
    dbLogger.error('Error closing database connections:', error);
    throw error;
  }
};

process.on('SIGINT', async () => {
  dbLogger.info('Received SIGINT, closing database connections...');
  await closeDatabase();
});

process.on('SIGTERM', async () => {
  dbLogger.info('Received SIGTERM, closing database connections...');
  await closeDatabase();
});

module.exports = {
  supabase,
  supabaseAdmin,
  pool,
  checkDatabaseConnection,
  initializeDatabase,
  closeDatabase,
  dbLogger
};
-- 创建会话数据表
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_id TEXT UNIQUE NOT NULL,
  session_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_sessions_short_id ON sessions(short_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 创建清理过期会话的函数
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 创建RLS (Row Level Security) 策略
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 允许所有人插入和读取数据
CREATE POLICY "Allow public access" ON sessions
  FOR ALL USING (true)
  WITH CHECK (true);

-- 设置权限
GRANT ALL ON sessions TO anon;
GRANT ALL ON sessions TO authenticated;
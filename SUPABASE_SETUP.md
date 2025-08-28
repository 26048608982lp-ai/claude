# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账户
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - Name: `qixi-match`
   - Database Password: 设置强密码
   - Region: 选择离用户最近的区域（建议 Singapore 或 Tokyo）

## 2. 获取配置信息

项目创建后，在项目设置中找到：
- **Project URL**: `https://your-project-id.supabase.co`
- **anon public key**: 在 Settings > API 中找到

## 3. 创建数据库表

在 Supabase SQL Editor 中执行以下SQL：

```sql
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
```

## 4. 配置环境变量

### 本地开发
在项目根目录创建 `.env.local` 文件：

```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 生产环境

#### EdgeOne Pages
在 EdgeOne 控制台添加环境变量：
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

#### Vercel
在 Vercel 项目设置 > Environment Variables 中添加：
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## 5. 验证设置

运行项目并测试：
```bash
npm start
```

在浏览器开发者工具的 Console 中查看是否显示 Supabase 连接成功的信息。

## 6. 数据清理（可选）

可以设置定时任务自动清理过期会话：

```sql
-- 创建定时任务清理过期会话
SELECT cron.schedule('cleanup-expired-sessions', '0 0 * * *', $$DELETE FROM sessions WHERE expires_at < NOW()$$);
```
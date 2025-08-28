import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// 创建Supabase客户端
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// 数据库表接口定义
export interface SessionRecord {
  id?: string;
  short_id: string;
  session_data: any;
  created_at: string;
  expires_at: string;
}

// 数据库操作函数
export class SupabaseService {
  // 生成短链接ID
  generateShortId(): string {
    return Math.random().toString(36).substring(2, 8);
  }

  // 保存会话数据
  async saveSession(sessionData: any, shortId?: string): Promise<string> {
    const sessionId = shortId || this.generateShortId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24小时过期

    const { error } = await supabase
      .from('sessions')
      .upsert({
        short_id: sessionId,
        session_data: sessionData,
        expires_at: expiresAt
      });

    if (error) {
      console.error('Failed to save session to Supabase:', error);
      throw error;
    }

    return sessionId;
  }

  // 获取会话数据
  async getSession(shortId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('session_data')
      .eq('short_id', shortId)
      .single();

    if (error) {
      console.error('Failed to fetch session from Supabase:', error);
      return null;
    }

    return data?.session_data || null;
  }

  // 更新会话数据
  async updateSession(shortId: string, sessionData: any): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .update({ session_data: sessionData })
      .eq('short_id', shortId);

    if (error) {
      console.error('Failed to update session in Supabase:', error);
      throw error;
    }
  }

  // 删除过期会话
  async cleanupExpiredSessions(): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Failed to cleanup expired sessions:', error);
    }
  }

  // 检查会话是否存在
  async checkSessionExists(shortId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('sessions')
      .select('id')
      .eq('short_id', shortId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }
}

export const supabaseService = new SupabaseService();
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 简化的环境变量访问方式
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  
  console.log('Supabase config check:', {
    supabaseUrl: supabaseUrl ? 'configured' : 'missing',
    supabaseKey: supabaseKey ? 'configured' : 'missing',
    urlLength: supabaseUrl.length,
    keyLength: supabaseKey.length
  });
  
  return { supabaseUrl, supabaseKey };
};

const { supabaseUrl, supabaseKey } = getSupabaseConfig();

// 创建Supabase客户端（仅在配置有效时）
export const supabase: SupabaseClient | null = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

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

  // 测试Supabase连接
  async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    console.log('🔍 Testing Supabase connection...');
    
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase client not initialized',
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }
      };
    }

    try {
      // 测试基本连接 - 尝试查询sessions表
      const { data, error, status } = await supabase
        .from('sessions')
        .select('count', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        return { 
          success: false, 
          error: error.message,
          details: { 
            status: status,
            code: error.code,
            hint: error.hint,
            details: error.details
          }
        };
      }

      console.log('✅ Supabase connection test successful');
      return { 
        success: true, 
        details: { 
          status: status,
          count: data ? 'Table accessible' : 'No data returned'
        }
      };
    } catch (error) {
      console.error('❌ Supabase connection test exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
    }
  }

  // 保存会话数据
  async saveSession(sessionData: any, shortId?: string): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase client is not available');
    }
    
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
    if (!supabase) {
      throw new Error('Supabase client is not available');
    }
    
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
    console.log('🔄 Updating session in Supabase:', { shortId, dataKeys: Object.keys(sessionData) });
    
    if (!supabase) {
      throw new Error('Supabase client is not available');
    }
    
    try {
      const { data, error, status } = await supabase
        .from('sessions')
        .update({ session_data: sessionData })
        .eq('short_id', shortId)
        .select();

      if (error) {
        console.error('❌ Failed to update session in Supabase:', {
          error: error.message,
          code: error.code,
          status: status,
          hint: error.hint,
          details: error.details,
          shortId: shortId
        });
        throw error;
      }

      console.log('✅ Session updated successfully:', { 
        shortId, 
        status, 
        returnedData: !!data 
      });
    } catch (error) {
      console.error('❌ Exception during session update:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        shortId: shortId,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  // 删除过期会话
  async cleanupExpiredSessions(): Promise<void> {
    if (!supabase) {
      return;
    }
    
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
    if (!supabase) {
      return false;
    }
    
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
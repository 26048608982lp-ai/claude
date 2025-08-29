import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import InterestSelector from './components/InterestSelector';
import MatchResults from './components/MatchResults';
import ErrorBoundary from './components/ErrorBoundary';
import LanguageSwitcher from './components/LanguageSwitcher';
import { MatchingEngine } from './utils/matchingEngine';
import SessionManager from './utils/sessionManager';
import { supabaseService } from './utils/supabase';
import { Interest, MatchResult, SessionData } from './types';

type AppStage = 'welcome' | 'enterName' | 'user1' | 'user2' | 'results' | 'share';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [stage, setStage] = useState<AppStage>('welcome');
  const [user1Interests, setUser1Interests] = useState<Interest[]>([]);
  const [user2Interests, setUser2Interests] = useState<Interest[]>([]);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [user1Name, setUser1Name] = useState('');
  const [user2Name, setUser2Name] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [isLoadingShareLink, setIsLoadingShareLink] = useState(false);

  const engine = useMemo(() => new MatchingEngine(), []);

  // 处理会话数据的辅助函数
  const processSessionData = useCallback((sessionDataFromUrl: SessionData) => {
    console.log('✅ Found valid session data, processing...');
    console.log('Session data details:', {
      sessionId: sessionDataFromUrl.sessionId,
      hasUser1: !!sessionDataFromUrl.user1,
      hasUser2: !!sessionDataFromUrl.user2,
      user2Name: sessionDataFromUrl.user2Name,
      hasMatchResult: !!sessionDataFromUrl.matchResult,
      user1Name: sessionDataFromUrl.user1?.name,
      user2ActualName: sessionDataFromUrl.user2?.name
    });
    
    console.log('Setting session data...');
    setSessionData(sessionDataFromUrl);
    
    // 安全地设置sessionId，如果不存在则生成新的
    if (sessionDataFromUrl.sessionId) {
      setSessionId(sessionDataFromUrl.sessionId);
    } else {
      const newSessionId = SessionManager.generateSessionId();
      setSessionId(newSessionId);
      // 更新sessionData中的sessionId
      sessionDataFromUrl.sessionId = newSessionId;
    }
    
    if (sessionDataFromUrl.user1 && sessionDataFromUrl.user2) {
      // 两个用户都完成了，显示结果
      console.log('🎯 Both users completed, showing results...');
      console.log('User1 name:', sessionDataFromUrl.user1.name);
      console.log('User2 name:', sessionDataFromUrl.user2.name);
      console.log('Has pre-calculated result:', !!sessionDataFromUrl.matchResult);
      
      let result;
      
      // 如果会话数据中已经有匹配结果，直接使用
      if (sessionDataFromUrl.matchResult) {
        console.log('✅ Using pre-calculated match result from URL data');
        result = sessionDataFromUrl.matchResult;
      } else {
        // 否则重新计算匹配结果
        console.log('🔄 Calculating new match result');
        result = engine.calculateMatch(sessionDataFromUrl.user1.interests, sessionDataFromUrl.user2.interests);
      }
      
      console.log('📊 Match result prepared:', result);
      setMatchResult(result);
      setUser1Name(sessionDataFromUrl.user1.name);
      setUser2Name(sessionDataFromUrl.user2.name);
      setStage('results');
      console.log('🎉 Set stage to results');
    } else if (sessionDataFromUrl.user1) {
      // 用户1完成了，检查是否有用户2的名字
      console.log('👤 User 1 completed, checking for user2 name...');
      console.log('User1 name:', sessionDataFromUrl.user1.name);
      console.log('User2 name from URL:', sessionDataFromUrl.user2Name);
      
      setUser1Name(sessionDataFromUrl.user1.name);
      setUser1Interests(sessionDataFromUrl.user1.interests);
      
      // 如果URL中已经有user2Name，直接进入用户2的选择界面
      if (sessionDataFromUrl.user2Name) {
        console.log('✅ Found user2Name in URL:', sessionDataFromUrl.user2Name);
        setUser2Name(sessionDataFromUrl.user2Name);
        setStage('user2');
        console.log('🎯 Set stage to user2 (skip name entry)');
      } else {
        // 否则需要输入用户2的名字
        console.log('❓ No user2Name found, showing enter name...');
        setStage('enterName');
        console.log('🎯 Set stage to enterName');
      }
    }
  }, [engine]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔍 Checking URL data...');
        console.log('Current URL:', window.location.href);
        console.log('URL search:', window.location.search);
        console.log('URL hostname:', window.location.hostname);
        
        // 检查环境变量
        const supabaseUrl = process.env?.REACT_APP_SUPABASE_URL || '';
        const supabaseKey = process.env?.REACT_APP_SUPABASE_ANON_KEY || '';
        console.log('Environment check:', {
          hasProcess: typeof process !== 'undefined',
          hasEnv: typeof process !== 'undefined' && process.env ? true : false,
          supabaseUrl: supabaseUrl ? 'set' : 'not set',
          supabaseKey: supabaseKey ? 'set' : 'not set',
          urlLength: supabaseUrl.length,
          keyLength: supabaseKey.length,
          urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '',
          keyPreview: supabaseKey ? supabaseKey.substring(0, 20) + '...' : ''
        });
        
        // 测试Supabase连接
        if (supabaseUrl && supabaseKey) {
          console.log('🔍 Testing Supabase connection...');
          try {
            const connectionTest = await supabaseService.testConnection();
            if (connectionTest.success) {
              console.log('✅ Supabase connection test passed:', connectionTest.details);
            } else {
              console.error('❌ Supabase connection test failed:', connectionTest.error);
              console.error('Error details:', connectionTest.details);
            }
          } catch (error) {
            console.error('❌ Supabase connection test exception:', error);
          }
        }
        
        // 优先检查Supabase短链接
        const shortId = SessionManager.getShortIdFromUrl();
        if (shortId) {
          console.log('🔗 Found Supabase short ID:', shortId);
          try {
            const sessionDataFromSupabase = await SessionManager.getSessionFromSupabase(shortId);
            if (sessionDataFromSupabase) {
              console.log('✅ Found valid session data from Supabase');
              processSessionData(sessionDataFromSupabase);
              return;
            }
          } catch (error) {
            console.warn('Error fetching from Supabase:', error);
          }
        }
        
        // 检查报告短链接
        const reportShortId = SessionManager.getReportShortIdFromUrl();
        if (reportShortId) {
          console.log('📄 Found report short ID:', reportShortId);
          try {
            const sessionDataFromSupabase = await SessionManager.getSessionFromSupabase(reportShortId);
            if (sessionDataFromSupabase) {
              console.log('✅ Found valid report data from Supabase');
              processSessionData(sessionDataFromSupabase);
              return;
            }
          } catch (error) {
            console.warn('Error fetching report from Supabase:', error);
          }
        }
        
        // Fallback到原有的URL数据检查
        const sessionDataFromUrl = SessionManager.getSessionDataFromUrl();
        console.log('📦 Session data from URL:', sessionDataFromUrl);
        
        if (sessionDataFromUrl) {
          processSessionData(sessionDataFromUrl);
          return;
        }
        
        // 检查报告链接（向后兼容）
        const reportId = SessionManager.getReportIdFromUrl();
        if (reportId) {
          const savedSession = SessionManager.loadSession();
          if (savedSession && savedSession.sessionId === reportId && savedSession.user1 && savedSession.user2) {
            const result = engine.calculateMatch(savedSession.user1.interests, savedSession.user2.interests);
            setMatchResult(result);
            setUser1Name(savedSession.user1.name);
            setUser2Name(savedSession.user2.name);
            setStage('results');
            return;
          }
        }
        
        // 检查现有的session从URL或localStorage
        const urlSessionId = SessionManager.getSessionIdFromUrl();
        const savedSession = SessionManager.loadSession();
        
        if (urlSessionId && savedSession && savedSession.sessionId === urlSessionId) {
          setSessionId(urlSessionId);
          setSessionData(savedSession);
          
          if (savedSession.user1 && savedSession.user2) {
            // 两个用户都完成了，显示结果
            const result = engine.calculateMatch(savedSession.user1.interests, savedSession.user2.interests);
            setMatchResult(result);
            setUser1Name(savedSession.user1.name);
            setUser2Name(savedSession.user2.name);
            setStage('results');
          } else if (savedSession.user1) {
            // 用户1完成了，用户2需要输入名字并完成
            setUser1Name(savedSession.user1.name);
            setUser1Interests(savedSession.user1.interests);
            setStage('enterName');
          }
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
        // 设置默认状态，确保应用能够启动
        setStage('welcome');
      }
    };
    
    initializeApp();
  }, [engine, processSessionData]);

  // 当进入分享页面时生成短链接
  useEffect(() => {
    const generateShareLink = async () => {
      if (stage === 'share' && sessionData) {
        try {
          setIsLoadingShareLink(true);
          // 优先使用Supabase生成短链接
          const link = await SessionManager.getSupabaseShareLink(sessionData);
          setShareLink(link);
          console.log('Generated share link for display:', link);
          console.log('Share link length:', link.length);
        } catch (error) {
          console.error('Failed to generate share link:', error);
          // 回退到传统方法
          try {
            const fallbackLink = SessionManager.getShareableLinkWithData(sessionData);
            setShareLink(fallbackLink);
          } catch (fallbackError) {
            console.error('Fallback link generation also failed:', fallbackError);
          }
        } finally {
          setIsLoadingShareLink(false);
        }
      }
    };

    generateShareLink();
  }, [stage, sessionData]);

  const handleUser1Complete = async (interests: Interest[]) => {
    const newSessionId = sessionId || SessionManager.generateSessionId();
    const user1Selection = SessionManager.createUserSelection('user1', user1Name, interests);
    
    const newSessionData: SessionData = {
      sessionId: newSessionId,
      user1: user1Selection,
      user2: null,
      user2Name: user2Name, // 保存用户B的名字
      createdAt: Date.now()
    };
    
    setSessionId(newSessionId);
    setSessionData(newSessionData);
    setUser1Interests(interests);
    SessionManager.saveSession(newSessionData);
    
    // 保存到Supabase
    try {
      await SessionManager.updateSupabaseSession(newSessionId, newSessionData);
    } catch (error) {
      console.error('Failed to save to Supabase:', error);
    }
    
    setStage('share');
  };

  const handleUser2Complete = async (interests: Interest[]) => {
    console.log('handleUser2Complete called');
    console.log('Current sessionData:', sessionData);
    console.log('User2 name:', user2Name);
    console.log('User2 interests:', interests);
    
    if (!sessionData) {
      console.error('❌ No session data available');
      return;
    }
    
    try {
      const user2Selection = SessionManager.createUserSelection('user2', user2Name, interests);
      console.log('✅ Created user2 selection:', user2Selection);
      
      // 更新sessionData，确保包含user2Name
      const updatedSession = {
        ...sessionData,
        user2: user2Selection,
        user2Name: user2Name // 确保 user2Name 被正确保存
      };
      console.log('✅ Updated session with user2Name:', updatedSession);
      
      setSessionData(updatedSession);
      setUser2Interests(interests);
      SessionManager.saveSession(updatedSession);
      
      // 保存完整的会话数据到Supabase
      try {
        await SessionManager.updateSupabaseSession(sessionId, updatedSession);
      } catch (error) {
        console.error('Failed to save complete session to Supabase:', error);
      }
      
      // 使用更新后的session数据计算匹配结果
      const result = engine.calculateMatch(updatedSession.user1!.interests, interests);
      console.log('✅ Calculated match result:', result);
      
      setMatchResult(result);
      setStage('results');
      console.log('✅ Moved to results stage');
    } catch (error) {
      console.error('❌ Error in handleUser2Complete:', error);
    }
  };

  const resetApp = () => {
    setStage('welcome');
    setUser1Interests([]);
    setUser2Interests([]);
    setMatchResult(null);
    setUser1Name('');
    setUser2Name('');
    setSessionId('');
    setSessionData(null);
    SessionManager.clearSession();
  };

  const copyShareLink = async () => {
    console.log('copyShareLink called');
    console.log('Current sessionData:', sessionData);
    console.log('Current user1Name:', user1Name);
    console.log('Current user2Name:', user2Name);
    
    if (!sessionData) {
      console.error('❌ No session data available');
      alert('No shareable data available');
      return;
    }
    
    // 验证用户A分享场景的数据完整性
    if (!sessionData.user1) {
      console.error('❌ User1 data missing from session');
      alert('User A data incomplete, please complete selection again');
      return;
    }
    
    if (!sessionData.user2Name && !user2Name) {
      console.error('❌ User2 name missing');
      alert('Please ensure you have entered User B\'s name');
      return;
    }
    
    try {
      // 确保sessionData包含user2Name
      const shareSessionData = {
        ...sessionData,
        user2Name: sessionData.user2Name || user2Name
      };
      
      console.log('✅ Prepared session data for sharing:', shareSessionData);
      
      // 优先使用Supabase生成短链接
      const shareLink = await SessionManager.getSupabaseShareLink(shareSessionData);
      console.log('Generated share link:', shareLink);
      console.log('Link length:', shareLink.length);
      console.log('Link format check - using Supabase short ID:', shareLink.includes('?s='));
      
      // 验证链接格式 - 应该是短链接格式
      if (shareLink.includes('?s=')) {
        console.log('✅ Using Supabase short link format');
      } else {
        console.warn('⚠️ Share link might be using fallback format:', shareLink);
      }
      
      await navigator.clipboard.writeText(shareLink);
      console.log('✅ Share link copied to clipboard');
      alert('Share link copied to clipboard! You can send it to ' + (shareSessionData.user2Name || user2Name) + ' to fill out.');
    } catch (err) {
      console.error('❌ Failed to copy share link: ', err);
      console.error('Error details:', err);
      alert('Failed to copy share link, please copy manually');
    }
  };

  const copyResultsLink = async () => {
    console.log('copyResultsLink called');
    console.log('Current sessionData:', sessionData);
    console.log('Current matchResult:', matchResult);
    console.log('Current user1Name:', user1Name);
    console.log('Current user2Name:', user2Name);
    
    if (!sessionData || !matchResult) {
      console.error('❌ Missing session data or match result');
      alert('No results data available to share');
      return;
    }
    
    try {
      // 确保sessionData包含完整的用户信息
      const completeSessionData = {
        ...sessionData,
        user1: sessionData.user1,
        user2: sessionData.user2,
        user2Name: sessionData.user2Name || user2Name, // 使用状态中的user2Name作为备用
        matchResult: matchResult
      };
      
      console.log('✅ Complete session data for sharing:', completeSessionData);
      
      // 验证数据完整性
      if (!completeSessionData.user1 || !completeSessionData.user2) {
        console.error('❌ Incomplete user data in session');
        alert('Sharing data incomplete, please complete match again');
        return;
      }
      
      if (!completeSessionData.user2Name) {
        console.error('❌ Missing user2Name in session data');
        alert('Missing User B name information');
        return;
      }
      
      // 优先使用Supabase生成短链接
      const reportLink = await SessionManager.getSupabaseShareLink(completeSessionData);
      console.log('✅ Generated report link:', reportLink);
      console.log('Report link length:', reportLink.length);
      console.log('Link format check - using Supabase short ID:', reportLink.includes('?s='));
      
      // 验证链接格式
      if (reportLink.includes('?s=')) {
        console.log('✅ Using Supabase short link format for results');
      } else {
        console.warn('⚠️ Report link might be using fallback format:', reportLink);
      }
      
      await navigator.clipboard.writeText(reportLink);
      console.log('✅ Report link copied to clipboard');
      alert('Results link copied to clipboard! You can share it with your partner to view the match results.');
    } catch (err) {
      console.error('❌ Failed to copy results link: ', err);
      alert('Failed to copy results link, please copy manually');
    }
  };

  const renderWelcome = () => (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-xl max-w-md w-full text-center">
        <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">💕</div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">{t('app.title')}</h1>
        <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6">
          {t('app.subtitle')}
        </p>
        
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <input
            type="text"
            placeholder={t('app.welcome.enterYourName') as string}
            value={user1Name}
            onChange={(e) => setUser1Name(e.target.value)}
            className="w-full p-2.5 sm:p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 text-sm sm:text-base"
          />
          <input
            type="text"
            placeholder={t('app.welcome.enterPartnerName') as string}
            value={user2Name}
            onChange={(e) => setUser2Name(e.target.value)}
            className="w-full p-2.5 sm:p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 text-sm sm:text-base"
          />
        </div>
        
        <button
          onClick={() => sessionData ? setStage('user2') : setStage('user1')}
          disabled={!user1Name || !user2Name}
          className="w-full bg-gradient-to-r from-qixi-pink to-qixi-purple text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-qixi-pink/80 hover:to-qixi-purple/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sessionData ? t('app.welcome.startMatching') : t('app.welcome.beginMatch')}
        </button>
      </div>
    </div>
  );

  const renderUserSelection = (userNumber: number) => (
    <div className="pt-8 sm:pt-12">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
          {t('app.userSelection.title', { name: userNumber === 1 ? user1Name : user2Name })}
        </h1>
        <p className="text-sm sm:text-base text-white/80">
          {t('app.userSelection.subtitle')}
        </p>
      </div>
      
        
      <InterestSelector
        selectedInterests={userNumber === 1 ? user1Interests : user2Interests}
        onSelectionChange={(interests) => {
          if (userNumber === 1) {
            setUser1Interests(interests);
          } else {
            setUser2Interests(interests);
          }
        }}
      />
      
      <div className="text-center mt-6 sm:mt-8">
        <button
          onClick={async () => {
            if (userNumber === 1) {
              await handleUser1Complete(user1Interests);
            } else {
              await handleUser2Complete(user2Interests);
            }
          }}
          disabled={(userNumber === 1 ? user1Interests : user2Interests).length === 0}
          className="bg-gradient-to-r from-qixi-pink to-qixi-purple text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-qixi-pink/80 hover:to-qixi-purple/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {userNumber === 1 ? t('app.userSelection.completeSelection') : t('app.userSelection.viewResults')}
        </button>
        
        {userNumber === 2 && sessionData && (
          <button
            onClick={() => setStage('share')}
            className="ml-2 sm:ml-4 bg-white/20 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-white/30 transition-all duration-300"
          >
            {t('app.userSelection.shareAgain')}
          </button>
        )}
      </div>
    </div>
  );

  const renderEnterName = () => (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-xl max-w-md w-full text-center">
        <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">👤</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">{t('app.enterName.title')}</h1>
        <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6">
          {t('app.enterName.subtitle', { user1Name })}
        </p>
        
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <input
            type="text"
            placeholder={t('app.enterName.title') as string}
            value={user2Name}
            onChange={(e) => setUser2Name(e.target.value)}
            className="w-full p-2.5 sm:p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 text-sm sm:text-base"
          />
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={() => setStage('user2')}
            disabled={!user2Name}
            className="w-full bg-gradient-to-r from-qixi-pink to-qixi-purple text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-qixi-pink/80 hover:to-qixi-purple/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('app.enterName.startMatching')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderShare = () => {
    if (!sessionData || !user1Name) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-xl max-w-md w-full text-center">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">❌</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">{t('app.errors.dataLost')}</h1>
            <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6">
              {t('app.errors.sharingDataLost')}
            </p>
            <button
              onClick={resetApp}
              className="w-full bg-gradient-to-r from-qixi-pink to-qixi-purple text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-qixi-pink/80 hover:to-qixi-purple/80 transition-all duration-300"
            >
              {t('app.errors.startOver')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">📱</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            {t('app.share.title', { partnerName: sessionData?.user2Name || user2Name })}
          </h1>
          <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6">
            {t('app.share.subtitle', { 
              userName: user1Name, 
              partnerName: sessionData?.user2Name || user2Name 
            })}
          </p>
          
          <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-white/60 text-xs sm:text-sm mb-2">{t('app.share.shareLink')}</p>
            {isLoadingShareLink ? (
              <p className="text-white/80 text-xs sm:text-sm">{t('app.share.generatingLink')}</p>
            ) : (
              <p className="text-white text-xs sm:text-sm break-all">
                {shareLink || t('app.errors.linkGenerationFailed')}
              </p>
            )}
            {!isLoadingShareLink && shareLink && (
              <p className="text-white/60 text-xs mt-2">
                {t('app.share.linkLength', { length: shareLink.length })}
                {shareLink.includes('?s=') && t('app.share.shortLinkFormat')}
              </p>
            )}
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={copyShareLink}
              disabled={!shareLink || isLoadingShareLink}
              className="w-full bg-gradient-to-r from-qixi-pink to-qixi-purple text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-qixi-pink/80 hover:to-qixi-purple/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingShareLink ? t('app.share.generating') : t('app.share.copyShareLink')}
            </button>
            
            <button
              onClick={() => setStage('enterName')}
              className="w-full bg-white/20 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-white/30 transition-all duration-300"
            >
              {t('app.share.startFillingOut', { partnerName: sessionData?.user2Name || user2Name })}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <LanguageSwitcher />
        {stage === 'welcome' && renderWelcome()}
        {stage === 'enterName' && renderEnterName()}
        {stage === 'user1' && renderUserSelection(1)}
        {stage === 'share' && renderShare()}
        {stage === 'user2' && renderUserSelection(2)}
        {stage === 'results' && matchResult && (
          <div className="pt-8 sm:pt-12">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">{t('app.results.title')}</h1>
              <p className="text-sm sm:text-base text-white/80">
                {t('app.results.subtitle')}
              </p>
            </div>
            
            <MatchResults
              matchResult={matchResult}
              user1Name={user1Name}
              user2Name={user2Name}
            />
            
            <div className="text-center mt-6 sm:mt-8">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button
                  onClick={copyResultsLink}
                  className="w-full sm:w-auto bg-gradient-to-r from-qixi-blue to-qixi-purple text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-qixi-blue/80 hover:to-qixi-purple/80 transition-all duration-300"
                >
                  {t('app.results.shareResults')}
                </button>
                
                <button
                  onClick={resetApp}
                  className="w-full sm:w-auto bg-gradient-to-r from-qixi-pink to-qixi-purple text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-qixi-pink/80 hover:to-qixi-purple/80 transition-all duration-300"
                >
                  {t('app.results.startOver')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;

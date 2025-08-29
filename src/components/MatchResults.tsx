import React from 'react';
import { MatchResult } from '../types';
import { MatchingEngine } from '../utils/matchingEngine';

interface MatchResultsProps {
  matchResult: MatchResult;
  user1Name: string;
  user2Name: string;
}

const MatchResults: React.FC<MatchResultsProps> = ({
  matchResult,
  user1Name,
  user2Name
}) => {
  const engine = new MatchingEngine();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* 匹配度总览 */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          {user1Name} ❤️ {user2Name} Match Results
        </h2>
        
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-qixi-gold mb-2">
            {matchResult.overallScore}%
          </div>
          <div className="text-xl text-qixi-pink font-semibold">
            {engine.getMatchLevel(matchResult.overallScore)}
          </div>
        </div>

        {/* 分类匹配度 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(matchResult.categoryScores).map(([category, score]) => (
            <div key={category} className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{score}%</div>
              <div className="text-sm text-white/80">
                {engine.getCategoryName(category)}
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-qixi-pink h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 共同兴趣 */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-qixi-gold">⭐</span>
          Common Interests ({matchResult.commonInterests.length})
        </h3>
        
        {matchResult.commonInterests.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {matchResult.commonInterests.map(interest => (
              <div
                key={interest.id}
                className="bg-gradient-to-r from-qixi-pink to-qixi-purple text-white p-3 rounded-lg text-center"
              >
                <div className="text-2xl mb-1">{interest.icon}</div>
                <div className="font-medium">{interest.name}</div>
                <div className="text-xs opacity-80">
                  Importance: {interest.importance}★
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/60 py-8">
            <div className="text-4xl mb-2">🌟</div>
            <p>No common interests, but this is a great opportunity to get to know each other!</p>
          </div>
        )}
      </div>

      {/* 独特兴趣 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">
            {user1Name}'s Unique Interests
          </h3>
          <div className="space-y-2">
            {matchResult.uniqueInterests.user1.length > 0 ? (
              matchResult.uniqueInterests.user1.map(interest => (
                <div
                  key={interest.id}
                  className="bg-white/10 text-white p-2 rounded flex items-center gap-2"
                >
                  <span>{interest.icon}</span>
                  <span>{interest.name}</span>
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-4">All interests are common</p>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">
            {user2Name}'s Unique Interests
          </h3>
          <div className="space-y-2">
            {matchResult.uniqueInterests.user2.length > 0 ? (
              matchResult.uniqueInterests.user2.map(interest => (
                <div
                  key={interest.id}
                  className="bg-white/10 text-white p-2 rounded flex items-center gap-2"
                >
                  <span>{interest.icon}</span>
                  <span>{interest.name}</span>
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-4">All interests are common</p>
            )}
          </div>
        </div>
      </div>

      {/* 推荐活动 */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-qixi-gold">💝</span>
          Recommended Date Activities for You
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchResult.recommendedActivities.map(activity => (
            <div
              key={activity.id}
              className="bg-white/10 text-white p-4 rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-lg">{activity.name}</h4>
                <div className="bg-qixi-pink text-white px-2 py-1 rounded-full text-xs">
                  {activity.matchScore}%
                </div>
              </div>
              
              <p className="text-sm text-white/80 mb-3">{activity.description}</p>
              
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>⏱️ {activity.duration}</span>
                <span>💰 {activity.cost}</span>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-qixi-gold h-2 rounded-full"
                    style={{ width: `${activity.matchScore}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 互动建议 */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-qixi-gold">💕</span>
          Tips to Strengthen Your Relationship
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-qixi-pink/20 to-qixi-purple/20 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-2">Based on Common Interests</h4>
            <p className="text-white/80 text-sm">
              {matchResult.commonInterests.length > 0
                ? `Participate in more ${matchResult.commonInterests[0]?.name} related activities to create shared memories.`
                : 'Try exploring new interests together to discover new sides of each other.'
              }
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-qixi-blue/20 to-qixi-gold/20 p-4 rounded-lg">
            <h4 className="font-bold text-white mb-2">Based on Unique Interests</h4>
            <p className="text-white/80 text-sm">
              {matchResult.uniqueInterests.user1.length > 0 || matchResult.uniqueInterests.user2.length > 0
                ? 'Share your expertise with each other and teach new skills.'
                : 'Try completely new activities together and grow as a couple.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchResults;
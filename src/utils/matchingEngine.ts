import { Interest, MatchResult, Activity } from '../types';

export class MatchingEngine {
  private activities: Activity[] = [
    {
      id: 'movie_night',
      name: 'Movie Night',
      category: 'entertainment',
      description: 'Watch a romantic movie together and enjoy quality time',
      matchScore: 0,
      duration: '2-3 hours',
      cost: 'Medium'
    },
    {
      id: 'concert',
      name: 'Concert',
      category: 'entertainment',
      description: 'Attend an exciting live concert',
      matchScore: 0,
      duration: '3-4 hours',
      cost: 'High'
    },
    {
      id: 'hiking_date',
      name: 'Hiking Date',
      category: 'sports',
      description: 'Hike together and enjoy natural scenery',
      matchScore: 0,
      duration: 'Half day',
      cost: 'Low'
    },
    {
      id: 'cooking_class',
      name: 'Cooking Class',
      category: 'food',
      description: 'Learn to cook delicious meals together',
      matchScore: 0,
      duration: '2-3 hours',
      cost: 'Medium'
    },
    {
      id: 'beach_vacation',
      name: 'Beach Vacation',
      category: 'travel',
      description: 'Enjoy sunshine, sand, and waves',
      matchScore: 0,
      duration: 'Few days',
      cost: 'High'
    },
    {
      id: 'museum_visit',
      name: 'Museum Visit',
      category: 'travel',
      description: 'Explore culture and history together',
      matchScore: 0,
      duration: '2-3 hours',
      cost: 'Low'
    },
    {
      id: 'game_night',
      name: 'Game Night',
      category: 'entertainment',
      description: 'Play games together and enjoy friendly competition',
      matchScore: 0,
      duration: '2-3 hours',
      cost: 'Low'
    },
    {
      id: 'coffee_date',
      name: 'Coffee Date',
      category: 'food',
      description: 'Enjoy a relaxing time at a coffee shop',
      matchScore: 0,
      duration: '1-2 hours',
      cost: 'Low'
    }
  ];

  getImportanceWeight(importance: number): number {
    const weights = {
      1: 0.5,   // 不重要
      2: 0.8,   // 不太重要
      3: 1.0,   // 一般重要
      4: 1.2,   // 很重要
      5: 1.5    // 非常重要
    };
    return weights[importance as keyof typeof weights] || 1.0;
  }

  calculateInterestConsistency(user1Importance: number, user2Importance: number): number {
    const difference = Math.abs(user1Importance - user2Importance);
    const consistencyScore = Math.max(0, 1 - difference * 0.2);
    return consistencyScore;
  }

  calculateCategoryActivity(interests: Interest[]): number {
    if (interests.length === 0) return 0;
    
    const totalImportance = interests.reduce((sum, interest) => sum + interest.importance, 0);
    const maxPossibleImportance = interests.length * 5;
    
    return totalImportance / maxPossibleImportance;
  }

  calculateMatch(user1Interests: Interest[], user2Interests: Interest[]): MatchResult {
    // 计算共同兴趣
    const commonInterests = user1Interests.filter(interest1 =>
      user2Interests.some(interest2 => interest2.id === interest1.id)
    );

    // 计算各分类匹配度
    const categoryScores = this.calculateCategoryScores(user1Interests, user2Interests);

    // 计算总体匹配度
    const overallScore = this.calculateOverallScore(categoryScores, commonInterests, user1Interests, user2Interests);

    // 找出独特兴趣
    const uniqueInterests = {
      user1: user1Interests.filter(interest1 =>
        !user2Interests.some(interest2 => interest2.id === interest1.id)
      ),
      user2: user2Interests.filter(interest2 =>
        !user1Interests.some(interest1 => interest1.id === interest2.id)
      )
    };

    // 推荐活动
    const recommendedActivities = this.recommendActivities(
      commonInterests,
      categoryScores,
      user1Interests,
      user2Interests
    );

    return {
      overallScore,
      categoryScores,
      commonInterests,
      uniqueInterests,
      recommendedActivities
    };
  }

  private calculateCategoryScores(user1Interests: Interest[], user2Interests: Interest[]) {
    const categories = ['entertainment', 'sports', 'food', 'travel'];
    const scores: any = {};

    categories.forEach(category => {
      const user1CategoryInterests = user1Interests.filter(i => i.category === category);
      const user2CategoryInterests = user2Interests.filter(i => i.category === category);

      if (user1CategoryInterests.length === 0 && user2CategoryInterests.length === 0) {
        scores[category] = 0;
        return;
      }

      // 计算该分类的共同兴趣
      const commonCategoryInterests = user1CategoryInterests.filter(interest1 =>
        user2CategoryInterests.some(interest2 => interest2.id === interest1.id)
      );

      // 计算兴趣重叠度
      const totalInterests = new Set([
        ...user1CategoryInterests.map(i => i.id),
        ...user2CategoryInterests.map(i => i.id)
      ]).size;
      const overlapScore = commonCategoryInterests.length / Math.max(totalInterests, 1);

      // 计算共同兴趣的加权得分
      const commonWeightedScore = commonCategoryInterests.reduce((sum, interest) => {
        const user1Importance = user1Interests.find(i => i.id === interest.id)?.importance || 3;
        const user2Importance = user2Interests.find(i => i.id === interest.id)?.importance || 3;
        
        const user1Weight = this.getImportanceWeight(user1Importance);
        const user2Weight = this.getImportanceWeight(user2Importance);
        const consistency = this.calculateInterestConsistency(user1Importance, user2Importance);
        
        return sum + (user1Weight + user2Weight) * consistency * 0.5;
      }, 0) / Math.max(commonCategoryInterests.length, 1);

      // 计算分类活跃度（考虑单独兴趣的重要性）
      const user1Activity = this.calculateCategoryActivity(user1CategoryInterests);
      const user2Activity = this.calculateCategoryActivity(user2CategoryInterests);
      const activityScore = (user1Activity + user2Activity) * 0.5;

      // 计算单独兴趣的兼容性
      const uniqueUser1Interests = user1CategoryInterests.filter(interest1 =>
        !user2CategoryInterests.some(interest2 => interest2.id === interest1.id)
      );
      const uniqueUser2Interests = user2CategoryInterests.filter(interest2 =>
        !user1CategoryInterests.some(interest1 => interest1.id === interest2.id)
      );

      const uniqueCompatibilityScore = this.calculateUniqueInterestCompatibility(
        uniqueUser1Interests, 
        uniqueUser2Interests,
        user1CategoryInterests,
        user2CategoryInterests
      );

      // 综合得分计算
      const finalScore = (
        overlapScore * 0.4 +                    // 兴趣重叠度权重 40%
        commonWeightedScore * 0.4 +            // 共同兴趣加权权重 40%
        activityScore * 0.1 +                   // 分类活跃度权重 10%
        uniqueCompatibilityScore * 0.1         // 单独兴趣兼容性权重 10%
      ) * 100;

      scores[category] = Math.min(100, Math.round(finalScore));
    });

    return scores;
  }

  private calculateUniqueInterestCompatibility(
    uniqueUser1Interests: Interest[],
    uniqueUser2Interests: Interest[],
    user1CategoryInterests: Interest[],
    user2CategoryInterests: Interest[]
  ): number {
    if (uniqueUser1Interests.length === 0 && uniqueUser2Interests.length === 0) {
      return 1.0;
    }

    // 计算用户的整体兴趣强度，如果一个人在该分类很有兴趣，而另一个人没有，这会降低兼容性
    const user1OverallImportance = this.calculateCategoryActivity(user1CategoryInterests);
    const user2OverallImportance = this.calculateCategoryActivity(user2CategoryInterests);

    // 如果双方都很活跃，但没有共同兴趣，兼容性较低
    if (user1OverallImportance > 0.6 && user2OverallImportance > 0.6) {
      return 0.3; // 低兼容性
    }

    // 如果一方活跃，另一方不活跃，兼容性中等
    if (Math.abs(user1OverallImportance - user2OverallImportance) > 0.4) {
      return 0.6; // 中等兼容性
    }

    // 如果双方都不太活跃，兼容性较高
    return 0.8; // 高兼容性
  }

  private calculateOverallScore(categoryScores: any, commonInterests: Interest[], user1Interests: Interest[], user2Interests: Interest[]): number {
    // 计算动态权重，基于用户兴趣分布
    const user1CategoryDistribution = this.calculateCategoryDistribution(user1Interests);
    const user2CategoryDistribution = this.calculateCategoryDistribution(user2Interests);
    
    // 计算加权平均分
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(categoryScores).forEach(([category, score]) => {
      const user1Weight = user1CategoryDistribution[category] || 0;
      const user2Weight = user2CategoryDistribution[category] || 0;
      const combinedWeight = (user1Weight + user2Weight) * 0.5;
      
      weightedSum += (score as number) * combinedWeight;
      totalWeight += combinedWeight;
    });
    
    const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // 计算重要性一致性奖励
    const consistencyBonus = this.calculateConsistencyBonus(commonInterests, user1Interests, user2Interests);
    
    // 计算兴趣多样性奖励
    const diversityBonus = this.calculateDiversityBonus(user1Interests, user2Interests);
    
    // 共同兴趣基础奖励
    const commonInterestBonus = Math.min(15, commonInterests.length * 3);
    
    // 最终得分
    const finalScore = weightedAverage + consistencyBonus + diversityBonus + commonInterestBonus;
    
    return Math.min(100, Math.round(finalScore));
  }

  private calculateCategoryDistribution(interests: Interest[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    const totalImportance = interests.reduce((sum, interest) => sum + interest.importance, 0);
    
    if (totalImportance === 0) return distribution;
    
    interests.forEach(interest => {
      distribution[interest.category] = (distribution[interest.category] || 0) + interest.importance;
    });
    
    // 归一化为权重
    Object.keys(distribution).forEach(category => {
      distribution[category] = distribution[category] / totalImportance;
    });
    
    return distribution;
  }

  private calculateConsistencyBonus(commonInterests: Interest[], user1Interests: Interest[], user2Interests: Interest[]): number {
    if (commonInterests.length === 0) return 0;
    
    const totalConsistency = commonInterests.reduce((sum, interest) => {
      const user1Importance = user1Interests.find(i => i.id === interest.id)?.importance || 3;
      const user2Importance = user2Interests.find(i => i.id === interest.id)?.importance || 3;
      const consistency = this.calculateInterestConsistency(user1Importance, user2Importance);
      return sum + consistency;
    }, 0);
    
    const averageConsistency = totalConsistency / commonInterests.length;
    
    // 一致性越高，奖励越多，最多10分
    return Math.round(averageConsistency * 10);
  }

  private calculateDiversityBonus(user1Interests: Interest[], user2Interests: Interest[]): number {
    const user1Categories = new Set(user1Interests.map(i => i.category));
    const user2Categories = new Set(user2Interests.map(i => i.category));
    const allCategories = new Set(Array.from(user1Categories).concat(Array.from(user2Categories)));
    
    // 如果双方覆盖的类别多样，给予奖励，最多5分
    const diversityRatio = allCategories.size / 4; // 4个总类别
    return Math.round(diversityRatio * 5);
  }

  private recommendActivities(
    commonInterests: Interest[],
    categoryScores: any,
    user1Interests: Interest[],
    user2Interests: Interest[]
  ): Activity[] {
    const allInterests = [...user1Interests, ...user2Interests];
    const interestCounts = new Map<string, number>();
    
    allInterests.forEach(interest => {
      interestCounts.set(interest.id, (interestCounts.get(interest.id) || 0) + 1);
    });

    return this.activities
      .map(activity => {
        // 基础分类得分
        const categoryScore = categoryScores[activity.category] || 0;
        
        // 计算相关兴趣的重要性加权匹配度
        const relatedInterests = this.getRelatedInterests(activity.category);
        const weightedRelatedScore = relatedInterests.reduce((sum, interestId) => {
          const count = interestCounts.get(interestId) || 0;
          if (count === 0) return sum;
          
          // 找到这个兴趣在用户列表中的重要性
          const user1Interest = user1Interests.find(i => i.id === interestId);
          const user2Interest = user2Interests.find(i => i.id === interestId);
          
          let importanceScore = 0;
          if (count === 2 && user1Interest && user2Interest) {
            // 共同兴趣，计算加权重要性
            const user1Weight = this.getImportanceWeight(user1Interest.importance);
            const user2Weight = this.getImportanceWeight(user2Interest.importance);
            const consistency = this.calculateInterestConsistency(user1Interest.importance, user2Interest.importance);
            importanceScore = (user1Weight + user2Weight) * consistency * 15;
          } else if (count === 1) {
            // 单独兴趣，给予较少分数
            const interest = user1Interest || user2Interest;
            if (interest) {
              const weight = this.getImportanceWeight(interest.importance);
              importanceScore = weight * 5;
            }
          }
          
          return sum + importanceScore;
        }, 0);

        // 计算用户对该活动类别的重要性偏好
        const categoryPreferenceScore = this.calculateCategoryPreferenceScore(
          activity.category, 
          user1Interests, 
          user2Interests
        );

        // 计算总匹配度，使用更平衡的权重
        const matchScore = Math.round(
          categoryScore * 0.5 +                    // 基础分类得分权重 50%
          weightedRelatedScore * 0.3 +            // 相关兴趣重要性权重 30%
          categoryPreferenceScore * 0.2           // 类别偏好权重 20%
        );

        return {
          ...activity,
          matchScore
        };
      })
      .filter(activity => activity.matchScore > 25)  // 降低过滤阈值
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  }

  private calculateCategoryPreferenceScore(
    category: string, 
    user1Interests: Interest[], 
    user2Interests: Interest[]
  ): number {
    const user1CategoryInterests = user1Interests.filter(i => i.category === category);
    const user2CategoryInterests = user2Interests.filter(i => i.category === category);
    
    if (user1CategoryInterests.length === 0 && user2CategoryInterests.length === 0) {
      return 0;
    }

    // 计算用户对该类别的重要性平均值
    const user1AvgImportance = user1CategoryInterests.length > 0 
      ? user1CategoryInterests.reduce((sum, i) => sum + i.importance, 0) / user1CategoryInterests.length
      : 0;
    
    const user2AvgImportance = user2CategoryInterests.length > 0
      ? user2CategoryInterests.reduce((sum, i) => sum + i.importance, 0) / user2CategoryInterests.length
      : 0;

    // 使用重要性权重计算偏好得分
    const user1WeightedScore = user1AvgImportance > 0 ? this.getImportanceWeight(user1AvgImportance) * 50 : 0;
    const user2WeightedScore = user2AvgImportance > 0 ? this.getImportanceWeight(user2AvgImportance) * 50 : 0;

    // 如果双方都有该类别的兴趣，给予额外奖励
    const bothInterested = user1CategoryInterests.length > 0 && user2CategoryInterests.length > 0;
    const bonus = bothInterested ? 20 : 0;

    return Math.min(100, (user1WeightedScore + user2WeightedScore) * 0.5 + bonus);
  }

  private getRelatedInterests(category: string): string[] {
    const relatedMap: Record<string, string[]> = {
      entertainment: ['movies', 'music', 'games', 'concerts', 'theater', 'art'],
      sports: ['basketball', 'football', 'tennis', 'swimming', 'hiking', 'yoga'],
      food: ['chinese', 'western', 'japanese', 'dessert', 'coffee', 'cooking'],
      travel: ['beach', 'mountains', 'city', 'countryside', 'museum', 'shopping']
    };

    return relatedMap[category] || [];
  }

  getMatchLevel(score: number): string {
    if (score >= 90) return 'Perfect Match 💕';
    if (score >= 80) return 'Deep Connection 💖';
    if (score >= 70) return 'Great Compatibility 💗';
    if (score >= 60) return 'Good Attraction 💓';
    return 'Room to Grow 💝';
  }

  getCategoryName(category: string): string {
    const names: Record<string, string> = {
      entertainment: 'Entertainment',
      sports: 'Sports',
      food: 'Food',
      travel: 'Travel'
    };
    return names[category] || category;
  }
}
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

  calculateMatch(user1Interests: Interest[], user2Interests: Interest[]): MatchResult {
    // 计算共同兴趣
    const commonInterests = user1Interests.filter(interest1 =>
      user2Interests.some(interest2 => interest2.id === interest1.id)
    );

    // 计算各分类匹配度
    const categoryScores = this.calculateCategoryScores(user1Interests, user2Interests);

    // 计算总体匹配度
    const overallScore = this.calculateOverallScore(categoryScores, commonInterests);

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

      // 计算匹配度
      const totalInterests = new Set([
        ...user1CategoryInterests.map(i => i.id),
        ...user2CategoryInterests.map(i => i.id)
      ]).size;

      const commonScore = commonCategoryInterests.length / Math.max(totalInterests, 1);
      
      // 考虑重要程度
      const importanceWeight = commonCategoryInterests.reduce((sum, interest) => {
        const user1Importance = user1Interests.find(i => i.id === interest.id)?.importance || 1;
        const user2Importance = user2Interests.find(i => i.id === interest.id)?.importance || 1;
        return sum + (user1Importance + user2Importance) / 2;
      }, 0) / Math.max(commonCategoryInterests.length, 1);

      scores[category] = Math.min(100, Math.round(commonScore * importanceWeight * 100));
    });

    return scores;
  }

  private calculateOverallScore(categoryScores: any, commonInterests: Interest[]): number {
    const categoryAverage = Object.values(categoryScores).reduce((sum: number, score: any) => sum + score, 0) / 4;
    const commonInterestBonus = Math.min(20, commonInterests.length * 5);
    
    return Math.min(100, Math.round(categoryAverage + commonInterestBonus));
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
        // 根据活动类别计算匹配度
        const categoryScore = categoryScores[activity.category] || 0;
        
        // 计算相关兴趣的匹配度
        const relatedInterests = this.getRelatedInterests(activity.category);
        const relatedScore = relatedInterests.reduce((sum, interestId) => {
          const count = interestCounts.get(interestId) || 0;
          return sum + (count > 1 ? 10 : 0);
        }, 0);

        // 计算总匹配度
        const matchScore = Math.round((categoryScore * 0.7 + relatedScore * 0.3));

        return {
          ...activity,
          matchScore
        };
      })
      .filter(activity => activity.matchScore > 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
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
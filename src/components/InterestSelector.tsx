import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Interest } from '../types';

interface InterestSelectorProps {
  onSelectionChange: (interests: Interest[]) => void;
  selectedInterests: Interest[];
}

const InterestSelector: React.FC<InterestSelectorProps> = ({
  onSelectionChange,
  selectedInterests
}) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('entertainment');
  
  const interestCategories = [
    {
      id: 'entertainment',
      name: t('interestSelector.categories.entertainment'),
      interests: [
        { id: 'movies', name: t('interestSelector.interests.entertainment.movies'), category: 'entertainment', icon: '🎬', importance: 0 },
        { id: 'music', name: t('interestSelector.interests.entertainment.music'), category: 'entertainment', icon: '🎵', importance: 0 },
        { id: 'games', name: t('interestSelector.interests.entertainment.games'), category: 'entertainment', icon: '🎮', importance: 0 },
        { id: 'concerts', name: t('interestSelector.interests.entertainment.concerts'), category: 'entertainment', icon: '🎤', importance: 0 },
        { id: 'theater', name: t('interestSelector.interests.entertainment.theater'), category: 'entertainment', icon: '🎭', importance: 0 },
        { id: 'art', name: t('interestSelector.interests.entertainment.art'), category: 'entertainment', icon: '🎨', importance: 0 },
      ]
    },
    {
      id: 'sports',
      name: t('interestSelector.categories.sports'),
      interests: [
        { id: 'basketball', name: t('interestSelector.interests.sports.basketball'), category: 'sports', icon: '🏀', importance: 0 },
        { id: 'football', name: t('interestSelector.interests.sports.football'), category: 'sports', icon: '⚽', importance: 0 },
        { id: 'tennis', name: t('interestSelector.interests.sports.tennis'), category: 'sports', icon: '🎾', importance: 0 },
        { id: 'swimming', name: t('interestSelector.interests.sports.swimming'), category: 'sports', icon: '🏊', importance: 0 },
        { id: 'hiking', name: t('interestSelector.interests.sports.hiking'), category: 'sports', icon: '🥾', importance: 0 },
        { id: 'yoga', name: t('interestSelector.interests.sports.yoga'), category: 'sports', icon: '🧘', importance: 0 },
      ]
    },
    {
      id: 'food',
      name: t('interestSelector.categories.food'),
      interests: [
        { id: 'chinese', name: t('interestSelector.interests.food.chinese'), category: 'food', icon: '🥘', importance: 0 },
        { id: 'western', name: t('interestSelector.interests.food.western'), category: 'food', icon: '🍝', importance: 0 },
        { id: 'japanese', name: t('interestSelector.interests.food.japanese'), category: 'food', icon: '🍱', importance: 0 },
        { id: 'dessert', name: t('interestSelector.interests.food.dessert'), category: 'food', icon: '🍰', importance: 0 },
        { id: 'coffee', name: t('interestSelector.interests.food.coffee'), category: 'food', icon: '☕', importance: 0 },
        { id: 'cooking', name: t('interestSelector.interests.food.cooking'), category: 'food', icon: '👨‍🍳', importance: 0 },
      ]
    },
    {
      id: 'travel',
      name: t('interestSelector.categories.travel'),
      interests: [
        { id: 'beach', name: t('interestSelector.interests.travel.beach'), category: 'travel', icon: '🏖️', importance: 0 },
        { id: 'mountains', name: t('interestSelector.interests.travel.mountains'), category: 'travel', icon: '🏔️', importance: 0 },
        { id: 'city', name: t('interestSelector.interests.travel.city'), category: 'travel', icon: '🏙️', importance: 0 },
        { id: 'countryside', name: t('interestSelector.interests.travel.countryside'), category: 'travel', icon: '🌾', importance: 0 },
        { id: 'museum', name: t('interestSelector.interests.travel.museum'), category: 'travel', icon: '🏛️', importance: 0 },
        { id: 'shopping', name: t('interestSelector.interests.travel.shopping'), category: 'travel', icon: '🛍️', importance: 0 },
      ]
    }
  ];

  const currentCategory = interestCategories.find(cat => cat.id === activeCategory);

  const handleInterestClick = (interest: Interest) => {
    const isSelected = selectedInterests.some(selected => selected.id === interest.id);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedInterests.filter(selected => selected.id !== interest.id);
    } else {
      newSelection = [...selectedInterests, interest];
    }
    
    onSelectionChange(newSelection);
  };

  const handleImportanceChange = (interestId: string, importance: number) => {
    const newSelection = selectedInterests.map(interest => 
      interest.id === interestId ? { ...interest, importance } : interest
    );
    onSelectionChange(newSelection);
  };

  const isSelected = (interestId: string) => {
    return selectedInterests.some(selected => selected.id === interestId);
  };

  const getSelectedInterest = (interestId: string) => {
    return selectedInterests.find(selected => selected.id === interestId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">{t('interestSelector.title')}</h2>
        
        {/* 分类标签 */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
          {interestCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-qixi-pink text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 兴趣选择网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {currentCategory?.interests.map(interest => (
            <div
              key={interest.id}
              onClick={() => handleInterestClick(interest)}
              className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isSelected(interest.id)
                  ? 'bg-qixi-pink text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-2xl">{interest.icon}</span>
                  <span className="text-sm sm:text-base font-medium">{interest.name}</span>
                </div>
                {isSelected(interest.id) && (
                  <span className="text-green-300 text-sm sm:text-base">✓</span>
                )}
              </div>
              
              {isSelected(interest.id) && (
                <div className="mt-2 sm:mt-3">
                  <label className="text-xs text-white/80 block mb-1">{t('interestSelector.importance')}</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={getSelectedInterest(interest.id)?.importance || 1}
                    onChange={(e) => handleImportanceChange(interest.id, parseInt(e.target.value))}
                    className="w-full h-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>{t('interestSelector.normal')}</span>
                    <span>{t('interestSelector.veryImportant')}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 已选择的兴趣预览 */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/20">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">{t('interestSelector.selectedInterests', { count: selectedInterests.length })}</h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {selectedInterests.map(interest => (
              <div
                key={interest.id}
                className="bg-qixi-purple text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
              >
                <span className="text-sm sm:text-base">{interest.icon}</span>
                <span className="text-xs sm:text-sm">{interest.name}</span>
                <span className="text-xs bg-white/20 px-1 rounded">
                  {interest.importance}★
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestSelector;
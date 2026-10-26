import React from 'react';
import { 
  Briefcase, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Receipt, 
  Film, 
  Activity, 
  BookOpen, 
  MoreHorizontal 
} from 'lucide-react';
import { CategoryId, CATEGORIES } from '../types/finance';

interface CategoryIconProps {
  category: CategoryId | string;
  size?: number;
  className?: string;
  withBackground?: boolean;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 18,
  className = '',
  withBackground = true,
}) => {
  const cat = CATEGORIES[category as CategoryId] || CATEGORIES.other;

  const renderIcon = () => {
    switch (cat.id) {
      case 'salary':
        return <Briefcase size={size} />;
      case 'food':
        return <Utensils size={size} />;
      case 'transport':
        return <Car size={size} />;
      case 'shopping':
        return <ShoppingBag size={size} />;
      case 'bills':
        return <Receipt size={size} />;
      case 'entertainment':
        return <Film size={size} />;
      case 'health':
        return <Activity size={size} />;
      case 'education':
        return <BookOpen size={size} />;
      default:
        return <MoreHorizontal size={size} />;
    }
  };

  if (!withBackground) {
    return <span style={{ color: cat.color }} className={className}>{renderIcon()}</span>;
  }

  return (
    <div
      style={{
        backgroundColor: `${cat.color}1f`,
        color: cat.color,
      }}
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${className}`}
    >
      {renderIcon()}
    </div>
  );
};

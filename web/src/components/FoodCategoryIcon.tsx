import type { ReactNode } from "react";

type Category = "fruit" | "vegetable" | "dairy" | "protein" | "grains" | "drink" | "pantry";

export function foodCategoryFor(value: string): Category {
  const name = value.toLowerCase();
  if (/apple|avocado|banana|berry|berries|grape|lemon|lime|melon|orange|peach|pear|tomato/.test(name)) return "fruit";
  if (/spinach|carrot|onion|garlic|basil|lettuce|kale|broccoli|pepper|potato|vegetable|herb|scallion/.test(name)) return "vegetable";
  if (/milk|cheese|yogurt|cream|butter/.test(name)) return "dairy";
  if (/egg|chicken|beef|pork|fish|tofu|bean|lentil|protein/.test(name)) return "protein";
  if (/bread|rice|pasta|noodle|flour|oat|cereal|grain|tortilla/.test(name)) return "grains";
  if (/juice|soda|tea|coffee|water|drink|beverage/.test(name)) return "drink";
  return "pantry";
}

const paths: Record<Category, ReactNode> = {
  fruit: <><path d="M12 7c-2.8-2.2-6-.5-6 3.4C6 15.3 9.1 19 12 19s6-3.7 6-8.6C18 6.5 14.8 4.8 12 7Z" /><path d="M12 7c0-2.1 1.2-3.5 3.5-4M13.5 5c1.5 0 2.7.5 3.5 1.5" /></>,
  vegetable: <><path d="M5 18c6.4 0 11-4.6 13-12-7.4 1.8-12 6.4-12 13" /><path d="M6 18c3.3-3.4 6.6-6 10-8" /></>,
  dairy: <><path d="M8 4h7l2 4v12H7V8l1-4Z" /><path d="M8 4h7M7 8h10M11 4v4" /></>,
  protein: <><path d="M12 4c3.7 0 6.5 5.2 6.5 9.1A6.5 6.5 0 1 1 5.5 13C5.5 9.2 8.3 4 12 4Z" /></>,
  grains: <><path d="M12 20V5M12 8 8.5 5.5M12 11 8 8.5M12 14 8.5 12M12 8l3.5-2.5M12 11 16 8.5M12 14l3.5-2" /></>,
  drink: <><path d="M7 8h10l-1 12H8L7 8Z" /><path d="m13 8 2-5h3M9 12h6" /></>,
  pantry: <><path d="M7 8h10v11H7V8ZM8 5h8l1 3H7l1-3Z" /><path d="M10 12h4M10 15h4" /></>,
};

export function FoodCategoryIcon({ name, size = 30 }: { name: string; size?: number }) {
  const category = foodCategoryFor(name);
  return <svg className="food-category-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={`${category} category`}>
    {paths[category]}
  </svg>;
}

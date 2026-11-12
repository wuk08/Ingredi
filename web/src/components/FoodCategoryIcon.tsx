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

const art: Record<Category, ReactNode> = {
  fruit: <>
    <path fill="#E86F51" d="M12 7.2c-2.9-2.3-6.5-.5-6.5 3.7C5.5 16 8.8 20 12 20s6.5-4 6.5-9.1c0-4.2-3.6-6-6.5-3.7Z" />
    <path fill="#F39A68" d="M12 7.2c-1.8-1.4-3.8-.9-5.1.5 4.4.4 7.1 3.7 7.1 8.3 0 1.2-.2 2.2-.5 3.2 2.7-1.1 5-4.5 5-8.3 0-4.2-3.6-6-6.5-3.7Z" />
    <path fill="#46795A" d="M12.4 6.9c.2-2.5 1.8-4.1 4.7-4.3-.3 2.7-2 4.1-4.7 4.3Z" />
    <path fill="#754F3B" d="M11.3 7.2c-.1-2 .5-3.4 1.8-4.5l.9 1c-1 .9-1.4 2-1.3 3.5h-1.4Z" />
  </>,
  vegetable: <>
    <path fill="#4E8060" d="M11.8 19.8C6.5 19 4 15.9 4.2 10.4c5.4.5 8.3 3.4 7.6 9.4Z" />
    <path fill="#72A864" d="M12.2 19.8c-.7-6 2.2-8.9 7.6-9.4.2 5.5-2.3 8.6-7.6 9.4Z" />
    <path fill="#A3C86F" d="M12 21a.9.9 0 0 1-.9-.9V9.2c0-.5.4-.9.9-.9s.9.4.9.9v10.9c0 .5-.4.9-.9.9Z" />
  </>,
  dairy: <>
    <path fill="#D9ECF0" d="M7 7.4h10V20H7z" />
    <path fill="#78AFC3" d="m8 3.5h6.5L17 7.4H7L8 3.5Z" />
    <path fill="#4F8FA8" d="M12.5 3.5h2L17 7.4h-4.5z" />
    <path fill="#FFFFFF" d="M9 10h6v6H9z" />
    <path fill="#72A864" d="M12 11.2c1.5 1.2 2.2 2.1 2.2 3a2.2 2.2 0 0 1-4.4 0c0-.9.7-1.8 2.2-3Z" />
  </>,
  protein: <>
    <path fill="#F5E9D0" d="M12 3.5c4.2 0 7.5 5.8 7.5 10.3a7.5 7.5 0 1 1-15 0C4.5 9.3 7.8 3.5 12 3.5Z" />
    <circle cx="12" cy="14" r="3.8" fill="#F2B84B" />
    <circle cx="10.8" cy="12.8" r="1.1" fill="#FFD66B" />
  </>,
  grains: <>
    <path fill="#9C7241" d="M11.2 3.2h1.6v17.7h-1.6z" />
    <path fill="#E2AC45" d="M10.8 7.9C7.9 7.5 6.5 5.9 6.4 3c2.9.2 4.4 1.8 4.4 4.9ZM13.2 7.9c2.9-.4 4.3-2 4.4-4.9-2.9.2-4.4 1.8-4.4 4.9ZM10.8 13.4c-2.9-.4-4.3-2-4.4-4.9 2.9.2 4.4 1.8 4.4 4.9ZM13.2 13.4c2.9-.4 4.3-2 4.4-4.9-2.9.2-4.4 1.8-4.4 4.9ZM10.8 18.8c-2.9-.4-4.3-2-4.4-4.9 2.9.2 4.4 1.8 4.4 4.9ZM13.2 18.8c2.9-.4 4.3-2 4.4-4.9-2.9.2-4.4 1.8-4.4 4.9Z" />
  </>,
  drink: <>
    <path fill="#6BC0C7" d="M6.5 7.5h11L16.3 21H7.7L6.5 7.5Z" />
    <path fill="#A6E0DB" d="M8.2 11h7.6l-.7 7.8H8.9L8.2 11Z" />
    <path fill="#E86F51" d="m13.1 8.2 2.1-5.4h3.2v1.7h-2L14.7 9l-1.6-.8Z" />
    <path fill="#FFFFFF" d="M8 8.6h8v1.5H8z" />
  </>,
  pantry: <>
    <path fill="#E9C56A" d="M6.5 7.5h11v12.8h-11z" />
    <path fill="#B97A52" d="M7.5 3.5h9L18 7.5H6l1.5-4Z" />
    <path fill="#8E5D43" d="M7.5 3.5h9v1.8h-9z" />
    <path fill="#FFF4D6" d="M8.5 10.3h7v5.7h-7z" />
    <path fill="#E86F51" d="M10.2 12h3.6v2.3h-3.6z" />
  </>,
};

export function FoodCategoryIcon({ name, size = 40 }: { name: string; size?: number }) {
  const category = foodCategoryFor(name);
  return <svg className="food-category-icon" width={size} height={size} viewBox="2 2 20 20" role="img" aria-label={`${category} category`}>
    {art[category]}
  </svg>;
}

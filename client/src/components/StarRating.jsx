import { Star } from 'lucide-react';

export function StarRating({ value, size = 16 }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= full ? 'fill-accent text-accent' : 'text-slate-200'}
          strokeWidth={i <= full ? 0 : 1.5}
        />
      ))}
    </span>
  );
}

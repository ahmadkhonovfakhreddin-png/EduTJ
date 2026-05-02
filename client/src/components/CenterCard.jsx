import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck } from 'lucide-react';
import { CATEGORY_LABELS } from '../constants';
import { StarRating } from './StarRating';

export function CenterCard({ center }) {
  return (
    <Link
      to={`/centers/${center.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
    >
      <div className="relative h-28 bg-slate-100">
        {center.coverImage ? (
          <img
            src={center.coverImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/30" />
        )}
        <div className="absolute -bottom-6 left-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-white shadow-md">
          {center.logo ? (
            <img src={center.logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-primary">{center.name?.[0]}</span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
            {center.name}
          </h3>
          {center.isVerified && (
            <BadgeCheck className="h-5 w-5 shrink-0 text-primary" aria-label="Verified" />
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {center.city}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <StarRating value={center.avgRating || 0} size={14} />
          <span className="text-xs text-slate-500">
            {center.avgRating?.toFixed?.(1) ?? '0'} ({center.reviewCount ?? 0})
          </span>
        </div>
        {center.topCategories?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {center.topCategories.slice(0, 3).map((c) => (
              <span
                key={c}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {CATEGORY_LABELS[c] || c}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

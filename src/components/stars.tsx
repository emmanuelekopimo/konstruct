import { Star } from "lucide-react";

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="stars" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {rating.toFixed(1)}
      <Star size={12} fill="currentColor" strokeWidth={0} />
      {reviews !== undefined && <span>({reviews})</span>}
    </span>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Star, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

interface Review {
  id: string;
  buyerName: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

interface Props {
  productId: string;
  themeColor: string;
}

export default function ReviewsSection({ productId, themeColor }: Props) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ReviewsData>(`/api/reviews/product/${productId}`)
      .then((reviewsData) => {
        setData(reviewsData);
      })
      .catch(() => {
        // Silent fail - reviews are optional
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!data || data.totalReviews === 0) {
    return null; // Don't show section if no reviews
  }

  return (
    <section className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(data.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {data.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">
                ({data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {data.reviews.map((review) => (
          <div key={review.id} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{review.buyerName}</span>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            {review.comment && (
              <p className="text-sm text-gray-600 leading-relaxed mt-2">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

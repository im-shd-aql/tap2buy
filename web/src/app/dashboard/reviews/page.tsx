"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Star, ShieldCheck, Check, Trash2, MessageSquare } from "lucide-react";
import Image from "next/image";

interface Review {
  id: string;
  buyerName: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

export default function ReviewsPage() {
  const { token } = useAuth();
  const { store } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  useEffect(() => {
    loadReviews();
  }, [token, store]);

  function loadReviews() {
    if (!token || !store) return;
    setLoading(true);
    api
      .get<{ reviews: Review[] }>(`/api/reviews/store/${store.id}`, { token })
      .then((data) => {
        setReviews(data.reviews);
      })
      .catch((err) => {
        console.error("Failed to load reviews:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function approveReview(reviewId: string) {
    if (!token) return;
    try {
      await api.put(`/api/reviews/${reviewId}/approve`, {}, { token });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, isApproved: true } : r))
      );
    } catch (err) {
      console.error("Failed to approve review:", err);
    }
  }

  async function deleteReview(reviewId: string) {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/api/reviews/${reviewId}`, { token });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.isApproved;
    if (filter === "approved") return r.isApproved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Reviews</h1>
        <p className="text-gray-500 mt-1">Moderate and manage product reviews</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === "pending"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === "approved"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === "all"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All
        </button>
      </div>

      {/* Reviews list */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {filter === "pending" ? "No pending reviews" : "No reviews yet"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Reviews will appear here once customers leave feedback
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex gap-4">
                {/* Product image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {review.product.images[0] ? (
                    <Image
                      src={review.product.images[0]}
                      alt={review.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      No image
                    </div>
                  )}
                </div>

                {/* Review content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-0.5 truncate">
                        {review.product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">
                          {review.buyerName}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        {review.isApproved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold">
                            <Check className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()} at{" "}
                        {new Date(review.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {!review.isApproved && (
                        <button
                          onClick={() => approveReview(review.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { use } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useCategoryStyles } from "@/hooks/useCategoryStyles";
import { RecommendationForm } from "@/components/admin/RecommendationForm";

export default function EditRecommendationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { recommendations, loading } = useRecommendations();
  const { categoryStyles, loading: stylesLoading } = useCategoryStyles();

  if (loading || stylesLoading) return <p className="text-sm text-neutral-500">Loading...</p>;

  const recommendation = recommendations.find((r) => r.id === id);
  if (!recommendation) return <p className="text-sm text-red-600">Recommendation not found.</p>;

  const selectsCount = recommendations.filter((r) => r.isSelect).length;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-[#1B1408]">Edit Recommendation</h1>
      <RecommendationForm
        recommendation={recommendation}
        categoryStyles={categoryStyles}
        selectsCount={selectsCount}
      />
    </div>
  );
}

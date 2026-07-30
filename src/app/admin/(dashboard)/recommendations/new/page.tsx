"use client";

import { useRecommendations } from "@/hooks/useRecommendations";
import { useCategoryStyles } from "@/hooks/useCategoryStyles";
import { RecommendationForm } from "@/components/admin/RecommendationForm";

export default function NewRecommendationPage() {
  const { recommendations, loading } = useRecommendations();
  const { categoryStyles, loading: stylesLoading } = useCategoryStyles();

  if (loading || stylesLoading) return <p className="text-sm text-neutral-500">Loading...</p>;

  const selectsCount = recommendations.filter((r) => r.isSelect).length;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-[#1B1408]">New Recommendation</h1>
      <RecommendationForm recommendation={null} categoryStyles={categoryStyles} selectsCount={selectsCount} />
    </div>
  );
}

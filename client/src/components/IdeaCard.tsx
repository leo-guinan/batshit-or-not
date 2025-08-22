import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share, BarChart3 } from "lucide-react";
import type { Idea, User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import saneButton from "@assets/ChatGPT Image Aug 22, 2025, 06_02_42 PM_1755900175658.png";
import confusingButton from "@assets/ChatGPT Image Aug 22, 2025, 06_02_40 PM_1755900175658.png";
import batshitButton from "@assets/ChatGPT Image Aug 22, 2025, 06_02_38 PM_1755900175657.png";

interface IdeaCardProps {
  idea: Idea & { author: User | null };
  onRate: (ideaId: string, rating: number) => void;
  isRatingPending?: boolean;
}

const RATING_OPTIONS = [
  { 
    value: 3, 
    name: "SANE", 
    image: saneButton,
    bgColor: "#28A745",
    description: "Pretty normal idea"
  },
  { 
    value: 6, 
    name: "CONFUSING", 
    image: confusingButton,
    bgColor: "#F39C3C",
    description: "Wait... what now?"
  },
  { 
    value: 10, 
    name: "BATSHIT", 
    image: batshitButton,
    bgColor: "#DC3545",
    description: "Absolutely unhinged!"
  },
];

const CATEGORY_COLORS = {
  technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  lifestyle: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  science: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  art: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  social: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function IdeaCard({ idea, onRate, isRatingPending }: IdeaCardProps) {
  const { user } = useAuth();
  const [showRatingButtons, setShowRatingButtons] = useState(false);

  // Check if user has already rated this idea
  const { data: ratingCheck } = useQuery<{ hasRated: boolean; rating?: number }>({
    queryKey: ['/api/ratings/check', idea.id],
    enabled: !!user,
  });

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const ideaDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - ideaDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return "text-primary";
    if (rating >= 7) return "text-orange-500";
    if (rating >= 5) return "text-accent";
    if (rating >= 3) return "text-secondary";
    return "text-success";
  };

  const handleRatingClick = (rating: number) => {
    onRate(idea.id, rating);
    setShowRatingButtons(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this idea on Batshit or Not",
          text: idea.text,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback - copy to clipboard
      const url = `${window.location.origin}?idea=${idea.id}`;
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <Card className="idea-card bg-card border border-border" data-testid={`card-idea-${idea.id}`}>
      <CardContent className="p-6">
        {/* Author Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {!idea.isAnonymous && idea.author ? (
              <>
                {idea.author.profileImageUrl ? (
                  <img 
                    src={idea.author.profileImageUrl} 
                    alt="Author avatar" 
                    className="w-10 h-10 rounded-full object-cover"
                    data-testid="author-avatar"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold">
                    {idea.author.firstName?.[0] || idea.author.email?.[0] || '?'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground text-sm" data-testid="author-name">
                    {idea.author.firstName || idea.author.email?.split('@')[0] || 'Anonymous'}
                  </p>
                  <p className="text-muted-foreground text-xs" data-testid="idea-time">
                    {formatTimeAgo(idea.createdAt!)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">?</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Anonymous</p>
                  <p className="text-muted-foreground text-xs" data-testid="idea-time">
                    {formatTimeAgo(idea.createdAt!)}
                  </p>
                </div>
              </>
            )}
          </div>
          <Badge 
            className={CATEGORY_COLORS[idea.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other}
            data-testid="idea-category"
          >
            {idea.category}
          </Badge>
        </div>

        {/* Idea Text */}
        <div className="mb-4">
          <p className="text-foreground text-base leading-relaxed" data-testid="idea-text">
            {idea.text}
          </p>
        </div>

        {/* Rating Interface */}
        {!ratingCheck?.hasRated ? (
          <div className="bg-muted rounded-xl p-4 mb-4">
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">How batshit is this idea?</p>
            </div>
            
            {showRatingButtons ? (
              <div className="space-y-3">
                {RATING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className="w-full h-20 rounded-2xl transition-all duration-300 ease-out hover:scale-105 active:scale-95 transform-gpu overflow-hidden shadow-lg hover:shadow-xl"
                    onClick={() => handleRatingClick(option.value)}
                    disabled={isRatingPending}
                    data-testid={`rating-button-${option.value}`}
                  >
                    <img 
                      src={option.image} 
                      alt={option.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                
                {/* Back to simple rating button */}
                <button
                  onClick={() => setShowRatingButtons(false)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  Choose different way to rate
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowRatingButtons(true)}
                className="w-full"
                data-testid="button-show-rating"
              >
                Rate This Idea
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-muted rounded-xl p-4 mb-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">You rated this idea:</p>
            <div className={`text-lg font-bold ${getRatingColor(ratingCheck.rating!)}`}>
              {ratingCheck.rating}/10
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1" data-testid="rating-count">
              <BarChart3 className="w-4 h-4 text-secondary" />
              <span>{idea.ratingCount} ratings</span>
            </span>
            <button 
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
          {idea.ratingCount >= 10 && (
            <div className="flex items-center space-x-1">
              <span className={`text-lg font-bold ${getRatingColor(idea.averageRating!)}`} data-testid="average-rating">
                {idea.averageRating!.toFixed(1)}
              </span>
              <span className="text-xs">avg</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

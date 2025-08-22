import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import IdeaCard from "@/components/IdeaCard";
import SubmissionModal from "@/components/SubmissionModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Idea, User } from "@shared/schema";

type FeedType = 'fresh' | 'trending' | 'hall-of-fame';

export default function Home() {
  const [currentFeed, setCurrentFeed] = useState<FeedType>('fresh');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: ideas, isLoading: ideasLoading, error: ideasError } = useQuery<(Idea & { author: User | null })[]>({
    queryKey: ['/api/ideas', currentFeed],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?filter=${queryKey[1]}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async ({ ideaId, rating }: { ideaId: string; rating: number }) => {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, rating }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      toast({
        title: "Rating submitted!",
        description: "Thanks for rating this idea.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message.includes('already rated') ? "You've already rated this idea!" : "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const handleRating = (ideaId: string, rating: number) => {
    ratingMutation.mutate({ ideaId, rating });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="brand-header shadow-lg border-b border-primary/20 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-float">
                <div className="text-white text-lg animate-wiggle">🦇</div>
              </div>
              <h1 className="text-xl font-black text-white tracking-wide" data-testid="app-title" style={{ fontFamily: 'var(--font-display)' }}>
                BATSHIT OR NOT
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative p-2 text-white/80 hover:text-white transition-colors">
                <div className="text-lg animate-bounce-gentle">🔔</div>
              </div>
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="User avatar" 
                  className="w-10 h-10 rounded-xl border-2 border-white/30 object-cover hover:scale-110 transition-transform"
                  data-testid="user-avatar"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform">
                  {user?.firstName?.[0] || user?.email?.[0] || '?'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Feed Tabs */}
      <div className="max-w-md mx-auto px-4 py-4 bg-gradient-to-r from-accent/50 to-background border-b border-border">
        <div className="flex space-x-2 bg-muted/80 rounded-xl p-2 shadow-inner">
          <button
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
              currentFeed === 'fresh' 
                ? 'bg-gradient-to-r from-primary to-destructive text-white shadow-lg' 
                : 'text-muted-foreground hover:bg-card hover:text-foreground'
            }`}
            onClick={() => setCurrentFeed('fresh')}
            data-testid="tab-fresh"
          >
            🔥 FRESH
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
              currentFeed === 'trending' 
                ? 'bg-gradient-to-r from-primary to-destructive text-white shadow-lg' 
                : 'text-muted-foreground hover:bg-card hover:text-foreground'
            }`}
            onClick={() => setCurrentFeed('trending')}
            data-testid="tab-trending"
          >
            📈 TRENDING
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
              currentFeed === 'hall-of-fame' 
                ? 'bg-gradient-to-r from-primary to-destructive text-white shadow-lg' 
                : 'text-muted-foreground hover:bg-card hover:text-foreground'
            }`}
            onClick={() => setCurrentFeed('hall-of-fame')}
            data-testid="tab-hall-of-fame"
          >
            🏆 FAME
          </button>
        </div>
      </div>

      {/* Main Feed */}
      <main className="max-w-md mx-auto px-4 pb-20">
        {ideasLoading ? (
          <div className="space-y-4 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
                <div className="h-20 bg-muted rounded-xl mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-6 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : ideas && ideas.length > 0 ? (
          <div className="space-y-4 mt-4">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onRate={handleRating}
                isRatingPending={ratingMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-destructive rounded-xl flex items-center justify-center mx-auto mb-6 animate-float shadow-xl">
              <div className="text-3xl animate-wiggle">🦇</div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              NO IDEAS YET!
            </h3>
            <p className="text-muted-foreground mb-6">The chaos awaits your brilliant madness</p>
            <button
              onClick={() => setIsSubmissionModalOpen(true)}
              className="batshit-button animate-batshit-bounce"
              data-testid="button-submit-first-idea"
            >
              🚀 Submit the First Idea!
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-20 right-4 w-16 h-16 bg-gradient-to-br from-primary via-destructive to-secondary text-white rounded-xl shadow-xl flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all animate-float border-2 border-white/20"
        onClick={() => setIsSubmissionModalOpen(true)}
        data-testid="button-add-idea"
      >
        <Plus className="w-8 h-8 animate-crazy-shake" />
      </button>

      {/* Navigation */}
      <Navigation currentPage="home" />

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
      />
    </div>
  );
}

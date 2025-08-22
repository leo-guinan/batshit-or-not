import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, BarChart } from "lucide-react";
import type { User, UserStats } from "@shared/schema";

interface ProfileData {
  user: User;
  stats: UserStats;
}

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: profileData, isLoading: profileLoading, error } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized", 
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const { user: userData, stats } = profileData;

  const getDisplayName = () => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    if (userData.firstName) {
      return userData.firstName;
    }
    return userData.email?.split('@')[0] || 'User';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return "Absolutely Batshit";
    if (rating >= 7) return "Certified Crazy";
    if (rating >= 5) return "Getting Weird";
    if (rating >= 3) return "Mildly Quirky";
    return "Boringly Sane";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground" data-testid="profile-title">Profile</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-20">
        {/* User Info */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            {userData.profileImageUrl ? (
              <img 
                src={userData.profileImageUrl} 
                alt="Profile"
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-secondary object-cover"
                data-testid="profile-image"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-secondary-foreground">
                {getDisplayName()[0]}
              </div>
            )}
            <h2 className="text-xl font-bold text-foreground mb-2" data-testid="profile-name">
              {getDisplayName()}
            </h2>
            <p className="text-muted-foreground text-sm mb-4" data-testid="profile-email">
              {userData.email}
            </p>
            <p className="text-muted-foreground text-sm">
              Dreaming up the impossible, one idea at a time
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="stat-ideas">
                {stats.ideasSubmitted}
              </div>
              <div className="text-xs text-muted-foreground">Ideas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary mb-1" data-testid="stat-avg-rating">
                {stats.averageRatingReceived?.toFixed(1) || '0.0'}
              </div>
              <div className="text-xs text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1" data-testid="stat-ratings-given">
                {stats.ratingsGiven}
              </div>
              <div className="text-xs text-muted-foreground">Ratings</div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Category */}
        {stats.averageRatingReceived > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold text-foreground mb-2">Your Ideas Are...</h3>
              <div className="text-lg font-bold mb-2" style={{ 
                color: stats.averageRatingReceived >= 7 ? 'hsl(353, 100%, 70%)' : 
                       stats.averageRatingReceived >= 5 ? 'hsl(51, 100%, 70%)' : 
                       'hsl(180, 58%, 61%)'
              }}>
                {getRatingLabel(stats.averageRatingReceived)}
              </div>
              <div className="batshit-scale h-2 rounded-full mb-2"></div>
              <p className="text-xs text-muted-foreground">
                Based on {stats.totalRatingsReceived} ratings
              </p>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-accent" />
              Achievements
            </h3>
            
            <div className="space-y-3">
              {/* First Timer Achievement */}
              <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                stats.ideasSubmitted > 0 ? 'bg-accent/20' : 'bg-muted/50'
              }`}>
                <div className={`text-2xl ${stats.ideasSubmitted > 0 ? '' : 'grayscale opacity-50'}`}>
                  🎯
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${stats.ideasSubmitted > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    First Timer
                  </p>
                  <p className="text-xs text-muted-foreground">Submit your first idea</p>
                </div>
                {stats.ideasSubmitted > 0 && (
                  <div className="text-accent text-sm">✓</div>
                )}
              </div>

              {/* Idea Machine Achievement */}
              <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                stats.ideasSubmitted >= 10 ? 'bg-primary/20' : 'bg-muted/50'
              }`}>
                <div className={`text-2xl ${stats.ideasSubmitted >= 10 ? '' : 'grayscale opacity-50'}`}>
                  🏭
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${stats.ideasSubmitted >= 10 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Idea Machine
                  </p>
                  <p className="text-xs text-muted-foreground">Submit 10+ ideas ({stats.ideasSubmitted}/10)</p>
                </div>
                {stats.ideasSubmitted >= 10 && (
                  <div className="text-primary text-sm">✓</div>
                )}
              </div>

              {/* Judge Judy Achievement */}
              <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                stats.ratingsGiven >= 100 ? 'bg-secondary/20' : 'bg-muted/50'
              }`}>
                <div className={`text-2xl ${stats.ratingsGiven >= 100 ? '' : 'grayscale opacity-50'}`}>
                  ⚖️
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${stats.ratingsGiven >= 100 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Judge Judy
                  </p>
                  <p className="text-xs text-muted-foreground">Rate 100+ ideas ({stats.ratingsGiven}/100)</p>
                </div>
                {stats.ratingsGiven >= 100 && (
                  <div className="text-secondary text-sm">✓</div>
                )}
              </div>

              {/* Certifiably Insane Achievement */}
              <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                stats.averageRatingReceived >= 9 && stats.totalRatingsReceived >= 10 ? 'bg-destructive/20' : 'bg-muted/50'
              }`}>
                <div className={`text-2xl ${stats.averageRatingReceived >= 9 && stats.totalRatingsReceived >= 10 ? '' : 'grayscale opacity-50'}`}>
                  🤪
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${stats.averageRatingReceived >= 9 && stats.totalRatingsReceived >= 10 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Certifiably Insane
                  </p>
                  <p className="text-xs text-muted-foreground">Average rating 9+ with 10+ ratings</p>
                </div>
                {stats.averageRatingReceived >= 9 && stats.totalRatingsReceived >= 10 && (
                  <div className="text-destructive text-sm">✓</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <Navigation currentPage="profile" />
    </div>
  );
}

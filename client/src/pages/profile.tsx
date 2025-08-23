import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, BarChart, Search, UserPlus, UserCheck, UserX, Users, TrendingUp } from "lucide-react";
import type { User, UserStats, Friendship } from "@shared/schema";
import battyLogo from "@assets/ChatGPT Image Aug 22, 2025, 04_28_34 PM_1755895253186.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import RatingComparison from "@/components/RatingComparison";

interface ProfileData {
  user: User;
  stats: UserStats;
}

interface FriendWithFriendship extends User {
  friendship: Friendship;
}

export default function Profile() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("stats");

  const { data: profileData, isLoading: profileLoading, error } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  // Friend-related queries
  const { data: friends = [] } = useQuery<FriendWithFriendship[]>({
    queryKey: ['/api/friends'],
    enabled: !!user,
  });

  const { data: friendRequests = [] } = useQuery<FriendWithFriendship[]>({
    queryKey: ['/api/friends/requests'],
    enabled: !!user,
  });

  const { data: searchResults = [] } = useQuery<User[]>({
    queryKey: ['/api/users/search', searchQuery],
    enabled: !!user && searchQuery.length >= 2,
  });

  // Friend mutations
  const sendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      await apiRequest(`/api/friends/request`, 'POST', { friendId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      toast({
        title: "Friend Request Sent!",
        description: "Your friend request has been sent.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const respondToRequestMutation = useMutation({
    mutationFn: async ({ friendshipId, status }: { friendshipId: string; status: 'accepted' | 'rejected' }) => {
      await apiRequest(`/api/friends/requests/${friendshipId}`, 'PUT', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
      toast({
        title: "Success!",
        description: "Friend request updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to respond to friend request.",
        variant: "destructive",
      });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      await apiRequest(`/api/friends/${friendId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      toast({
        title: "Friend Removed",
        description: "Friend has been removed from your list.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove friend.",
        variant: "destructive",
      });
    },
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
    return userData.username || userData.email?.split('@')[0] || 'User';
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
      <header className="brand-header shadow-lg border-b border-primary/20 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8">
                <img 
                  src={battyLogo} 
                  alt="Batty" 
                  className="w-full h-full object-contain animate-wiggle"
                />
              </div>
              <h1 className="text-xl font-black text-white tracking-wide" data-testid="profile-title" style={{ fontFamily: 'var(--font-display)' }}>
                PROFILE
              </h1>
            </div>
            <button
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl transition-all hover:scale-105"
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              data-testid="button-logout"
            >
              Logout
            </button>
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
            <p className="text-muted-foreground text-sm" data-testid="profile-username">
              @{userData.username}
            </p>
            <p className="text-muted-foreground text-sm mb-4" data-testid="profile-email">
              {userData.email}
            </p>
            <p className="text-muted-foreground text-sm">
              Dreaming up the impossible, one idea at a time
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats" data-testid="tab-stats">
              <BarChart className="w-4 h-4 mr-1" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="friends" data-testid="tab-friends">
              <Users className="w-4 h-4 mr-1" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="insights" data-testid="tab-insights">
              <TrendingUp className="w-4 h-4 mr-1" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-6">
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
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            {/* Friend Search */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users to add as friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-friend-search"
                  />
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {searchResults.map((searchUser) => (
                      <div key={searchUser.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {searchUser.profileImageUrl ? (
                            <img 
                              src={searchUser.profileImageUrl} 
                              alt="User" 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                              {(searchUser.firstName || searchUser.email?.split('@')[0] || 'U')[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {searchUser.firstName && searchUser.lastName 
                                ? `${searchUser.firstName} ${searchUser.lastName}`
                                : searchUser.firstName || searchUser.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground">{searchUser.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => sendRequestMutation.mutate(searchUser.id)}
                          disabled={sendRequestMutation.isPending}
                          data-testid={`button-add-friend-${searchUser.id}`}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Friend Requests */}
            {friendRequests.length > 0 && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Friend Requests ({friendRequests.length})</h3>
                  <div className="space-y-2">
                    {friendRequests.map((request) => (
                      <div key={request.friendship.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {request.profileImageUrl ? (
                            <img 
                              src={request.profileImageUrl} 
                              alt="User" 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                              {(request.firstName || request.email?.split('@')[0] || 'U')[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {request.firstName && request.lastName 
                                ? `${request.firstName} ${request.lastName}`
                                : request.firstName || request.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground">{request.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => respondToRequestMutation.mutate({ 
                              friendshipId: request.friendship.id, 
                              status: 'accepted' 
                            })}
                            disabled={respondToRequestMutation.isPending}
                            data-testid={`button-accept-${request.id}`}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => respondToRequestMutation.mutate({ 
                              friendshipId: request.friendship.id, 
                              status: 'rejected' 
                            })}
                            disabled={respondToRequestMutation.isPending}
                            data-testid={`button-reject-${request.id}`}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Friends List */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Your Friends ({friends.length})</h3>
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No friends yet! Search above to find people to connect with.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {friend.profileImageUrl ? (
                            <img 
                              src={friend.profileImageUrl} 
                              alt="Friend" 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                              {(friend.firstName || friend.email?.split('@')[0] || 'U')[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {friend.firstName && friend.lastName 
                                ? `${friend.firstName} ${friend.lastName}`
                                : friend.firstName || friend.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground">{friend.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFriendMutation.mutate(friend.id)}
                          disabled={removeFriendMutation.isPending}
                          data-testid={`button-remove-friend-${friend.id}`}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <RatingComparison />
          </TabsContent>
        </Tabs>
      </div>

      {/* Navigation */}
      <Navigation currentPage="profile" />
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Globe, User, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface RatingComparisonData {
  userAverage: number;
  friendsAverage: number;
  globalAverage: number;
  categoryBreakdown: Array<{
    category: string;
    userAverage: number;
    friendsAverage: number;
    globalAverage: number;
  }>;
}

export default function RatingComparison() {
  const { user } = useAuth();
  
  const { data: comparisonData, isLoading } = useQuery<RatingComparisonData>({
    queryKey: ['/api/ratings/comparison'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No rating data available yet. Rate some ideas to see comparisons!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallData = [
    {
      name: 'You',
      value: comparisonData.userAverage,
      icon: 'user'
    },
    {
      name: 'Friends',
      value: comparisonData.friendsAverage,
      icon: 'users'
    },
    {
      name: 'Everyone',
      value: comparisonData.globalAverage,
      icon: 'globe'
    },
  ];

  const categoryData = comparisonData.categoryBreakdown.map(item => ({
    category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    You: Math.round(item.userAverage * 10) / 10,
    Friends: Math.round(item.friendsAverage * 10) / 10,
    Everyone: Math.round(item.globalAverage * 10) / 10,
  })).filter(item => item.You > 0 || item.Friends > 0 || item.Everyone > 0);

  const getRatingPersonality = () => {
    const user = comparisonData.userAverage;
    const global = comparisonData.globalAverage;
    const diff = user - global;
    
    if (diff > 1.5) return { label: "Chaos Enthusiast", description: "You see batshit potential everywhere!", color: "text-destructive" };
    if (diff > 0.5) return { label: "Creative Optimist", description: "You're more open to wild ideas than most.", color: "text-orange-500" };
    if (diff > -0.5) return { label: "Balanced Judge", description: "You're right in tune with the community.", color: "text-primary" };
    if (diff > -1.5) return { label: "Practical Realist", description: "You prefer ideas with solid foundations.", color: "text-blue-500" };
    return { label: "Logic Guardian", description: "You keep the community grounded!", color: "text-green-600" };
  };

  const personality = getRatingPersonality();

  return (
    <div className="space-y-6" data-testid="rating-comparison">
      {/* Overall Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Your Rating Style</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Rating Personality */}
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <h3 className={`text-lg font-bold ${personality.color}`}>
                {personality.label}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {personality.description}
              </p>
            </div>

            {/* Overall Averages */}
            <div className="grid grid-cols-3 gap-4">
              {overallData.map((item, index) => (
                <div key={item.name} className="text-center">
                  <div className="flex justify-center mb-2">
                    {item.icon === 'user' && <User className="w-6 h-6 text-primary" />}
                    {item.icon === 'users' && <Users className="w-6 h-6 text-secondary" />}
                    {item.icon === 'globe' && <Globe className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="text-2xl font-bold mb-1" data-testid={`average-${item.icon}`}>
                    {item.value.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Breakdown by Category</CardTitle>
            <p className="text-sm text-muted-foreground">
              See how your ratings compare across different types of ideas
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80" data-testid="category-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="category" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    domain={[0, 10]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--popover-foreground))'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}`, '']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="You" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Your Average"
                  />
                  <Bar 
                    dataKey="Friends" 
                    fill="hsl(var(--secondary))" 
                    radius={[4, 4, 0, 0]}
                    name="Friends' Average"
                  />
                  <Bar 
                    dataKey="Everyone" 
                    fill="hsl(var(--muted-foreground))" 
                    radius={[4, 4, 0, 0]}
                    name="Global Average"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fun Facts */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Fun Facts</h3>
          <div className="space-y-2 text-sm">
            {comparisonData.friendsAverage > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span>Agreement with friends:</span>
                <span className="font-medium">
                  {Math.abs(comparisonData.userAverage - comparisonData.friendsAverage) < 0.5 
                    ? "🤝 High" 
                    : Math.abs(comparisonData.userAverage - comparisonData.friendsAverage) < 1.5 
                    ? "👥 Moderate" 
                    : "🔥 You're the rebel!"}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span>Compared to everyone:</span>
              <span className="font-medium">
                {comparisonData.userAverage > comparisonData.globalAverage + 0.5
                  ? "🚀 More adventurous"
                  : comparisonData.userAverage < comparisonData.globalAverage - 0.5
                  ? "⚓ More cautious"
                  : "🎯 Right on target"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
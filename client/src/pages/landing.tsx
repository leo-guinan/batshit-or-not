import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Star, Users, Trophy } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
            <Lightbulb className="w-10 h-10 text-white" data-testid="logo-icon" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="app-title">
            Batshit or Not
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="app-subtitle">
            Rate wild ideas on the crazy scale
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Rate Ideas</h3>
                  <p className="text-sm text-muted-foreground">From boringly sane to absolutely batshit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Share & Discover</h3>
                  <p className="text-sm text-muted-foreground">Submit your wildest ideas to the community</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Earn Achievements</h3>
                  <p className="text-sm text-muted-foreground">Build your reputation as an idea generator</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 animate-bounce-gentle"
            onClick={() => window.location.href = "/api/login"}
            data-testid="login-button"
          >
            Get Started
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Join the community of creative minds
          </p>
        </div>
      </div>
    </div>
  );
}

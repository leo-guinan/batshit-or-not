import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Star, Users, Trophy } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-destructive rounded-full flex items-center justify-center mx-auto mb-6 animate-float shadow-xl">
            <Lightbulb className="w-12 h-12 text-white animate-wiggle" data-testid="logo-icon" />
          </div>
          <h1 className="text-5xl font-black text-foreground mb-4 animate-batshit-bounce" data-testid="app-title" style={{ fontFamily: 'var(--font-display)' }}>
            BATSHIT OR NOT
          </h1>
          <p className="text-xl text-muted-foreground mb-8 font-medium" data-testid="app-subtitle">
            Rate wild ideas on the crazy scale! 🦇
          </p>
        </div>

        {/* Features */}
        <div className="space-y-6 mb-12">
          <Card className="border-2 border-primary/30 hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:rotate-1 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-destructive rounded-xl flex items-center justify-center animate-bounce-gentle">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">Rate Ideas</h3>
                  <p className="text-sm text-muted-foreground">From boringly sane to absolutely batshit! 🤯</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/30 hover:border-secondary shadow-lg hover:shadow-xl transition-all duration-300 hover:-rotate-1 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center animate-pulse-slow">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">Share & Discover</h3>
                  <p className="text-sm text-muted-foreground">Submit your wildest ideas to the chaos! 🚀</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/30 hover:border-success shadow-lg hover:shadow-xl transition-all duration-300 hover:rotate-1 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-success to-secondary rounded-xl flex items-center justify-center animate-crazy-shake">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">Earn Achievements</h3>
                  <p className="text-sm text-muted-foreground">Build your batshit reputation! 🏆</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            className="batshit-button w-full h-16 text-xl uppercase tracking-wide animate-batshit-bounce"
            onClick={() => window.location.href = "/api/login"}
            data-testid="login-button"
          >
            🦇 Join the Chaos! 🦇
          </button>
          <p className="text-sm text-muted-foreground mt-4 font-medium">
            Welcome to the beautiful madness! 🎪
          </p>
        </div>
      </div>
    </div>
  );
}

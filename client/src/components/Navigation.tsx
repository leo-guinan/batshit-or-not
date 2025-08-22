import { Link, useLocation } from "wouter";
import { Home, Search, Trophy, User } from "lucide-react";

interface NavigationProps {
  currentPage?: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (currentPage) {
      return currentPage === path;
    }
    return location === path || (path === "home" && location === "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          <Link href="/">
            <button 
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive("home") || isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid="nav-home"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">Home</span>
            </button>
          </Link>
          
          <button 
            className="flex flex-col items-center py-2 px-4 text-muted-foreground"
            data-testid="nav-search"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </button>
          
          <button 
            className="flex flex-col items-center py-2 px-4 text-muted-foreground"
            data-testid="nav-leaderboard"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs mt-1">Rankings</span>
          </button>
          
          <Link href="/profile">
            <button 
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive("profile") || isActive("/profile") ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid="nav-profile"
            >
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

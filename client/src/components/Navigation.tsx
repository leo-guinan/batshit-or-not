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
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-card to-card/95 backdrop-blur-sm border-t-2 border-primary/20 z-40 shadow-2xl">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex justify-around">
          <Link href="/">
            <button 
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all hover:scale-110 ${
                isActive("home") || isActive("/") 
                  ? "text-primary bg-primary/10 shadow-lg" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
              data-testid="nav-home"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1 font-bold">Home</span>
            </button>
          </Link>
          
          <button 
            className="flex flex-col items-center py-2 px-4 rounded-xl text-muted-foreground hover:text-secondary hover:bg-secondary/5 transition-all hover:scale-110"
            data-testid="nav-search"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1 font-bold">Search</span>
          </button>
          
          <button 
            className="flex flex-col items-center py-2 px-4 rounded-xl text-muted-foreground hover:text-success hover:bg-success/5 transition-all hover:scale-110"
            data-testid="nav-leaderboard"
          >
            <Trophy className="w-6 h-6" />
            <span className="text-xs mt-1 font-bold">Rankings</span>
          </button>
          
          <Link href="/profile">
            <button 
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all hover:scale-110 ${
                isActive("profile") || isActive("/profile") 
                  ? "text-primary bg-primary/10 shadow-lg" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
              data-testid="nav-profile"
            >
              <User className="w-6 h-6" />
              <span className="text-xs mt-1 font-bold">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

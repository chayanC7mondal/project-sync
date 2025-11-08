import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getRoleDisplay = (role: string | undefined) => {
    if (!role) return "User";
    const roleMap: Record<string, string> = {
      admin: "Admin",
      liaison: "Liaison Officer",
      io: "Investigating Officer",
      witness: "Witness",
    };
    return roleMap[role] || "User";
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/40 bg-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/90 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md ring-2 ring-primary/10">
            <span className="text-primary-foreground font-bold text-lg">O</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">Odisha Court</h2>
            <p className="text-xs text-muted-foreground leading-tight">Attendance System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <Button variant="ghost" size="icon" className="relative hover:bg-muted/80 transition-colors">
          <Bell className="w-5 h-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-md"
          >
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted/80 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm ring-2 ring-primary/10">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="font-medium text-sm">{user?.username || "User"}</span>
                <span className="text-xs text-muted-foreground">{getRoleDisplay(user?.role)}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate("/settings")}
            >
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Change Password</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;

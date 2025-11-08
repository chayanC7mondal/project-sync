import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Bell,
  BarChart3,
  Settings,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", badge: null },
  { icon: FileText, label: "Case Management", path: "/cases", badge: null },
  { icon: Bell, label: "Notifications", path: "/notifications", badge: "3" },
  { icon: Settings, label: "Settings", path: "/settings", badge: null },
];

const Sidebar = () => {
  return (
    <aside className="w-72 h-screen bg-gradient-to-b from-primary via-primary/95 to-primary/90 text-sidebar-foreground flex flex-col shadow-xl border-r border-primary/20 fixed left-0 top-0 z-40 no-scrollbar">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-white/10 flex-shrink-0">
        <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg p-1">
          <img
            src="/op.png"
            alt="Odisha Police Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-base text-white">Odisha Police</h1>
          <p className="text-xs text-white/70 mt-0.5">
            Court Attendance System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-hidden min-h-0 no-scrollbar">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden",
                isActive
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white hover:shadow-md"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full shadow-lg" />
                )}

                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "bg-white/20 shadow-md"
                        : "bg-white/5 group-hover:bg-white/10"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-accent/90 text-white border-0 shadow-md text-xs px-2 py-0.5"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-60"
                    )}
                  />
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 space-y-3 flex-shrink-0">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <p className="text-xs text-white/90 font-medium mb-1">Quick Help</p>
          <p className="text-xs text-white/70">
            Need assistance? Contact support at ext. 2024
          </p>
        </div>
        <p className="text-xs text-white/60 text-center">
          © 2024 Government of Odisha
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

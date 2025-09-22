"use client";

import {
  HomeIcon,
  UsersIcon,
  X,
  SquareMenu,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Admin, AdminRole, adminService } from "@/services/adminService";

interface MenuSideBarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MenuSideBar({ collapsed = false, onCloseMobile }: MenuSideBarProps) {
  const router = useRouter();
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: () => adminService.getProfile(),
  });
  const profile = profileData?.data as Admin;

  const menuItems: MenuItem[] = [
    // { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Posts", href: "/posts", icon: ClipboardList },
    {
      name: "Categories",
      href: "/categories",
      icon: SquareMenu,
    },
    ...(profile?.role === AdminRole.ADMIN
      ? [{ name: "Author", href: "/authors", icon: UsersIcon }]
      : [{ name: "My Profile", href: "/profile", icon: UsersIcon }]),
    // { name: "CMS Logs", href: "/logs", icon: TextSearch },
  ];

  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <li key={item.name}>
        <Link
          href={item.href}
          className={`group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            collapsed ? "justify-center" : "justify-start"
          } ${
            active
              ? "bg-thirdary text-primary shadow-sm border-r-4 border-secondary"
              : "text-primary hover:bg-thirdary/70 hover:shadow-sm"
          }`}
          title={collapsed ? item.name : undefined}
        >
          <div className={`flex-shrink-0 ${collapsed ? "" : "mr-3"}`}>
            <Icon
              className={`h-5 w-5 transition-all duration-200 ${
                active
                  ? "text-primary scale-110"
                  : "text-primary/70 group-hover:text-primary group-hover:scale-105"
              }`}
            />
          </div>

          {!collapsed && (
            <>
              <span className="flex-1 truncate font-medium">{item.name}</span>
              {active && (
                <div className="ml-auto">
                  <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                </div>
              )}
            </>
          )}

          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.name}
            </div>
          )}
        </Link>
      </li>
    );
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  return (
    <aside
      className={`h-full bg-white text-primary shadow-lg flex flex-col transition-all duration-300 ease-in-out border-r border-gray-100 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 p-4 bg-gradient-to-r from-white to-gray-50">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 shadow-sm grid place-items-center">
              <HomeIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
                Crypto Threads
              </h2>
              <p className="text-xs text-primary/60 font-medium">
                CMS Dashboard
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 shadow-sm grid place-items-center">
            <HomeIcon className="h-5 w-5 text-primary" />
          </div>
        )}

        <button
          onClick={onCloseMobile}
          className="lg:hidden p-2 rounded-lg text-primary/60 hover:text-primary hover:bg-secondary/20 transition-all duration-200"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <ul className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </ul>
        <div className="mt-6 border-t border-gray-100 pt-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              collapsed ? "justify-center" : "justify-start"
            } text-red-600 hover:bg-red-600/10`}
            title={collapsed ? "Logout" : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 transition-all duration-200 ${
                collapsed ? "" : "mr-3"
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>

      <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-white">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-primary grid place-items-center text-sm font-bold shadow-sm">
              {"AD"}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-thirdary/30 transition-all duration-200">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-primary grid place-items-center text-sm font-bold shadow-sm">
              {"AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-primary">
                Admin User
              </p>
              <p className="truncate text-xs text-primary/50 font-medium">
                admin@crypto.com
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default MenuSideBar;

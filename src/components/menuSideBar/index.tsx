"use client";

import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  TextSearch,
  X,
  SquareMenu,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface MenuSideBarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  sub?: {
    name: string;
    href: string;
    sub?: { name: string; href: string }[];
  }[];
}

function MenuSideBar({ collapsed = false, onCloseMobile }: MenuSideBarProps) {
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Author", href: "/authors", icon: UsersIcon },
    { name: "Admin", href: "/admin", icon: ShieldCheckIcon },
    { name: "Posts", href: "/posts", icon: ClipboardList },
    {
      name: "Categories",
      href: "/categories",
      icon: SquareMenu,
      sub: [
        {
          name: "Insights",
          href: "/categories/insights", // Thêm prefix
          sub: [
            { name: "TradFi", href: "/categories/insights/tradfi" },
            {
              name: "Crypto Regulations",
              href: "/categories/insights/crypto-regulations",
            },
            { name: "Market", href: "/categories/insights/market" },
          ],
        },
        {
          name: "Learn",
          href: "/categories/learn", // Thêm prefix
          sub: [
            { name: "Hidden Gems", href: "/categories/learn/hidden-gems" },
            {
              name: "Chains & Protocols",
              href: "/categories/learn/chains-protocols",
            },
            {
              name: "Crypto Fundamentals",
              href: "/categories/learn/crypto-fundamentals",
            },
            { name: "Airdrops", href: "/categories/learn/airdrops" },
          ],
        },
        {
          name: "Trading",
          href: "/categories/trading", // Thêm prefix
          sub: [
            {
              name: "Trading Strategies",
              href: "/categories/trading/trading-strategies",
            },
            {
              name: "Crypto Analytics",
              href: "/categories/trading/crypto-analytics",
            },
            { name: "Dummies", href: "/categories/trading/dummies" },
          ],
        },
      ],
    },
    { name: "CMS Logs", href: "/logs", icon: TextSearch },
  ];

  const pathname = usePathname();

  const toggleSubmenu = (menuName: string) => {
    if (collapsed) return;

    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isMenuExpanded = (menuName: string) => expandedMenus.includes(menuName);

  const isActive = (href: string) => pathname === href;

  const isParentActive = (item: MenuItem) => {
    if (pathname === item.href) return true;
    if (item.sub) {
      return item.sub.some((subItem) => {
        if (pathname === subItem.href) return true;
        if (subItem.sub) {
          return subItem.sub.some((subSubItem) => pathname === subSubItem.href);
        }
        return false;
      });
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const Icon = item.icon;
    const hasSubmenu = item.sub && item.sub.length > 0;
    const isExpanded = isMenuExpanded(item.name);
    const parentActive = isParentActive(item);
    const active = isActive(item.href);

    return (
      <li key={item.name}>
        <div
          className={`group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
            collapsed ? "justify-center" : "justify-start"
          } ${
            active || parentActive
              ? "bg-thirdary text-primary shadow-sm border-r-4 border-secondary"
              : "text-primary  hover:bg-thirdary/70 hover:shadow-sm"
          }`}
          onClick={() => (hasSubmenu ? toggleSubmenu(item.name) : null)}
          title={collapsed ? item.name : undefined}
          style={{
            paddingLeft: collapsed ? undefined : `${16 + level * 20}px`,
          }}
        >
          {level === 0 && Icon && (
            <div className={`flex-shrink-0 ${collapsed ? "" : "mr-3"}`}>
              <Icon
                className={`h-5 w-5 transition-all duration-200 ${
                  active || parentActive
                    ? "text-primary scale-110"
                    : "text-primary/70 group-hover:text-primary group-hover:scale-105"
                }`}
              />
            </div>
          )}

          {!collapsed && (
            <>
              <Link
                href={item.href}
                className="flex-1 truncate font-medium"
                onClick={(e) => {
                  if (hasSubmenu) {
                    e.preventDefault();
                  }
                }}
              >
                {item.name}
              </Link>

              {hasSubmenu && (
                <div className="ml-auto flex items-center">
                  <div
                    className={`p-1 rounded-md transition-all duration-200 ${
                      isExpanded
                        ? "bg-secondary/20 rotate-0"
                        : "hover:bg-secondary/10"
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-primary/60" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-primary/60" />
                    )}
                  </div>
                </div>
              )}

              {(active || parentActive) && !hasSubmenu && (
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
        </div>

        {hasSubmenu && !collapsed && isExpanded && (
          <ul className="mt-1 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
            {item.sub!.map((subItem) => (
              <li key={subItem.name}>
                <div
                  className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive(subItem.href)
                      ? "bg-thirdary/70 text-primary shadow-sm"
                      : "text-primary hover:bg-thirdary/70"
                  }`}
                  onClick={() =>
                    subItem.sub ? toggleSubmenu(subItem.name) : null
                  }
                  style={{ paddingLeft: `${16 + (level + 1) * 20}px` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mr-3 flex-shrink-0" />

                  <Link
                    href={subItem.href}
                    className="flex-1 truncate"
                    onClick={(e) => {
                      if (subItem.sub) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {subItem.name}
                  </Link>

                  {subItem.sub && (
                    <div className="ml-2">
                      <div
                        className={`p-0.5 rounded transition-all duration-200 ${
                          isMenuExpanded(subItem.name)
                            ? "bg-secondary/20"
                            : "hover:bg-secondary/10"
                        }`}
                      >
                        {isMenuExpanded(subItem.name) ? (
                          <ChevronDown className="h-3.5 w-3.5 text-primary/50" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-primary/50" />
                        )}
                      </div>
                    </div>
                  )}

                  {isActive(subItem.href) && !subItem.sub && (
                    <div className="ml-auto">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    </div>
                  )}
                </div>

                {subItem.sub && isMenuExpanded(subItem.name) && (
                  <ul className="mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                    {subItem.sub.map((subSubItem) => (
                      <li key={subSubItem.name}>
                        <Link
                          href={subSubItem.href}
                          className={`group flex items-center rounded-lg px-3 py-1.5 text-sm transition-all duration-200 ${
                            isActive(subSubItem.href)
                              ? "bg-thirdary/60 text-primary font-medium"
                              : "text-primary hover:bg-thirdary/60"
                          }`}
                          style={{ paddingLeft: `${16 + (level + 2) * 20}px` }}
                        >
                          <div className="w-1 h-1 rounded-full bg-primary/20 mr-3 flex-shrink-0" />
                          <span className="truncate">{subSubItem.name}</span>
                          {isActive(subSubItem.href) && (
                            <div className="ml-auto">
                              <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                            </div>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
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

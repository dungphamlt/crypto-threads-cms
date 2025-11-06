"use client";

import {
  HomeIcon,
  UsersIcon,
  X,
  FolderClosed,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme, themes } from "@/contexts/ThemeContext";

interface MenuSideBarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { name: string; href: string }[];
}

function MenuSideBar({ collapsed = false, onCloseMobile }: MenuSideBarProps) {
  const router = useRouter();
  const { isAdmin, profile } = useAuth();
  const { currentTheme, setTheme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const menuItems: MenuItem[] = [
    // { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    {
      name: "Posts",
      href: "/posts/all-posts",
      icon: ClipboardList,
      subItems: [
        { name: "All Posts", href: "/posts/all-posts" },
        { name: "Create Post", href: "/posts/create-post" },
      ],
    },
    {
      name: "Categories",
      href: "/categories",
      icon: FolderClosed,
    },
    ...(isAdmin
      ? [{ name: "Author", href: "/authors", icon: UsersIcon }]
      : [{ name: "My Profile", href: "/profile", icon: UsersIcon }]),
    // { name: "CMS Logs", href: "/logs", icon: TextSearch },
  ];

  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const isExpanded = (itemName: string) => expandedItems.has(itemName);

  const hasActiveSubItem = (item: MenuItem) => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem) => isActive(subItem.href));
  };

  // Auto-expand items with active sub items
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems) {
        const hasActive = item.subItems.some((subItem) =>
          isActive(subItem.href)
        );
        if (hasActive) {
          setExpandedItems((prev) => {
            if (!prev.has(item.name)) {
              return new Set(prev).add(item.name);
            }
            return prev;
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close theme selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        showThemeSelector &&
        !target.closest("[data-theme-selector]") &&
        !target.closest("[data-theme-button]")
      ) {
        setShowThemeSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showThemeSelector]);

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const active = isActive(item.href) || hasActiveSubItem(item);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const expanded = isExpanded(item.name);

    return (
      <li key={item.name}>
        <div>
          {hasSubItems && !collapsed ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className={`group relative flex items-center w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-thirdary text-primary shadow-sm border-r-4 border-secondary"
                  : "text-primary hover:bg-thirdary/70 hover:shadow-sm"
              }`}
            >
              <div className="flex-shrink-0 mr-3">
                <Icon
                  className={`h-5 w-5 transition-all duration-200 ${
                    active
                      ? "text-primary scale-110"
                      : "text-primary/70 group-hover:text-primary group-hover:scale-105"
                  }`}
                />
              </div>
              <span className="flex-1 truncate font-medium text-left">
                {item.name}
              </span>
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-primary/60" />
              ) : (
                <ChevronRight className="h-4 w-4 text-primary/60" />
              )}
            </button>
          ) : (
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
                  <span className="flex-1 truncate font-medium">
                    {item.name}
                  </span>
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
          )}

          {hasSubItems && !collapsed && expanded && (
            <ul className="ml-6 mt-4 space-y-2">
              {item.subItems?.map((subItem) => {
                const subActive = isActive(subItem.href);
                return (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.href}
                      className={`group relative flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                        subActive
                          ? "bg-secondary/10 text-primary border-l-2 border-secondary"
                          : "text-primary/70 hover:bg-secondary/10 hover:text-primary"
                      }`}
                    >
                      <span className="flex-1 truncate">{subItem.name}</span>
                      {subActive && (
                        <div className="ml-auto">
                          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
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

        {/* Theme Selector */}
        {!collapsed && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              data-theme-button
              className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-primary hover:bg-thirdary/70 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary/70" />
                <span>Theme</span>
              </div>
              {showThemeSelector ? (
                <ChevronDown className="h-4 w-4 text-primary/60" />
              ) : (
                <ChevronRight className="h-4 w-4 text-primary/60" />
              )}
            </button>

            {showThemeSelector && (
              <div className="mt-3 space-y-2" data-theme-selector>
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      setShowThemeSelector(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      currentTheme === key
                        ? "bg-secondary/20 border-2 border-secondary"
                        : "hover:bg-thirdary/50 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex gap-1.5">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: theme.secondary }}
                      />
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: theme.thirdary }}
                      />
                    </div>
                    <span className="text-xs font-medium text-primary">
                      {theme.name}
                    </span>
                    {currentTheme === key && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-secondary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {collapsed && (
          <div className="mt-6 border-t border-gray-100 pt-4 relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              data-theme-button
              className="w-full flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-primary hover:bg-thirdary/70"
              title="Theme"
            >
              <Palette className="h-5 w-5 text-primary/70" />
            </button>

            {showThemeSelector && (
              <div
                className="absolute left-full ml-2 top-0 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[200px]"
                data-theme-selector
              >
                <div className="space-y-2">
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTheme(key);
                        setShowThemeSelector(false);
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                        currentTheme === key
                          ? "bg-secondary/20 border-2 border-secondary"
                          : "hover:bg-thirdary/50 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex gap-1.5">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: theme.secondary }}
                        />
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: theme.thirdary }}
                        />
                      </div>
                      <span className="text-xs font-medium text-primary">
                        {theme.name}
                      </span>
                      {currentTheme === key && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-secondary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
            {isAdmin ? (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-primary grid place-items-center text-sm font-bold shadow-sm">
                {"AD"}
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-primary grid place-items-center text-sm font-bold shadow-sm">
                <Image
                  src={profile?.avatarUrl || "/logo.png"}
                  alt={profile?.penName || "Admin"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {isAdmin ? (
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
            ) : (
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-thirdary/30 transition-all duration-200">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-primary grid place-items-center text-sm font-bold shadow-sm">
                  <Image
                    src={profile?.avatarUrl || "/logo.png"}
                    alt={profile?.penName || "Admin"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary">
                    {profile?.penName}
                  </p>
                  <p className="truncate text-xs text-primary/50 font-medium">
                    {profile?.email}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

export default MenuSideBar;

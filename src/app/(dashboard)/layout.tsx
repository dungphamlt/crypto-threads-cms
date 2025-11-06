"use client";

import { useEffect, useState } from "react";
import MenuSideBar from "@/components/menuSideBar";
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/contexts/ThemeContext";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { profile, isAdmin } = useAuth();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/posts/create-post")) {
      setSidebarOpen(false);
      setSidebarCollapsed(true);
    } else {
      setSidebarOpen(true);
      setSidebarCollapsed(false);
    }
  }, [pathname]);

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-thirdary text-primary">
        {/* Mobile overlay (40% primary) */}
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: "rgba(31,65,114,0.4)" }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${sidebarCollapsed ? "lg:w-16" : "lg:w-64"}`}
        >
          <MenuSideBar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onCloseMobile={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header
            className="bg-white border-b shadow-sm px-4 py-3 lg:px-6"
            style={{
              borderColor:
                "color-mix(in oklab, var(--color-1) 15%, transparent)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile trigger */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md hover:bg-thirdary focus:outline-none focus:ring-2"
                  aria-label="Open sidebar"
                >
                  <ArrowBigLeftDash className="h-5 w-5" />
                </button>

                {/* Desktop collapse */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:inline-flex p-2 rounded-md hover:bg-thirdary focus:outline-none focus:ring-2"
                  aria-label="Toggle sidebar"
                >
                  {sidebarCollapsed ? (
                    <ArrowBigRightDash className="h-5 w-5" />
                  ) : (
                    <ArrowBigLeftDash className="h-5 w-5" />
                  )}
                </button>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="opacity-70">Crypto Threads CMS</span>
                  <span className="opacity-30">/</span>
                  <span className="font-semibold uppercase">
                    {pathname.split("/").pop()?.split("-").join(" ")}
                  </span>
                </div>
              </div>

              {/* User pill */}
              {isAdmin ? (
                <Link
                  href="/authors"
                  className="hidden md:flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full border border-primary grid place-items-center bg-primary text-white">
                    AD
                  </div>
                  <span className="text-sm font-medium">Admin</span>
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full border border-primary">
                    <Image
                      src={profile?.avatarUrl || "/logo.png"}
                      alt={profile?.penName || "Admin"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {profile?.penName || "Admin"}
                  </span>
                </Link>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto overscroll-contain p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default DashboardLayout;

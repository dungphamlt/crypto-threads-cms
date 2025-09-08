import type React from "react";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-white rounded-xl shadow-md">
      {/* Category Level Breadcrumb */}
      <div className="">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 border-b border-gray-300 pb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Home className="h-4 w-4" />
              <span>/</span>
              <Link href="/categories" className="hover:text-gray-700">
                Categories
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{categoryName}</span>
            </div>
          </div>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}

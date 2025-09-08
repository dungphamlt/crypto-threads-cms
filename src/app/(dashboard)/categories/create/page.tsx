"use client";

import type React from "react";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const colorOptions = [
  { name: "Xanh dương", value: "bg-blue-500", color: "bg-blue-500" },
  { name: "Xanh lá", value: "bg-green-500", color: "bg-green-500" },
  { name: "Tím", value: "bg-purple-500", color: "bg-purple-500" },
  { name: "Cam", value: "bg-orange-500", color: "bg-orange-500" },
  { name: "Đỏ", value: "bg-red-500", color: "bg-red-500" },
  { name: "Hồng", value: "bg-pink-500", color: "bg-pink-500" },
  { name: "Vàng", value: "bg-yellow-500", color: "bg-yellow-500" },
  { name: "Xám", value: "bg-gray-500", color: "bg-gray-500" },
];

function CreateCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: "bg-blue-500",
    isActive: true,
  });

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Creating category:", formData);
    // Redirect to categories list
    router.push("/categories");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/categories">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo danh mục mới</h1>
          <p className="text-gray-600">Thêm danh mục mới cho hệ thống</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tên danh mục *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Nhập tên danh mục"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Slug
                  </label>
                  <input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="duong-dan-url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL sẽ là: /categories/{formData.slug || "duong-dan-url"}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Mô tả ngắn về danh mục này"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Tùy chỉnh giao diện</h2>
              </div>
              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu sắc
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            color: option.value,
                          }))
                        }
                        className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-colors ${
                          formData.color === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${option.color}`}
                        />
                        <span className="text-sm">{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Trạng thái</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="isActive"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Kích hoạt danh mục
                    </label>
                    <p className="text-sm text-gray-600">
                      Danh mục sẽ hiển thị công khai
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        formData.isActive ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          formData.isActive ? "translate-x-5" : "translate-x-0"
                        } mt-0.5 ml-0.5`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Xem trước</h2>
              </div>
              <div className="p-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full ${formData.color}`} />
                    <h3 className="font-medium">
                      {formData.name || "Tên danh mục"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formData.description || "Mô tả danh mục sẽ hiển thị ở đây"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Tạo danh mục
              </button>
              <Link href="/categories">
                <button
                  type="button"
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
export default CreateCategoryPage;

"use client";

import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { AdminRole, adminService, Author } from "@/services/adminService";
import FormAddNewAuthor from "@/components/author/author-form";
// import AdminCard from "@/components/admin/AdminCard";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import AuthorCard from "@/components/author/author-card";
import AuthorDetailModal from "@/components/author/author-detail";
export interface AuthorDetail extends Author {
  _id: string;
}

export default function AuthorManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthorDetailModalOpen, setIsAuthorDetailModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorDetail | null>(
    null
  );
  const handleAddAuthorSuccess = (newAuthor: Author) => {
    setIsFormOpen(false);
    toast.success("New author " + newAuthor.username + " added successfully!");
  };

  const { data: dataAuthor } = useQuery({
    queryKey: ["author"],
    queryFn: () => adminService.getAuthorList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const authorList = dataAuthor?.success
    ? dataAuthor.data?.filter((author) => author.role === AdminRole.WRITER) ||
      []
    : [];

  const handleViewAuthor = (author: Author) => {
    setSelectedAuthor(author as AuthorDetail);
    setIsAuthorDetailModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedAuthor(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Author Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Create Author
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>

        <div className="relative z-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Admin List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Author List
                </h3>
                <div className="text-sm text-gray-500">
                  {/* {filteredAdmins.length} of {adminList.length} admins */}
                </div>
              </div>

              {/* Author Cards */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {authorList?.map((author) => (
                  <AuthorCard
                    key={author.email}
                    author={author}
                    onView={handleViewAuthor}
                  />
                ))}
              </div>
            </div>

            {/* Author Details */}
            <div className="space-y-6"></div>
          </div>

          {/* Status Messages */}
        </div>
      </div>
      <FormAddNewAuthor
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleAddAuthorSuccess}
        onError={() => toast.error("Failed to add new author")}
      />
      <AuthorDetailModal
        author={selectedAuthor}
        isOpen={isAuthorDetailModalOpen}
        onClose={() => setIsAuthorDetailModalOpen(false)}
      />
    </div>
  );
}

"use client";
import { Mail, User, Award, Link2, X } from "lucide-react";
import { Author } from "@/services/adminService";
import Image from "next/image";

interface AuthorDetailModalProps {
  author: Author | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (author: Author) => void;
}

export default function AuthorDetailModal({
  author,
  isOpen,
  onClose,
  onEdit,
}: AuthorDetailModalProps) {
  if (!author || !isOpen) return null;

  const getInitials = (name?: string) => {
    const displayName = name || author.penName || author.email || "U";
    return displayName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = author.penName || author.username || author.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-900">Author Detail</h2>
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={() => author && onEdit(author)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg ring-4 ring-blue-100">
                {author.avatarUrl ? (
                  <Image
                    src={author.avatarUrl}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover"
                    width={100}
                    height={100}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  getInitials(displayName)
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {author.penName}
                </h2>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <User className="h-4 w-4 mr-2" />
                <span>{author.username}</span>
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <Mail className="h-4 w-4 mr-2" />
                <span>{author.email}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Award className="h-4 w-4 mr-2" />
                <span className="capitalize">{author.role}</span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200"></div>

          {author.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {author.description}
              </p>
            </div>
          )}

          {author.designations && author.designations.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Designations</h3>
              <div className="flex flex-wrap gap-2">
                {author.designations.map((designation, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {designation}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-3 text-blue-500" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{author.email}</div>
                </div>
              </div>

              {author.username && (
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-3 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">Username</div>
                    <div className="font-medium">@{author.username}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {author.socials && Object.keys(author.socials).length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Socials</h3>
              <div className="space-y-3">
                {Object.entries(author.socials).map(([social, index]) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <Link2 className="h-4 w-4 mr-3 text-purple-500" />
                    <div>
                      <div className="text-sm text-gray-500">
                        Link {index + 1}
                      </div>
                      <a
                        href={social}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {social}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="border-t border-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

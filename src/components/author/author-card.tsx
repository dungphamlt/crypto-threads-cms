import { Author } from "@/services/adminService";
import { Calendar, Mail, Shield } from "lucide-react";
import React from "react";
import Image from "next/image";

interface AuthorCardProps {
  author: Author;
  onView?: (author: Author) => void;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author, onView }) => {
  return (
    <div
      onClick={() => onView?.(author)}
      className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:bg-gray-50 cursor-pointer hover:border-blue-500"
    >
      <div className="flex items-start justify-between">
        {/* Author Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {author.avatarUrl ? (
              <Image
                src={author.avatarUrl}
                alt={author.username}
                width={100}
                height={100}
                className="w-14 h-14 rounded-full object-cover shadow-[0_0_4px_1px_rgba(0,0,0,0.2)]"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                {author.username?.charAt(0)?.toUpperCase() || "A"}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {author.penName || "Unknown Author"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>{author.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Author</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined recently</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorCard;

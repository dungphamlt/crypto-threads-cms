import {
  Admin,
  AdminRole,
  adminService,
  AdminStatus,
} from "@/services/adminService";
import { Calendar, Shield, Crown, UserCheck } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface AdminCardProps {
  admin: Admin;
  selected: boolean;
  onSelect: (admin: Admin) => void;
  onRoleUpdate?: (adminId: number, newRole: AdminRole) => void;
}

function getRoleIcon(role: AdminRole) {
  switch (role) {
    case AdminRole.ADMIN:
      return <Crown className="w-4 h-4" />;
    case AdminRole.WRITER:
      return <Shield className="w-4 h-4" />;
    default:
      return <UserCheck className="w-4 h-4" />;
  }
}

function getRoleColor(role: AdminRole) {
  switch (role) {
    case AdminRole.ADMIN:
      return "from-purple-500 to-pink-500 border-purple-200 text-purple-700";
    case AdminRole.WRITER:
      return "from-blue-500 to-indigo-500 border-blue-200 text-blue-700";
    default:
      return "from-green-500 to-emerald-500 border-green-200 text-green-700";
  }
}

const AdminCard: React.FC<AdminCardProps> = ({ admin, selected, onSelect }) => {
  // const [active, setActive] = useState(admin.role === AdminRole.ADMIN);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(
    admin.role === AdminRole.ADMIN ? AdminStatus.ACTIVE : AdminStatus.INACTIVE
  );
  const handleUpdateStatus = async (adminId: number, status: AdminStatus) => {
    setIsUpdating(true);
    try {
      const response = await adminService.updateAdminStatus(adminId, status);
      if (response.success) {
        toast.success(
          `Admin ${
            status === AdminStatus.ACTIVE ? "activated" : "deactivated"
          } successfully!`
        );
        setStatus(
          status === AdminStatus.ACTIVE
            ? AdminStatus.ACTIVE
            : AdminStatus.INACTIVE
        );
      } else {
        toast.error(response.message || "Failed to update admin status");
      }
    } catch (error) {
      console.error("Failed to change active:", error);
      toast.error("An error occurred while updating admin status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`group cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-md ${
        selected
          ? "bg-blue-50 border-blue-300 shadow-md"
          : "bg-white/50 border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onSelect(admin)}
    >
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h4 className="font-semibold text-gray-800 text-lg">
              {admin.username}
            </h4>
            {selected && (
              <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">ID:</span> {admin._id}
          </p>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            Admin Account
          </div>
        </div>
        <div className="flex flex-col justify-between items-center">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRoleColor(
              admin.role
            )} text-white flex items-center space-x-1`}
          >
            {getRoleIcon(admin.role)}
            <span>{admin.role}</span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <label
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full cursor-pointer transition-all duration-300
                ${
                  status === AdminStatus.ACTIVE
                    ? "bg-green-500/20 hover:bg-green-500/30"
                    : "bg-red-500/10 hover:bg-red-500/20"
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={status === AdminStatus.ACTIVE}
                onChange={() =>
                  handleUpdateStatus(
                    Number(admin._id),
                    status === AdminStatus.ACTIVE
                      ? AdminStatus.INACTIVE
                      : AdminStatus.ACTIVE
                  )
                }
                disabled={isUpdating}
                className="accent-green-500"
              />
              <span>
                {status === AdminStatus.ACTIVE ? "Active" : "Inactive"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCard;

"use client";

import { useState } from "react";
import {
  Users,
  Shield,
  Crown,
  // Settings,
  Search,
  // UserCheck,
  // Edit3,
  Plus,
} from "lucide-react";
import { Admin, AdminRole } from "@/services/adminService";
import FormAddNewAdmin from "@/components/admin/FormAddNewAdmin";
// import AdminCard from "@/components/admin/AdminCard";
import toast from "react-hot-toast";

export default function AdminManagement() {
  const [adminList, setAdminList] = useState<Admin[]>([]);
  // const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  // const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // const [isUpdating, setIsUpdating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // const loadAdminList = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");
  //     const response = await adminService.getAdminList();
  //     if (response.success) {
  //       setAdminList(response.data || []);
  //       setFilteredAdmins(response.data || []);
  //     } else {
  //       setError(response.error || "Failed to load admin list");
  //     }
  //   } catch (error) {
  //     console.error("Failed to load admin list:", error);
  //     setError("An error occurred while loading admin list");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   // Filter admins based on search term
  //   const filtered = adminList.filter(
  //     (admin) =>
  //       admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       admin.telegram_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  //   setFilteredAdmins(filtered);
  // }, [adminList, searchTerm]);

  // const checkAdminPermission = async () => {
  //   try {
  //     const response = await authService.getCurrentAdmin();
  //     if (response.success && response.data?.role === AdminRole.ADMIN) {
  //       await loadAdminList();
  //     } else {
  //       setError("You don't have permission to view this page");
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.error("Failed to verify admin permissions:", error);
  //     setError("An error occurred while verifying permissions");
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   loadAdminList();
  //   checkAdminPermission();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // const handleRoleUpdate = async (adminId: number, newRole: AdminRole) => {
  //   try {
  //     setIsUpdating(true);
  //     const response = await adminService.updateAdminRole(adminId, newRole);
  //     if (response.success) {
  //       const updatedAdminList = adminList.map((admin) =>
  //         admin._id === adminId ? { ...admin, role: newRole } : admin
  //       );
  //       setAdminList(updatedAdminList);

  //       if (selectedAdmin?.id === adminId) {
  //         setSelectedAdmin({ ...selectedAdmin, role: newRole });
  //       }

  //       toast.success(`Successfully updated role to ${newRole}`);
  //     } else {
  //       toast.error(response.error || "Failed to update admin role");
  //     }
  //   } catch (error) {
  //     console.error("Failed to update admin role:", error);
  //     toast.error("An error occurred while updating admin role");
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

  const handleAddAdminSuccess = (newAdmin: Admin) => {
    setAdminList((prev) => [newAdmin, ...prev]);
    setIsFormOpen(false);
    toast.success("New admin added successfully!");
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
  //         <div className="mt-4 text-gray-600 font-medium">
  //           Loading admin data...
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error && adminList.length === 0) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
  //       <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
  //         <div className="text-center">
  //           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //             <AlertCircle className="text-red-600 w-8 h-8" />
  //           </div>
  //           <h3 className="text-xl font-semibold text-gray-800 mb-2">
  //             Error Loading Data
  //           </h3>
  //           <p className="text-gray-600 mb-4">{error}</p>
  //           <button
  //             // onClick={loadAdminList}
  //             className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
  //           >
  //             Try Again
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Admin Management
          </h1>
          <p className="text-gray-600 text-lg">
            Manage administrator roles and permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Admins
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {adminList.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Users className="text-white w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Root Admins</p>
                <p className="text-3xl font-bold text-gray-900">
                  {
                    adminList.filter((admin) => admin.role === AdminRole.ADMIN)
                      .length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Crown className="text-white w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Regular Admins
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {
                    adminList.filter((admin) => admin.role === AdminRole.ADMIN)
                      .length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Shield className="text-white w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <button
            className="cursor-pointer p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add New Admin
          </button>
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
                    Admin List
                  </h3>
                  <div className="text-sm text-gray-500">
                    {/* {filteredAdmins.length} of {adminList.length} admins */}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-black pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                  />
                </div>

                {/* Admin Cards */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* {filteredAdmins.map((admin) => (
                    <AdminCard
                      key={admin._id}
                      admin={admin}
                      selected={selectedAdmin?._id === admin._id}
                      onSelect={setSelectedAdmin}
                    />
                  ))} */}
                </div>
              </div>

              {/* Admin Details */}
              <div className="space-y-6"></div>
            </div>

            {/* Status Messages */}
          </div>
        </div>
        <FormAddNewAdmin
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleAddAdminSuccess}
          onError={() => toast.error("Failed to add new admin")}
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  adminService,
  Admin,
  NewAdmin,
  AdminRole,
} from "@/services/adminService";
import { X, PenTool, User, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { Image } from "antd";

interface FormAddNewAdminProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newAdmin: Admin) => void;
  onError?: () => void;
}

const FormAddNewAdmin = ({
  open,
  onClose,
  onSuccess,
  onError,
}: FormAddNewAdminProps) => {
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    email: "",
    username: "",
    password: "",
    penName: "",
    socials: [],
    avatarUrl: "",
    description: "",
    designations: [],
    role: AdminRole.WRITER,
  });
  const [loading, setLoading] = useState(false);

  // Local state for input fields
  const [socialInput, setSocialInput] = useState("");
  const [designationInput, setDesignationInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setNewAdmin((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Handle adding social links
  const addSocial = () => {
    const trimmedSocial = socialInput.trim();
    if (trimmedSocial && !newAdmin.socials.includes(trimmedSocial)) {
      setNewAdmin((prev) => ({
        ...prev,
        socials: [...prev.socials, trimmedSocial],
      }));
      setSocialInput("");
    }
  };

  const removeSocial = (socialToRemove: string) => {
    setNewAdmin((prev) => ({
      ...prev,
      socials: prev.socials.filter((social) => social !== socialToRemove),
    }));
  };

  const handleSocialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSocial();
    }
  };

  // Handle adding designations
  const addDesignation = () => {
    const trimmedDesignation = designationInput.trim();
    if (
      trimmedDesignation &&
      !newAdmin.designations.includes(trimmedDesignation)
    ) {
      setNewAdmin((prev) => ({
        ...prev,
        designations: [...prev.designations, trimmedDesignation],
      }));
      setDesignationInput("");
    }
  };

  const removeDesignation = (designationToRemove: string) => {
    setNewAdmin((prev) => ({
      ...prev,
      designations: prev.designations.filter(
        (designation) => designation !== designationToRemove
      ),
    }));
  };

  const handleDesignationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDesignation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminService.createAdmin(newAdmin);
      if (res.success) {
        toast.success("New creator added successfully!");
        setNewAdmin({
          email: "",
          username: "",
          password: "",
          penName: "",
          socials: [],
          avatarUrl: "",
          description: "",
          designations: [],
          role: AdminRole.WRITER,
        });
        setSocialInput("");
        setDesignationInput("");
        onSuccess(res.data as unknown as Admin);
      } else {
        toast.error(res.message || "Failed to create new creator");
      }
    } catch (err) {
      console.error("Error creating new creator:", err);
      toast.error("An error occurred while creating the creator");
      if (onError) onError();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-gray-100"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center mb-6">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <PenTool className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <UserPlus className="w-6 h-6 text-purple-500" />
                Add New Admin
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email & Username Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Email *
                  </label>
                  <input
                    className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter email address"
                    type="email"
                    name="email"
                    value={newAdmin.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Username *
                  </label>
                  <input
                    className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter username"
                    name="username"
                    value={newAdmin.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Pen Name & Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Pen Name
                  </label>
                  <input
                    className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Professional writing name"
                    name="penName"
                    value={newAdmin.penName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Password *
                  </label>
                  <input
                    className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter secure password"
                    type="password"
                    name="password"
                    value={newAdmin.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Avatar URL
                </label>
                <input
                  className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                  name="avatarUrl"
                  value={newAdmin.avatarUrl}
                  onChange={handleChange}
                />

                {newAdmin.avatarUrl && (
                  <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Image
                      src={newAdmin.avatarUrl}
                      alt="Avatar preview"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      Avatar preview
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Description
                </label>
                <textarea
                  className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm resize-none"
                  placeholder="Tell us about this creator..."
                  name="description"
                  rows={3}
                  value={newAdmin.description}
                  onChange={handleChange}
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Professional background and expertise</span>
                  <span>{newAdmin.description.length}/500</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Social Links
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={socialInput}
                    onChange={(e) => setSocialInput(e.target.value)}
                    onKeyDown={handleSocialKeyDown}
                    placeholder="https://twitter.com/username"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addSocial}
                    disabled={!socialInput.trim()}
                    className="px-4 py-3 text-sm bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                  >
                    Add
                  </button>
                </div>

                {newAdmin.socials.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newAdmin.socials.map((social, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-full border border-purple-200"
                      >
                        {social.length > 30
                          ? `${social.substring(0, 30)}...`
                          : social}
                        <button
                          type="button"
                          onClick={() => removeSocial(social)}
                          className="hover:text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Designations */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Designations
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={designationInput}
                    onChange={(e) => setDesignationInput(e.target.value)}
                    onKeyDown={handleDesignationKeyDown}
                    placeholder="e.g., Senior Writer, Tech Analyst"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addDesignation}
                    disabled={!designationInput.trim()}
                    className="px-4 py-3 text-sm bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                  >
                    Add
                  </button>
                </div>

                {newAdmin.designations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newAdmin.designations.map((designation, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200"
                      >
                        {designation}
                        <button
                          type="button"
                          onClick={() => removeDesignation(designation)}
                          className="hover:text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Role
                </label>
                <select
                  className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm appearance-none"
                  name="role"
                  value={newAdmin.role}
                  onChange={handleChange}
                >
                  <option value="admin">Admin</option>
                  <option value="writer">Writer</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  className="px-6 py-3 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    loading ||
                    !newAdmin.username ||
                    !newAdmin.email ||
                    !newAdmin.password
                  }
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Creator
                    </span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormAddNewAdmin;

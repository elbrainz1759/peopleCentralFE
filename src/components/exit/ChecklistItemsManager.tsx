"use client";
import React, { useState, useEffect } from "react";
import { exitServiceInstance, ChecklistItem } from "@/services/exit.service";
import { authService } from "@/services/auth.service";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { EyeIcon, PencilIcon, TrashBinIcon, MoreDotIcon, PlusIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Drawer } from "../ui/drawer/Drawer";

export default function ChecklistItemsManager() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    departmentId: "", // Will be set when departments are loaded
    name: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = React.useCallback(async () => {
    setIsLoadingDepartments(true);
    try {
      const response = await exitServiceInstance.getDepartments();
      const departmentsData = response.data || response || [];
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      
      // Set default department if none selected
      if (departmentsData.length > 0 && !formData.departmentId) {
        setFormData(prev => ({
          ...prev,
          departmentId: departmentsData[0].unique_id
        }));
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast.error("Could not load departments");
    } finally {
      setIsLoadingDepartments(false);
    }
  }, [formData.departmentId]);

  const fetchChecklistItems = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await exitServiceInstance.getAllChecklistItems();
      const itemsData = response.data || response || [];
      setChecklistItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error("Failed to fetch checklist items:", error);
      toast.error("Could not load checklist items");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecklistItems();
    fetchDepartments();
  }, [fetchChecklistItems, fetchDepartments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await exitServiceInstance.updateChecklistItem(editingItem.id!, formData);
        toast.success("Checklist item updated successfully!");
      } else {
        await exitServiceInstance.createChecklistItem(formData);
        toast.success("Checklist item created successfully!");
      }
      
      setIsDrawerOpen(false);
      resetForm();
      fetchChecklistItems();
    } catch (error: any) {
      console.error("Failed to save checklist item:", error);
      toast.error(error.response?.data?.message || "Failed to save checklist item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: ChecklistItem) => {
    setEditingItem(item);
    setFormData({
      departmentId: item.department, // Use department field from API
      name: item.name,
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await exitServiceInstance.deleteChecklistItem(deleteId);
      toast.success("Checklist item deleted successfully");
      fetchChecklistItems();
    } catch (error) {
      toast.error("Failed to delete checklist item");
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      departmentId: departments.length > 0 ? departments[0].unique_id : "",
      name: "",
    });
    setEditingItem(null);
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  const getDepartmentName = (departmentId: string, departmentName?: string) => {
    // If department_name is available in the data, use it
    if (departmentName) return departmentName;
    
    // Otherwise, find by departmentId (unique_id)
    const department = departments.find((dept: any) => 
      dept.unique_id === departmentId
    );
    return department?.name || `Department ${departmentId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Exit Checklist Items
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage department-specific checklist items for exit clearance
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsDrawerOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Add Checklist Item
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  S/N
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Item Name
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Department
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                    Loading checklist items...
                  </TableCell>
                </TableRow>
              ) : checklistItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                    No checklist items found. Start by adding some items.
                  </TableCell>
                </TableRow>
              ) : (
                checklistItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {item.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {getDepartmentName(item.department, item.departmentName)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(item.id?.toString() || '')}
                          className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          style={{ transform: 'rotate(90deg)' }}
                        >
                          <MoreDotIcon className="w-5 h-5" />
                        </button>
                        <Dropdown
                          isOpen={openDropdownId === item.id?.toString()}
                          onClose={closeDropdown}
                          className="w-40 right-0 mt-2 top-full"
                        >
                          <DropdownItem
                            onItemClick={() => {
                              closeDropdown();
                              handleEdit(item);
                            }}
                            className="flex gap-2 items-center"
                          >
                            <PencilIcon className="w-4 h-4" />
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            onItemClick={() => {
                              closeDropdown();
                              handleDelete(item.id!);
                            }}
                            className="flex gap-2 items-center text-red-500"
                          >
                            <TrashBinIcon className="w-4 h-4" />
                            Delete
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingItem ? "Edit Checklist Item" : "Add Checklist Item"}
      >
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Department *
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                required
                disabled={isLoadingDepartments}
              >
                <option value="">
                  {isLoadingDepartments ? "Loading departments..." : "Select Department"}
                </option>
                {departments.map((dept: any) => (
                  <option key={dept.unique_id} value={dept.unique_id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Laptop, ID Card, Access Key"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Saving..." : "Save Item"}
              </button>
            </div>
          </form>
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this checklist item? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

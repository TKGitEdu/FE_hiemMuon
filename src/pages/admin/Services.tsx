import { useEffect, useState } from "react";
import { servicesAPI, type Service } from "../../api/adminApi/servicesAPI";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<Omit<Service, "serviceId">>({
    name: "",
    description: "",
    price: 0,
    status: "Active", // Set default status to "Active"
    category: "",
  });
  const [confirmStatus, setConfirmStatus] = useState<{
    service: Service | null;
    newStatus: string;
  }>({ service: null, newStatus: "" });
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await servicesAPI.getAllService();
      // Normalize status to handle case-insensitive "active"
      const normalizedData = data.map((service: Service) => ({
        ...service,
        status: service.status.toLowerCase() === "active" ? "Active" : service.status,
      }));
      setServices(normalizedData);
    } catch (err) {
      console.error("Lỗi khi lấy dịch vụ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description,
      price: service.price,
      status: service.status.toLowerCase() === "active" ? "Active" : service.status,
      category: service.category,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // Ensure status is not empty or null
      const normalizedForm = {
        ...form,
        status: form.status.toLowerCase() === "active" || !form.status ? "Active" : form.status,
      };
      if (editingService) {
        await servicesAPI.update(editingService.serviceId, {
          ...normalizedForm,
          serviceId: editingService.serviceId,
        });
      } else {
        await servicesAPI.create({
          ...normalizedForm,
          serviceId: "",
        });
      }
      setModalOpen(false);
      setEditingService(null);
      await fetchServices();
      setSuccessMsg("Cập nhật dịch vụ thành công!");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      console.error("Lỗi khi lưu dịch vụ:", err);
    }
  };

  // Gọi khi chọn dropdown trạng thái
  // const handleStatusSelect = (service: Service, newStatus: string) => {
  //   const normalizedStatus = newStatus.toLowerCase() === "active" ? "Active" : newStatus;
  //   setConfirmStatus({ service, newStatus: normalizedStatus });
  // };

  // Xác nhận update trạng thái
  const handleConfirmStatus = async () => {
    if (!confirmStatus.service) return;
    try {
      const normalizedStatus = confirmStatus.newStatus.toLowerCase() === "active" ? "Active" : confirmStatus.newStatus;
      await servicesAPI.update(confirmStatus.service.serviceId, {
        ...confirmStatus.service,
        status: normalizedStatus,
      });
      setServices((prev) =>
        prev.map((s) =>
          s.serviceId === confirmStatus.service?.serviceId
            ? { ...s, status: normalizedStatus }
            : s
        )
      );
      setConfirmStatus({ service: null, newStatus: "" });
      setSuccessMsg("Cập nhật trạng thái thành công!");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      alert("Cập nhật trạng thái thất bại!");
      setConfirmStatus({ service: null, newStatus: "" });
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
            Quản lý dịch vụ
          </h1>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:cursor-pointer"
            onClick={() => {
              setForm({
                name: "",
                description: "",
                price: 0,
                status: "Active", // Set default status to "Active"
                category: "",
              });
              setEditingService(null);
              setModalOpen(true);
            }}
          >
            + Thêm dịch vụ mới
          </Button>
        </div>

        {/* Thông báo nhỏ */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[100] bg-green-500 text-white px-4 py-2 rounded shadow transition">
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-4 border-t-indigo-600 border-gray-200 rounded-full"
            ></motion.div>
          </div>
        ) : (
          <div className="grid gap-6">
            {services.map((s, idx) => (
              <motion.div
                key={s.serviceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg hover:bg-indigo-50 transition-all duration-300 cursor-pointer"
                onClick={() => handleEdit(s)}
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="font-semibold text-gray-800">{s.name}</div>
                  <div className="text-gray-600 md:col-span-2">{s.description}</div>
                  <div className="text-gray-800 font-medium">
                    {s.price.toLocaleString("vi-VN")} ₫
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2 py-1 rounded-lg ${
                        s.status.toLowerCase() === "active" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                      }`}
                    >
                      {s.status.toLowerCase() === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </div>
                  <div className="text-gray-700">{s.category}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-Blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                  {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên dịch vụ
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên dịch vụ"
                      className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      placeholder="Nhập mô tả dịch vụ"
                      className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                      rows={4}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá
                    </label>
                    <input
                      type="number"
                      placeholder="Nhập giá dịch vụ"
                      className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all duration-200 hover:cursor-pointer"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Active">Hoạt động</option>
                      <option value="Inactive">Ngừng hoạt động</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập danh mục"
                      className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 hover:cursor-pointer"
                      onClick={() => setModalOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:cursor-pointer"
                      onClick={handleSubmit}
                    >
                      {editingService ? "Lưu" : "Thêm"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popup xác nhận cập nhật trạng thái */}
        <AnimatePresence>
          {confirmStatus.service && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm"
              >
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Xác nhận cập nhật trạng thái
                </h2>
                <p className="mb-6">
                  Bạn có chắc muốn đổi trạng thái dịch vụ <b>{confirmStatus.service.name}</b> thành <b>{confirmStatus.newStatus.toLowerCase() === "active" ? "Hoạt động" : "Ngừng hoạt động"}</b>?
                </p>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 hover:cursor-pointer"
                    onClick={() => setConfirmStatus({ service: null, newStatus: "" })}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:cursor-pointer"
                    onClick={handleConfirmStatus}
                  >
                    Xác nhận
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
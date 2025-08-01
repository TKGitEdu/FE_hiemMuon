import React, { useEffect, useState } from "react";
import { BookingAPI, type BookingResponse } from "../../api/adminApi/bookingsAPI";
import { motion } from "framer-motion";

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await BookingAPI.getAllBookings();
        setBookings(response); 
      } catch (err) {
        setError("Không thể tải dữ liệu lịch hẹn.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // const handleCancel = async (bookingId: string) => {
  //   if (!window.confirm("Bạn có chắc muốn hủy lịch hẹn này?")) return;
  //   try {
  //     await BookingAPI.cancelBooking(bookingId);
  //     setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
  //   } catch {
  //     alert("Hủy lịch hẹn thất bại!");
  //   }
  // };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="h-16 w-16 border-4 border-t-indigo-500 border-b-purple-500 rounded-full"
      ></motion.div>
    </div>
  );
  if (error) return <p className="p-4 text-red-600 font-medium bg-white shadow-md rounded-lg mx-auto max-w-md">{error}</p>;

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-200 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 mb-10">
           Lịch hẹn
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-lg">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10">
              <tr>
                <th className="text-left px-6 py-4 font-semibold">NO</th>
                <th className="text-left px-6 py-4 font-semibold">Bệnh nhân</th>
                <th className="text-left px-6 py-4 font-semibold">Dịch vụ</th>
                <th className="text-left px-6 py-4 font-semibold">Bác sĩ</th>
                <th className="text-left px-6 py-4 font-semibold">Ngày hẹn</th>
                <th className="text-left px-6 py-4 font-semibold">Khung giờ</th>
                <th className="text-left px-6 py-4 font-semibold">Trạng thái</th>
                <th className="text-left px-6 py-4 font-semibold">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-100">
              {bookings.map((booking, idx) => (
                <motion.tr
                  key={booking.bookingId || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.1)", scale: 1.02 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">{idx + 1}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {booking.patient?.name || ""}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {booking.service?.name || ""}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {booking.doctor?.doctorName || ""}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap max-w-[150px]">
                    {booking.dateBooking ? new Date(booking.dateBooking).toLocaleString("vi-VN") : ""}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap max-w-[120px]">
                    {booking.slot?.slotName || ""}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap max-w-[120px]">
                    {booking.status || ""}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {booking.note || ""}
                  </td>
                  
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
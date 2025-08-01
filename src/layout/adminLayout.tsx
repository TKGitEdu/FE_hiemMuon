import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut,DollarSign, Home, Users,  Beaker, List, BriefcaseMedical, CalendarDays } from "lucide-react";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      // setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const sidebarLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/admin/services", label: "Dịch vụ", icon: <List size={20} /> },
    { path: "/admin/patients", label: "Quản lý bệnh nhân", icon: <Users size={20} /> },
    { path: "/admin/doctors", label: "Quản lý bác sĩ", icon: <Users size={20} /> },
    { path: "/admin/bookings", label: "Lịch hẹn", icon: <CalendarDays size={20} /> },
    { path: "/admin/examinations", label: "Xét nghiệm", icon: <Beaker size={20} /> },
     { path: "/admin/medicines", label: "Quản lí thuốc", icon: <BriefcaseMedical size={20} /> },
    { path: "/admin/payments", label: "Giao dịch thanh toán", icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-6 py-8 flex flex-col fixed top-0 left-0 h-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-10">Administrator </h2>
        <nav className="flex-1 space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 ${
                location.pathname === link.path
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-200 hover:cursor-pointer gap-2 px-4 py-2 text-black  hover:bg-red-400 rounded-md transition-colors duration-200"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <div className="bg-white rounded-lg shadow-md p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
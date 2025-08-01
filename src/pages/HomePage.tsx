import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ClipboardCheck, 
  ActivitySquare, 
  BellRing, 
  ArrowRight,
  Star
} from "lucide-react";
import { Button } from "../components/ui/button";
// import FeaturesSection from "../components/feature";
// import Footer from "../components/footer";
import Header from "../components/header";
// import HeroSection from "../components/HeroSection";
import { useAuth } from "../contexts/AuthContext";

// Giả lập dữ liệu dịch vụ
const services = [
  {
    id: 1,
    title: "Thụ tinh trong tử cung (IUI)",
    description: "Phương pháp hỗ trợ sinh sản đơn giản, tinh trùng được đưa trực tiếp vào tử cung.",
    icon: <ClipboardCheck className="h-10 w-10 text-blue-600" />,
    image: "/dist/anhchofehiemmuon/iuv-service.jpg"
  },
  {
    id: 2,
    title: "Thụ tinh trong ống nghiệm (IVF)",
    description: "Phương pháp thụ tinh trứng và tinh trùng trong môi trường phòng thí nghiệm.",
    icon: <ActivitySquare className="h-10 w-10 text-blue-600" />,
    image: "/dist/anhchofehiemmuon/IVF.jpg"
  },
  {
    id: 3,
    title: "Bảo quản trứng và tinh trùng",
    description: "Dịch vụ bảo quản trứng và tinh trùng cho những người muốn trì hoãn việc có con.",
    icon: <BellRing className="h-10 w-10 text-blue-600" />,
    image: "/dist/anhchofehiemmuon/baoquantrungtinhtrung.jpg"
  }
];

// Giả lập dữ liệu bác sĩ
const doctors = [
  {
    id: 1,
    name: "TS. BS. Nguyễn Văn A",
    specialty: "Chuyên gia IVF",
    image: "/dist/anhchofehiemmuon/isha.jpg",
    rating: 4.9,
    reviews: 120
  },
  {
    id: 2,
    name: "PGS. TS. Trần Thị B",
    specialty: "Sản phụ khoa",
    image: "/dist/anhchofehiemmuon/isha.jpg",
    rating: 4.8,
    reviews: 95
  },
  {
    id: 3,
    name: "TS. BS. Lê Văn C",
    specialty: "Nội tiết sinh sản",
    image: "/dist/anhchofehiemmuon/isha.jpg",
    rating: 4.7,
    reviews: 88
  }
];

// Giả lập dữ liệu bài viết
const blogs = [
  {
    id: 1,
    title: "5 cách tự nhiên để cải thiện khả năng sinh sản",
    excerpt: "Các phương pháp tự nhiên có thể giúp cải thiện khả năng sinh sản...",
    image: "/dist/anhchofehiemmuon/isha.jpg",
    date: "10/06/2025"
  },
  {
    id: 2,
    title: "Hiểu về quy trình IVF: Từ chuẩn bị đến kết quả",
    excerpt: "Hướng dẫn chi tiết về quy trình thụ tinh trong ống nghiệm...",
    image: "/dist/anhchofehiemmuon/isha.jpg",
    date: "05/06/2025"
  },
  {
    id: 3,
    title: "Chế độ dinh dưỡng cho phụ nữ đang điều trị hiếm muộn",
    excerpt: "Những thực phẩm nên và không nên ăn trong quá trình điều trị...",
    image: "/dist/anhchofehiemmuon/isha.jpg",
    date: "01/06/2025"
  }
];

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const userRole = localStorage.getItem('userRole');

  // Hàm lấy link dashboard dựa trên vai trò
  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin/dashboard';
    if (userRole === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-blue-100 py-20 overflow-hidden mt-20">{/* mt-20 để tránh bị che bởi fixed header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isAuthenticated ? (
                // Hiển thị nội dung cá nhân hóa cho người dùng đã đăng nhập
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Xin chào, {user?.fullName || 'Bạn'}!
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn trong hành trình điều trị. Hãy khám phá các dịch vụ của chúng tôi hoặc kiểm tra lịch hẹn của bạn.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/booking">
                      <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                        Đặt lịch khám
                      </Button>
                    </Link>
                    <Link to={getDashboardLink()}>
                      <Button variant="outline" className="px-6 py-3 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        Trang cá nhân
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                // Hiển thị nội dung mặc định cho người dùng chưa đăng nhập
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Mang lại cơ hội làm cha mẹ cho mọi gia đình
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">
                    Với đội ngũ bác sĩ chuyên môn cao và trang thiết bị hiện đại, chúng tôi cung cấp các giải pháp điều trị hiếm muộn hiệu quả, mang lại hạnh phúc trọn vẹn cho gia đình bạn.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/booking">
                      <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                        Đặt lịch ngay
                      </Button>
                    </Link>
                    <Link to="/services">
                      <Button variant="outline" className="px-6 py-3 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        Tìm hiểu dịch vụ
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img 
                src="/dist/anhchofehiemmuon/welcomequaytrolai1.jpg" 
                alt="Happy family" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">5000+</p>
              <p className="text-gray-600">Bệnh nhân tin tưởng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">1000+</p>
              <p className="text-gray-600">Ca điều trị thành công</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">20+</p>
              <p className="text-gray-600">Bác sĩ chuyên môn</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">15+</p>
              <p className="text-gray-600">Năm kinh nghiệm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dịch vụ điều trị hiếm muộn</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp các dịch vụ điều trị hiếm muộn chất lượng cao với quy trình chuẩn quốc tế
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <motion.div 
                key={service.id}
                className="bg-blue-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -10 }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link to={`/services/${service.id}`} className="text-blue-600 font-medium flex items-center hover:text-blue-800">
                    Chi tiết dịch vụ <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/services">
              <Button variant="outline" className="px-6 py-3 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                Xem tất cả dịch vụ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quy trình điều trị</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Quy trình điều trị hiếm muộn được thiết kế tối ưu, đảm bảo hiệu quả và sự thoải mái cho bệnh nhân
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tư vấn ban đầu</h3>
              <p className="text-gray-600">Gặp gỡ bác sĩ để tìm hiểu nguyên nhân và lập kế hoạch điều trị</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xét nghiệm</h3>
              <p className="text-gray-600">Thực hiện các xét nghiệm cần thiết để đánh giá tình trạng</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Điều trị</h3>
              <p className="text-gray-600">Thực hiện phương pháp điều trị phù hợp (IUI, IVF,...)</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Theo dõi</h3>
              <p className="text-gray-600">Theo dõi tiến trình và hỗ trợ liên tục trong suốt quá trình</p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link to="/booking">
              <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                Đăng ký tư vấn ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ bác sĩ</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Đội ngũ bác sĩ của chúng tôi là những chuyên gia hàng đầu trong lĩnh vực điều trị hiếm muộn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <motion.div 
                key={doctor.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{doctor.specialty}</p>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-gray-700">{doctor.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({doctor.reviews} đánh giá)</span>
                  </div>
                  <Link to={`/doctors/${doctor.id}`} className="text-blue-600 font-medium flex items-center hover:text-blue-800">
                    Xem hồ sơ <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/doctors">
              <Button variant="outline" className="px-6 py-3 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                Xem tất cả bác sĩ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Câu chuyện thành công</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Những câu chuyện từ khách hàng đã thành công trong hành trình điều trị hiếm muộn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <img 
                    src="/dist/anhchofehiemmuon/isha.jpg" 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Gia đình anh Minh & chị Hà</h4>
                  <p className="text-blue-600">Điều trị IVF thành công</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Sau 5 năm chờ đợi, chúng tôi đã có được niềm hạnh phúc vô bờ khi chào đón con trai đầu lòng. Cảm ơn đội ngũ y bác sĩ tại FertilityCare đã đồng hành cùng chúng tôi suốt quá trình điều trị."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <img 
                    src="/dist/anhchofehiemmuon/isha.jpg" 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Chị Thủy & anh Nam</h4>
                  <p className="text-blue-600">Điều trị IUI thành công</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Tôi đã từng nghĩ mình sẽ không bao giờ có con. Nhưng sau khi được tư vấn và điều trị tại FertilityCare, chúng tôi đã có thai sau lần thử đầu tiên. Thật sự là một phép màu!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bài viết mới nhất</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Cập nhật những thông tin hữu ích về sức khỏe sinh sản và điều trị hiếm muộn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <motion.div 
                key={blog.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-500 text-sm mb-2">{blog.date}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{blog.title}</h3>
                  <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                  <Link to={`/blog/${blog.id}`} className="text-blue-600 font-medium flex items-center hover:text-blue-800">
                    Đọc tiếp <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/blog">
              <Button variant="outline" className="px-6 py-3 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                Xem tất cả bài viết
              </Button>
            </Link>
          </div>
        </div>
      </section>      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {isAuthenticated ? (
              <>
                <h2 className="text-3xl font-bold mb-6">Tiếp tục hành trình điều trị của bạn</h2>
                <p className="text-lg mb-8 max-w-3xl mx-auto">
                  Đặt lịch tư vấn hoặc kiểm tra lịch hẹn hiện tại của bạn
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/booking">
                    <Button className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-lg hover:shadow-xl transition-all text-lg">
                      Đặt lịch mới
                    </Button>
                  </Link>
                  <Link to={`${userRole?.toLowerCase() || 'patient'}/appointments`}>
                    <Button variant="outline" className="px-8 py-3 bg-transparent border-white text-white hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-xl transition-all text-lg">
                      Xem lịch hẹn
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-6">Bắt đầu hành trình làm cha mẹ ngay hôm nay</h2>
                <p className="text-lg mb-8 max-w-3xl mx-auto">
                  Đặt lịch tư vấn để nhận được sự hỗ trợ chuyên nghiệp từ các bác sĩ của chúng tôi
                </p>
                <Link to="/booking">
                  <Button className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-lg hover:shadow-xl transition-all text-lg">
                    Đặt lịch hẹn ngay
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, Star, Filter } from "lucide-react";
import { Button } from "../components/ui/button";

// Giả lập dữ liệu dịch vụ
const services = [
  {
    id: 1,
    title: "Thụ tinh trong tử cung (IUI)",
    description: "Phương pháp điều trị hiếm muộn đơn giản, ít xâm lấn. Tinh trùng được xử lý và đưa trực tiếp vào tử cung, giúp tăng cơ hội thụ thai.",
    shortDescription: "Phương pháp hỗ trợ sinh sản đơn giản, tinh trùng được đưa trực tiếp vào tử cung.",
    image: "/anhchofehiemmuon/Dr_ Romantic.jpg",
    price: "15,000,000 - 25,000,000 VNĐ",
    rating: 4.8,
    reviewCount: 56,
    categories: ["Điều trị cơ bản", "Phổ biến"]
  },
  {
    id: 2,
    title: "Thụ tinh trong ống nghiệm (IVF)",
    description: "Phương pháp điều trị hiếm muộn hiện đại, trứng và tinh trùng được kết hợp trong phòng thí nghiệm. Phôi được nuôi cấy và chuyển vào tử cung.",
    shortDescription: "Phương pháp thụ tinh trứng và tinh trùng trong môi trường phòng thí nghiệm.",
    image: "/anhchofehiemmuon/Dr_ Romantic.jpg",
    price: "60,000,000 - 120,000,000 VNĐ",
    rating: 4.9,
    reviewCount: 124,
    categories: ["Điều trị nâng cao", "Phổ biến"]
  },
  {
    id: 3,
    title: "Tiêm tinh trùng vào bào tương trứng (ICSI)",
    description: "Kỹ thuật tiên tiến trong IVF, tinh trùng được tiêm trực tiếp vào trứng. Phù hợp cho các trường hợp tinh trùng yếu hoặc ít.",
    shortDescription: "Kỹ thuật tiên tiến, tinh trùng được tiêm trực tiếp vào trứng.",
    image: "/anhchofehiemmuon/Dr_ Romantic.jpg",
    price: "70,000,000 - 130,000,000 VNĐ",
    rating: 4.7,
    reviewCount: 89,
    categories: ["Điều trị nâng cao", "Hiện đại"]
  },
  {
    id: 4,
    title: "Bảo quản trứng",
    description: "Dịch vụ bảo quản trứng trong nitrogen lỏng, giúp phụ nữ lưu trữ trứng khi còn trẻ để sử dụng trong tương lai.",
    shortDescription: "Dịch vụ bảo quản trứng cho những người muốn trì hoãn việc có con.",
    image: "/anhchofehiemmuon/Dr_ Romantic.jpg",
    price: "30,000,000 - 40,000,000 VNĐ",
    rating: 4.6,
    reviewCount: 42,
    categories: ["Bảo quản", "Hiện đại"]
  },
  {
    id: 5,
    title: "Bảo quản tinh trùng",
    description: "Dịch vụ bảo quản tinh trùng trong nitrogen lỏng, phù hợp trước khi điều trị ung thư hoặc lưu trữ để sử dụng trong tương lai.",
    shortDescription: "Dịch vụ bảo quản tinh trùng trong điều kiện tối ưu, an toàn lâu dài.",
    image: "/anhchofehiemmuon/Dr_ Romantic.jpg",
    price: "20,000,000 - 30,000,000 VNĐ",
    rating: 4.5,
    reviewCount: 38,
    categories: ["Bảo quản", "Hiện đại"]
  },
  {
    id: 6,
    title: "Tư vấn di truyền",
    description: "Dịch vụ tư vấn và sàng lọc các bệnh di truyền trước khi thực hiện các biện pháp hỗ trợ sinh sản, giúp sinh con khỏe mạnh.",
    shortDescription: "Tư vấn và sàng lọc các bệnh di truyền trước khi thực hiện hỗ trợ sinh sản.",
    image: "/anhchofehiemmuon/Dr_ Romantic.jpg",
    price: "5,000,000 - 15,000,000 VNĐ",
    rating: 4.8,
    reviewCount: 65,
    categories: ["Tư vấn", "Sàng lọc"]
  },
  {
    id: 7,
    title: "Sàng lọc phôi tiền làm tổ (PGT)",
    description: "Kỹ thuật kiểm tra phôi trước khi cấy vào tử cung, giúp phát hiện bất thường di truyền và tăng tỷ lệ thành công của IVF.",
    shortDescription: "Kỹ thuật kiểm tra phôi trước khi cấy vào tử cung, phát hiện bất thường di truyền.",
    image: "/anhchofehiemmuon/Dr_ Romantic.jpg",
    price: "40,000,000 - 60,000,000 VNĐ",
    rating: 4.9,
    reviewCount: 47,
    categories: ["Sàng lọc", "Hiện đại", "Điều trị nâng cao"]
  },
  {
    id: 8,
    title: "Hiến tặng trứng",
    description: "Dịch vụ hiến tặng trứng cho các cặp vợ chồng không thể sử dụng trứng của người vợ để thụ thai, với quy trình chọn lọc kỹ lưỡng.",
    shortDescription: "Dịch vụ hiến tặng trứng cho các cặp vợ chồng có nhu cầu.",
    image: "/anhchofehiemmuon/Dr_ Romantic.jpg",
    price: "80,000,000 - 150,000,000 VNĐ",
    rating: 4.7,
    reviewCount: 36,
    categories: ["Hiến tặng", "Điều trị nâng cao"]
  }
];

// Lấy tất cả các danh mục từ dịch vụ
const allCategories = Array.from(
  new Set(services.flatMap(service => service.categories))
);

const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
                          service.categories.some(category => selectedCategories.includes(category));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Dịch vụ điều trị hiếm muộn</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
            Chúng tôi cung cấp đa dạng dịch vụ điều trị hiếm muộn với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="w-full md:w-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-auto">
              <Button
                variant="outline"
                className="w-full md:w-auto border-gray-300 text-gray-700 flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                Lọc theo danh mục
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-gray-700 font-medium">{service.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm ml-2">({service.reviewCount} đánh giá)</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.shortDescription}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.categories.map((category) => (
                    <span
                      key={category}
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <p className="text-blue-600 font-medium mb-4">{service.price}</p>
                <div className="flex justify-between items-center">
                  <Link to={`/services/${service.id}`} className="text-blue-600 font-medium flex items-center hover:text-blue-800">
                    Chi tiết dịch vụ <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to={`/booking?service=${service.id}`}>
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Đặt lịch
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Không tìm thấy dịch vụ phù hợp</p>
            <p className="text-gray-500 mt-2">Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa các bộ lọc</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-blue-600 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-12 md:py-16 md:px-12 text-center md:text-left md:flex md:items-center md:justify-between">
            <div className="md:flex-1 mb-8 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">Bạn cần được tư vấn?</h2>
              <p className="text-blue-100">
                Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn trong hành trình điều trị hiếm muộn
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/booking">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 shadow-md">
                  Đặt lịch tư vấn
                </Button>
              </Link>
              <Link to="/doctors">
                <Button variant="outline" className="border-white text-white hover:bg-blue-700 px-6 py-3">
                  Gặp bác sĩ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;

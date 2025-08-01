import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, User, ArrowRight, Tag } from "lucide-react";
import { Button } from "../components/ui/button";

// Giả lập dữ liệu bài viết
const allBlogs = [
  {
    id: 1,
    title: "5 cách tự nhiên để cải thiện khả năng sinh sản",
    excerpt: "Các phương pháp tự nhiên có thể giúp cải thiện khả năng sinh sản như chế độ ăn uống, tập luyện và giảm stress.",
    content: "Nội dung chi tiết về các phương pháp tự nhiên giúp cải thiện khả năng sinh sản...",
    image: "/dist/anhchofehiemmuon/isha5.jpg",
    date: "10/06/2025",
    author: "BS. Nguyễn Văn A",
    category: "Sức khỏe sinh sản",
    tags: ["Sức khỏe", "Tự nhiên", "Sinh sản"]
  },
  {
    id: 2,
    title: "Hiểu về quy trình IVF: Từ chuẩn bị đến kết quả",
    excerpt: "Hướng dẫn chi tiết về quy trình thụ tinh trong ống nghiệm từ bước chuẩn bị ban đầu đến khi có kết quả.",
    content: "Nội dung chi tiết về quy trình IVF...",
    image: "/dist/anhchofehiemmuon/isha5.jpg",
    date: "05/06/2025",
    author: "TS. Trần Thị B",
    category: "IVF",
    tags: ["IVF", "Điều trị hiếm muộn", "Thụ tinh ống nghiệm"]
  },
  {
    id: 3,
    title: "Chế độ dinh dưỡng cho phụ nữ đang điều trị hiếm muộn",
    excerpt: "Những thực phẩm nên và không nên ăn trong quá trình điều trị hiếm muộn để tăng cơ hội thành công.",
    content: "Nội dung chi tiết về chế độ dinh dưỡng...",
    image: "/dist/anhchofehiemmuon/isha5.jpg",
    date: "01/06/2025",
    author: "BS. Lê Văn C",
    category: "Dinh dưỡng",
    tags: ["Dinh dưỡng", "Hiếm muộn", "Sức khỏe"]
  },
  {
    id: 4,
    title: "Yếu tố tâm lý trong quá trình điều trị hiếm muộn",
    excerpt: "Hiểu về tác động của yếu tố tâm lý và cách quản lý stress trong quá trình điều trị hiếm muộn.",
    content: "Nội dung chi tiết về yếu tố tâm lý...",
    image: "/dist/anhchofehiemmuon/isha5.jpg",
    date: "25/05/2025",
    author: "ThS. Phạm Thị D",
    category: "Tâm lý",
    tags: ["Tâm lý", "Stress", "Hỗ trợ tinh thần"]
  },
  {
    id: 5,
    title: "Những tiến bộ mới nhất trong điều trị vô sinh nam",
    excerpt: "Cập nhật các phương pháp điều trị mới nhất dành cho nam giới bị vô sinh hiếm muộn.",
    content: "Nội dung chi tiết về tiến bộ trong điều trị vô sinh nam...",
    image: "/dist/anhchofehiemmuon/isha5.jpg",
    date: "20/05/2025",
    author: "PGS. TS. Đỗ Văn E",
    category: "Vô sinh nam",
    tags: ["Vô sinh nam", "Điều trị hiếm muộn", "Công nghệ mới"]
  },
  {
    id: 6,
    title: "Làm thế nào để chuẩn bị tâm lý khi bắt đầu IVF",
    excerpt: "Các bước chuẩn bị tâm lý quan trọng trước khi bắt đầu quá trình điều trị IVF.",
    content: "Nội dung chi tiết về chuẩn bị tâm lý...",
    image: "/dist/anhchofehiemmuon/isha5.jpg",
    date: "15/05/2025",
    author: "BS. CKI. Hoàng Thị F",
    category: "IVF",
    tags: ["IVF", "Tâm lý", "Chuẩn bị"]
  },
  {
    id: 7,
    title: "Vai trò của nam giới trong quá trình điều trị hiếm muộn",
    excerpt: "Vai trò quan trọng của người chồng trong việc hỗ trợ vợ và đóng góp vào quá trình điều trị.",
    content: "Nội dung chi tiết về vai trò của nam giới...",
    image: "/dist/anhchofehiemmuon/isha5.jpg",
    date: "10/05/2025",
    author: "TS. BS. Nguyễn Văn A",
    category: "Hỗ trợ gia đình",
    tags: ["Hỗ trợ", "Vai trò nam giới", "Quan hệ vợ chồng"]
  },
  {
    id: 8,
    title: "So sánh chi tiết giữa IUI và IVF: Nên chọn phương pháp nào?",
    excerpt: "Phân tích ưu nhược điểm của hai phương pháp điều trị hiếm muộn phổ biến: IUI và IVF.",
    content: "Nội dung chi tiết so sánh IUI và IVF...",
    image: "/dist/anhchofehiemmuon/isha5.jpg",
    date: "05/05/2025",
    author: "PGS. TS. Trần Thị B",
    category: "Điều trị hiếm muộn",
    tags: ["IUI", "IVF", "So sánh"]
  },
  {
    id: 9,
    title: "Những câu chuyện thành công: Hành trình vượt qua hiếm muộn",
    excerpt: "Các câu chuyện có thật về những cặp vợ chồng đã vượt qua hiếm muộn và có được hạnh phúc làm cha mẹ.",
    content: "Nội dung chi tiết về các câu chuyện thành công...",
    image: "/dist/anhchofehiemmuon/isha5.jpg",
    date: "01/05/2025",
    author: "BS. Lê Văn C",
    category: "Câu chuyện thành công",
    tags: ["Câu chuyện", "Thành công", "Truyền cảm hứng"]
  }
];

// Các danh mục
const categories = [
  "Tất cả",
  "Sức khỏe sinh sản",
  "IVF",
  "Dinh dưỡng",
  "Tâm lý",
  "Vô sinh nam",
  "Hỗ trợ gia đình",
  "Điều trị hiếm muộn",
  "Câu chuyện thành công"
];

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [filteredBlogs, setFilteredBlogs] = useState(allBlogs);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filtered = allBlogs.filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            blog.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "Tất cả" || blog.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredBlogs(filtered);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    const filtered = allBlogs.filter(blog => {
      const matchesSearch = searchTerm === "" || 
                            blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            blog.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = category === "Tất cả" || blog.category === category;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredBlogs(filtered);
  };
  
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog & Tin tức</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Thông tin hữu ích, chia sẻ kinh nghiệm và kiến thức về sức khỏe sinh sản, điều trị hiếm muộn
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-10">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-full md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 py-3 px-6">
            Tìm kiếm
          </Button>
        </form>
      </div>
      
      {/* Category Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Featured Post */}
      {filteredBlogs.length > 0 && (
        <div className="mb-12">
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
          >
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={filteredBlogs[0].image}
                  alt={filteredBlogs[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {filteredBlogs[0].category}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{filteredBlogs[0].title}</h2>
                <p className="text-gray-600 mb-4">{filteredBlogs[0].excerpt}</p>
                <div className="flex items-center text-gray-500 mb-6">
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-sm mr-4">{filteredBlogs[0].author}</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">{filteredBlogs[0].date}</span>
                </div>
                <Link to={`/blog/${filteredBlogs[0].id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Đọc bài viết
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Blog List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.length > 1 ? (
          filteredBlogs.slice(1).map((blog) => (
            <motion.div
              key={blog.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-600 text-sm font-medium">{blog.category}</span>
                  <span className="text-gray-500 text-sm">{blog.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm flex items-center">
                    <User className="h-4 w-4 mr-1" /> {blog.author}
                  </span>
                  <Link
                    to={`/blog/${blog.id}`}
                    className="text-blue-600 font-medium flex items-center hover:text-blue-800"
                  >
                    Đọc tiếp <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : filteredBlogs.length === 0 ? (
          <div className="col-span-3 py-10 text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy bài viết phù hợp với tiêu chí tìm kiếm.</p>
          </div>
        ) : null}
      </div>
      
      {/* Newsletter Signup */}
      <div className="mt-16 bg-blue-50 rounded-xl p-8 shadow-sm">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Đăng ký nhận tin tức mới nhất</h2>
          <p className="text-gray-600 mb-6">
            Cập nhật thông tin mới nhất về điều trị hiếm muộn, chia sẻ kinh nghiệm và các bài viết hữu ích khác.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3">
              Đăng ký
            </Button>
          </form>
          <p className="text-sm text-gray-500 mt-4">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Bạn có thể hủy đăng ký bất cứ lúc nào.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;

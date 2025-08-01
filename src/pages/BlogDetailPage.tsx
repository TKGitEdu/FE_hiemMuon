import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar,  
  MessageCircle, 
  Facebook, 
  Twitter, 
  Linkedin, 
  ChevronLeft, 
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "../components/ui/button";

// Giả lập dữ liệu bài viết
const blogsData = [
  {
    id: 1,
    title: "5 cách tự nhiên để cải thiện khả năng sinh sản",
    excerpt: "Các phương pháp tự nhiên có thể giúp cải thiện khả năng sinh sản như chế độ ăn uống, tập luyện và giảm stress.",
    content: `
      <p>Khả năng sinh sản là một vấn đề quan trọng đối với nhiều cặp vợ chồng đang cố gắng có con. Ngoài các phương pháp y tế, có nhiều cách tự nhiên có thể giúp cải thiện khả năng sinh sản. Dưới đây là 5 cách tự nhiên hiệu quả:</p>
      
      <h2>1. Duy trì chế độ ăn uống cân bằng</h2>
      
      <p>Chế độ ăn uống đóng vai trò quan trọng trong việc duy trì sức khỏe sinh sản. Một số thực phẩm đặc biệt có lợi bao gồm:</p>
      
      <ul>
        <li>Thực phẩm giàu chất chống oxy hóa như quả mọng, các loại hạt, và rau xanh đậm</li>
        <li>Thực phẩm giàu axit folic như rau lá xanh, đậu, và ngũ cốc nguyên hạt</li>
        <li>Thực phẩm giàu omega-3 như cá hồi, cá thu, và hạt lanh</li>
        <li>Thực phẩm giàu kẽm như hàu, thịt đỏ, và hạt bí ngô</li>
      </ul>
      
      <p>Đồng thời, hạn chế thực phẩm chế biến sẵn, đồ ngọt, và thực phẩm chứa nhiều chất béo trans.</p>
      
      <h2>2. Duy trì cân nặng hợp lý</h2>
      
      <p>Cả thừa cân và thiếu cân đều có thể ảnh hưởng đến khả năng sinh sản. Chỉ số khối cơ thể (BMI) lý tưởng nằm trong khoảng từ 18.5 đến 24.9. Nếu BMI của bạn nằm ngoài phạm vi này, việc điều chỉnh cân nặng có thể giúp cải thiện khả năng sinh sản.</p>
      
      <h2>3. Tập thể dục điều độ</h2>
      
      <p>Hoạt động thể chất vừa phải có thể cải thiện lưu thông máu đến các cơ quan sinh sản và giúp cân bằng hormone. Tuy nhiên, tập luyện quá mức có thể gây tác dụng ngược, đặc biệt ở phụ nữ, vì nó có thể làm gián đoạn chu kỳ kinh nguyệt. Nên tập thể dục khoảng 30 phút mỗi ngày với cường độ vừa phải.</p>
      
      <h2>4. Quản lý stress</h2>
      
      <p>Stress mạn tính có thể ảnh hưởng đến cân bằng hormone và làm giảm khả năng sinh sản. Các phương pháp giảm stress hiệu quả bao gồm:</p>
      
      <ul>
        <li>Thiền định và mindfulness</li>
        <li>Yoga</li>
        <li>Kỹ thuật thở sâu</li>
        <li>Đi bộ trong thiên nhiên</li>
        <li>Đảm bảo ngủ đủ giấc</li>
      </ul>
      
      <h2>5. Hạn chế rượu, cà phê và thuốc lá</h2>
      
      <p>Các chất kích thích như rượu, cà phê và thuốc lá có thể ảnh hưởng tiêu cực đến khả năng sinh sản cả ở nam và nữ. Nên giới hạn tiêu thụ cà phê dưới 200mg caffeine mỗi ngày (khoảng 1-2 tách), tránh hoặc hạn chế rượu và hoàn toàn kiêng thuốc lá.</p>
      
      <p>Mặc dù các phương pháp tự nhiên này có thể giúp cải thiện khả năng sinh sản, nhưng nếu bạn đã cố gắng có thai trong hơn một năm (hoặc sáu tháng nếu bạn trên 35 tuổi) mà không thành công, bạn nên tham khảo ý kiến bác sĩ chuyên khoa. Các vấn đề y tế tiềm ẩn có thể cần được điều trị bằng các phương pháp y học hiện đại.</p>
    `,
    image: "/src/assets/xxx.jpg",
    date: "10/06/2025",
    readTime: "5 phút",
    author: {
      name: "BS. Nguyễn Văn A",
      avatar: "/src/assets/xxx.jpg",
      bio: "Bác sĩ chuyên khoa Sản phụ khoa với hơn 15 năm kinh nghiệm trong lĩnh vực sức khỏe sinh sản."
    },
    category: "Sức khỏe sinh sản",
    tags: ["Sức khỏe", "Tự nhiên", "Sinh sản", "Dinh dưỡng"],
    comments: [
      {
        id: 1,
        name: "Nguyễn Thị X",
        avatar: "/src/assets/xxx.jpg",
        date: "12/06/2025",
        content: "Bài viết rất bổ ích, tôi đã áp dụng chế độ ăn uống và tập luyện như bài viết gợi ý và thấy sức khỏe của mình cải thiện rõ rệt."
      },
      {
        id: 2,
        name: "Trần Văn Y",
        avatar: "/src/assets/xxx.jpg",
        date: "11/06/2025",
        content: "Tôi không biết rằng stress có thể ảnh hưởng nhiều đến khả năng sinh sản như vậy. Cảm ơn bác sĩ đã chia sẻ thông tin quý giá."
      }
    ],
    relatedPosts: [2, 3, 9]
  },
  {
    id: 2,
    title: "Hiểu về quy trình IVF: Từ chuẩn bị đến kết quả",
    excerpt: "Hướng dẫn chi tiết về quy trình thụ tinh trong ống nghiệm từ bước chuẩn bị ban đầu đến khi có kết quả.",
    content: `
      <p>Thụ tinh trong ống nghiệm (IVF) là một trong những phương pháp điều trị hiếm muộn phổ biến và hiệu quả nhất hiện nay. Bài viết này sẽ giúp bạn hiểu rõ về quy trình IVF từ giai đoạn chuẩn bị đến khi có kết quả cuối cùng.</p>
      
      <h2>Giai đoạn 1: Đánh giá và chuẩn bị</h2>
      
      <p>Trước khi bắt đầu quy trình IVF, bác sĩ sẽ thực hiện một loạt các xét nghiệm để đánh giá tình trạng sức khỏe sinh sản của cả hai vợ chồng, bao gồm:</p>
      
      <ul>
        <li>Xét nghiệm hormone</li>
        <li>Siêu âm buồng trứng</li>
        <li>Phân tích tinh trùng</li>
        <li>Kiểm tra tử cung và ống dẫn trứng</li>
        <li>Các xét nghiệm máu cơ bản</li>
      </ul>
      
      <p>Dựa trên kết quả, bác sĩ sẽ xây dựng kế hoạch điều trị phù hợp và hướng dẫn về việc chuẩn bị về mặt thể chất và tinh thần.</p>
      
      <h2>Giai đoạn 2: Kích thích buồng trứng</h2>
      
      <p>Trong chu kỳ tự nhiên, thường chỉ có một trứng được phát triển và rụng. Với IVF, mục tiêu là kích thích buồng trứng sản xuất nhiều trứng để tăng cơ hội thành công.</p>
      
      <p>Quy trình bao gồm:</p>
      
      <ul>
        <li>Tiêm các loại thuốc kích thích buồng trứng (FSH, LH) trong khoảng 8-14 ngày</li>
        <li>Siêu âm thường xuyên để theo dõi sự phát triển của nang trứng</li>
        <li>Xét nghiệm máu để kiểm tra nồng độ hormone</li>
        <li>Tiêm thuốc kích trứng rụng (hCG) khi nang trứng đạt kích thước phù hợp</li>
      </ul>
      
      <h2>Giai đoạn 3: Chọc hút trứng</h2>
      
      <p>Khoảng 34-36 giờ sau khi tiêm hCG, bác sĩ sẽ tiến hành thủ thuật chọc hút trứng. Thủ thuật này được thực hiện dưới hướng dẫn của siêu âm, thường kéo dài 15-30 phút và bệnh nhân được gây mê nhẹ hoặc gây tê. Bác sĩ sẽ sử dụng một kim nhỏ để hút trứng từ các nang trứng.</p>
      
      <h2>Giai đoạn 4: Thụ tinh và nuôi cấy phôi</h2>
      
      <p>Sau khi chọc hút, trứng sẽ được đưa vào phòng thí nghiệm để thụ tinh với tinh trùng. Có hai phương pháp thụ tinh chính:</p>
      
      <ul>
        <li>Thụ tinh thông thường: Trứng và tinh trùng được đặt cùng nhau trong đĩa nuôi cấy</li>
        <li>ICSI (Tiêm tinh trùng vào bào tương trứng): Một tinh trùng được tiêm trực tiếp vào trứng</li>
      </ul>
      
      <p>Sau khi thụ tinh, phôi được nuôi cấy trong phòng thí nghiệm từ 3-5 ngày. Trong thời gian này, phôi học viên sẽ theo dõi sự phát triển của phôi để chọn ra những phôi chất lượng tốt nhất.</p>
      
      <h2>Giai đoạn 5: Chuyển phôi</h2>
      
      <p>Phôi chất lượng tốt nhất sẽ được chuyển vào tử cung. Thủ thuật này không đau và không cần gây mê. Bác sĩ sẽ sử dụng một ống thông mỏng để đặt phôi vào tử cung. Số lượng phôi được chuyển phụ thuộc vào nhiều yếu tố như tuổi, nguyên nhân vô sinh và chất lượng phôi, nhưng xu hướng hiện nay là chuyển 1-2 phôi để giảm nguy cơ đa thai.</p>
      
      <p>Các phôi chất lượng tốt còn lại có thể được trữ đông để sử dụng trong tương lai nếu cần thiết.</p>
      
      <h2>Giai đoạn 6: Hỗ trợ giai đoạn hoàng thể</h2>
      
      <p>Sau khi chuyển phôi, bệnh nhân sẽ được kê đơn thuốc progesterone để hỗ trợ môi trường tử cung thuận lợi cho việc làm tổ của phôi. Thuốc này thường được dùng dưới dạng viên đặt âm đạo, gel, hoặc tiêm.</p>
      
      <h2>Giai đoạn 7: Xét nghiệm thai</h2>
      
      <p>Khoảng 14 ngày sau khi chuyển phôi, bệnh nhân sẽ được xét nghiệm máu để kiểm tra nồng độ hCG nhằm xác định có thai hay không. Nếu kết quả dương tính, siêu âm sẽ được thực hiện sau 2-3 tuần để xác nhận thai trong tử cung và đánh giá số lượng thai.</p>
      
      <h2>Kết luận</h2>
      
      <p>IVF là một quy trình phức tạp đòi hỏi sự kiên nhẫn và cam kết. Tỷ lệ thành công của IVF phụ thuộc vào nhiều yếu tố, đặc biệt là tuổi của người phụ nữ và nguyên nhân vô sinh. Hiểu rõ về từng giai đoạn của quy trình IVF sẽ giúp bạn chuẩn bị tốt hơn về mặt thể chất và tinh thần.</p>
      
      <p>Nếu bạn đang cân nhắc điều trị IVF, hãy tham khảo ý kiến bác sĩ chuyên khoa để được tư vấn cụ thể về tình trạng của bạn.</p>
    `,
    image: "/src/assets/xxx.jpg",
    date: "05/06/2025",
    readTime: "8 phút",
    author: {
      name: "TS. Trần Thị B",
      avatar: "/src/assets/xxx.jpg",
      bio: "Tiến sĩ Y khoa, chuyên gia IVF với hơn 20 năm kinh nghiệm trong lĩnh vực hỗ trợ sinh sản."
    },
    category: "IVF",
    tags: ["IVF", "Điều trị hiếm muộn", "Thụ tinh ống nghiệm", "Quy trình"],
    comments: [
      {
        id: 1,
        name: "Lê Thị M",
        avatar: "/src/assets/xxx.jpg",
        date: "07/06/2025",
        content: "Bài viết rất chi tiết và dễ hiểu. Tôi đang chuẩn bị bắt đầu quy trình IVF và bài viết này đã giúp tôi hiểu rõ hơn về những gì sắp diễn ra."
      },
      {
        id: 2,
        name: "Phạm Văn N",
        avatar: "/src/assets/xxx.jpg",
        date: "06/06/2025",
        content: "Cảm ơn bác sĩ đã chia sẻ thông tin chi tiết. Tôi có thắc mắc là liệu có thể thực hiện IVF mà không cần kích thích buồng trứng không?"
      },
      {
        id: 3,
        name: "TS. Trần Thị B",
        avatar: "/src/assets/xxx.jpg",
        date: "06/06/2025",
        content: "Cảm ơn anh Phạm Văn N đã quan tâm. Có, điều này được gọi là IVF tự nhiên, khi chúng tôi chỉ lấy một trứng trong chu kỳ tự nhiên của người phụ nữ. Tuy nhiên, phương pháp này có tỷ lệ thành công thấp hơn và thường chỉ được khuyến nghị trong một số trường hợp cụ thể. Anh có thể đặt lịch tư vấn để chúng tôi thảo luận chi tiết hơn về trường hợp của anh."
      }
    ],
    relatedPosts: [1, 6, 8]
  }
];

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  
  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const foundBlog = blogsData.find(blog => blog.id === parseInt(id || "0"));
      setBlog(foundBlog);
      
      if (foundBlog && foundBlog.relatedPosts) {
        const related = foundBlog.relatedPosts
          .map(relatedId => blogsData.find(blog => blog.id === relatedId))
          .filter(Boolean);
        setRelatedPosts(related);
      }
      
      setLoading(false);
    }, 500);
  }, [id]);
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Chức năng bình luận sẽ được phát triển trong phiên bản tiếp theo!");
    setComment("");
  };
  
  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!blog) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h1>
        <p className="text-gray-600 mb-8">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/blog">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Quay lại blog
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 py-12">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {blog.category}
              </span>
              {blog.tags.map((tag: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{blog.readTime}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                <span>{blog.comments.length} bình luận</span>
              </div>
            </div>
            
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">{blog.author.name}</p>
                <p className="text-sm text-gray-600">{blog.author.bio}</p>
              </div>
            </div>
          </div>
          
          <div className="h-96 overflow-hidden">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div 
              className="prose prose-blue prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            
            {/* Social Share */}
            <div className="border-t border-gray-100 mt-8 pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-4">Chia sẻ bài viết:</span>
                  <div className="flex space-x-2">
                    <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">
                      <Facebook className="h-4 w-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500">
                      <Twitter className="h-4 w-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800">
                      <Linkedin className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Link to="/blog" className="text-blue-600 font-medium flex items-center hover:text-blue-800">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Quay lại blog
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Author Bio */}
        <div className="bg-blue-50 rounded-xl shadow-md overflow-hidden mb-8 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img
                src={blog.author.avatar}
                alt={blog.author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Về tác giả</h3>
              <p className="text-gray-900 font-medium mb-2">{blog.author.name}</p>
              <p className="text-gray-600 mb-4">{blog.author.bio}</p>
              <Link to={`/doctors?search=${encodeURIComponent(blog.author.name)}`}>
                <Button variant="outline" className="border-blue-600 text-blue-600">
                  Xem hồ sơ bác sĩ
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Comments */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Bình luận ({blog.comments.length})</h3>
            
            {blog.comments.length > 0 ? (
              <div className="space-y-6 mb-8">
                {blog.comments.map((comment: any) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                        <img
                          src={comment.avatar}
                          alt={comment.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-gray-900">{comment.name}</p>
                          <p className="text-sm text-gray-500">{comment.date}</p>
                        </div>
                        <p className="text-gray-600">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-8">Chưa có bình luận nào.</p>
            )}
            
            {/* Comment Form */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Để lại bình luận</h4>
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  placeholder="Nhập bình luận của bạn..."
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Gửi bình luận
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Bài viết liên quan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="border border-gray-100 rounded-lg overflow-hidden"
                  >
                    <div className="h-40 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                      <Link
                        to={`/blog/${post.id}`}
                        className="text-blue-600 font-medium flex items-center hover:text-blue-800 text-sm"
                      >
                        Đọc tiếp <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
      
      {/* Newsletter */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-md overflow-hidden text-white">
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Đăng ký nhận tin tức mới nhất</h3>
            <p className="mb-6">
              Nhận thông tin mới nhất về sức khỏe sinh sản và điều trị hiếm muộn qua email.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3">
                Đăng ký
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;

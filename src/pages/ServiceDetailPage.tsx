import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Clock, 
  ThumbsUp, 
  Users, 
  ArrowRight, 
  Star,
  MessageCircle
} from "lucide-react";
import { Button } from "../components/ui/button";

// Giả lập dữ liệu dịch vụ chi tiết
const servicesData = [
  {
    id: 1,
    title: "Thụ tinh trong tử cung (IUI)",
    tagline: "Phương pháp điều trị hiếm muộn đơn giản, ít xâm lấn",
    heroImage: "/src/assets/xxx.jpg",
    description: `
      <p>Thụ tinh trong tử cung (Intrauterine Insemination - IUI) là phương pháp hỗ trợ sinh sản cơ bản, trong đó tinh trùng đã được xử lý sẽ được đưa trực tiếp vào tử cung của người phụ nữ để tăng cơ hội thụ thai.</p>
      
      <p>Đây là phương pháp ít xâm lấn, đơn giản và có chi phí thấp hơn nhiều so với thụ tinh trong ống nghiệm (IVF). IUI thường được khuyên dùng như một biện pháp điều trị đầu tiên cho nhiều cặp vợ chồng bị hiếm muộn.</p>
    `,
    price: "15,000,000 - 25,000,000 VNĐ",
    duration: "2-3 tuần/chu kỳ",
    rating: 4.8,
    reviewCount: 56,
    successRate: "15-20%",
    gallery: [
      "/src/assets/xxx.jpg",
      "/src/assets/xxx.jpg",
      "/src/assets/xxx.jpg"
    ],
    indications: [
      "Bất thường về tinh trùng nhẹ đến trung bình",
      "Vô sinh không rõ nguyên nhân",
      "Các vấn đề về rụng trứng",
      "Vô sinh do yếu tố cổ tử cung",
      "Không thể quan hệ tình dục do vấn đề thể chất hoặc tâm lý"
    ],
    process: [
      {
        title: "Kích thích buồng trứng",
        description: "Sử dụng thuốc kích thích buồng trứng để tạo ra nhiều trứng, tăng cơ hội thụ thai"
      },
      {
        title: "Theo dõi sự phát triển của nang trứng",
        description: "Siêu âm và xét nghiệm hormone để xác định thời điểm rụng trứng"
      },
      {
        title: "Thu thập và xử lý tinh trùng",
        description: "Mẫu tinh trùng được thu thập và xử lý để chọn ra những tinh trùng khỏe mạnh nhất"
      },
      {
        title: "Bơm tinh trùng vào tử cung",
        description: "Tinh trùng đã xử lý được đưa trực tiếp vào tử cung bằng một ống thông mỏng"
      },
      {
        title: "Hỗ trợ giai đoạn hoàng thể",
        description: "Sử dụng thuốc hỗ trợ để tăng cường môi trường tử cung thuận lợi cho việc làm tổ"
      }
    ],
    faqs: [
      {
        question: "IUI có đau không?",
        answer: "Thủ thuật IUI thường không gây đau đớn và tương tự như khi khám phụ khoa thông thường. Một số phụ nữ có thể cảm thấy hơi khó chịu nhẹ, tương tự như cảm giác chuột rút khi hành kinh."
      },
      {
        question: "Tỷ lệ thành công của IUI là bao nhiêu?",
        answer: "Tỷ lệ thành công của IUI dao động từ 15-20% cho mỗi chu kỳ, tùy thuộc vào tuổi, nguyên nhân vô sinh và các yếu tố khác. Nhiều cặp vợ chồng có thể cần thực hiện vài chu kỳ IUI để đạt được kết quả mong muốn."
      },
      {
        question: "Khi nào nên chuyển sang IVF sau IUI?",
        answer: "Thông thường, nếu sau 3-4 chu kỳ IUI không thành công, bác sĩ có thể đề xuất chuyển sang phương pháp IVF. Tuy nhiên, điều này còn phụ thuộc vào tuổi của người phụ nữ, nguyên nhân vô sinh và các yếu tố cá nhân khác."
      },
      {
        question: "IUI có phù hợp với tất cả các trường hợp vô sinh không?",
        answer: "Không, IUI không phù hợp với tất cả các trường hợp. IUI có hiệu quả cao nhất đối với các trường hợp vô sinh do yếu tố cổ tử cung, bất thường tinh trùng nhẹ đến trung bình, hoặc vô sinh không rõ nguyên nhân. Nếu ống dẫn trứng bị tắc nghẽn hoặc tinh trùng rất yếu, IVF có thể là phương pháp phù hợp hơn."
      }
    ],
    reviews: [
      {
        id: 1,
        name: "Nguyễn Thị A",
        avatar: "/src/assets/xxx.jpg",
        rating: 5,
        date: "10/05/2025",
        comment: "Tôi đã thành công có thai sau 2 lần IUI tại FertilityCare. Đội ngũ y bác sĩ rất tận tình, chu đáo và luôn giải đáp mọi thắc mắc của tôi. Cảm ơn bác sĩ và toàn bộ nhân viên rất nhiều!"
      },
      {
        id: 2,
        name: "Trần Văn B",
        avatar: "/src/assets/xxx.jpg",
        rating: 4,
        date: "15/04/2025",
        comment: "Vợ chồng tôi đã trải qua 3 chu kỳ IUI và thành công ở lần thứ 3. Quy trình chuyên nghiệp, bác sĩ giải thích rất rõ ràng về từng bước và luôn động viên tinh thần chúng tôi."
      }
    ],
    relatedServices: [2, 3, 4]
  },
  {
    id: 2,
    title: "Thụ tinh trong ống nghiệm (IVF)",
    tagline: "Phương pháp điều trị hiếm muộn hiện đại, hiệu quả cao",
    heroImage: "/src/assets/xxx.jpg",
    description: `
      <p>Thụ tinh trong ống nghiệm (In Vitro Fertilization - IVF) là phương pháp điều trị hiếm muộn hiện đại, trong đó trứng được lấy ra khỏi buồng trứng và thụ tinh với tinh trùng trong phòng thí nghiệm. Sau đó, phôi được nuôi cấy và chuyển vào tử cung.</p>
      
      <p>IVF là một trong những phương pháp hỗ trợ sinh sản hiệu quả nhất hiện nay, đặc biệt phù hợp cho nhiều nguyên nhân vô sinh khác nhau. Với sự phát triển của công nghệ, tỷ lệ thành công của IVF ngày càng được cải thiện.</p>
    `,
    price: "60,000,000 - 120,000,000 VNĐ",
    duration: "4-6 tuần/chu kỳ",
    rating: 4.9,
    reviewCount: 124,
    successRate: "40-50%",
    gallery: [
      "/src/assets/xxx.jpg",
      "/src/assets/xxx.jpg",
      "/src/assets/xxx.jpg"
    ],
    indications: [
      "Tắc nghẽn hoặc tổn thương ống dẫn trứng",
      "Vô sinh nam nghiêm trọng",
      "Thất bại với các phương pháp điều trị khác",
      "Lão hóa buồng trứng",
      "Nguy cơ di truyền cần sàng lọc phôi",
      "Vô sinh không rõ nguyên nhân kéo dài"
    ],
    process: [
      {
        title: "Kích thích buồng trứng",
        description: "Sử dụng thuốc để kích thích buồng trứng sản xuất nhiều trứng"
      },
      {
        title: "Theo dõi sự phát triển của nang trứng",
        description: "Siêu âm và xét nghiệm hormone để theo dõi quá trình phát triển của nang trứng"
      },
      {
        title: "Chọc hút trứng",
        description: "Thủ thuật lấy trứng từ buồng trứng dưới hướng dẫn siêu âm"
      },
      {
        title: "Thụ tinh",
        description: "Trứng và tinh trùng được kết hợp trong phòng thí nghiệm để tạo thành phôi"
      },
      {
        title: "Nuôi cấy phôi",
        description: "Phôi được nuôi cấy trong môi trường đặc biệt từ 3-5 ngày"
      },
      {
        title: "Chuyển phôi",
        description: "Phôi được chuyển vào tử cung qua đường âm đạo"
      },
      {
        title: "Hỗ trợ giai đoạn hoàng thể",
        description: "Sử dụng thuốc hỗ trợ để tăng cường môi trường tử cung thuận lợi cho việc làm tổ"
      }
    ],
    faqs: [
      {
        question: "Quá trình chọc hút trứng có đau không?",
        answer: "Thủ thuật chọc hút trứng được thực hiện dưới tác dụng của thuốc gây mê hoặc gây tê, nên bạn sẽ không cảm thấy đau trong quá trình thực hiện. Sau thủ thuật, một số phụ nữ có thể cảm thấy hơi đau hoặc khó chịu nhẹ, tương tự như cảm giác chuột rút khi hành kinh."
      },
      {
        question: "Tỷ lệ thành công của IVF là bao nhiêu?",
        answer: "Tỷ lệ thành công của IVF dao động từ 40-50% cho mỗi chu kỳ, tùy thuộc vào tuổi của người phụ nữ, nguyên nhân vô sinh và chất lượng phôi. Ở phụ nữ dưới 35 tuổi, tỷ lệ thành công cao hơn, trong khi ở phụ nữ trên 40 tuổi, tỷ lệ này thấp hơn."
      },
      {
        question: "IVF có tăng nguy cơ sinh đôi hoặc sinh ba không?",
        answer: "Có, IVF có thể tăng nguy cơ đa thai nếu nhiều phôi được chuyển vào tử cung. Tuy nhiên, xu hướng hiện nay là chuyển một phôi chất lượng tốt nhất để giảm nguy cơ đa thai và các biến chứng liên quan."
      },
      {
        question: "Tôi có thể trữ đông phôi dư để sử dụng sau này không?",
        answer: "Có, các phôi chất lượng tốt không sử dụng trong chu kỳ hiện tại có thể được trữ đông để sử dụng trong tương lai. Điều này giúp tránh phải trải qua quá trình kích thích buồng trứng và chọc hút trứng lại nếu chu kỳ đầu tiên không thành công hoặc nếu bạn muốn có thêm con sau này."
      }
    ],
    reviews: [
      {
        id: 1,
        name: "Lê Thị C",
        avatar: "/src/assets/xxx.jpg",
        rating: 5,
        date: "20/03/2025",
        comment: "Sau 7 năm mong mỏi có con, chúng tôi đã thành công với IVF tại FertilityCare. Đội ngũ y bác sĩ rất tận tâm, chuyên nghiệp và luôn đồng hành cùng chúng tôi trong suốt quá trình. Giờ đây chúng tôi đã có một bé gái kháu khỉnh!"
      },
      {
        id: 2,
        name: "Phạm Văn D",
        avatar: "/src/assets/xxx.jpg",
        rating: 5,
        date: "05/02/2025",
        comment: "Vợ chồng tôi đã thử IUI không thành công và chuyển sang IVF. May mắn thành công ngay lần đầu tiên. Cơ sở vật chất hiện đại, quy trình chuyên nghiệp, bác sĩ tận tâm và am hiểu chuyên môn. Xin cảm ơn cả đội ngũ FertilityCare!"
      }
    ],
    relatedServices: [1, 3, 7]
  }
];

const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState("");
  const [relatedServices, setRelatedServices] = useState<any[]>([]);

  useEffect(() => {
    // Giả lập API call
    setLoading(true);
    setTimeout(() => {
      const foundService = servicesData.find(s => s.id === parseInt(id || "0"));
      setService(foundService);
      
      if (foundService?.relatedServices) {
        const related = servicesData.filter(s => 
          foundService.relatedServices.includes(s.id) && s.id !== foundService.id
        );
        setRelatedServices(related);
      }
      
      setLoading(false);
      
      if (foundService?.gallery && foundService.gallery.length > 0) {
        setSelectedImage(foundService.gallery[0]);
      }
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy dịch vụ</h2>
        <p className="mt-4 text-gray-600">Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
        <Link to="/services" className="mt-6 inline-block">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Quay lại danh sách dịch vụ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* Hero Section */}
      <div className="relative h-80 md:h-96 bg-gradient-to-r from-blue-800 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src={service.heroImage}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{service.title}</h1>
            <p className="text-xl text-blue-100">{service.tagline}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-8 py-4">
            <button
              className={`whitespace-nowrap px-1 py-2 font-medium text-sm border-b-2 ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Tổng quan
            </button>
            <button
              className={`whitespace-nowrap px-1 py-2 font-medium text-sm border-b-2 ${
                activeTab === "process"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("process")}
            >
              Quy trình
            </button>
            <button
              className={`whitespace-nowrap px-1 py-2 font-medium text-sm border-b-2 ${
                activeTab === "faqs"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("faqs")}
            >
              Câu hỏi thường gặp
            </button>
            <button
              className={`whitespace-nowrap px-1 py-2 font-medium text-sm border-b-2 ${
                activeTab === "reviews"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Service Details */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Giới thiệu dịch vụ</h2>
                <div 
                  className="prose prose-blue max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Đối tượng phù hợp</h2>
                <ul className="space-y-2">
                  {service.indications.map((indication: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{indication}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Hình ảnh</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={selectedImage}
                      alt="Service"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="flex space-x-4 mt-2 overflow-x-auto pb-2">
                    {service.gallery.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(image)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                          selectedImage === image ? "border-blue-600" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin chi tiết</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Thời gian điều trị</p>
                      <p className="font-medium">{service.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <ThumbsUp className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tỷ lệ thành công</p>
                      <p className="font-medium">{service.successRate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Star className="h-5 w-5 text-yellow-500 fill-current mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Đánh giá</p>
                      <div className="flex items-center">
                        <p className="font-medium mr-1">{service.rating}/5</p>
                        <span className="text-sm text-gray-500">({service.reviewCount} đánh giá)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Đã phục vụ</p>
                      <p className="font-medium">1000+ khách hàng</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">Chi phí</p>
                    <p className="text-xl font-bold text-blue-600">{service.price}</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    * Chi phí có thể thay đổi tùy thuộc vào tình trạng cụ thể của từng bệnh nhân
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Link to={`/booking?service=${service.id}`} className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Đặt lịch ngay
                    </Button>
                  </Link>
                  <Link to="/contact" className="w-full">
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                      Liên hệ tư vấn
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "process" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Quy trình {service.title}</h2>
            
            <div className="relative">
              <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-blue-200"></div>
              <div className="space-y-12">
                {service.process.map((step: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative flex items-start"
                  >
                    <div className="absolute left-0 rounded-full bg-blue-600 text-white flex items-center justify-center w-24 h-24 text-center z-10">
                      <div>
                        <div className="text-sm font-medium">Bước</div>
                        <div className="text-2xl font-bold">{index + 1}</div>
                      </div>
                    </div>
                    <div className="ml-36 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to={`/booking?service=${service.id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Đặt lịch ngay
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "faqs" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Câu hỏi thường gặp về {service.title}</h2>
            
            <div className="space-y-6">
              {service.faqs.map((faq: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Vẫn còn thắc mắc?</h3>
              <p className="text-gray-600 mb-4">
                Nếu bạn có thêm câu hỏi về {service.title} hoặc các dịch vụ khác, đừng ngần ngại liên hệ với chúng tôi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact">
                  <Button variant="outline" className="border-blue-600 text-blue-600">
                    Liên hệ tư vấn
                  </Button>
                </Link>
                <Link to={`/booking?service=${service.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Đặt lịch tư vấn
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Đánh giá từ khách hàng</h2>
              <Link to={`/reviews/write?service=${service.id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <MessageCircle size={18} />
                  Viết đánh giá
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-8">
              {service.reviews.map((review: any) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">{review.name}</h3>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                      <div className="flex items-center mt-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center">
              <Button variant="outline" className="border-gray-300 text-gray-700">
                Xem thêm đánh giá
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Related Services */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Dịch vụ liên quan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedServices.map((related) => (
              <motion.div
                key={related.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={related.heroImage}
                    alt={related.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{related.title}</h3>
                  <p className="text-gray-600 mb-4">{related.tagline}</p>
                  <div className="flex justify-between items-center">
                    <Link to={`/services/${related.id}`} className="text-blue-600 font-medium flex items-center hover:text-blue-800">
                      Chi tiết <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link to={`/booking?service=${related.id}`}>
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
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-12 md:py-16 md:px-12 text-center md:text-left md:flex md:items-center md:justify-between">
              <div className="md:flex-1 mb-8 md:mb-0">
                <h2 className="text-2xl font-bold text-white mb-2">Bắt đầu hành trình làm cha mẹ ngay hôm nay</h2>
                <p className="text-blue-100">
                  Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn trong hành trình điều trị hiếm muộn
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link to={`/booking?service=${service.id}`}>
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
    </div>
  );
};

export default ServiceDetailPage;

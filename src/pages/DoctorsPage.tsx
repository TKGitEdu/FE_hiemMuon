import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, Filter, ArrowRight, BookOpen, Award, Users, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";

// Giả lập dữ liệu bác sĩ
const allDoctors = [
  {
    id: 1,
    name: "TS. BS. Nguyễn Văn A",
    specialty: "Chuyên gia IVF",
    image: "/anhchofehiemmuon/isha6.jpg",
    education: "Tiến sĩ Y khoa - Đại học Y Hà Nội",
    experience: "15 năm kinh nghiệm",
    rating: 4.9,
    reviews: 120,
    about: "TS. BS. Nguyễn Văn A là chuyên gia hàng đầu về điều trị hiếm muộn và thụ tinh trong ống nghiệm (IVF) với hơn 15 năm kinh nghiệm. Bác sĩ đã giúp hàng nghìn cặp vợ chồng hiếm muộn có được hạnh phúc làm cha mẹ.",
    expertiseAreas: ["IVF", "IUI", "ICSI", "Hiếm muộn nam", "Hiếm muộn nữ"]
  },
  {
    id: 2,
    name: "PGS. TS. Trần Thị B",
    specialty: "Sản phụ khoa",
    image: "/anhchofehiemmuon/isha6.jpg",
    education: "Phó Giáo sư, Tiến sĩ Y khoa - Đại học Y Dược TP.HCM",
    experience: "20 năm kinh nghiệm",
    rating: 4.8,
    reviews: 95,
    about: "PGS. TS. Trần Thị B là chuyên gia đầu ngành về sản phụ khoa với chuyên môn sâu về các bệnh lý phụ khoa và điều trị hiếm muộn. Bác sĩ từng tu nghiệp tại Mỹ và Singapore về lĩnh vực hỗ trợ sinh sản.",
    expertiseAreas: ["Sản phụ khoa", "Nội tiết sinh sản", "IVF", "Phẫu thuật nội soi"]
  },
  {
    id: 3,
    name: "TS. BS. Lê Văn C",
    specialty: "Nội tiết sinh sản",
    image: "/anhchofehiemmuon/isha6.jpg",
    education: "Tiến sĩ Y khoa - Đại học Y Dược Huế",
    experience: "12 năm kinh nghiệm",
    rating: 4.7,
    reviews: 88,
    about: "TS. BS. Lê Văn C là chuyên gia về nội tiết sinh sản và điều trị các rối loạn nội tiết liên quan đến hiếm muộn. Bác sĩ có nhiều nghiên cứu khoa học trong lĩnh vực nội tiết sinh sản được công bố quốc tế.",
    expertiseAreas: ["Nội tiết sinh sản", "Rối loạn nội tiết", "Siêu âm", "IUI"]
  },
  {
    id: 4,
    name: "BS. CKI. Phạm Thị D",
    specialty: "Hiếm muộn nam",
    image: "/anhchofehiemmuon/isha6.jpg",
    education: "Chuyên khoa I Nam học - Đại học Y Hà Nội",
    experience: "10 năm kinh nghiệm",
    rating: 4.6,
    reviews: 75,
    about: "BS. CKI. Phạm Thị D chuyên điều trị các vấn đề hiếm muộn nam giới, với chuyên môn sâu về chẩn đoán và điều trị các bệnh lý tinh trùng. Bác sĩ đã tham gia nhiều khóa đào tạo chuyên sâu về Nam khoa tại Nhật Bản.",
    expertiseAreas: ["Hiếm muộn nam", "Rối loạn tinh trùng", "Xuất tinh sớm", "Tinh hoàn ẩn"]
  },
  {
    id: 5,
    name: "PGS. TS. Đỗ Văn E",
    specialty: "Phôi học",
    image: "/anhchofehiemmuon/isha6.jpg",
    education: "Phó Giáo sư, Tiến sĩ Sinh học - Đại học Khoa học Tự nhiên",
    experience: "18 năm kinh nghiệm",
    rating: 4.9,
    reviews: 110,
    about: "PGS. TS. Đỗ Văn E là chuyên gia đầu ngành về phôi học, với chuyên môn sâu về nuôi cấy phôi, đông lạnh phôi và các kỹ thuật hỗ trợ sinh sản tiên tiến. Bác sĩ từng làm việc tại các trung tâm IVF hàng đầu ở Mỹ và Úc.",
    expertiseAreas: ["Phôi học", "PGT-A", "Trữ đông phôi", "Trữ đông trứng", "ICSI"]
  },
  {
    id: 6,
    name: "TS. BS. Hoàng Thị F",
    specialty: "Siêu âm sản khoa",
    image: "/anhchofehiemmuon/isha6.jpg",
    education: "Tiến sĩ Y khoa - Đại học Y Dược TP.HCM",
    experience: "14 năm kinh nghiệm",
    rating: 4.7,
    reviews: 82,
    about: "TS. BS. Hoàng Thị F là chuyên gia siêu âm sản khoa với chuyên môn sâu về siêu âm 4D và chẩn đoán trước sinh. Bác sĩ có nhiều kinh nghiệm trong việc theo dõi thai kỳ sau điều trị hiếm muộn, đặc biệt là thai kỳ sau IVF.",
    expertiseAreas: ["Siêu âm 4D", "Chẩn đoán trước sinh", "Theo dõi thai kỳ", "Siêu âm nang noãn"]
  }
];

// Các chuyên khoa
const specialties = [
  "Tất cả",
  "Chuyên gia IVF",
  "Sản phụ khoa",
  "Nội tiết sinh sản",
  "Hiếm muộn nam",
  "Phôi học",
  "Siêu âm sản khoa"
];

const DoctorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả");
  const [filteredDoctors, setFilteredDoctors] = useState(allDoctors);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filtered = allDoctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = selectedSpecialty === "Tất cả" || doctor.specialty === selectedSpecialty;
      
      return matchesSearch && matchesSpecialty;
    });
    
    setFilteredDoctors(filtered);
  };
  
  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    
    const filtered = allDoctors.filter(doctor => {
      const matchesSearch = searchTerm === "" || 
                            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = specialty === "Tất cả" || doctor.specialty === specialty;
      
      return matchesSearch && matchesSpecialty;
    });
    
    setFilteredDoctors(filtered);
  };
  
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ chuyên gia</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm sẽ đồng hành cùng bạn trong hành trình điều trị hiếm muộn
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
              placeholder="Tìm kiếm theo tên hoặc chuyên khoa..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-full md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedSpecialty}
              onChange={(e) => handleSpecialtyChange(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 py-3 px-6">
            Tìm kiếm
          </Button>
        </form>
      </div>
      
      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h2>
                <p className="text-blue-600 font-medium mb-2">{doctor.specialty}</p>
                
                <div className="flex items-center mb-3">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-gray-700">{doctor.rating}</span>
                  <span className="text-gray-500 text-sm ml-2">({doctor.reviews} đánh giá)</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="text-sm">{doctor.education}</span>
                </div>
                  <div className="flex items-center text-gray-600 mb-4">
                  <Award className="h-4 w-4 mr-2" />
                  <span className="text-sm">{doctor.experience}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {doctor.about}
                </p>
                
                <div className="flex justify-between items-center">
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="text-blue-600 font-medium flex items-center hover:text-blue-800"
                  >
                    Xem hồ sơ <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  
                  <Link to={`/booking?doctor=${doctor.id}`}>
                    <Button variant="outline" size="sm" className="border-blue-600 text-blue-600">
                      Đặt lịch
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 py-10 text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm.</p>
          </div>
        )}
      </div>
      
      {filteredDoctors.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Bạn cần hỗ trợ tìm bác sĩ phù hợp? Hãy liên hệ với chúng tôi để được tư vấn miễn phí.
          </p>
          <Link to="/booking">
            <Button className="bg-blue-600 hover:bg-blue-700 py-3 px-8">
              Đặt lịch tư vấn ngay
            </Button>
          </Link>
        </div>
      )}
      
      {/* Why Choose Our Doctors */}
      <section className="mt-20 bg-blue-50 rounded-xl p-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Tại sao chọn bác sĩ tại FertilityCare?</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Đội ngũ bác sĩ của chúng tôi không chỉ giỏi chuyên môn mà còn tận tâm, nhiệt huyết và luôn đặt lợi ích của bệnh nhân lên hàng đầu
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trình độ chuyên môn cao</h3>
            <p className="text-gray-600">
              Đội ngũ bác sĩ của chúng tôi đều tốt nghiệp từ các trường y khoa hàng đầu và thường xuyên cập nhật kiến thức y khoa mới nhất.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kinh nghiệm thực tiễn</h3>
            <p className="text-gray-600">
              Các bác sĩ của chúng tôi có nhiều năm kinh nghiệm trong điều trị hiếm muộn, giúp hàng nghìn cặp vợ chồng có được hạnh phúc làm cha mẹ.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Đồng hành cùng bệnh nhân</h3>
            <p className="text-gray-600">
              Chúng tôi không chỉ điều trị bệnh mà còn đồng hành, hỗ trợ tinh thần cho bệnh nhân trong suốt quá trình điều trị hiếm muộn.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoctorsPage;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Phone, Mail, Award, BookOpen, Star, User, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";

// Định nghĩa types gọn gàng
interface EducationDetail {
  degree: string;
  institution: string;
  year: string;
}

interface Training {
  course: string;
  institution: string;
  year: string;
}

interface WorkSchedule {
  day: string;
  hours: string;
}

interface Testimonial {
  id: number;
  patient: string;
  rating: number;
  content: string;
  date: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image: string;
  education: string;
  experience: string;
  rating: number;
  reviews: number;
  about: string;
  expertiseAreas: string[];
  achievements: string[];
  education_detail: EducationDetail[];
  training: Training[];
  workSchedule: WorkSchedule[];
  contact: { email: string; phone: string };
  testimonials: Testimonial[];
}

// Mock data giữ nguyên
const doctorsData: Doctor[] = [
  {
    id: 1,
    name: "TS. BS. Nguyễn Văn A",
    specialty: "Chuyên gia IVF",
    image: "/anhchofehiemmuon/isha3.jpg",
    education: "Tiến sĩ Y khoa - Đại học Y Hà Nội",
    experience: "15 năm kinh nghiệm",
    rating: 4.9,
    reviews: 120,
    about: `
      <p>TS. BS. Nguyễn Văn A là chuyên gia hàng đầu về điều trị hiếm muộn và thụ tinh trong ống nghiệm (IVF) với hơn 15 năm kinh nghiệm. Bác sĩ đã giúp hàng nghìn cặp vợ chồng hiếm muộn có được hạnh phúc làm cha mẹ.</p>
      <p>Bác sĩ A tốt nghiệp Đại học Y Hà Nội và nhận bằng Tiến sĩ Y khoa chuyên ngành Sản phụ khoa. Bác sĩ đã tu nghiệp tại nhiều trung tâm IVF hàng đầu tại Pháp, Nhật Bản và Singapore.</p>
      <p>Hiện tại, bác sĩ A là trưởng khoa Hỗ trợ sinh sản tại FertilityCare, chịu trách nhiệm điều hành các hoạt động chuyên môn và nghiên cứu khoa học liên quan đến IVF và các kỹ thuật hỗ trợ sinh sản tiên tiến.</p>
    `,
    expertiseAreas: ["IVF", "IUI", "ICSI", "Hiếm muộn nam", "Hiếm muộn nữ"],
    achievements: [
      "Giải thưởng Nhà khoa học xuất sắc trong lĩnh vực Hỗ trợ sinh sản (2020)",
      "Chủ tịch Hội Hỗ trợ sinh sản Việt Nam (2018-2022)",
      "Tác giả của hơn 50 công trình nghiên cứu được đăng trên các tạp chí y khoa quốc tế"
    ],
    education_detail: [
      { degree: "Tiến sĩ Y khoa - Chuyên ngành Sản phụ khoa", institution: "Đại học Y Hà Nội", year: "2010" },
      { degree: "Bác sĩ Chuyên khoa II - Sản phụ khoa", institution: "Đại học Y Hà Nội", year: "2005" },
      { degree: "Bác sĩ Đa khoa", institution: "Đại học Y Hà Nội", year: "2000" }
    ],
    training: [
      { course: "Chứng chỉ Hỗ trợ sinh sản nâng cao", institution: "Trung tâm IVF Nhật Bản", year: "2012" },
      { course: "Khóa đào tạo Phôi học lâm sàng", institution: "Đại học Singapore", year: "2008" },
      { course: "Chứng chỉ Kỹ thuật ICSI", institution: "Viện Sinh học sinh sản Paris, Pháp", year: "2006" }
    ],
    workSchedule: [
      { day: "Thứ 2", hours: "08:00 - 12:00" },
      { day: "Thứ 3", hours: "13:30 - 17:00" },
      { day: "Thứ 4", hours: "08:00 - 12:00" },
      { day: "Thứ 5", hours: "13:30 - 17:00" },
      { day: "Thứ 6", hours: "08:00 - 12:00" },
      { day: "Thứ 7", hours: "08:00 - 11:30" }
    ],
    contact: { email: "nguyenvana@fertilitycare.vn", phone: "024.7300.8899" },
    testimonials: [
      {
        id: 1,
        patient: "Chị Nguyễn Thị X",
        rating: 5,
        content: "Tôi rất biết ơn bác sĩ A đã giúp vợ chồng tôi có được niềm hạnh phúc làm cha mẹ sau 7 năm chờ đợi. Bác sĩ rất tận tâm, luôn lắng nghe và động viên chúng tôi không bỏ cuộc.",
        date: "10/05/2025"
      },
      {
        id: 2,
        patient: "Anh Trần Văn Y",
        rating: 5,
        content: "Bác sĩ A không chỉ giỏi chuyên môn mà còn rất tâm lý, luôn giải thích rõ ràng về quy trình điều trị để chúng tôi hiểu và yên tâm. Nhờ bác sĩ mà giờ đây gia đình tôi đã có một bé trai kháu khỉnh!",
        date: "22/04/2025"
      },
      {
        id: 3,
        patient: "Chị Lê Thị Z",
        rating: 4,
        content: "Tôi đánh giá cao sự tận tâm và kinh nghiệm của bác sĩ A. Mặc dù lần đầu điều trị không thành công, nhưng bác sĩ luôn động viên và giúp chúng tôi tìm ra phương pháp phù hợp. Lần thứ hai đã thành công!",
        date: "05/03/2025"
      }
    ]
  },
  {
    id: 2,
    name: "PGS. TS. Trần Thị B",
    specialty: "Sản phụ khoa",
    image: "/anhchofehiemmuon/isha3.jpg",
    education: "Phó Giáo sư, Tiến sĩ Y khoa - Đại học Y Dược TP.HCM",
    experience: "20 năm kinh nghiệm",
    rating: 4.8,
    reviews: 95,
    about: `
      <p>PGS. TS. Trần Thị B là chuyên gia đầu ngành về sản phụ khoa với chuyên môn sâu về các bệnh lý phụ khoa và điều trị hiếm muộn. Bác sĩ từng tu nghiệp tại Mỹ và Singapore về lĩnh vực hỗ trợ sinh sản.</p>
      <p>Với hơn 20 năm kinh nghiệm, PGS. TS. Trần Thị B đã điều trị thành công cho hàng nghìn bệnh nhân với các vấn đề phức tạp về phụ khoa và hiếm muộn. Bác sĩ còn là tác giả của nhiều công trình nghiên cứu khoa học về nội tiết sinh sản và vô sinh hiếm muộn.</p>
      <p>Hiện tại, bác sĩ B đang đảm nhận vị trí Phó Giám đốc chuyên môn tại FertilityCare, phụ trách khám và điều trị các bệnh lý phụ khoa phức tạp liên quan đến hiếm muộn.</p>
    `,
    expertiseAreas: ["Sản phụ khoa", "Nội tiết sinh sản", "IVF", "Phẫu thuật nội soi"],
    achievements: [
      "Giải thưởng Bác sĩ xuất sắc của Hội Sản Phụ khoa Việt Nam (2022)",
      "Chủ tịch Hội Nội soi Phụ khoa Việt Nam (2019-2023)",
      "Tác giả chính của hơn 40 công trình nghiên cứu được công bố quốc tế"
    ],
    education_detail: [
      { degree: "Phó Giáo sư", institution: "Hội đồng Giáo sư Nhà nước", year: "2015" },
      { degree: "Tiến sĩ Y khoa - Chuyên ngành Sản phụ khoa", institution: "Đại học Y Dược TP.HCM", year: "2008" },
      { degree: "Bác sĩ Chuyên khoa II - Sản phụ khoa", institution: "Đại học Y Dược TP.HCM", year: "2003" }
    ],
    training: [
      { course: "Chứng chỉ Phẫu thuật nội soi nâng cao", institution: "Đại học Johns Hopkins, Mỹ", year: "2010" },
      { course: "Khóa đào tạo IVF chuyên sâu", institution: "Trung tâm Hỗ trợ sinh sản Singapore", year: "2007" }
    ],
    workSchedule: [
      { day: "Thứ 2", hours: "13:30 - 17:00" },
      { day: "Thứ 3", hours: "08:00 - 12:00" },
      { day: "Thứ 4", hours: "13:30 - 17:00" },
      { day: "Thứ 5", hours: "08:00 - 12:00" },
      { day: "Thứ 7", hours: "13:30 - 17:00" }
    ],
    contact: { email: "tranthib@fertilitycare.vn", phone: "024.7300.8899" },
    testimonials: [
      {
        id: 1,
        patient: "Chị Phạm Thị M",
        rating: 5,
        content: "Bác sĩ B là người đã giúp tôi điều trị thành công sau nhiều năm bị u xơ tử cung và hiếm muộn. Bác sĩ rất tận tình, chu đáo và luôn tạo cảm giác an tâm cho bệnh nhân.",
        date: "15/05/2025"
      },
      {
        id: 2,
        patient: "Chị Hoàng Thị N",
        rating: 5,
        content: "Tôi đã được bác sĩ B phẫu thuật nội soi và sau đó thực hiện IVF thành công. Bác sĩ không chỉ giỏi chuyên môn mà còn rất nhiệt tình, tâm lý với bệnh nhân.",
        date: "20/04/2025"
      }
    ]
  }
];

// Tabs là hằng số, khai báo ngoài component
const TABS = [
  { id: "overview", label: "Tổng quan" },
  { id: "education", label: "Học vấn & Chứng chỉ" },
  { id: "schedule", label: "Lịch khám" },
  { id: "reviews", label: "Đánh giá" }
] as const;

const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>(TABS[0].id);

  useEffect(() => {
    const doctorId = Number(id);
    if (isNaN(doctorId)) return setDoctor(null);
    
    // Giả lập API call với cleanup
    const timeout = setTimeout(() => {
      setDoctor(doctorsData.find(doc => doc.id === doctorId) || null);
    }, 500);
    return () => clearTimeout(timeout);
  }, [id]);

  if (!doctor) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thông tin bác sĩ</h1>
        <Link to="/doctors">
          <Button className="bg-blue-600 hover:bg-blue-700">Quay lại danh sách bác sĩ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-md mb-8 md:flex">
          <div className="md:w-1/3 p-6">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-full rounded-lg shadow-md"
              onError={(e) => (e.currentTarget.src = "/path/to/fallback-image.jpg")}
            />
            <div className="mt-6 space-y-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="ml-1 text-lg font-medium">{doctor.rating}/5</span>
                <span className="text-gray-500 text-sm ml-2">({doctor.reviews} đánh giá)</span>
              </div>
              <div className="flex items-center text-gray-600">
                <BookOpen className="h-5 w-5 mr-2" />
                <span>{doctor.education}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Award className="h-5 w-5 mr-2" />
                <span>{doctor.experience}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-2" />
                <span>{doctor.contact.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-2" />
                <span>{doctor.contact.phone}</span>
              </div>
              <Link to={`/booking?doctor=${doctor.id}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3">Đặt lịch hẹn</Button>
              </Link>
            </div>
          </div>
          <div className="md:w-2/3 p-6 md:border-l border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
            <p className="text-xl text-blue-600 font-medium mb-6">{doctor.specialty}</p>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Lĩnh vực chuyên môn</h2>
              <div className="flex flex-wrap gap-2">
                {doctor.expertiseAreas.map((area, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Thành tựu nổi bật</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                {doctor.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
            <Link to="/doctors" className="text-blue-600 font-medium flex items-center hover:text-blue-800">
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Quay lại danh sách bác sĩ
            </Link>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-gray-200 flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu về {doctor.name}</h2>
                {/* Lưu ý: about cần được sanitize trong production */}
                <div className="prose prose-blue max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: doctor.about }} />
              </div>
            )}
            {activeTab === "education" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Học vấn & Chứng chỉ</h2>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                    Học vấn
                  </h3>
                  <div className="space-y-4">
                    {doctor.education_detail.map((edu, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-600" />
                    Chứng chỉ & Khóa đào tạo
                  </h3>
                  <div className="space-y-4">
                    {doctor.training.map((training, index) => (
                      <div key={index} className="border-l-2 border-green-200 pl-4 pb-4">
                        <p className="font-medium text-gray-900">{training.course}</p>
                        <p className="text-gray-600">{training.institution}</p>
                        <p className="text-sm text-gray-500">{training.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "schedule" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Lịch khám của {doctor.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {doctor.workSchedule.map((schedule, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{schedule.day}</p>
                        <p className="text-gray-600">{schedule.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Để đặt lịch hẹn với {doctor.name}, vui lòng sử dụng nút đặt lịch hẹn hoặc liên hệ:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-blue-600" />
                      {doctor.contact.phone}
                    </li>
                    <li className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-blue-600" />
                      {doctor.contact.email}
                    </li>
                  </ul>
                </div>
                <div className="mt-8 text-center">
                  <Link to={`/booking?doctor=${doctor.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 py-3 px-8">Đặt lịch hẹn ngay</Button>
                  </Link>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Đánh giá từ bệnh nhân</h2>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="ml-1 text-lg font-medium">{doctor.rating}/5</span>
                    <span className="text-gray-500 text-sm ml-2">({doctor.reviews} đánh giá)</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {doctor.testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{testimonial.patient}</p>
                            <p className="text-sm text-gray-500">{testimonial.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{testimonial.content}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Button
                    onClick={() => console.log("Chuyển hướng đến form đánh giá")} // Thay alert bằng console.log
                    className="bg-blue-600 hover:bg-blue-700 py-3 px-6"
                  >
                    Viết đánh giá
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-md p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Đặt lịch hẹn với {doctor.name}</h2>
          <Link to={`/booking?doctor=${doctor.id}`}>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 py-3 px-8 shadow-lg">
              Đặt lịch hẹn ngay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
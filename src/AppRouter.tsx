import {ReactNode} from 'react';
import {Link, Navigate, Route, Routes} from 'react-router-dom';
import App from './App';

function PageLayout({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-6 md:px-6">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800">
          <Link to="/" className="font-semibold text-emerald-700 underline dark:text-emerald-400">
            ← Quay lại công cụ
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            <Link to="/gioi-thieu" className="hover:text-emerald-600 dark:hover:text-emerald-400">Giới thiệu</Link>
            <Link to="/faq" className="hover:text-emerald-600 dark:hover:text-emerald-400">FAQ</Link>
            <Link to="/chinh-sach" className="hover:text-emerald-600 dark:hover:text-emerald-400">Chính sách</Link>
            <Link to="/lien-he" className="hover:text-emerald-600 dark:hover:text-emerald-400">Liên hệ</Link>
          </nav>
        </div>

        <main className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6">
          <h1 className="mb-4 text-2xl font-black tracking-tight">{title}</h1>
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">{children}</div>
        </main>

        <footer className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Xem nhiều tool khác tại{' '}
          <a
            href="https://link.thanhlv.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            link.thanhlv.com
          </a>
          .
        </footer>
      </div>
    </div>
  );
}

function GioiThieuPage() {
  return (
    <PageLayout title="Giới thiệu">
      <p>
        Công Cụ Kiểm Tiền VN hỗ trợ kiểm đếm tiền mặt theo từng mệnh giá VND, phù hợp cho kiểm quỹ cuối ngày,
        đối soát thu chi và tổng hợp nhanh theo ca làm việc.
      </p>
      <p>
        Bạn có thể tách nhiều cụm số lượng trong cùng một mệnh giá, lưu phiên kiểm đếm vào lịch sử và xuất báo cáo PDF để đối chiếu.
      </p>
      <p>Dữ liệu lịch sử được lưu trên trình duyệt của chính bạn và không yêu cầu tài khoản để sử dụng.</p>
    </PageLayout>
  );
}

function FaqPage() {
  return (
    <PageLayout title="Câu hỏi thường gặp">
      <section>
        <h2 className="mb-1 text-base font-bold">Công cụ có miễn phí không?</h2>
        <p>Có. Bạn có thể dùng miễn phí tính năng kiểm đếm và xuất PDF.</p>
      </section>
      <section>
        <h2 className="mb-1 text-base font-bold">Dữ liệu được lưu ở đâu?</h2>
        <p>Lịch sử kiểm đếm lưu cục bộ trong localStorage của trình duyệt trên thiết bị hiện tại.</p>
      </section>
      <section>
        <h2 className="mb-1 text-base font-bold">Có thể tách nhiều bó cho cùng mệnh giá không?</h2>
        <p>Có. Bạn dùng nút thêm cụm ở từng mệnh giá để nhập nhiều nhóm số lượng riêng.</p>
      </section>
    </PageLayout>
  );
}

function ChinhSachPage() {
  return (
    <PageLayout title="Chính sách">
      <section>
        <h2 className="mb-1 text-base font-bold">Phạm vi sử dụng</h2>
        <p>
          Công cụ phục vụ hỗ trợ nghiệp vụ kiểm đếm và tổng hợp, không thay thế quy trình kiểm soát nội bộ của đơn vị sử dụng.
        </p>
      </section>
      <section>
        <h2 className="mb-1 text-base font-bold">Lưu trữ dữ liệu</h2>
        <p>Dữ liệu lịch sử được lưu ở phía trình duyệt người dùng, không cần đăng nhập để dùng tính năng cơ bản.</p>
      </section>
      <section>
        <h2 className="mb-1 text-base font-bold">Độ chính xác</h2>
        <p>Kết quả phụ thuộc dữ liệu đầu vào. Bạn cần đối soát lại trước khi dùng cho báo cáo hoặc quyết toán.</p>
      </section>
    </PageLayout>
  );
}

function LienHePage() {
  return (
    <PageLayout title="Liên hệ">
      <p>Nếu bạn cần góp ý, báo lỗi hoặc đề xuất tính năng, vui lòng liên hệ qua email:</p>
      <p>
        <a href="mailto:hello@thanhlv.com" className="font-semibold text-emerald-700 underline dark:text-emerald-400">
          hello@thanhlv.com
        </a>
      </p>
      <p>Thời gian phản hồi dự kiến: trong giờ hành chính, từ thứ 2 đến thứ 6.</p>
    </PageLayout>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/gioi-thieu/*" element={<GioiThieuPage />} />
      <Route path="/faq/*" element={<FaqPage />} />
      <Route path="/chinh-sach/*" element={<ChinhSachPage />} />
      <Route path="/lien-he/*" element={<LienHePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

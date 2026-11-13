import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedCursor from './components/AnimatedCursor';
import PageLoader from './components/PageLoader';
import Home from './pages/Home';
import Tracking from './pages/Tracking';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import About from './pages/About';
import Services from './pages/Services';
import Network from './pages/Network';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout() {
  const location = useLocation();
  const isDashboardOrLogin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

  if (isDashboardOrLogin) {
    return (
      <div className="relative min-h-screen w-full bg-background-dark font-display text-white selection:bg-primary selection:text-slate-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-display text-slate-900 dark:text-white bg-background-light dark:bg-background-dark selection:bg-primary selection:text-slate-900">
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/logistics" element={<Network />} />
          {/* Add more routes as we convert them */}
        </Routes>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <PageLoader />
      <Layout />
    </Router>
  );
}

export default App;

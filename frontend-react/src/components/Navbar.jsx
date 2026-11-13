import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Active link styling for light theme
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-primary text-sm font-semibold transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-primary"
      : "text-slate-600 hover:text-primary text-sm font-medium transition-colors";
      
  const mobileLinkClass = ({ isActive }) =>
    isActive
      ? "text-2xl font-bold text-primary transition-colors"
      : "text-2xl font-bold text-slate-600 hover:text-primary transition-colors";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-slate-900 group" onClick={closeMenu}>
            <div className="flex items-center justify-center size-10">
              <img src="/logo.png" alt="Allcargo Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Allcargo</h2>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            <NavLink to="/tracking" className={linkClass}>Tracking</NavLink>
            <NavLink to="/logistics" className={linkClass}>Network</NavLink>
            <NavLink to="/services" className={linkClass}>Services</NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>
            <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <Link
              to="/tracking"
              className="hidden sm:flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
            >
              Track
            </Link>
            
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-900 p-2"
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center gap-8 transition-transform duration-500 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeMenu}
          className="absolute top-6 right-6 text-slate-900 p-2"
        >
          <span className="material-symbols-outlined text-4xl text-primary">close</span>
        </button>

        {/* Links */}
        <NavLink to="/" className={mobileLinkClass} onClick={closeMenu}>Home</NavLink>
        <NavLink to="/tracking" className={mobileLinkClass} onClick={closeMenu}>Tracking</NavLink>
        <NavLink to="/logistics" className={mobileLinkClass} onClick={closeMenu}>Network</NavLink>
        <NavLink to="/services" className={mobileLinkClass} onClick={closeMenu}>Services</NavLink>
        <NavLink to="/about" className={mobileLinkClass} onClick={closeMenu}>About</NavLink>
        <NavLink to="/contact" className={mobileLinkClass} onClick={closeMenu}>Contact</NavLink>

        {/* Action inside menu */}
        <Link
          to="/tracking"
          onClick={closeMenu}
          className="mt-8 flex items-center justify-center rounded-lg bg-primary px-10 py-4 text-lg font-bold text-white shadow-lg"
        >
          Track Shipment
        </Link>
      </div>
    </>
  );
}

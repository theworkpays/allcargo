import { useEffect, useRef, useState } from 'react';

export default function AnimatedCursor() {
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setIsVisible(true);
      const x = e.clientX;
      const y = e.clientY;
      
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      if (outlineRef.current) {
        // We can add a slight delay to the outline using JS, or just follow directly for now.
        outlineRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, input, .stat-card, details')) {
        document.body.classList.add("cursor-hover");
      } else {
        document.body.classList.remove("cursor-hover");
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef}
        id="cursor-dot" 
        className="pointer-events-none fixed top-0 left-0 w-2 h-2 bg-primary rounded-full z-[9999] transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
      ></div>
      <div 
        ref={outlineRef}
        id="cursor-outline" 
        className="pointer-events-none fixed top-0 left-0 w-8 h-8 border border-primary/50 rounded-full z-[9998] transition-all duration-150 ease-out"
        style={{ opacity: isVisible ? 1 : 0 }}
      ></div>
    </>
  );
}

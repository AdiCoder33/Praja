import React, { useRef, useState, useEffect } from 'react';

interface GalleryItem {
  image: string;
  text: string;
}

interface CircularGalleryProps {
  items: GalleryItem[];
  textColor?: string;
}

export default function CircularGallery({
  items,
  textColor = '#1e293b'
}: CircularGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Duplicate items array a few times to ensure infinite smooth scrolling
  const duplicatedItems = [...items, ...items, ...items, ...items];

  // Auto-scroll logic (faster)
  useEffect(() => {
    if (isDragging) return;
    
    let animationId: number;
    const scroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += 1.5; // Fast sideways panning
        
        const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        // If we reach near the end of our cloned arrays, silently snap back to the start
        if (scrollRef.current.scrollLeft >= maxScroll - 500) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isDragging]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      className="marquee-gallery-scene"
      style={{
        width: '100vw',
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'calc(-50vw + 50%)',
        position: 'relative',
        background: '#f1f5f9',
      }}
    >
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          display: 'flex',
          gap: '20px',
          overflowX: 'hidden', /* Hidden scrollbar, handled by JS */
          width: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: '0 20px',
        }}
        className="no-scrollbar"
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={index}
            style={{
              width: '140px',
              height: '180px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
              padding: '8px 0',
              pointerEvents: 'none', /* Prevent dragging image directly */
              userSelect: 'none'
            }}
          >
            <div 
              style={{ 
                width: '100%', 
                height: '100px',
                overflow: 'hidden', 
                borderRadius: '10px', 
                boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={item.image}
                alt={item.text}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
                draggable={false}
              />
            </div>
            
            <div
              style={{
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: textColor,
                font: 'bold 15px Inter',
                fontWeight: 600,
                letterSpacing: '-0.3px',
                marginTop: '0.75rem',
                textAlign: 'center',
                lineHeight: 1.2
              }}
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}

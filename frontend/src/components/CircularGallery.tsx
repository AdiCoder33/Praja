import React, { useRef, useState, useEffect } from 'react';

interface GalleryItem {
  image: string;
  text: string;
}

interface CircularGalleryProps {
  items: GalleryItem[];
  textColor?: string;
  font?: string;
  speed?: number;
}

export default function CircularGallery({
  items,
  textColor = '#1e293b',
  font,
  speed,
}: CircularGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const timeRef = useRef(0);

  // Duplicate items for seamless infinite loop
  const duplicatedItems = [...items, ...items, ...items, ...items];

  // Combined auto-scroll + sine wave curve animation
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      timeRef.current += 0.018; // Controls wave speed

      // Auto-scroll horizontal pan
      if (scrollRef.current && !isDragging) {
        const step = speed ? speed / 25 : 1.5;
        scrollRef.current.scrollLeft += step;
        const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        if (scrollRef.current.scrollLeft >= maxScroll - 500) {
          scrollRef.current.scrollLeft = 0;
        }
      }

      // Apply sine wave vertical offset to each card
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        // Each card gets a phase offset based on index → creates wave shape
        const phase = index * 0.5;
        const yOffset = Math.sin(timeRef.current + phase) * 22; // 22px wave amplitude
        const scale = 0.92 + Math.sin(timeRef.current + phase) * 0.06; // subtle scale pulse
        card.style.transform = `translateY(${yOffset}px) scale(${scale})`;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isDragging]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      className="marquee-gallery-scene"
      style={{
        width: '100vw',
        height: '280px', /* Extra height to accommodate wave vertical movement */
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'calc(-50vw + 50%)',
        position: 'relative',
        background: '#f1f5f9',
        overflow: 'hidden',
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
          overflowX: 'hidden',
          width: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: '30px 20px', /* Vertical padding for wave room */
          alignItems: 'center',
        }}
        className="no-scrollbar"
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={index}
            ref={el => { cardRefs.current[index] = el; }}
            style={{
              width: '140px',
              height: '180px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
              padding: '8px 0',
              pointerEvents: 'none',
              userSelect: 'none',
              willChange: 'transform', /* GPU-accelerated smooth curve */
              transition: 'transform 0.05s linear',
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
                font: font || 'bold 15px Inter',
                fontWeight: 600,
                letterSpacing: '-0.3px',
                marginTop: '0.75rem',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

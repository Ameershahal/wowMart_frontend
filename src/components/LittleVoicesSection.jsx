import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";

const defaultVideos = [
  { id: 1, src: "https://drftkgc3tvidp.cloudfront.net/Review01.mp4" },
  { id: 2, src: "https://drftkgc3tvidp.cloudfront.net/Review02.mp4" },
  { id: 3, src: "https://drftkgc3tvidp.cloudfront.net/Review03.mp4" },
  { id: 4, src: "https://drftkgc3tvidp.cloudfront.net/Review04.mp4" },
  { id: 5, src: "https://drftkgc3tvidp.cloudfront.net/Review05.mp4" },
  { id: 6, src: "https://drftkgc3tvidp.cloudfront.net/Review06.mp4" },
];

export default function LittleVoicesSection() {
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [videos, setVideos] = useState(defaultVideos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('/settings/little-voices-videos');
        if (response.data && response.data.videos && response.data.videos.length > 0) {
          setVideos(response.data.videos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        // Keep default videos on error
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    if (loading || videos.length === 0) return;
    
    const container = scrollRef.current;
    if (!container || !container.children.length) return;

    const gap = 16; // gap-4
    const cardWidth = container.children[0].offsetWidth + gap;
    const total = videos.length;

    let index = 0;
    let interval;

    interval = setInterval(() => {
      if (paused) return;

      index += 1;

      container.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });

      // 🔁 TRUE INFINITE LOOP (silent reset)
      if (index === total) {
        setTimeout(() => {
          container.scrollTo({
            left: 0,
            behavior: "auto", // invisible jump
          });
          index = 0;
        }, 500); // wait for smooth scroll to finish
      }
    }, 2500); // ⏱ one-by-one delay

    return () => clearInterval(interval);
  }, [paused, videos, loading]);

  if (loading || videos.length === 0) {
    return null; // Don't render until videos are loaded
  }

  return (
    <section className="py-16 px-4 sm:px-8">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-semibold font-[Comfortaa] mb-4">
          Little Voices Speak!
        </h2>
        <p className="text-gray-600 text-base sm:text-lg">
          Every detail tells a story. Our creations blend craftsmanship and
          creativity to let the little voices speak!
        </p>
      </div>

      {/* Infinite One-by-One Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden scrollbar-hide"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {[...videos, ...videos].map((video, i) => (
          <div
            key={i}
            className="
              flex-shrink-0
              w-[180px]
              sm:w-[200px]
              md:w-[220px]
              lg:w-[calc((100vw-8rem)/5)]
              h-[340px] sm:h-[380px]
              rounded-2xl overflow-hidden
              bg-black shadow-md
              hover:shadow-xl
              transition-all duration-300
            "
          >
            <video
              src={video.src}
              className="w-full h-full object-cover"
              muted
              autoPlay
              loop
              playsInline
              controls
              preload="auto"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: "My kids love the toys we got here. Fast delivery and everything was packed with care. Will definitely order again!",
    name: "Priya M.",
    role: "Parent",
    rating: 5,
  },
  {
    quote: "Best place for quality toys and gadgets. The customer service is amazing and the products are exactly as described.",
    name: "Rahul K.",
    role: "Happy Customer",
    rating: 5,
  },
  {
    quote: "So glad we found wowmart. Great selection, fair prices, and my little one is obsessed with the building set we bought.",
    name: "Anita S.",
    role: "Parent",
    rating: 5,
  },
];

function StarRating({ rating }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex justify-center gap-0.5 mb-3" aria-label={`${rating} out of 5 stars`}>
      {stars.map((i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ quote, name, role, rating = 5 }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 md:p-7 text-center flex-shrink-0 w-[320px] md:w-[380px]">
      <StarRating rating={rating} />
      <p className="text-slate-700 text-base md:text-lg leading-relaxed mb-4">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="font-semibold text-slate-900">{name}</p>
      {role && <p className="text-sm text-slate-500 mt-0.5">{role}</p>}
    </div>
  );
}

export default function TestimonialsSection() {
  // Duplicate 3x for long, seamless infinite auto-scroll
  const duplicated = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-14 md:py-20 bg-white border-t border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-display text-display-sm md:text-display-md font-semibold text-slate-900 mb-2">
            Testimonials
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Real stories from families who love shopping with us.
          </p>
        </div>

        <div className="relative -mx-4 sm:-mx-6 overflow-hidden">
          <div className="flex gap-6 w-max will-change-transform animate-testimonial-scroll">
            {duplicated.map((t, i) => (
              <TestimonialCard key={i} quote={t.quote} name={t.name} role={t.role} rating={t.rating} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

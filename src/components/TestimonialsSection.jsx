const testimonials = [
  {
    quote: "My kids love the toys we got here. Fast delivery and everything was packed with care. Will definitely order again!",
    name: "Priya M.",
    role: "Parent",
  },
  {
    quote: "Best place for quality toys and gadgets. The customer service is amazing and the products are exactly as described.",
    name: "Rahul K.",
    role: "Happy Customer",
  },
  {
    quote: "So glad we found wowmart. Great selection, fair prices, and my little one is obsessed with the building set we bought.",
    name: "Anita S.",
    role: "Parent",
  },
];

function TestimonialCard({ quote, name, role }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 md:p-7 text-center flex-shrink-0 w-[320px] md:w-[380px]">
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
              <TestimonialCard key={i} quote={t.quote} name={t.name} role={t.role} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

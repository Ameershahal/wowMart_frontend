/**
 * Placeholder block. Default pulse is slow/subtle so first paint feels less "loading".
 * Set pulse={false} for a static tile (categories, etc.).
 */
export default function Skeleton({ className = '', pulse = true, ...props }) {
  return (
    <div
      className={`rounded-md bg-slate-100 ${
        pulse
          ? 'motion-safe:animate-[pulse_2.75s_ease-in-out_infinite] motion-reduce:animate-none'
          : ''
      } ${className}`}
      aria-hidden="true"
      {...props}
    />
  )
}

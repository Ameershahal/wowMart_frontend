export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
      aria-hidden="true"
      {...props}
    />
  )
}

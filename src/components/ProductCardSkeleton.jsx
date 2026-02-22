import Skeleton from './Skeleton'

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-5 w-16 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

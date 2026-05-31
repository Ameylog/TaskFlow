import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TodoSkeleton() {
  return (
    <section>
      <div className="p-2">
        <Card className="rounded-2xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
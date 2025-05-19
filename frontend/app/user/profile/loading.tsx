import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-5 w-[350px]" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr]">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="text-center space-y-2">
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-40 mx-auto" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="my-6 h-[1px] w-full bg-gray-200" />

              <div className="flex flex-col gap-2">
                {Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array(2)
                    .fill(null)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array(2)
                    .fill(null)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {Array(3)
                    .fill(null)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                </div>

                <div className="flex justify-end">
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>
                    <Skeleton className="h-6 w-24" />
                  </CardTitle>
                  <Skeleton className="mt-1 h-4 w-32" />
                </div>
                <div className="flex flex-col gap-2 md:flex-row">
                  <Skeleton className="h-10 w-full md:w-[200px] lg:w-[300px]" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-12" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="mt-1 h-3 w-32" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="mt-1 h-3 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="mt-1 h-3 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-[350px]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
              <Skeleton className="mt-1 h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center pb-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="mt-4 h-6 w-32" />
                <Skeleton className="mt-1 h-4 w-40" />
                <div className="mt-2 flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>

              <div className="mb-4 flex gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-4 w-40" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-4 w-40" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-4 w-40" />
                  <Skeleton className="mt-1 h-4 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-4 w-40" />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  CheckCircle2,
  Filter,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserCog,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFilteredUsers, updateUserRole, updateUserStatus } from "@/lib/admin-mock-data"
import type { User } from "@/lib/admin-types"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Get filtered users based on current filters
  const users = getFilteredUsers({
    role: roleFilter,
    status: statusFilter,
    search: searchQuery,
  })

  // Handle role change
  const handleRoleChange = (userId: string, newRole: "admin" | "user") => {
    updateUserRole(userId, newRole)
    // Force re-render
    setSearchQuery(searchQuery)
  }

  // Handle status change
  const handleStatusChange = (userId: string, newStatus: "active" | "inactive" | "suspended") => {
    updateUserStatus(userId, newStatus)
    // Force re-render
    setSearchQuery(searchQuery)
  }

  // Handle user selection for details view
  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage users, assign admin roles, and monitor user activity.</p>
        </div>
        <Button className="w-full md:w-auto">
          <UserCog className="mr-2 h-4 w-4" />
          Add New Admin
        </Button>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>{users.length} users found</CardDescription>
                </div>
                <div className="flex flex-col gap-2 md:flex-row">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="w-full pl-8 md:w-[200px] lg:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">Filter</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filter Users</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <p className="mb-1 text-xs font-medium">Role</p>
                        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Role</SelectLabel>
                              <SelectItem value="all">All Roles</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-2">
                        <p className="mb-1 text-xs font-medium">Status</p>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Status</SelectLabel>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="cursor-pointer" onClick={() => handleUserSelect(user)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.role === "admin" ? (
                            <Badge
                              variant="outline"
                              className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                            >
                              <ShieldCheck className="mr-1 h-3 w-3" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.status === "active" ? (
                            <Badge
                              variant="outline"
                              className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : user.status === "inactive" ? (
                            <Badge
                              variant="outline"
                              className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                            >
                              Inactive
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Suspended
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.location ? (
                            <div className="text-xs">
                              <p>{user.location.province}</p>
                              <p className="text-muted-foreground">{user.location.district}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p>Last active: {format(user.lastActive, "MMM d, yyyy")}</p>
                            <p className="text-muted-foreground">
                              {user.role === "admin"
                                ? `${user.responseCount} responses`
                                : `${user.feedbackCount} feedback items`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {user.role === "user" ? (
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Make Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")}>
                                  <ShieldX className="mr-2 h-4 w-4" />
                                  Remove Admin Role
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {user.status !== "active" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, "active")}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Set as Active
                                </DropdownMenuItem>
                              )}
                              {user.status !== "inactive" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, "inactive")}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Set as Inactive
                                </DropdownMenuItem>
                              )}
                              {user.status !== "suspended" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, "suspended")}>
                                  <ShieldAlert className="mr-2 h-4 w-4" />
                                  Suspend User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedUser && (
          <div className="w-full md:w-[350px]">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>User Details</CardTitle>
                <CardDescription>View and manage user information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center pb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                    <AvatarFallback className="text-xl">{selectedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="mt-2 flex gap-2">
                    {selectedUser.role === "admin" ? (
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                    {selectedUser.status === "active" ? (
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                      >
                        Active
                      </Badge>
                    ) : selectedUser.status === "inactive" ? (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      >
                        Inactive
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                      >
                        Suspended
                      </Badge>
                    )}
                  </div>
                </div>

                <Tabs defaultValue="info">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                  <TabsContent value="info" className="space-y-4 pt-4">
                    <div>
                      <h4 className="text-sm font-medium">Account Created</h4>
                      <p className="text-sm text-muted-foreground">{format(selectedUser.createdAt, "MMMM d, yyyy")}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Last Active</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedUser.lastActive, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Location</h4>
                      {selectedUser.location ? (
                        <div className="text-sm text-muted-foreground">
                          <p>{selectedUser.location.province}</p>
                          <p>
                            {selectedUser.location.district}, {selectedUser.location.sector}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not specified</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Activity Summary</h4>
                      <div className="text-sm text-muted-foreground">
                        {selectedUser.role === "admin" ? (
                          <p>{selectedUser.responseCount} responses provided</p>
                        ) : (
                          <p>{selectedUser.feedbackCount} feedback items submitted</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="activity" className="pt-4">
                    <div className="space-y-4">
                      <div className="border-l-2 border-muted pl-4">
                        <h4 className="text-sm font-medium">Last Login</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(selectedUser.lastActive, "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      {selectedUser.role === "admin" ? (
                        <>
                          <div className="border-l-2 border-muted pl-4">
                            <h4 className="text-sm font-medium">Responded to Feedback</h4>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(2023, 5, 18), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div className="border-l-2 border-muted pl-4">
                            <h4 className="text-sm font-medium">Updated Feedback Status</h4>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(2023, 5, 17), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="border-l-2 border-muted pl-4">
                            <h4 className="text-sm font-medium">Submitted Feedback</h4>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(2023, 5, 16), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div className="border-l-2 border-muted pl-4">
                            <h4 className="text-sm font-medium">Commented on Feedback</h4>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(2023, 5, 15), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </>
                      )}
                      <div className="border-l-2 border-muted pl-4">
                        <h4 className="text-sm font-medium">Profile Updated</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(2023, 5, 10), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 space-y-2">
                  {selectedUser.role === "user" ? (
                    <Button className="w-full" onClick={() => handleRoleChange(selectedUser.id, "admin")}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Make Admin
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleRoleChange(selectedUser.id, "user")}
                    >
                      <ShieldX className="mr-2 h-4 w-4" />
                      Remove Admin Role
                    </Button>
                  )}

                  {selectedUser.status === "active" ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedUser.id, "suspended")}
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Suspend User
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleStatusChange(selectedUser.id, "active")}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Activate User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

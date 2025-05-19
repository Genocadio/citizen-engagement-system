"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { useQuery, useMutation } from "@apollo/client"
import { toast } from "react-toastify"
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
import { GET_USERS } from "@/lib/graphql/queries"
import { UPDATE_USER_ROLE, UPDATE_USER_PROFILE } from "@/lib/graphql/mutations"

// Helper function to safely format dates
const formatDate = (dateString: string | number | undefined | null, formatStr: string = "MMM d, yyyy") => {
  if (!dateString) return "Never"
  try {
    let date: Date
    // Handle MongoDB timestamp (milliseconds since epoch)
    if (typeof dateString === 'number' || /^\d{13}$/.test(dateString)) {
      date = new Date(Number(dateString))
    } else {
      // Try parsing as ISO string
      date = parseISO(dateString)
      if (isNaN(date.getTime())) {
        // If that fails, try regular Date parsing
        date = new Date(dateString)
      }
    }
    
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }
    return format(date, formatStr)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  phoneNumber?: string
  profileUrl?: string
  role: string
  category?: string
  isActive: boolean
  lastLoginAt?: string
  lastActivityAt?: string
  createdAt: string
  updatedAt: string
}

type UserCategory =  'all'| 'citizen' | 'government' | 'infrastructure' | 'public-services' | 'safety' | 'environment' | 'other'

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Fetch users with filters
  const { data, loading, refetch } = useQuery(GET_USERS, {
    variables: {
      role: roleFilter === "all" ? undefined : roleFilter,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    },
  })

  // Update user role mutation
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE, {
    onCompleted: () => {
      toast.success("User role updated successfully")
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Update user category mutation
  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      toast.success("User category updated successfully")
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Filter users based on search query
  const filteredUsers = data?.users?.filter((user: User) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower)
    )
  }) || []

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    try {
      await updateUserRole({
        variables: {
          id: userId,
          role: newRole,
        },
      })
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  // Handle category change
  const handleCategoryChange = async (userId: string, newCategory: UserCategory) => {
    try {
      await updateUserProfile({
        variables: {
          id: userId,
          input: {
            category: newCategory,
          },
        },
      })
    } catch (error) {
      console.error("Error updating user category:", error)
    }
  }

  // Handle user selection for details view
  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
  }

  if (loading) {
    return <div>Loading...</div>
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
                  <CardDescription>{filteredUsers.length} users found</CardDescription>
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
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: User) => (
                      <TableRow key={user.id} className="cursor-pointer" onClick={() => handleUserSelect(user)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profileUrl || "/placeholder.svg"} alt={user.username || user.email} />
                              <AvatarFallback>{(user.username || user.email).charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.username || user.email}</p>
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
                          {user.isActive ? (
                            <Badge
                              variant="outline"
                              className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                            >
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p>Last active: {formatDate(user.lastActivityAt)}</p>
                            <p className="text-muted-foreground">
                              Joined: {formatDate(user.createdAt)}
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
                    <AvatarImage src={selectedUser.profileUrl || "/placeholder.svg"} alt={selectedUser.username || selectedUser.email} />
                    <AvatarFallback className="text-xl">{(selectedUser.username || selectedUser.email).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 text-lg font-semibold">{selectedUser.username || selectedUser.email}</h3>
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
                    {selectedUser.isActive ? (
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      >
                        Inactive
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
                      <p className="text-sm text-muted-foreground">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Last Active</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedUser.lastActivityAt, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Last Login</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedUser.lastLoginAt, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
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
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Category</p>
                    <Select
                      value={selectedUser.category || 'other'}
                      onValueChange={(value) => handleCategoryChange(selectedUser.id, value as UserCategory)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          <SelectItem value="citizen">Citizen</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="public-services">Public Services</SelectItem>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

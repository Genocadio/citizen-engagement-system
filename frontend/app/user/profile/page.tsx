"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Camera, User, Bell, Shield, History, LogOut } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useProfile } from "@/lib/hooks/use-profile"
import { toast } from "react-toastify"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    isLoading: profileLoading,
    userLoading,
    profileImage,
    formData,
    setFormData,
    passwordData,
    setPasswordData,
    handleProfileUpdate,
    handlePasswordChange,
    handleImageUpload,
    userData,
  } = useProfile()

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appNotifications: true,
    feedbackUpdates: true,
    commentReplies: true,
    statusChanges: true,
    marketingEmails: false,
  })

  if (!user) {
    router.push("/auth")
    return null
  }

  const handleNotificationUpdate = async () => {
    setIsLoading(true)

    try {
      // TODO: Implement notification settings update
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Notification preferences updated successfully")
    } catch (error) {
      toast.error("Failed to update notification preferences")
    } finally {
      setIsLoading(false)
    }
  }

  if (userLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const displayName = userData?.me ? `${userData.me.firstName || ''} ${userData.me.lastName || ''}`.trim() || userData.me.username : ''

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr]">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImage || "/placeholder.svg?height=96&width=96"} alt={displayName} />
                    <AvatarFallback className="text-2xl">{displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Upload profile image</span>
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">{userData?.me?.email}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>

              <Separator className="my-6" />

              <nav className="flex flex-col gap-2">
                <TabsList className="grid w-full grid-cols-1 gap-2">
                  <TabsTrigger value="account" className="justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="security" className="justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="justify-start">
                    <History className="mr-2 h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>
              </nav>
            </CardContent>
          </Card>

          <Tabs defaultValue="account" className="w-full">
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your personal information and contact details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Channels</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notifications" className="font-medium">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="sms-notifications" className="font-medium">
                              SMS Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                          </div>
                          <Switch
                            id="sms-notifications"
                            checked={notificationSettings.smsNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="app-notifications" className="font-medium">
                              In-App Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">Receive notifications within the app</p>
                          </div>
                          <Switch
                            id="app-notifications"
                            checked={notificationSettings.appNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, appNotifications: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Types</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="feedback-updates" className="font-medium">
                              Feedback Updates
                            </Label>
                            <p className="text-sm text-muted-foreground">Updates on your submitted feedback</p>
                          </div>
                          <Switch
                            id="feedback-updates"
                            checked={notificationSettings.feedbackUpdates}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, feedbackUpdates: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="comment-replies" className="font-medium">
                              Comment Replies
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Notifications when someone replies to your comments
                            </p>
                          </div>
                          <Switch
                            id="comment-replies"
                            checked={notificationSettings.commentReplies}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, commentReplies: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="status-changes" className="font-medium">
                              Status Changes
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Notifications about status changes on your feedback
                            </p>
                          </div>
                          <Switch
                            id="status-changes"
                            checked={notificationSettings.statusChanges}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, statusChanges: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="marketing-emails" className="font-medium">
                              Marketing Emails
                            </Label>
                            <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                          </div>
                          <Switch
                            id="marketing-emails"
                            checked={notificationSettings.marketingEmails}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({ ...notificationSettings, marketingEmails: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleNotificationUpdate} disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Change Password
                      </Button>
                    </div>
                  </form>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Security</h3>

                    <div className="rounded-lg border p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Two-Factor Authentication</h4>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Button variant="outline">Enable</Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Active Sessions</h4>
                            <p className="text-sm text-muted-foreground">Manage your active sessions across devices</p>
                          </div>
                          <Button variant="outline">Manage</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                  <CardDescription>View your recent activity on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Activity items will be populated from the backend */}
                    <div className="text-center text-muted-foreground">
                      No recent activity to display
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

/**
 * @fileoverview Submit page component for handling user feedback submission.
 * This page provides a form interface for users to submit complaints, positive feedback,
 * and suggestions with various options for customization and privacy.
 */

"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { categories, subcategories, generateTicketNumber } from "@/lib/data"
import { LocationSelector } from "@/components/location-selector"
import { Paperclip, MapPin } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

/**
 * Submit page component that handles user feedback submission.
 * 
 * @component
 * @returns {JSX.Element} A form interface with the following features:
 * - Tabbed interface for different feedback types (Issue, Positive, Suggestion)
 * - Category and subcategory selection
 * - Location information with hierarchical selection
 * - File attachment support
 * - Privacy controls (public/private, anonymous submission)
 * 
 * @example
 * ```tsx
 * <SubmitPage />
 * ```
 * 
 * @note
 * - Uses client-side form validation
 * - Integrates with authentication context
 * - Provides toast notifications for feedback
 * - Supports file attachments with size limits
 * - Includes location validation for Rwanda and other countries
 */
export default function SubmitPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [feedbackType, setFeedbackType] = useState<"Complaint" | "Positive" | "Suggestion">("Complaint")
  const [category, setCategory] = useState<string>("")
  const [subcategory, setSubcategory] = useState<string>("")
  const [isPublic, setIsPublic] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isLocationOpen, setIsLocationOpen] = useState(false)

  const [location, setLocation] = useState({
    country: "Rwanda",
    province: "",
    district: "",
    sector: "",
    otherDetails: "",
  })

  /**
   * Handles form submission with validation and feedback.
   * 
   * @param {React.FormEvent} e - The form submission event
   * @returns {void}
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate location data
    if (isLocationOpen) {
      if (!location.country) {
        toast({
          title: "Location Error",
          description: "Country is required",
          variant: "destructive",
        })
        return
      }

      if (location.country === "Rwanda") {
        if (!location.province || !location.district || !location.sector) {
          toast({
            title: "Location Error",
            description: "Province, district, and sector are required for Rwanda",
            variant: "destructive",
          })
          return
        }
      } else {
        if (!location.province || !location.district) {
          toast({
            title: "Location Error",
            description: "Province/State and District are required",
            variant: "destructive",
          })
          return
        }
      }
    }

    // In a real app, this would send data to the server
    toast({
      title: "Feedback submitted successfully",
      description: `Your ticket number is ${generateTicketNumber()}`,
    })

    // Redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  /**
   * Handles file attachment changes.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event
   * @returns {void}
   */
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  /**
   * Handles location changes from the LocationSelector component.
   * 
   * @param {Object} newLocation - The new location data
   * @param {string} newLocation.country - The selected country
   * @param {string} newLocation.province - The selected province/state
   * @param {string} newLocation.district - The selected district
   * @param {string} newLocation.sector - The selected sector
   * @param {string} [newLocation.otherDetails] - Additional location details
   * @returns {void}
   */
  const handleLocationChange = useCallback((newLocation: {
    country: string
    province: string
    district: string
    sector: string
    otherDetails?: string
  }) => {
    setLocation({
      ...newLocation,
      otherDetails: newLocation.otherDetails || ""
    })
  }, [])

  return (
    <div className="min-h-screen flex-col">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Submit Feedback</h1>

        <Tabs defaultValue="issue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issue" onClick={() => setFeedbackType("Complaint")}>
              Report an Issue
            </TabsTrigger>
            <TabsTrigger value="positive" onClick={() => setFeedbackType("Positive")}>
              Positive Feedback
            </TabsTrigger>
            <TabsTrigger value="suggestion" onClick={() => setFeedbackType("Suggestion")}>
              Suggestion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issue">
            <Card>
              <CardHeader>
                <CardTitle>Report an Issue</CardTitle>
                <CardDescription>Submit details about a problem that needs attention.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Brief description of the issue" required />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={setCategory} required>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select onValueChange={setSubcategory} disabled={!category}>
                        <SelectTrigger id="subcategory">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {category &&
                            subcategories[category]?.map((subcat) => (
                              <SelectItem key={subcat} value={subcat}>
                                {subcat}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide detailed information about the issue"
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Location Information</h3>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" type="button">
                          {isLocationOpen ? "Hide" : "Show"}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="mt-4">
                      <LocationSelector onLocationChange={handleLocationChange} />
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        {attachments.length > 0 ? `${attachments.length} file(s) selected` : "Add files"}
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleAttachmentChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You can upload images or documents related to the issue (max 5MB each).
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="public">Make this issue public</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Public issues are visible to all users and can receive community support.
                    </p>

                    <div className="flex items-center space-x-2">
                      <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                      <Label htmlFor="anonymous">Submit anonymously</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your name will not be displayed publicly if you choose to submit anonymously.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.push("/")}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Issue</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="positive">
            <Card>
              <CardHeader>
                <CardTitle>Positive Feedback</CardTitle>
                <CardDescription>Share your positive experiences with government services.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="positive-title">Title</Label>
                    <Input id="positive-title" placeholder="Brief description of your positive experience" required />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="positive-category">Category</Label>
                      <Select onValueChange={setCategory} required>
                        <SelectTrigger id="positive-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="positive-subcategory">Subcategory</Label>
                      <Select onValueChange={setSubcategory} disabled={!category}>
                        <SelectTrigger id="positive-subcategory">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {category &&
                            subcategories[category]?.map((subcat) => (
                              <SelectItem key={subcat} value={subcat}>
                                {subcat}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positive-description">Description</Label>
                    <Textarea
                      id="positive-description"
                      placeholder="Please share details about your positive experience"
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Location Information</h3>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" type="button">
                          {isLocationOpen ? "Hide" : "Show"}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="mt-4">
                      <LocationSelector onLocationChange={handleLocationChange} />
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="space-y-2">
                    <Label htmlFor="positive-attachments">Attachments (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById("positive-file-upload")?.click()}
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        {attachments.length > 0 ? `${attachments.length} file(s) selected` : "Add files"}
                      </Button>
                      <input
                        id="positive-file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleAttachmentChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="positive-public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="positive-public">Make this feedback public</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="positive-anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                      <Label htmlFor="positive-anonymous">Submit anonymously</Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.push("/")}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Feedback</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="suggestion">
            <Card>
              <CardHeader>
                <CardTitle>Suggestion</CardTitle>
                <CardDescription>Share your ideas for improving government services.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="suggestion-title">Title</Label>
                    <Input id="suggestion-title" placeholder="Brief description of your suggestion" required />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="suggestion-category">Category</Label>
                      <Select onValueChange={setCategory} required>
                        <SelectTrigger id="suggestion-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="suggestion-subcategory">Subcategory</Label>
                      <Select onValueChange={setSubcategory} disabled={!category}>
                        <SelectTrigger id="suggestion-subcategory">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {category &&
                            subcategories[category]?.map((subcat) => (
                              <SelectItem key={subcat} value={subcat}>
                                {subcat}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suggestion-description">Description</Label>
                    <Textarea
                      id="suggestion-description"
                      placeholder="Please provide detailed information about your suggestion"
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Location Information</h3>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" type="button">
                          {isLocationOpen ? "Hide" : "Show"}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="mt-4">
                      <LocationSelector onLocationChange={handleLocationChange} />
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="space-y-2">
                    <Label htmlFor="suggestion-attachments">Attachments (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById("suggestion-file-upload")?.click()}
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        {attachments.length > 0 ? `${attachments.length} file(s) selected` : "Add files"}
                      </Button>
                      <input
                        id="suggestion-file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleAttachmentChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="suggestion-public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="suggestion-public">Make this suggestion public</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="suggestion-anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                      <Label htmlFor="suggestion-anonymous">Submit anonymously</Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.push("/")}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Suggestion</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

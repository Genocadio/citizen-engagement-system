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
import { useMutation } from '@apollo/client';
import { CREATE_FEEDBACK } from '@/lib/graphql/mutations';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CldUploadButton } from 'next-cloudinary';

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
  const { user } = useAuth()
  const [createFeedback, { loading }] = useMutation(CREATE_FEEDBACK)

  const [feedbackType, setFeedbackType] = useState<"Complaint" | "Positive" | "Suggestion">("Complaint")
  const [category, setCategory] = useState<string>("")
  const [subcategory, setSubcategory] = useState<string>("")
  const [isPublic, setIsPublic] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(!user)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isLocationOpen, setIsLocationOpen] = useState(false)

  const [location, setLocation] = useState({
    country: "",
    province: "",
    district: "",
    sector: "",
    otherDetails: "",
  })
  const [hasLocationBeenEdited, setHasLocationBeenEdited] = useState(false)

  /**
   * Handles form submission with validation and feedback.
   * 
   * @param {React.FormEvent} e - The form submission event
   * @returns {void}
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Get the correct input IDs based on the feedback type
    const titleId = feedbackType === "Complaint" ? "title" : 
                   feedbackType === "Positive" ? "positive-title" : "suggestion-title"
    const descriptionId = feedbackType === "Complaint" ? "description" : 
                         feedbackType === "Positive" ? "positive-description" : "suggestion-description"
    
    const title = (document.getElementById(titleId) as HTMLInputElement)?.value
    const description = (document.getElementById(descriptionId) as HTMLTextAreaElement)?.value
    
    // Validate required fields
    if (!title || !description) {
      toast.error("Please fill in all required fields", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return
    }
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Submitting feedback with data:', {
          title,
          description,
          type: feedbackType,
          category,
          subcategory,
          priority: feedbackType === 'Complaint' ? 'High' : 'Medium',
          chatEnabled: isPublic,
          isAnonymous,
          location: hasLocationBeenEdited ? location : undefined,
          attachments: uploadedImages
        })
      }

      const { data } = await createFeedback({
        variables: {
          input: {
            title,
            description,
            type: feedbackType,
            category,
            subcategory,
            priority: feedbackType === 'Complaint' ? 'High' : 'Medium',
            chatEnabled: isPublic,
            isAnonymous,
            location: hasLocationBeenEdited ? location : undefined,
            attachments: uploadedImages
          }
        }
      })

      if (data?.createFeedback) {
        toast.success(`Feedback submitted successfully! Your ticket ID is: ${data.createFeedback.ticketId}`, {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error("Failed to submit feedback. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }

  /**
   * Handles file attachment changes.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event
   * @returns {void}
   */
  const handleCloudinaryUpload = (result: any) => {
    const MAX_IMAGES = 5;
    if (result.info && result.info.secure_url) {
      if (uploadedImages.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
      setUploadedImages(prev => [...prev, result.info.secure_url]);
      toast.success("Image uploaded successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

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
    setHasLocationBeenEdited(true)
  }, [])

  // Replace the file upload button section with Cloudinary upload
  const renderUploadButton = () => (
    <div className="space-y-2">
      <Label>Attachments (Optional)</Label>
      <div className="flex items-center gap-2">
        <CldUploadButton
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}
          onSuccess={handleCloudinaryUpload}
          className="w-full"
        >
          <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
            <Paperclip className="mr-2 h-4 w-4" />
            {uploadedImages.length > 0 ? `${uploadedImages.length}/5 images uploaded` : "Upload images"}
          </div>
        </CldUploadButton>
      </div>
      <p className="text-xs text-muted-foreground">
        You can upload up to 5 images (max 5MB each).
      </p>
      {uploadedImages.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Uploaded image ${index + 1}`}
                className="h-20 w-full rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Update the anonymous switch rendering in all three tabs
  const renderAnonymousSwitch = () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Switch 
          id="anonymous" 
          checked={isAnonymous} 
          onCheckedChange={user ? setIsAnonymous : undefined}
          disabled={!user}
        />
        <Label htmlFor="anonymous">Submit anonymously</Label>
      </div>
      <p className="text-xs text-muted-foreground">
        {!user 
          ? "You must be logged in to submit non-anonymous feedback."
          : "Your name will not be displayed publicly if you choose to submit anonymously."}
      </p>
    </div>
  )

  return (
    <div className="min-h-screen flex-col">
      <ToastContainer />
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
                    {renderUploadButton()}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="public">Make this issue public</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Public issues are visible to all users and can receive community support.
                    </p>

                    {renderAnonymousSwitch()}
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
                    {renderUploadButton()}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="positive-public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="positive-public">Make this feedback public</Label>
                    </div>

                    {renderAnonymousSwitch()}
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
                    {renderUploadButton()}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="suggestion-public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="suggestion-public">Make this suggestion public</Label>
                    </div>

                    {renderAnonymousSwitch()}
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

/**
 * @fileoverview Main landing page component for the citizen engagement platform.
 * This page serves as the entry point for users to submit feedback, view issues,
 * and access various features of the platform.
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Clock, MessageSquare, ThumbsUp } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { RecentIssues } from "@/components/recent-issues"

/**
 * Home page component that displays the main landing page of the application.
 * 
 * @component
 * @returns {JSX.Element} The rendered home page with the following sections:
 * - Hero section with call-to-action buttons
 * - Statistics overview with key metrics
 * - Recent public issues section
 * - Feature cards highlighting main platform capabilities
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col ">
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Your Voice Matters
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Submit feedback, report issues, and track progress on community matters that are important to you.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/submit">Submit Feedback</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/issues">View Public Issues</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Submitted Issues"
              value="1,234"
              description="Total issues reported"
              icon={<MessageSquare className="h-6 w-6" />}
            />
            <StatCard
              title="Resolved"
              value="987"
              description="Successfully addressed"
              icon={<CheckCircle className="h-6 w-6" />}
            />
            <StatCard
              title="In Progress"
              value="142"
              description="Currently being handled"
              icon={<Clock className="h-6 w-6" />}
            />
            <StatCard
              title="Positive Feedback"
              value="456"
              description="Appreciation received"
              icon={<ThumbsUp className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-2 mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Recent Public Issues</h2>
            <p className="text-muted-foreground">Stay updated with the latest community concerns</p>
          </div>
          <RecentIssues />
          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/issues" className="flex items-center gap-2">
                View All Issues <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-muted/50 rounded-lg">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Submit Feedback</CardTitle>
                <CardDescription>Share your thoughts and experiences</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Whether you want to report an issue or share positive feedback, your input helps improve services.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/submit">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Track Your Tickets</CardTitle>
                <CardDescription>Monitor the status of your submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Stay updated on the progress of your submitted issues and feedback through our tracking system.</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Public Issue Board</CardTitle>
                <CardDescription>Engage with community concerns</CardDescription>
              </CardHeader>
              <CardContent>
                <p>View, follow, and comment on public issues to participate in community problem-solving.</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/issues">Browse Issues</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

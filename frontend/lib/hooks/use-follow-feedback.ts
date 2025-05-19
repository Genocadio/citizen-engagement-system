import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { FOLLOW_FEEDBACK, UNFOLLOW_FEEDBACK } from '@/lib/graphql/mutations'
import { useToast } from '@/components/ui/use-toast'

interface UseFollowFeedbackProps {
  feedbackId: string
  currentUserId?: string
  initialIsFollowing?: boolean
  initialFollowerCount?: number
  onFollowChange?: (isFollowing: boolean) => void
}

export function useFollowFeedback({
  feedbackId,
  currentUserId,
  initialIsFollowing = false,
  initialFollowerCount = 0,
  onFollowChange
}: UseFollowFeedbackProps) {
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowerCount)

  // Update local state when initial values change
  useEffect(() => {
    setIsFollowing(initialIsFollowing)
    setFollowersCount(initialFollowerCount)
  }, [initialIsFollowing, initialFollowerCount])

  const [followFeedback] = useMutation(FOLLOW_FEEDBACK, {
    onCompleted: (data) => {
      const newIsFollowing = data.followFeedback.isFollowing
      setIsFollowing(newIsFollowing)
      setFollowersCount(data.followFeedback.followerCount)
      onFollowChange?.(newIsFollowing)
      toast({
        title: newIsFollowing ? "Following issue" : "Not following issue",
        description: newIsFollowing 
          ? "You will now receive updates about this issue"
          : "You will no longer receive updates about this issue",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const [unfollowFeedback] = useMutation(UNFOLLOW_FEEDBACK, {
    onCompleted: (data) => {
      const newIsFollowing = data.unfollowFeedback.isFollowing
      setIsFollowing(newIsFollowing)
      setFollowersCount(data.unfollowFeedback.followerCount)
      onFollowChange?.(newIsFollowing)
      toast({
        title: newIsFollowing ? "Following issue" : "Unfollowed issue",
        description: newIsFollowing 
          ? "You will now receive updates about this issue"
          : "You will no longer receive updates about this issue",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const toggleFollow = () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow issues",
        variant: "destructive",
      })
      return
    }

    if (isFollowing) {
      unfollowFeedback({ variables: { id: feedbackId } })
    } else {
      followFeedback({ variables: { id: feedbackId } })
    }
  }

  return {
    isFollowing,
    followersCount,
    toggleFollow
  }
} 
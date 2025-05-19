import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_CURRENT_USER } from '@/lib/graphql/queries'
import { UPDATE_USER_PROFILE, CHANGE_PASSWORD } from '@/lib/graphql/mutations'
import { toast } from 'react-toastify'

export function useProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phoneNumber: "",
    email: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch current user data
  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER)
  const [updateUser] = useMutation(UPDATE_USER_PROFILE)
  const [changePassword] = useMutation(CHANGE_PASSWORD)

  useEffect(() => {
    if (userData?.me) {
      setFormData({
        firstName: userData.me.firstName || "",
        lastName: userData.me.lastName || "",
        username: userData.me.username || "",
        phoneNumber: userData.me.phoneNumber || "",
        email: userData.me.email || "",
      })
      setProfileImage(userData.me.profileUrl || null)
    }
  }, [userData])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await updateUser({
        variables: {
          id: userData.me.id,
          input: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            phoneNumber: formData.phoneNumber,
          },
        },
      })

      if (data?.updateUser) {
        toast.success("Profile updated successfully")
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    setIsLoading(true)

    try {
      const { data } = await changePassword({
        variables: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      })

      if (data?.changePassword) {
        toast.success("Password changed successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      }
    } catch (error) {
      toast.error("Failed to change password. Please check your current password and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string)
          toast.success("Profile image updated successfully")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return {
    isLoading,
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
  }
} 
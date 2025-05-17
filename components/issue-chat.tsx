import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@/lib/utils"
import { MessageSquare, Send } from "lucide-react"

interface Message {
  id: string
  content: string
  timestamp: string
  author: {
    name: string
    type: "citizen" | "agency" | "admin"
    avatar?: string
  }
  isResponse: boolean
  attachments?: string[]
}

interface IssueChatProps {
  issueId: string
  initialMessages: Message[]
  onNewMessage: (message: Message) => void
  isAgency?: boolean
}

export function IssueChat({ issueId, initialMessages, onNewMessage, isAgency = false }: IssueChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content: newMessage,
      timestamp: new Date().toISOString(),
      author: {
        name: isAgency ? "Agency Representative" : "You",
        type: isAgency ? "agency" : "citizen",
      },
      isResponse: isAgency,
    }

    setMessages((prev) => [...prev, message])
    onNewMessage(message)
    setNewMessage("")

    toast({
      title: "Message sent",
      description: "Your message has been added to the conversation",
    })
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <CardContent className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.isResponse ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.author.avatar} alt={message.author.name} />
                <AvatarFallback>{message.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div
                className={`flex max-w-[80%] flex-col gap-1 rounded-lg p-3 ${
                  message.isResponse
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{message.author.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {message.author.type}
                  </Badge>
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(message.timestamp))}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="relative h-20 w-20 overflow-hidden rounded-md border"
                      >
                        <img
                          src={attachment}
                          alt={`Attachment ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[60px] flex-1"
          />
          <Button type="submit" size="icon" className="h-[60px] w-[60px]">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 
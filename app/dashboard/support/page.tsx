"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Phone, Mail, FileText, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Ticket = {
  id: number
  subject: string
  priority: string
  status: string
  created_at: string
  updated_at: string
}

type Message = {
  id: number
  message: string
  is_staff: boolean
  created_at: string
}

type TicketDetail = {
  ticket: Ticket
  messages: Message[]
}

export default function SupportPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [activeTab, setActiveTab] = useState("contact")

  // Fetch tickets when the component mounts or when the active tab changes to "tickets"
  useEffect(() => {
    if (activeTab === "tickets") {
      fetchTickets()
    }
  }, [activeTab])

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/support/tickets")
      if (!response.ok) {
        throw new Error("Failed to fetch tickets")
      }
      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
      toast({
        title: "Error",
        description: "Failed to load your support tickets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTicketDetail = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch ticket details")
      }
      const data = await response.json()
      setSelectedTicket(data)
    } catch (error) {
      console.error("Error fetching ticket details:", error)
      toast({
        title: "Error",
        description: "Failed to load ticket details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit support request")
      }

      setIsSubmitted(true)
      toast({
        title: "Success",
        description: "Your support request has been submitted successfully.",
      })

      // Reset form
      setFormData({
        subject: "",
        message: "",
        priority: "medium",
      })
    } catch (error) {
      console.error("Error submitting support request:", error)
      toast({
        title: "Error",
        description: "Failed to submit your support request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !replyMessage.trim()) return

    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket.ticket.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: replyMessage }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Refresh ticket details to show the new message
      await fetchTicketDetail(selectedTicket.ticket.id)
      setReplyMessage("")

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Open
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            In Progress
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Closed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">Get help with your account and services</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Phone className="h-5 w-5 mr-2 text-primary" />
                  Phone Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Available Monday to Friday, 9am to 5pm</p>
                <p className="font-medium">+1 (555) 123-4567</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">We'll respond within 24 hours</p>
                <p className="font-medium">support@orcsys.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Chat with our support team</p>
                <Button size="sm" className="mt-2">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <CardDescription>
                Fill out the form below and our team will get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Request Submitted</h3>
                  <p className="text-muted-foreground max-w-md">
                    Thank you for contacting us. Your support ticket has been created and we'll respond shortly.
                  </p>
                  <Button className="mt-6" onClick={() => setIsSubmitted(false)}>
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="low">Low - General question</option>
                      <option value="medium">Medium - Issue affecting work</option>
                      <option value="high">High - Critical issue</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please describe your issue in detail"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Attach Files
                    </Button>
                    <p className="text-xs text-muted-foreground">Max file size: 10MB (PDF, PNG, JPG)</p>
                  </div>
                </form>
              )}
            </CardContent>
            {!isSubmitted && (
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <p className="text-xs text-muted-foreground">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>
                <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">
                        <Clock className="h-4 w-4" />
                      </span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about our services and platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">How do I upload and process invoices?</h3>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the Invoices section in your dashboard, click on "Upload" and select your invoice files.
                    Our OCR system will automatically extract the relevant information.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">What file formats are supported for document upload?</h3>
                  <p className="text-sm text-muted-foreground">
                    We support PDF, JPG, JPEG, and PNG file formats for document uploads. For best results, ensure your
                    documents are clear and well-lit.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">How accurate is the OCR system?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our OCR system typically achieves 85-95% accuracy depending on document quality. You can always
                    review and edit the extracted information before finalizing.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">How do I manage multiple companies?</h3>
                  <p className="text-sm text-muted-foreground">
                    You can switch between companies using the company selector in the top navigation bar. To add a new
                    company, go to Settings and select "Add Company".
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Can I export my data?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can export your data in various formats including CSV, Excel, and PDF. Go to the Reports
                    section and use the export options available.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("contact")}>
                  Contact our support team
                </Button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          {selectedTicket ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => setSelectedTicket(null)}>
                    ← Back to tickets
                  </Button>
                  <div className="flex items-center gap-2">
                    <CardTitle>{selectedTicket.ticket.subject}</CardTitle>
                    {getStatusBadge(selectedTicket.ticket.status)}
                    {getPriorityBadge(selectedTicket.ticket.priority)}
                  </div>
                  <CardDescription>
                    Ticket #{selectedTicket.ticket.id} • Created {formatDate(selectedTicket.ticket.created_at)}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-[400px] overflow-y-auto p-1">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${message.is_staff ? "bg-primary/10 ml-8" : "bg-muted/50 mr-8"}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{message.is_staff ? "Support Agent" : "You"}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(message.created_at)}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                  ))}
                </div>

                {selectedTicket.ticket.status !== "closed" && (
                  <div className="pt-4 border-t">
                    <form onSubmit={handleReply} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="reply" className="text-sm font-medium">
                          Reply
                        </label>
                        <Textarea
                          id="reply"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your message here..."
                          rows={3}
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={!replyMessage.trim()}>
                          Send Message
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <CardDescription>Track and manage your support requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                    <p className="text-sm text-muted-foreground mb-4">You haven't submitted any support tickets yet.</p>
                    <Button onClick={() => setActiveTab("contact")}>Create Your First Ticket</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(ticket.status)}
                            <h3 className="font-medium">{ticket.subject}</h3>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Ticket #{ticket.id} • {formatDate(ticket.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          {getPriorityBadge(ticket.priority)}
                          <Button variant="ghost" size="sm" onClick={() => fetchTicketDetail(ticket.id)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button className="ml-auto" onClick={() => setActiveTab("contact")}>
                  Create New Ticket
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

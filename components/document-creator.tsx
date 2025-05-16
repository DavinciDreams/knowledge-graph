"use client"

import { useState } from "react"
import { FileText, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

type DocumentCreatorProps = {
  flowId?: string
}

type DocumentTemplate = {
  id: string
  name: string
  description: string
  content: string
  type: "blog" | "email" | "social" | "report" | "custom"
}

const templates: DocumentTemplate[] = [
  {
    id: "template-1",
    name: "Blog Post",
    description: "A standard blog post template with title, intro, and sections",
    content:
      "# [Title]\n\n## Introduction\n\n[Your introduction here]\n\n## Section 1\n\n[Content for section 1]\n\n## Section 2\n\n[Content for section 2]\n\n## Conclusion\n\n[Your conclusion here]",
    type: "blog",
  },
  {
    id: "template-2",
    name: "Email Newsletter",
    description: "A template for email newsletters",
    content: "Subject: [Your Subject Line]\n\nHello [Name],\n\n[Main content here]\n\nBest regards,\n[Your Name]",
    type: "email",
  },
  {
    id: "template-3",
    name: "Social Media Post",
    description: "A template for social media posts",
    content: "[Main message]\n\n#[hashtag1] #[hashtag2] #[hashtag3]",
    type: "social",
  },
  {
    id: "template-4",
    name: "Analysis Report",
    description: "A template for data analysis reports",
    content:
      "# [Report Title]\n\n## Executive Summary\n\n[Summary here]\n\n## Data Analysis\n\n[Analysis details]\n\n## Findings\n\n[Key findings]\n\n## Recommendations\n\n[Recommendations based on findings]",
    type: "report",
  },
]

export function DocumentCreator({ flowId }: DocumentCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentContent, setDocumentContent] = useState("")

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setDocumentContent(template.content)
    }
  }

  // Create document
  const createDocument = () => {
    if (!documentTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your document",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would save the document to a database
    toast({
      title: "Document created",
      description: `"${documentTitle}" has been created successfully`,
    })

    setIsOpen(false)
    setSelectedTemplate(null)
    setDocumentTitle("")
    setDocumentContent("")
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Create Document
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create Document</DialogTitle>
            <DialogDescription>Create a new document from a template or start from scratch</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-md p-4 cursor-pointer transition-colors ${
                    selectedTemplate === template.id ? "border-primary bg-primary/10" : "hover:border-primary/50"
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                </div>
              ))}
              <div
                className="border rounded-md p-4 cursor-pointer transition-colors hover:border-primary/50 flex flex-col items-center justify-center"
                onClick={() => {
                  setSelectedTemplate(null)
                  setDocumentContent("")
                }}
              >
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="font-medium">Custom</h4>
                <p className="text-xs text-muted-foreground mt-1 text-center">Start from scratch</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-title">Document Title</Label>
              <Input
                id="document-title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select defaultValue="custom">
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-content">Content</Label>
              <Textarea
                id="document-content"
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                placeholder="Enter document content"
                rows={10}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createDocument}>Create Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

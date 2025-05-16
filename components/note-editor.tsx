"use client"

import { useEffect, useState } from "react"
import { Save, Tag, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { type KnowledgeNode, weaviateService } from "@/lib/weaviate-service"

type NoteEditorProps = {
  node: KnowledgeNode
  onSave: (node: KnowledgeNode) => void
  onClose: () => void
}

export function NoteEditor({ node, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(node.title)
  const [content, setContent] = useState(node.content)
  const [tags, setTags] = useState<string[]>(node.tags)
  const [newTag, setNewTag] = useState("")

  // Update state when node changes
  useEffect(() => {
    setTitle(node.title)
    setContent(node.content)
    setTags(node.tags)
  }, [node])

  // Handle save
  const handleSave = () => {
    const updatedNode = weaviateService.updateNode(node.id, {
      title,
      content,
      tags,
    })

    if (updatedNode) {
      // Track this interaction for personalization
      weaviateService.trackNodeInteraction(node.id, "edit")

      onSave(updatedNode)
    }
  }

  // Add a tag
  const addTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) {
      setNewTag("")
      return
    }

    setTags([...tags, newTag.trim()])
    setNewTag("")
  }

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium border-none focus-visible:ring-0 px-0"
          placeholder="Untitled"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-full resize-none p-4 border-none focus-visible:ring-0"
          placeholder="Start writing..."
        />
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Tags</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <div key={tag} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
              <span className="text-xs">{tag}</span>
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => removeTag(tag)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            className="h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag()
              }
            }}
          />
          <Button variant="outline" size="sm" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

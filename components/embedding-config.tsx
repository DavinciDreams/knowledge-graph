"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EmbeddingConfig() {
  const [model, setModel] = useState("openai")
  const [dimension, setDimension] = useState(1536)
  const [apiKey, setApiKey] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="embedding-model">Embedding Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="embedding-model">
            <SelectValue placeholder="Select embedding model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI Embeddings</SelectItem>
            <SelectItem value="cohere">Cohere Embeddings</SelectItem>
            <SelectItem value="huggingface">HuggingFace Embeddings</SelectItem>
            <SelectItem value="local">Local Embeddings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="embedding-dimension">Embedding Dimension</Label>
        <Input
          id="embedding-dimension"
          type="number"
          value={dimension}
          onChange={(e) => setDimension(Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">The dimension of the embedding vectors</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
        />
        <p className="text-xs text-muted-foreground">Required for hosted embedding models</p>
      </div>

      <Button className="w-full">Save Configuration</Button>
    </div>
  )
}

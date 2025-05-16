"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function VectorDBConfig() {
  const [provider, setProvider] = useState("pinecone")
  const [indexName, setIndexName] = useState("")
  const [namespace, setNamespace] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [environment, setEnvironment] = useState("")
  const [useMetadata, setUseMetadata] = useState(true)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vector-db-provider">Vector Database</Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger id="vector-db-provider">
            <SelectValue placeholder="Select vector database" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pinecone">Pinecone</SelectItem>
            <SelectItem value="qdrant">Qdrant</SelectItem>
            <SelectItem value="weaviate">Weaviate</SelectItem>
            <SelectItem value="milvus">Milvus</SelectItem>
            <SelectItem value="chroma">ChromaDB</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="index-name">Index Name</Label>
        <Input
          id="index-name"
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
          placeholder="Enter index name"
        />
      </div>

      {provider === "pinecone" && (
        <div className="space-y-2">
          <Label htmlFor="environment">Environment</Label>
          <Input
            id="environment"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            placeholder="Enter environment (e.g., us-west1-gcp)"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="namespace">Namespace</Label>
        <Input
          id="namespace"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          placeholder="Enter namespace (optional)"
        />
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
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="use-metadata">Use Metadata Filtering</Label>
        <Switch id="use-metadata" checked={useMetadata} onCheckedChange={setUseMetadata} />
      </div>

      <Button className="w-full">Connect Database</Button>
    </div>
  )
}

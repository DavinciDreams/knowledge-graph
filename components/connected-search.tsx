"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type KnowledgeNode, type SearchResult, weaviateService } from "@/lib/weaviate-service"

type ConnectedSearchProps = {
  onNodeSelect: (node: KnowledgeNode) => void
  onClose: () => void
}

export function ConnectedSearch({ onNodeSelect, onClose }: ConnectedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSelectedResult(null)
      return
    }

    const results = weaviateService.searchNodes(searchQuery)
    setSearchResults(results)

    // Select the first result by default
    if (results.length > 0 && !selectedResult) {
      setSelectedResult(results[0])
    }
  }, [searchQuery])

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result)
  }

  // Handle node selection
  const handleNodeSelect = (node: KnowledgeNode) => {
    onNodeSelect(node)

    // Track this interaction for personalization
    weaviateService.trackNodeInteraction(node.id, "view")

    // Add search query to recent searches
    const preferences = weaviateService.getUserPreferences()
    const recentSearches = preferences.recentSearches || []
    weaviateService.updateUserPreferences({
      recentSearches: [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 10),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center flex-1 mr-4">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your knowledge base..."
              className="flex-1"
              autoFocus
            />
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Results list */}
          <div className="w-1/3 border-r">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h3 className="font-medium text-sm mb-2">Search Results</h3>

                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery.trim() ? "No results found" : "Enter a search query"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.node.id}
                        className={`p-3 rounded-md cursor-pointer ${
                          selectedResult?.node.id === result.node.id
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => handleResultSelect(result)}
                      >
                        <h4 className="font-medium text-sm">{result.node.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                          {result.node.content}
                        </p>
                        {result.node.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {result.node.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Connected view */}
          <div className="flex-1 flex flex-col">
            {selectedResult ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="font-medium">{selectedResult.node.title}</h2>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(selectedResult.node.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{selectedResult.node.type}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedResult.node.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => handleNodeSelect(selectedResult.node)}>Open</Button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-hidden">
                  <h3 className="font-medium text-sm mb-4">Connected Notes</h3>

                  {selectedResult.relatedNodes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No connected notes found</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedResult.relatedNodes.map(({ node, similarity }) => (
                        <div
                          key={node.id}
                          className="border rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => handleNodeSelect(node)}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{node.title}</h4>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                              {Math.round(similarity * 100)}% similar
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mt-1">{node.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a result to see connected notes
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

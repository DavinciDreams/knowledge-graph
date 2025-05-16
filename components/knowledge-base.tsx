"use client"

import { useEffect, useState } from "react"
import { BookOpen, FileText, FolderOpen, Grid, LayoutGrid, Menu, Network, Plus, Search, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConnectedSearch } from "@/components/connected-search"
import { FileExplorer } from "@/components/file-explorer"
import { ForceDirectedGraph } from "@/components/force-directed-graph"
import { InfiniteCanvas } from "@/components/infinite-canvas"
import { NoteEditor } from "@/components/note-editor"
import { type KnowledgeNode, type Workspace, weaviateService } from "@/lib/weaviate-service"

type ViewMode = "canvas" | "graph" | "list"

export function KnowledgeBase() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("canvas")

  // Initialize workspaces
  useEffect(() => {
    // Initialize with demo data if empty
    weaviateService.initializeWithDemoData()

    // Load workspaces
    const workspaces = weaviateService.getWorkspaces()
    setWorkspaces(workspaces)

    // Set current workspace to the first one
    if (workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0])
    }

    // Load user preferences
    const preferences = weaviateService.getUserPreferences()
    if (preferences.viewMode) {
      setViewMode(preferences.viewMode as ViewMode)
    }
  }, [])

  // Handle node selection
  const handleNodeSelect = (node: KnowledgeNode | null) => {
    setSelectedNode(node)

    if (node) {
      // Track this interaction for personalization
      weaviateService.trackNodeInteraction(node.id, "view")

      // Open editor for note type
      if (node.type === "note" || node.type === "document" || node.type === "code") {
        setIsEditorOpen(true)
      }
    }
  }

  // Handle node creation on canvas
  const handleNodeCreate = (position: { x: number; y: number }) => {
    if (!currentWorkspace) return

    // Create a new note at the specified position
    const newNode = weaviateService.createNode("note", "Untitled Note", "", currentWorkspace.rootFolderId, position, {
      width: 300,
      height: 200,
    })

    // Select the new node and open editor
    handleNodeSelect(newNode)
  }

  // Handle node save
  const handleNodeSave = (node: KnowledgeNode) => {
    setSelectedNode(node)
  }

  // Change view mode
  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode)

    // Save preference
    weaviateService.updateUserPreferences({ viewMode: mode })
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-64 border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="font-semibold">Knowledge Base</h1>
          </div>

          {currentWorkspace && (
            <FileExplorer
              workspaceId={currentWorkspace.id}
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNode?.id}
            />
          )}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top toolbar */}
        <div className="h-12 border-b flex items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="ml-4 flex items-center gap-2">
              <Button
                variant={viewMode === "canvas" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => changeViewMode("canvas")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Canvas
              </Button>
              <Button
                variant={viewMode === "graph" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => changeViewMode("graph")}
              >
                <Network className="h-4 w-4 mr-2" />
                Graph
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => changeViewMode("list")}
              >
                <FileText className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {/* Main view */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "canvas" && currentWorkspace && (
            <InfiniteCanvas
              workspaceId={currentWorkspace.id}
              onNodeSelect={handleNodeSelect}
              onNodeCreate={handleNodeCreate}
              selectedNodeId={selectedNode?.id}
            />
          )}

          {viewMode === "graph" && currentWorkspace && (
            <ForceDirectedGraph
              workspaceId={currentWorkspace.id}
              onNodeSelect={handleNodeSelect}
              width={window.innerWidth - (isSidebarOpen ? 64 : 0)}
              height={window.innerHeight - 48}
            />
          )}

          {viewMode === "list" && (
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">All Notes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weaviateService
                  .getNodes()
                  .filter((node) => node.type !== "folder")
                  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                  .map((node) => (
                    <div
                      key={node.id}
                      className="border rounded-md p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                      onClick={() => handleNodeSelect(node)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {node.type === "note" ? (
                          <FileText className="h-4 w-4 text-blue-500" />
                        ) : node.type === "document" ? (
                          <BookOpen className="h-4 w-4 text-green-500" />
                        ) : node.type === "folder" ? (
                          <FolderOpen className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Grid className="h-4 w-4 text-purple-500" />
                        )}
                        <h3 className="font-medium">{node.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{node.content}</p>
                      {node.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {node.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {node.tags.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                              +{node.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note editor */}
      {isEditorOpen && selectedNode && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden">
            <NoteEditor node={selectedNode} onSave={handleNodeSave} onClose={() => setIsEditorOpen(false)} />
          </div>
        </div>
      )}

      {/* Connected search */}
      {isSearchOpen && (
        <ConnectedSearch
          onNodeSelect={(node) => {
            handleNodeSelect(node)
            setIsSearchOpen(false)
          }}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </div>
  )
}

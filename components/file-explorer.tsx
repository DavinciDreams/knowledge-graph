"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type KnowledgeNode, type NodeType, type Workspace, weaviateService } from "@/lib/weaviate-service"

type FileExplorerProps = {
  workspaceId: string
  onNodeSelect: (node: KnowledgeNode) => void
  selectedNodeId?: string
}

type TreeNode = {
  id: string
  name: string
  type: NodeType
  children: TreeNode[]
  isExpanded: boolean
  parentId?: string
  node: KnowledgeNode
}

export function FileExplorer({ workspaceId, onNodeSelect, selectedNodeId }: FileExplorerProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [newItemParentId, setNewItemParentId] = useState<string | undefined>()
  const [newItemName, setNewItemName] = useState("")
  const [newItemType, setNewItemType] = useState<NodeType>("note")

  // Load workspace and build tree
  useEffect(() => {
    const workspace = weaviateService.getWorkspace(workspaceId)
    if (!workspace) return

    setWorkspace(workspace)
    buildFileTree(workspace.rootFolderId)
  }, [workspaceId])

  // Build file tree from nodes
  const buildFileTree = (rootId: string) => {
    const allNodes = weaviateService.getNodes()

    // Find the root folder
    const rootFolder = allNodes.find((node) => node.id === rootId)
    if (!rootFolder) return

    // Build tree recursively
    const buildTree = (folderId: string): TreeNode[] => {
      const children = allNodes.filter((node) => node.parentId === folderId)

      return children.map((child) => ({
        id: child.id,
        name: child.title,
        type: child.type,
        children: child.type === "folder" ? buildTree(child.id) : [],
        isExpanded: false,
        parentId: child.parentId,
        node: child,
      }))
    }

    const tree: TreeNode[] = [
      {
        id: rootFolder.id,
        name: rootFolder.title,
        type: "folder",
        children: buildTree(rootFolder.id),
        isExpanded: true,
        node: rootFolder,
      },
    ]

    setTreeData(tree)
  }

  // Toggle folder expansion
  const toggleFolder = (nodeId: string) => {
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded }
        }
        if (node.children.length > 0) {
          return { ...node, children: updateNode(node.children) }
        }
        return node
      })
    }

    setTreeData(updateNode(treeData))
  }

  // Handle node selection
  const handleNodeSelect = (node: TreeNode) => {
    onNodeSelect(node.node)
  }

  // Open new item dialog
  const handleNewItem = (parentId?: string) => {
    setNewItemParentId(parentId)
    setNewItemName("")
    setNewItemType("note")
    setShowNewItemDialog(true)
  }

  // Create new item
  const createNewItem = () => {
    if (!newItemName.trim()) return

    const newNode = weaviateService.createNode(newItemType, newItemName, "", newItemParentId)

    // Refresh the tree
    if (workspace) {
      buildFileTree(workspace.rootFolderId)
    }

    setShowNewItemDialog(false)

    // Select the new node
    onNodeSelect(newNode)
  }

  // Delete node
  const deleteNode = (nodeId: string) => {
    weaviateService.deleteNode(nodeId)

    // Refresh the tree
    if (workspace) {
      buildFileTree(workspace.rootFolderId)
    }

    // If the deleted node was selected, clear selection
    if (selectedNodeId === nodeId) {
      onNodeSelect(null as any)
    }
  }

  // Render tree node
  const renderTreeNode = (node: TreeNode, level = 0) => {
    const isFolder = node.type === "folder"
    const isSelected = selectedNodeId === node.id

    return (
      <div key={node.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`flex items-center py-1 px-2 rounded-md cursor-pointer ${
                isSelected ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => handleNodeSelect(node)}
            >
              {isFolder ? (
                <div
                  className="mr-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFolder(node.id)
                  }}
                >
                  {node.isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              ) : (
                <div className="w-5" />
              )}

              {isFolder ? (
                node.isExpanded ? (
                  <FolderOpen className="h-4 w-4 mr-2 text-gray-500" />
                ) : (
                  <Folder className="h-4 w-4 mr-2 text-gray-500" />
                )
              ) : (
                <File className="h-4 w-4 mr-2 text-gray-500" />
              )}

              <span className="text-sm truncate">{node.name}</span>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            {isFolder && <ContextMenuItem onClick={() => handleNewItem(node.id)}>New Item</ContextMenuItem>}
            <ContextMenuItem onClick={() => handleNodeSelect(node)}>Open</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-red-600 dark:text-red-400" onClick={() => deleteNode(node.id)}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isFolder && node.isExpanded && node.children.length > 0 && (
          <div>{node.children.map((child) => renderTreeNode(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm">Files</h3>
        <Button variant="ghost" size="icon" onClick={() => handleNewItem(workspace?.rootFolderId)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">{treeData.map((node) => renderTreeNode(node))}</div>

      {/* New Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>Add a new item to your knowledge base</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-type">Type</Label>
              <Select value={newItemType} onValueChange={(value) => setNewItemType(value as NodeType)}>
                <SelectTrigger id="item-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="folder">Folder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createNewItem}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

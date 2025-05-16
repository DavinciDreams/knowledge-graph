"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue } from "framer-motion"
import { ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type KnowledgeNode, weaviateService } from "@/lib/weaviate-service"

type InfiniteCanvasProps = {
  workspaceId: string
  onNodeSelect: (node: KnowledgeNode) => void
  onNodeCreate: (position: { x: number; y: number }) => void
  selectedNodeId?: string
  children?: React.ReactNode
}

export function InfiniteCanvas({
  workspaceId,
  onNodeSelect,
  onNodeCreate,
  selectedNodeId,
  children,
}: InfiniteCanvasProps) {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([])
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const canvasRef = useRef<HTMLDivElement>(null)

  // Load nodes for this workspace
  useEffect(() => {
    const workspace = weaviateService.getWorkspace(workspaceId)
    if (!workspace) return

    const allNodes = weaviateService.getNodes()
    // Get all nodes that are in this workspace (have the root folder or any of its subfolders as parent)
    const workspaceNodes = allNodes.filter((node) => {
      if (node.parentId === workspace.rootFolderId) return true

      // Check if any parent folder is in this workspace
      let currentNode = node
      while (currentNode.parentId) {
        const parent = allNodes.find((n) => n.id === currentNode.parentId)
        if (!parent) break
        if (parent.id === workspace.rootFolderId) return true
        currentNode = parent
      }

      return false
    })

    // Only get nodes that have a position (are placed on the canvas)
    const canvasNodes = workspaceNodes.filter((node) => node.position)
    setNodes(canvasNodes)
  }, [workspaceId])

  // Zoom in/out
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  // Handle canvas drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button

    setIsDragging(true)
    setStartPos({ x: e.clientX - x.get(), y: e.clientY - y.get() })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    x.set(e.clientX - startPos.x)
    y.set(e.clientY - startPos.y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle double click to create a new node
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    // Get canvas bounds
    const rect = canvasRef.current.getBoundingClientRect()

    // Calculate position relative to canvas, accounting for pan and zoom
    const canvasX = (e.clientX - rect.left - x.get()) / scale
    const canvasY = (e.clientY - rect.top - y.get()) / scale

    onNodeCreate({ x: canvasX, y: canvasY })
  }

  // Handle node selection
  const handleNodeClick = (node: KnowledgeNode, e: React.MouseEvent) => {
    e.stopPropagation()
    onNodeSelect(node)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Canvas controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <motion.div
          style={{
            x,
            y,
            scale,
          }}
          className="origin-center w-full h-full relative"
        >
          {/* Background grid */}
          <div className="absolute inset-0 bg-grid-pattern" />

          {/* Render nodes */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              className={`absolute p-4 rounded-md shadow-md cursor-pointer ${
                selectedNodeId === node.id ? "ring-2 ring-blue-500" : ""
              } ${
                node.type === "note"
                  ? "bg-white dark:bg-gray-800"
                  : node.type === "document"
                    ? "bg-blue-50 dark:bg-blue-900"
                    : node.type === "image"
                      ? "bg-green-50 dark:bg-green-900"
                      : node.type === "code"
                        ? "bg-purple-50 dark:bg-purple-900"
                        : "bg-gray-50 dark:bg-gray-800"
              }`}
              style={{
                left: node.position?.x,
                top: node.position?.y,
                width: node.size?.width || 200,
                height: node.size?.height || 150,
              }}
              onClick={(e) => handleNodeClick(node, e)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="font-medium text-sm mb-1 truncate">{node.title}</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{node.content}</div>
              {node.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {node.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {node.tags.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      +{node.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {/* Additional canvas content */}
          {children}
        </motion.div>
      </div>
    </div>
  )
}

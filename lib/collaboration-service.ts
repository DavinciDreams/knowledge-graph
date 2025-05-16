import { safeLocalStorage } from "./browser-utils"
import type { Edge, Node } from "reactflow"

// Collaboration user type
export type CollaborationUser = {
  id: string
  name: string
  color: string
  cursor?: { x: number; y: number }
  selection?: string[]
  lastActive: Date
}

// Collaboration message type
export type CollaborationMessage = {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
}

// Collaboration event type
export type CollaborationEvent = {
  type: "join" | "leave" | "update" | "chat"
  userId: string
  timestamp: Date
  data?: any
}

// Collaboration service for real-time collaboration
export class CollaborationService {
  private readonly USERS_STORAGE_KEY = "flowiseCollaborationUsers"
  private readonly MESSAGES_STORAGE_KEY = "flowiseCollaborationMessages"
  private currentFlowId: string | null = null
  private currentUserId: string | null = null
  private updateInterval: number | null = null
  private listeners: Set<(event: CollaborationEvent) => void> = new Set()

  // Subscribe to collaboration events
  public subscribe(listener: (event: CollaborationEvent) => void): () => void {
    this.listeners.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners of an event
  private notifyListeners(event: CollaborationEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error("Error in collaboration event listener:", error)
      }
    })
  }

  // Join a flow for collaboration
  public async joinFlow(flowId: string): Promise<string> {
    // In a real implementation, this would connect to a real-time service
    // For now, we'll simulate it with localStorage
    this.currentFlowId = flowId

    // Generate a random user ID and name
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    this.currentUserId = userId

    // Generate a random color
    const colors = [
      "#FF5733", // Red
      "#33FF57", // Green
      "#3357FF", // Blue
      "#FF33F5", // Pink
      "#F5FF33", // Yellow
      "#33FFF5", // Cyan
      "#FF8333", // Orange
      "#8333FF", // Purple
    ]
    const color = colors[Math.floor(Math.random() * colors.length)]

    // Add user to the collaboration
    const users = this.getUsers(flowId)
    const newUser: CollaborationUser = {
      id: userId,
      name: `User ${users.length + 1}`,
      color,
      lastActive: new Date(),
    }

    safeLocalStorage().setItem(
      this.USERS_STORAGE_KEY,
      JSON.stringify({
        ...JSON.parse(safeLocalStorage().getItem(this.USERS_STORAGE_KEY) || "{}"),
        [flowId]: [...users, newUser],
      }),
    )

    // Start sending updates
    this.startSendingUpdates()

    // Notify listeners of join event
    this.notifyListeners({
      type: "join",
      userId,
      timestamp: new Date(),
      data: { user: newUser },
    })

    return userId
  }

  // Leave the current flow
  public leaveFlow(): void {
    if (!this.currentFlowId || !this.currentUserId) return

    // Remove user from the collaboration
    const users = this.getUsers(this.currentFlowId)
    const updatedUsers = users.filter((u) => u.id !== this.currentUserId)

    safeLocalStorage().setItem(
      this.USERS_STORAGE_KEY,
      JSON.stringify({
        ...JSON.parse(safeLocalStorage().getItem(this.USERS_STORAGE_KEY) || "{}"),
        [this.currentFlowId]: updatedUsers,
      }),
    )

    // Notify listeners of leave event
    this.notifyListeners({
      type: "leave",
      userId: this.currentUserId,
      timestamp: new Date(),
    })

    // Stop sending updates
    this.stopSendingUpdates()

    this.currentFlowId = null
    this.currentUserId = null
  }

  // Update flow data
  public updateFlow(nodes: Node[], edges: Edge[]): void {
    // In a real implementation, this would send the updates to other users
    // For now, we'll just update the user's last active timestamp
    this.updateUserActivity()

    // Notify listeners of update event
    if (this.currentUserId) {
      this.notifyListeners({
        type: "update",
        userId: this.currentUserId,
        timestamp: new Date(),
        data: { nodes, edges },
      })
    }
  }

  // Update cursor position
  public updateCursor(x: number, y: number): void {
    if (!this.currentFlowId || !this.currentUserId) return

    const users = this.getUsers(this.currentFlowId)
    const userIndex = users.findIndex((u) => u.id === this.currentUserId)

    if (userIndex === -1) return

    users[userIndex].cursor = { x, y }
    users[userIndex].lastActive = new Date()

    safeLocalStorage().setItem(
      this.USERS_STORAGE_KEY,
      JSON.stringify({
        ...JSON.parse(safeLocalStorage().getItem(this.USERS_STORAGE_KEY) || "{}"),
        [this.currentFlowId]: users,
      }),
    )
  }

  // Update selection
  public updateSelection(selection: string[]): void {
    if (!this.currentFlowId || !this.currentUserId) return

    const users = this.getUsers(this.currentFlowId)
    const userIndex = users.findIndex((u) => u.id === this.currentUserId)

    if (userIndex === -1) return

    users[userIndex].selection = selection
    users[userIndex].lastActive = new Date()

    safeLocalStorage().setItem(
      this.USERS_STORAGE_KEY,
      JSON.stringify({
        ...JSON.parse(safeLocalStorage().getItem(this.USERS_STORAGE_KEY) || "{}"),
        [this.currentFlowId]: users,
      }),
    )
  }

  // Send a chat message
  public sendChatMessage(content: string): void {
    if (!this.currentFlowId || !this.currentUserId) return

    const users = this.getUsers(this.currentFlowId)
    const user = users.find((u) => u.id === this.currentUserId)

    if (!user) return

    const messages = this.getMessages(this.currentFlowId)
    const newMessage: CollaborationMessage = {
      id: `message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: this.currentUserId,
      userName: user.name,
      content,
      timestamp: new Date(),
    }

    safeLocalStorage().setItem(
      this.MESSAGES_STORAGE_KEY,
      JSON.stringify({
        ...JSON.parse(safeLocalStorage().getItem(this.MESSAGES_STORAGE_KEY) || "{}"),
        [this.currentFlowId]: [...messages, newMessage],
      }),
    )

    this.updateUserActivity()

    // Notify listeners of chat event
    this.notifyListeners({
      type: "chat",
      userId: this.currentUserId,
      timestamp: new Date(),
      data: { message: content },
    })
  }

  // Get all users in a flow
  public getUsers(flowId: string): CollaborationUser[] {
    const usersData = JSON.parse(safeLocalStorage().getItem(this.USERS_STORAGE_KEY) || "{}")
    const users = usersData[flowId] || []

    return users.map((user: any) => ({
      ...user,
      lastActive: new Date(user.lastActive),
    }))
  }

  // Get all messages in a flow
  public getMessages(flowId: string): CollaborationMessage[] {
    const messagesData = JSON.parse(safeLocalStorage().getItem(this.MESSAGES_STORAGE_KEY) || "{}")
    const messages = messagesData[flowId] || []

    return messages.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }))
  }

  // Get the current user
  public getCurrentUser(): CollaborationUser | null {
    if (!this.currentFlowId || !this.currentUserId) return null

    const users = this.getUsers(this.currentFlowId)
    return users.find((u) => u.id === this.currentUserId) || null
  }

  // Update user activity
  private updateUserActivity(): void {
    if (!this.currentFlowId || !this.currentUserId) return

    const users = this.getUsers(this.currentFlowId)
    const userIndex = users.findIndex((u) => u.id === this.currentUserId)

    if (userIndex === -1) return

    users[userIndex].lastActive = new Date()

    safeLocalStorage().setItem(
      this.USERS_STORAGE_KEY,
      JSON.stringify({
        ...JSON.parse(safeLocalStorage().getItem(this.USERS_STORAGE_KEY) || "{}"),
        [this.currentFlowId]: users,
      }),
    )
  }

  // Start sending periodic updates
  private startSendingUpdates(): void {
    this.updateInterval = window.setInterval(() => {
      this.updateUserActivity()
    }, 5000) as unknown as number
  }

  // Stop sending periodic updates
  private stopSendingUpdates(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
}

// Export a singleton instance
export const collaborationService = new CollaborationService()

"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { Slider } from "@/components/ui/slider"

import type React from "react"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  Filter,
  Flag,
  Hash,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ThumbsUp,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  socialMediaService,
  type DraftResponse,
  type SocialAccount,
  type SocialFilter,
  type SocialPlatform,
  type SocialPost,
  type SocialTopic,
} from "@/lib/social-media-service"

// Platform icons and colors
const platformConfig: Record<
  SocialPlatform,
  { icon: React.ReactNode; color: string; name: string; description: string }
> = {
  discord: {
    icon: <div className="bg-[#5865F2] text-white rounded p-1">D</div>,
    color: "#5865F2",
    name: "Discord",
    description: "Chat and community platform",
  },
  notion: {
    icon: <div className="bg-black text-white rounded p-1">N</div>,
    color: "#000000",
    name: "Notion",
    description: "Productivity and note-taking",
  },
  github: {
    icon: <div className="bg-[#24292e] text-white rounded p-1">G</div>,
    color: "#24292e",
    name: "GitHub",
    description: "Code hosting and collaboration",
  },
  twitter: {
    icon: <div className="bg-[#1DA1F2] text-white rounded p-1">T</div>,
    color: "#1DA1F2",
    name: "Twitter/X",
    description: "Microblogging platform",
  },
  youtube: {
    icon: <div className="bg-[#FF0000] text-white rounded p-1">Y</div>,
    color: "#FF0000",
    name: "YouTube",
    description: "Video sharing platform",
  },
  telegram: {
    icon: <div className="bg-[#0088cc] text-white rounded p-1">T</div>,
    color: "#0088cc",
    name: "Telegram",
    description: "Messaging app",
  },
  instagram: {
    icon: <div className="bg-[#E1306C] text-white rounded p-1">I</div>,
    color: "#E1306C",
    name: "Instagram",
    description: "Photo and video sharing",
  },
  twitch: {
    icon: <div className="bg-[#6441A4] text-white rounded p-1">T</div>,
    color: "#6441A4",
    name: "Twitch",
    description: "Live streaming platform",
  },
  whatsapp: {
    icon: <div className="bg-[#25D366] text-white rounded p-1">W</div>,
    color: "#25D366",
    name: "WhatsApp",
    description: "Messaging app",
  },
  facebook: {
    icon: <div className="bg-[#1877F2] text-white rounded p-1">F</div>,
    color: "#1877F2",
    name: "Facebook",
    description: "Social networking platform",
  },
  pinterest: {
    icon: <div className="bg-[#E60023] text-white rounded p-1">P</div>,
    color: "#E60023",
    name: "Pinterest",
    description: "Image sharing and discovery",
  },
}

export function SocialMediaDashboard() {
  const [activeTab, setActiveTab] = useState("feed")
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [filters, setFilters] = useState<SocialFilter[]>([])
  const [topics, setTopics] = useState<SocialTopic[]>([])
  const [drafts, setDrafts] = useState<DraftResponse[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | "all">("all")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [showAddFilter, setShowAddFilter] = useState(false)
  const [showAddTopic, setShowAddTopic] = useState(false)
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})

  // Load data on mount
  useEffect(() => {
    loadAccounts()
    loadPosts()
    loadFilters()
    loadTopics()
    loadDrafts()
  }, [])

  // Load accounts
  const loadAccounts = () => {
    const accounts = socialMediaService.getAccounts()
    setAccounts(accounts)

    // If no accounts, add some mock accounts
    if (accounts.length === 0) {
      addMockAccounts()
    }
  }

  // Add mock accounts
  const addMockAccounts = () => {
    // Make sure we only use platforms that are defined in platformConfig
    const platforms: SocialPlatform[] = ["twitter", "facebook", "instagram", "youtube", "discord", "github"]

    platforms.forEach((platform) => {
      // Check if the platform exists in platformConfig before accessing its properties
      if (platformConfig[platform]) {
        socialMediaService.addAccount({
          platform,
          name: `${platformConfig[platform].name} Account`,
          isConnected: true,
        })
      } else {
        console.warn(`Platform ${platform} not found in platformConfig`)
      }
    })

    loadAccounts()
  }

  // Load posts
  const loadPosts = () => {
    const posts = socialMediaService.getPosts()
    setPosts(posts)

    // If no posts, fetch some mock posts
    if (posts.length === 0) {
      fetchMockPosts()
    }
  }

  // Fetch mock posts
  const fetchMockPosts = async () => {
    setIsLoading(true)
    try {
      const accounts = socialMediaService.getAccounts()
      for (const account of accounts) {
        if (account.isConnected) {
          await socialMediaService.fetchPosts(account.platform, account.id)
        }
      }
      loadPosts()
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load filters
  const loadFilters = () => {
    const filters = socialMediaService.getFilters()
    setFilters(filters)

    // If no filters, add a default filter
    if (filters.length === 0) {
      socialMediaService.createFilter({
        name: "All Posts",
        platforms: [],
        keywords: [],
        authors: [],
        excludeKeywords: [],
        excludeAuthors: [],
        isActive: true,
      })
      loadFilters()
    }
  }

  // Load topics
  const loadTopics = () => {
    const topics = socialMediaService.getTopics()
    setTopics(topics)

    // If no topics, add some default topics
    if (topics.length === 0) {
      socialMediaService.createTopic({
        name: "AI and Machine Learning",
        keywords: ["artificial intelligence", "machine learning", "AI", "ML", "deep learning"],
        filters: [],
        isMonitoring: true,
        notifyOnMatch: true,
        autoGenerateDrafts: true,
      })
      socialMediaService.createTopic({
        name: "Web Development",
        keywords: ["web development", "javascript", "react", "nextjs", "frontend", "backend"],
        filters: [],
        isMonitoring: true,
        notifyOnMatch: true,
        autoGenerateDrafts: true,
      })
      loadTopics()
    }
  }

  // Load drafts
  const loadDrafts = () => {
    const drafts = socialMediaService.getDrafts()
    setDrafts(drafts)
  }

  // Toggle post expansion
  const togglePostExpansion = (postId: string) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  // Bookmark a post
  const bookmarkPost = (postId: string) => {
    socialMediaService.bookmarkPost(postId, true)
    loadPosts()
    toast({
      title: "Post bookmarked",
      description: "The post has been saved to your bookmarks",
    })
  }

  // Add post to topic
  const addPostToTopic = (postId: string, topicId: string) => {
    socialMediaService.addPostToTopic(postId, topicId)
    loadPosts()
    loadTopics()
    toast({
      title: "Post added to topic",
      description: "The post has been added to the selected topic",
    })
  }

  // Generate draft response
  const generateDraftResponse = (post: SocialPost, topicId: string) => {
    const topic = socialMediaService.getTopic(topicId)
    if (!topic) return

    socialMediaService.generateDraftResponse(post, topic)
    loadDrafts()
    toast({
      title: "Draft response generated",
      description: "A draft response has been created for this post",
    })
  }

  // Filter posts
  const getFilteredPosts = () => {
    let filteredPosts = [...posts]

    // Filter by platform
    if (selectedPlatform !== "all") {
      filteredPosts = filteredPosts.filter((post) => post.platform === selectedPlatform)
    }

    // Apply selected filter
    if (selectedFilter) {
      const filter = filters.find((f) => f.id === selectedFilter)
      if (filter) {
        filteredPosts = socialMediaService.applyFilter(filter, filteredPosts)
      }
    }

    // Filter by topic
    if (selectedTopic) {
      filteredPosts = filteredPosts.filter((post) => post.topics.includes(selectedTopic))
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredPosts = filteredPosts.filter(
        (post) => post.content.toLowerCase().includes(query) || post.author.name.toLowerCase().includes(query),
      )
    }

    // Sort by date (newest first)
    filteredPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return filteredPosts
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  // Add new account
  const handleAddAccount = (platform: SocialPlatform, name: string) => {
    socialMediaService.addAccount({
      platform,
      name,
      isConnected: true,
    })
    loadAccounts()
    setShowAddAccount(false)
    toast({
      title: "Account added",
      description: `${name} has been added to your accounts`,
    })
  }

  // Add new filter
  const handleAddFilter = (name: string, platforms: SocialPlatform[], keywords: string[]) => {
    socialMediaService.createFilter({
      name,
      platforms,
      keywords,
      authors: [],
      excludeKeywords: [],
      excludeAuthors: [],
      isActive: true,
    })
    loadFilters()
    setShowAddFilter(false)
    toast({
      title: "Filter created",
      description: `${name} filter has been created`,
    })
  }

  // Add new topic
  const handleAddTopic = (name: string, keywords: string[]) => {
    socialMediaService.createTopic({
      name,
      keywords,
      filters: [],
      isMonitoring: true,
      notifyOnMatch: true,
      autoGenerateDrafts: true,
    })
    loadTopics()
    setShowAddTopic(false)
    toast({
      title: "Topic created",
      description: `${name} topic has been created`,
    })
  }

  // Update draft status
  const updateDraftStatus = (draftId: string, status: "approved" | "rejected" | "published") => {
    socialMediaService.updateDraft(draftId, { status })
    loadDrafts()
    toast({
      title: `Draft ${status}`,
      description: `The draft has been ${status}`,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">Social Media Dashboard</h2>
        <p className="text-sm text-muted-foreground">Monitor and manage your social media streams in one place</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <div className="container mx-auto">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="feed" className="h-full flex flex-col">
            <div className="container mx-auto p-4 flex gap-4">
              <div className="w-64 flex flex-col gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Platforms</h3>
                  <div className="space-y-1">
                    <Button
                      variant={selectedPlatform === "all" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedPlatform("all")}
                    >
                      All Platforms
                    </Button>
                    {Object.entries(platformConfig).map(([platform, config]) => {
                      const platformKey = platform as SocialPlatform
                      const hasAccount = accounts.some((a) => a.platform === platformKey && a.isConnected)
                      if (!hasAccount) return null
                      return (
                        <Button
                          key={platform}
                          variant={selectedPlatform === platformKey ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedPlatform(platformKey)}
                        >
                          <div className="mr-2">{config.icon}</div>
                          {config.name}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Filters</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowAddFilter(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <Button
                      variant={selectedFilter === null ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedFilter(null)}
                    >
                      No Filter
                    </Button>
                    {filters.map((filter) => (
                      <Button
                        key={filter.id}
                        variant={selectedFilter === filter.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedFilter(filter.id)}
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        {filter.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Topics</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowAddTopic(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <Button
                      variant={selectedTopic === null ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedTopic(null)}
                    >
                      All Topics
                    </Button>
                    {topics.map((topic) => (
                      <Button
                        key={topic.id}
                        variant={selectedTopic === topic.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedTopic(topic.id)}
                      >
                        <Hash className="mr-2 h-4 w-4" />
                        {topic.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 border rounded-md">
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchMockPosts}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-4 space-y-4">
                    {getFilteredPosts().length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>No posts found</p>
                        <p className="text-sm">Try adjusting your filters or search query</p>
                      </div>
                    ) : (
                      getFilteredPosts().map((post) => (
                        <div key={post.id} className="border rounded-md p-4">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <div>{platformConfig[post.platform].icon}</div>
                              <div>
                                <div className="font-medium">{post.author.name}</div>
                                <div className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => togglePostExpansion(post.id)}
                              >
                                {expandedPosts[post.id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className={expandedPosts[post.id] ? "" : "line-clamp-3"}>{post.content}</p>
                          </div>

                          {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="mt-2">
                              <img
                                src={post.mediaUrls[0] || "/placeholder.svg"}
                                alt="Post media"
                                className="rounded-md max-h-48 object-cover"
                              />
                            </div>
                          )}

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{post.likes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{post.comments || 0}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Flag className="mr-2 h-4 w-4" />
                                    Add to Topic
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add to Topic</DialogTitle>
                                    <DialogDescription>Select a topic to add this post to</DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <div className="space-y-2">
                                      {topics.map((topic) => (
                                        <div
                                          key={topic.id}
                                          className="flex items-center justify-between p-2 border rounded-md"
                                        >
                                          <div>
                                            <div className="font-medium">{topic.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {topic.keywords.join(", ")}
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button size="sm" onClick={() => addPostToTopic(post.id, topic.id)}>
                                              Add
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => generateDraftResponse(post, topic.id)}
                                            >
                                              Generate Draft
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => bookmarkPost(post.id)}
                                disabled={post.isBookmarked}
                              >
                                <BookmarkPlus className="mr-2 h-4 w-4" />
                                {post.isBookmarked ? "Bookmarked" : "Bookmark"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="h-full">
            <div className="container mx-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Topics</h3>
                <Button onClick={() => setShowAddTopic(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Topic
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map((topic) => (
                  <div key={topic.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{topic.name}</h4>
                        <p className="text-sm text-muted-foreground">{topic.description || "No description"}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium">Keywords</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {topic.keywords.map((keyword, index) => (
                          <div key={index} className="bg-muted text-xs px-2 py-1 rounded-full">
                            {keyword}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">{topic.posts.length}</span> posts
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor={`monitor-${topic.id}`} className="text-xs">
                            Monitor
                          </Label>
                          <Switch
                            id={`monitor-${topic.id}`}
                            checked={topic.isMonitoring}
                            onCheckedChange={(checked) => {
                              socialMediaService.updateTopic(topic.id, {
                                isMonitoring: checked,
                              })
                              loadTopics()
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Label htmlFor={`drafts-${topic.id}`} className="text-xs">
                            Auto Drafts
                          </Label>
                          <Switch
                            id={`drafts-${topic.id}`}
                            checked={topic.autoGenerateDrafts}
                            onCheckedChange={(checked) => {
                              socialMediaService.updateTopic(topic.id, {
                                autoGenerateDrafts: checked,
                              })
                              loadTopics()
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setSelectedTopic(topic.id)}>
                        View Posts
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="drafts" className="h-full">
            <div className="container mx-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Draft Responses</h3>
                <Select
                  value={selectedTopic || "all"}
                  onValueChange={(value) => setSelectedTopic(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {drafts
                  .filter((draft) => !selectedTopic || draft.topicId === selectedTopic)
                  .map((draft) => {
                    const topic = topics.find((t) => t.id === draft.topicId)
                    return (
                      <div key={draft.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <div>{platformConfig[draft.platform].icon}</div>
                              <div className="font-medium">{topic ? topic.name : "Unknown Topic"}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{formatDate(draft.createdAt)}</div>
                          </div>
                          <div
                            className={`px-2 py-1 text-xs rounded-full ${
                              draft.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : draft.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : draft.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
                          </div>
                        </div>

                        <div className="mt-4">
                          <Textarea
                            value={draft.content}
                            onChange={(e) => {
                              socialMediaService.updateDraft(draft.id, {
                                content: e.target.value,
                              })
                              loadDrafts()
                            }}
                            className="min-h-[100px]"
                            disabled={draft.status !== "draft"}
                          />
                        </div>

                        {draft.status === "draft" && (
                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => updateDraftStatus(draft.id, "rejected")}>
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => updateDraftStatus(draft.id, "approved")}>
                              Approve
                            </Button>
                          </div>
                        )}

                        {draft.status === "approved" && (
                          <div className="mt-4 flex justify-end gap-2">
                            <Button size="sm" onClick={() => updateDraftStatus(draft.id, "published")}>
                              Publish
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}

                {drafts.filter((draft) => !selectedTopic || draft.topicId === selectedTopic).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No drafts found</p>
                    <p className="text-sm">Create topics and enable auto-drafts to generate responses</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="h-full">
            <div className="container mx-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Connected Accounts</h3>
                <Button onClick={() => setShowAddAccount(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <div key={account.id} className="border rounded-md p-4">
                    <div className="flex items-center gap-3">
                      <div>{platformConfig[account.platform].icon}</div>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-xs text-muted-foreground">{platformConfig[account.platform].name}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          account.isConnected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {account.isConnected ? "Connected" : "Disconnected"}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          socialMediaService.removeAccount(account.id)
                          loadAccounts()
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="h-full">
            <div className="container mx-auto p-4">
              <h3 className="text-lg font-medium mb-4">Settings</h3>

              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Notification Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-new-posts">Notify on new posts</Label>
                      <Switch id="notify-new-posts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-topic-matches">Notify on topic matches</Label>
                      <Switch id="notify-topic-matches" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-drafts">Notify on new draft responses</Label>
                      <Switch id="notify-drafts" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Data Management</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="data-retention">Data retention period</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="data-retention" className="mt-1">
                          <SelectValue placeholder="Select retention period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-2">
                      <Button variant="destructive" size="sm">
                        Clear All Data
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">AI Response Settings</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="response-model">AI Model</Label>
                      <Select defaultValue="gpt-4">
                        <SelectTrigger id="response-model" className="mt-1">
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                          <SelectItem value="claude">Claude</SelectItem>
                          <SelectItem value="llama">Llama 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="response-temperature">Response Creativity</Label>
                      <Slider defaultValue={[0.7]} max={1} step={0.1} className="mt-2" />
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>Precise</span>
                        <span>Balanced</span>
                        <span>Creative</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Add Account Dialog */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Social Media Account</DialogTitle>
            <DialogDescription>Connect a new social media account to monitor</DialogDescription>
          </DialogHeader>

          <AddAccountForm
            onSubmit={(platform, name) => handleAddAccount(platform, name)}
            onCancel={() => setShowAddAccount(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Filter Dialog */}
      <Dialog open={showAddFilter} onOpenChange={setShowAddFilter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Filter</DialogTitle>
            <DialogDescription>Create a new filter to organize your social media feed</DialogDescription>
          </DialogHeader>

          <AddFilterForm
            onSubmit={(name, platforms, keywords) => handleAddFilter(name, platforms, keywords)}
            onCancel={() => setShowAddFilter(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Topic Dialog */}
      <Dialog open={showAddTopic} onOpenChange={setShowAddTopic}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Topic</DialogTitle>
            <DialogDescription>Create a new topic to monitor specific content</DialogDescription>
          </DialogHeader>

          <AddTopicForm
            onSubmit={(name, keywords) => handleAddTopic(name, keywords)}
            onCancel={() => setShowAddTopic(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Add Account Form
function AddAccountForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (platform: SocialPlatform, name: string) => void
  onCancel: () => void
}) {
  const [platform, setPlatform] = useState<SocialPlatform>("twitter")
  const [name, setName] = useState("")

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="platform">Platform</Label>
        <Select value={platform} onValueChange={(value) => setPlatform(value as SocialPlatform)}>
          <SelectTrigger id="platform">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Social Networks</SelectLabel>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Media Platforms</SelectLabel>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="twitch">Twitch</SelectItem>
              <SelectItem value="pinterest">Pinterest</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Messaging</SelectLabel>
              <SelectItem value="discord">Discord</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Other</SelectLabel>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="notion">Notion</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-name">Account Name</Label>
        <Input
          id="account-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter account name"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(platform, name)} disabled={!name.trim()}>
          Add Account
        </Button>
      </DialogFooter>
    </div>
  )
}

// Add Filter Form
function AddFilterForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, platforms: SocialPlatform[], keywords: string[]) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([])
  const [keywordsText, setKeywordsText] = useState("")

  const handleSubmit = () => {
    const keywords = keywordsText
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k)
    onSubmit(name, platforms, keywords)
  }

  const togglePlatform = (platform: SocialPlatform) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter((p) => p !== platform))
    } else {
      setPlatforms([...platforms, platform])
    }
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="filter-name">Filter Name</Label>
        <Input
          id="filter-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter filter name"
        />
      </div>

      <div className="space-y-2">
        <Label>Platforms</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(platformConfig).map(([platform, config]) => (
            <div key={platform} className="flex items-center space-x-2">
              <Switch
                id={`platform-${platform}`}
                checked={platforms.includes(platform as SocialPlatform)}
                onCheckedChange={() => togglePlatform(platform as SocialPlatform)}
              />
              <Label htmlFor={`platform-${platform}`} className="flex items-center gap-1">
                {config.icon}
                <span>{config.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords">Keywords (comma separated)</Label>
        <Textarea
          id="keywords"
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          placeholder="Enter keywords separated by commas"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          Create Filter
        </Button>
      </DialogFooter>
    </div>
  )
}

// Add Topic Form
function AddTopicForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, keywords: string[]) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [keywordsText, setKeywordsText] = useState("")

  const handleSubmit = () => {
    const keywords = keywordsText
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k)
    onSubmit(name, keywords)
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="topic-name">Topic Name</Label>
        <Input id="topic-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter topic name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic-description">Description (optional)</Label>
        <Textarea
          id="topic-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter topic description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic-keywords">Keywords (comma separated)</Label>
        <Textarea
          id="topic-keywords"
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          placeholder="Enter keywords separated by commas"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim() || !keywordsText.trim()}>
          Create Topic
        </Button>
      </DialogFooter>
    </div>
  )
}

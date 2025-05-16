"use client"

import dynamic from "next/dynamic"

// Dynamically import the KnowledgeBase component with SSR disabled
const KnowledgeBase = dynamic(() => import("@/components/knowledge-base").then((mod) => mod.KnowledgeBase), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="h-screen">
      <KnowledgeBase />
    </main>
  )
}

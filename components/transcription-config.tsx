"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function TranscriptionConfig() {
  const [model, setModel] = useState("whisper")
  const [language, setLanguage] = useState("en")
  const [enableDiarization, setEnableDiarization] = useState(false)
  const [enablePunctuation, setEnablePunctuation] = useState(true)
  const [apiKey, setApiKey] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="transcription-model">Transcription Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="transcription-model">
            <SelectValue placeholder="Select transcription model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="whisper">OpenAI Whisper</SelectItem>
            <SelectItem value="google">Google Speech-to-Text</SelectItem>
            <SelectItem value="azure">Azure Speech Services</SelectItem>
            <SelectItem value="assembly">AssemblyAI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger id="language">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="it">Italian</SelectItem>
            <SelectItem value="ja">Japanese</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
            <SelectItem value="auto">Auto-detect</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="diarization">Speaker Diarization</Label>
          <Switch id="diarization" checked={enableDiarization} onCheckedChange={setEnableDiarization} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="punctuation">Add Punctuation</Label>
          <Switch id="punctuation" checked={enablePunctuation} onCheckedChange={setEnablePunctuation} />
        </div>
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

      <Button className="w-full">Save Configuration</Button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"

export function TextToSpeechPlayer() {
  const [text, setText] = useState("Hello, this is a text-to-speech demo.")
  const [voice, setVoice] = useState("en-US-Neural2-F")
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [progress, setProgress] = useState(0)

  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)

    if (!isPlaying) {
      // Simulate playback progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 100)

      // Store the interval ID in a data attribute
      document.documentElement.setAttribute("data-tts-interval", String(interval))
    } else {
      // Stop playback simulation
      const intervalId = document.documentElement.getAttribute("data-tts-interval")
      if (intervalId) {
        clearInterval(Number(intervalId))
        document.documentElement.removeAttribute("data-tts-interval")
      }
    }
  }

  // Reset playback
  const resetPlayback = () => {
    setProgress(0)
    setIsPlaying(false)

    // Stop playback simulation
    const intervalId = document.documentElement.getAttribute("data-tts-interval")
    if (intervalId) {
      clearInterval(Number(intervalId))
      document.documentElement.removeAttribute("data-tts-interval")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tts-text">Text to Speak</Label>
        <Textarea
          id="tts-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tts-voice">Voice</Label>
        <Select value={voice} onValueChange={setVoice}>
          <SelectTrigger id="tts-voice">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US-Neural2-F">English (US) - Female</SelectItem>
            <SelectItem value="en-US-Neural2-M">English (US) - Male</SelectItem>
            <SelectItem value="en-GB-Neural2-F">English (UK) - Female</SelectItem>
            <SelectItem value="en-GB-Neural2-M">English (UK) - Male</SelectItem>
            <SelectItem value="fr-FR-Neural2-F">French - Female</SelectItem>
            <SelectItem value="de-DE-Neural2-F">German - Female</SelectItem>
            <SelectItem value="es-ES-Neural2-F">Spanish - Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Volume</Label>
        <div className="flex items-center gap-4">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            min={0}
            max={100}
            step={10}
            onValueChange={(value) => setVolume(value[0])}
            className="flex-1"
          />
          <span className="w-8 text-center text-sm">{volume}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>0:00</span>
          <span>0:{Math.floor(text.length / 20)}</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={resetPlayback}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button onClick={togglePlayback}>
          {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button variant="outline" size="icon" disabled>
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

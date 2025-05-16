"use client"

import { useEffect, useState } from "react"
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { type TTSVoice, ttsService } from "@/lib/tts-service"

export function TextToSpeechService() {
  const [text, setText] = useState("Hello, this is a text-to-speech demo using Microsoft Edge TTS.")
  const [voice, setVoice] = useState("en-US-AriaNeural")
  const [voices, setVoices] = useState<TTSVoice[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [rate, setRate] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [progress, setProgress] = useState(0)
  const [progressInterval, setProgressInterval] = useState<number | null>(null)

  // Load voices on mount
  useEffect(() => {
    setVoices(ttsService.getVoices())
  }, [])

  // Toggle play/pause
  const togglePlayback = async () => {
    if (isPlaying) {
      ttsService.stop()
      setIsPlaying(false)
      if (progressInterval) {
        clearInterval(progressInterval)
        setProgressInterval(null)
      }
      setProgress(0)
    } else {
      setIsPlaying(true)

      // Start progress simulation
      const interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 100) as unknown as number

      setProgressInterval(interval)

      // Speak the text
      await ttsService.speak(text, {
        voice,
        volume: volume / 100,
        rate,
        pitch,
      })

      // Clean up when speech is done
      clearInterval(interval)
      setProgressInterval(null)
      setIsPlaying(false)
      setProgress(0)
    }
  }

  // Reset playback
  const resetPlayback = () => {
    ttsService.stop()
    setIsPlaying(false)
    if (progressInterval) {
      clearInterval(progressInterval)
      setProgressInterval(null)
    }
    setProgress(0)
  }

  // Calculate estimated duration based on text length and rate
  const estimatedDuration = Math.max(1, Math.ceil(text.length / (20 * rate)))

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
            {voices.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name} ({v.locale}) - {v.gender}
              </SelectItem>
            ))}
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
        <Label>Speech Rate</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[rate]}
            min={0.5}
            max={2.0}
            step={0.1}
            onValueChange={(value) => setRate(value[0])}
            className="flex-1"
          />
          <span className="w-12 text-center text-sm">{rate.toFixed(1)}x</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Pitch</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[pitch]}
            min={0.5}
            max={2.0}
            step={0.1}
            onValueChange={(value) => setPitch(value[0])}
            className="flex-1"
          />
          <span className="w-12 text-center text-sm">{pitch.toFixed(1)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>0:00</span>
          <span>0:{estimatedDuration.toString().padStart(2, "0")}</span>
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

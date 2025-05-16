"use client"

import { useState } from "react"
import { Handle, Position } from "reactflow"
import { SpeakerIcon as SpeakerWave, Play, Pause } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ttsService } from "@/lib/tts-service"

export function TextToSpeechNode({ data }: { data: { label: string; text?: string } }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [voice, setVoice] = useState("en-US-AriaNeural")
  const [rate, setRate] = useState(1.0)
  const [volume, setVolume] = useState(1.0)

  const handlePlay = async () => {
    if (isPlaying) {
      ttsService.stop()
      setIsPlaying(false)
      return
    }

    setIsPlaying(true)
    const text = data.text || "This is a text to speech node. Connect it to a text source to speak that text."

    try {
      await ttsService.speak(text, {
        voice,
        rate,
        volume,
      })
    } catch (error) {
      console.error("Error playing speech:", error)
    } finally {
      setIsPlaying(false)
    }
  }

  return (
    <div className="bg-white border rounded-md shadow-sm p-3 min-w-[200px]">
      <div className="flex items-center gap-2">
        <SpeakerWave className="h-5 w-5 text-primary" />
        <div className="font-medium">{data.label}</div>
      </div>

      <div className="text-xs text-muted-foreground mt-1">Convert text to speech</div>

      <div className="mt-3 space-y-2">
        <Select value={voice} onValueChange={setVoice}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US-AriaNeural">Aria (US)</SelectItem>
            <SelectItem value="en-US-GuyNeural">Guy (US)</SelectItem>
            <SelectItem value="en-GB-SoniaNeural">Sonia (UK)</SelectItem>
            <SelectItem value="fr-FR-DeniseNeural">Denise (FR)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-xs">Rate:</span>
          <Slider
            value={[rate]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={(val) => setRate(val[0])}
            className="flex-1"
          />
          <span className="text-xs w-8">{rate.toFixed(1)}x</span>
        </div>

        <div className="flex justify-center mt-2">
          <Button size="sm" onClick={handlePlay}>
            {isPlaying ? <Pause className="mr-2 h-3 w-3" /> : <Play className="mr-2 h-3 w-3" />}
            {isPlaying ? "Stop" : "Play"}
          </Button>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}

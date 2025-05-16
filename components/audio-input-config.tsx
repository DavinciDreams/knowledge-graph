"use client"

import { useState } from "react"
import { Mic, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export function AudioInputConfig() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [autoGainControl, setAutoGainControl] = useState(true)
  const [noiseSuppression, setNoiseSuppression] = useState(true)
  const [echoCancellation, setEchoCancellation] = useState(true)

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Start recording simulation
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100)
      }, 100)

      // Store the interval ID in a data attribute
      document.documentElement.setAttribute("data-recording-interval", String(interval))
    } else {
      // Stop recording simulation
      const intervalId = document.documentElement.getAttribute("data-recording-interval")
      if (intervalId) {
        clearInterval(Number(intervalId))
        document.documentElement.removeAttribute("data-recording-interval")
      }
      setAudioLevel(0)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Audio Input</Label>
        <div className="flex items-center justify-between">
          <Button variant={isRecording ? "destructive" : "default"} onClick={toggleRecording} className="w-full">
            {isRecording ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Audio Level</Label>
        <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-150" style={{ width: `${audioLevel}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-gain">Auto Gain Control</Label>
          <Switch id="auto-gain" checked={autoGainControl} onCheckedChange={setAutoGainControl} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="noise-suppression">Noise Suppression</Label>
          <Switch id="noise-suppression" checked={noiseSuppression} onCheckedChange={setNoiseSuppression} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="echo-cancellation">Echo Cancellation</Label>
          <Switch id="echo-cancellation" checked={echoCancellation} onCheckedChange={setEchoCancellation} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Microphone Sensitivity</Label>
        <Slider defaultValue={[75]} max={100} step={1} />
      </div>
    </div>
  )
}

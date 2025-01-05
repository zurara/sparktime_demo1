import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Check, RotateCcw, Play, RefreshCw } from 'lucide-react'
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'

export type Task = {
  id: number
  title: string
  description: string
  steps: string[]
  isArchived: boolean
  isCompleted?: boolean
}

interface TaskCardProps {
  task: Task
  onReturn?: () => void
  onComplete?: () => void
  onRegenerate?: () => void
}

export function TaskCard({ task, onReturn, onComplete, onRegenerate }: TaskCardProps) {
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      // 触发彩带动画
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
    return () => clearTimeout(timer)
  }, [isCountingDown, countdown])

  const handleStart = () => {
    setIsCountingDown(true)
  }

  return (
    <Card className={cn(
      "w-full max-w-md mx-auto bg-japanese-beige/50 border-japanese-brown/20",
      task.isCompleted && "opacity-75",
      task.isArchived && "opacity-60"
    )}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-japanese font-medium text-japanese-navy text-lg">
            {task.title}
          </h3>
          {isCountingDown && (
            <span className="text-2xl font-bold text-japanese-red">
              {countdown}
            </span>
          )}
        </div>
        
        <p className="text-japanese-brown/80">{task.description}</p>
        
        <div className="space-y-3">
          <h4 className="font-japanese font-medium text-japanese-navy">实施步骤：</h4>
          <ul className="list-none space-y-2">
            {task.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-japanese-green/10 flex items-center justify-center text-sm text-japanese-green">
                  {index + 1}
                </span>
                <span className="text-japanese-brown">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="gap-2">
        {!isCountingDown && !task.isCompleted && !task.isArchived && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStart}
              className="border-japanese-green text-japanese-green hover:bg-japanese-green/10"
            >
              <Play className="mr-2 h-4 w-4" />
              开始
            </Button>
            {onRegenerate && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRegenerate}
                className="border-japanese-navy text-japanese-navy hover:bg-japanese-navy/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重新生成
              </Button>
            )}
          </>
        )}
        {onReturn && (
          <Button variant="outline" size="sm" onClick={onReturn}>
            <RotateCcw className="mr-2 h-4 w-4" />
            放回签筒
          </Button>
        )}
        {!task.isArchived && onComplete && (
          <Button variant="outline" size="sm" onClick={onComplete}>
            <Check className="mr-2 h-4 w-4" />
            完成
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 
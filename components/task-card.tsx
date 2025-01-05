import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Check, RotateCcw, Archive } from 'lucide-react'

export type Task = {
  id: number
  title: string
  description: string
  steps: string[]
  isArchived: boolean
}

interface TaskCardProps {
  task: Task
  onReturn?: () => void
  onComplete?: () => void
  onArchive?: () => void
}

export function TaskCard({ task, onReturn, onComplete, onArchive }: TaskCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6 space-y-4">
        <h3 className="font-semibold text-lg">{task.title}</h3>
        <p className="text-muted-foreground">{task.description}</p>
        <div className="space-y-2">
          <h4 className="font-medium">实现步骤：</h4>
          <ul className="list-decimal pl-4 space-y-1">
            {task.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={onReturn}>
          <RotateCcw className="mr-2 h-4 w-4" />
          放回签筒
        </Button>
        <Button variant="outline" size="sm" onClick={onComplete}>
          <Check className="mr-2 h-4 w-4" />
          完成任务
        </Button>
        <Button variant="outline" size="sm" onClick={onArchive}>
          <Archive className="mr-2 h-4 w-4" />
          归档
        </Button>
      </CardFooter>
    </Card>
  )
} 
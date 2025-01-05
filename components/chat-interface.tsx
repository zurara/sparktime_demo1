'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Dices, Archive } from 'lucide-react'
import { TaskCard, Task } from "./task-card"

const API_CONFIG = {
  baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
  model: 'Qwen/Qwen2.5-7B-Instruct',
  apiKey: process.env.NEXT_PUBLIC_SILICON_API_KEY || '',
}

const ChatInterface = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  
  // 添加新任务
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      const response = await fetch(API_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [
            {
              role: 'user',
              content: `请将以下任务分解成具体的第一步，并提供完整的实施步骤指南。任务：${inputValue}
              
              请按以下格式返回：
              {
                "title": "第一步具体任务",
                "description": "任务描述",
                "steps": ["步骤1", "步骤2", "步骤3"]
              }`
            }
          ]
        })
      })

      const data = await response.json()
      const taskData = JSON.parse(data.choices[0].message.content)
      
      const newTask: Task = {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description,
        steps: taskData.steps,
        isArchived: false
      }
      
      setTasks(prev => [...prev, newTask])
      setInputValue("")
    } catch (error) {
      console.error('创建任务失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 随机抽取任务
  const handleDrawTask = () => {
    const availableTasks = tasks.filter(task => !task.isArchived)
    if (availableTasks.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * availableTasks.length)
    setCurrentTask(availableTasks[randomIndex])
  }

  // 处理任务相关操作
  const handleReturnTask = () => setCurrentTask(null)
  
  const handleCompleteTask = () => {
    if (!currentTask) return
    setTasks(prev => prev.map(task => 
      task.id === currentTask.id ? { ...task, isCompleted: true, isArchived: true } : task
    ))
    setCurrentTask(null)
  }

  // Add these computed values
  const activeTasks = tasks.filter(task => !task.isArchived)
  const archivedTasks = tasks.filter(task => task.isArchived)

  // Add regenerateTask function inside ChatInterface component
  const regenerateTask = async () => {
    if (!currentTask) return
    
    setIsLoading(true)
    try {
      const response = await fetch(API_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [
            {
              role: 'user',
              content: `请将以下任务分解成具体的第一步，并提供完整的实施步骤指南。任务：${currentTask.title}
              
              请按以下格式返回：
              {
                "title": "第一步具体任务",
                "description": "任务描述",
                "steps": ["步骤1", "步骤2", "步骤3"]
              }`
            }
          ]
        })
      })

      const data = await response.json()
      const taskData = JSON.parse(data.choices[0].message.content)
      
      // Update the current task with new data
      const updatedTask = {
        ...currentTask,
        title: taskData.title,
        description: taskData.description,
        steps: taskData.steps
      }
      
      setCurrentTask(updatedTask)
      setTasks(prev => prev.map(task => 
        task.id === currentTask.id ? updatedTask : task
      ))
    } catch (error) {
      console.error('重新生成任务失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardContent className="flex-1 overflow-auto p-4 space-y-4">
        {currentTask ? (
          <TaskCard
            task={currentTask}
            onReturn={handleReturnTask}
            onComplete={handleCompleteTask}
            onRegenerate={regenerateTask}
          />
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground">
                  {tasks.length === 0 
                    ? "请添加任务到签筒中" 
                    : `签筒中还有 ${activeTasks.length} 个任务待完成`}
                </p>
                {archivedTasks.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    {showArchived ? "隐藏已归档" : "查看已归档"}
                  </Button>
                )}
              </div>
              
              {showArchived && archivedTasks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    已归档任务 ({archivedTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {archivedTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onReturn={() => {
                          setTasks(prev => prev.map(t => 
                            t.id === task.id ? { ...t, isArchived: false, isCompleted: false } : t
                          ))
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <form onSubmit={handleAddTask} className="flex w-full gap-2 items-center">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入要完成的任务"
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            size="icon" 
            variant="outline"
            onClick={handleDrawTask}
            disabled={activeTasks.length === 0 || currentTask !== null}
          >
            <Dices className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default ChatInterface


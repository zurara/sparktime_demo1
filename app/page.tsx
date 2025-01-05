import ChatInterface from "@/components/chat-interface"
import Image from "next/image"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4 relative bg-background">
      {/* 背景竹筒 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="relative w-[200px] md:w-[400px] h-[300px] md:h-[600px]">
          <Image
            src="/bamboo-tube.svg"
            alt="Bamboo Tube Background"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      
      {/* 主要內容 */}
      <div className="relative z-10 w-full">
        <ChatInterface />
      </div>
    </div>
  )
}
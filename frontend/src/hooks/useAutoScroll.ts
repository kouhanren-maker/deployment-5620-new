import { useEffect, useLayoutEffect, useRef } from 'react'

export const useAutoScroll = <T>(
  dependency: T[], 
  isLoading?: boolean
) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (scrollRef.current) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [dependency.length, isLoading])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [dependency.length, isLoading])

  return scrollRef
}


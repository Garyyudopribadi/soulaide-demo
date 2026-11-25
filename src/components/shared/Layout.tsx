import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header.tsx'
import { Footer } from './Footer.tsx'
import { FloatingCommunicationsWidget } from '@/features/chat/FloatingCommunicationsWidget.tsx'

const WORKSPACE_PREFIXES = ['/dashboard', '/admin', '/psychologist']

export const Layout: React.FC = () => {
  const { pathname, hash } = useLocation()
  const isWorkspace = WORKSPACE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  // Scroll to top on route changes, or smooth scroll & focus to hash anchors
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const scrollToElement = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          // Set focus for accessibility and keyboard navigation
          if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '-1')
          }
          el.focus({ preventScroll: true })
          return true
        }
        return false
      }

      // Try immediately, or retry on next animation frame if DOM is rendering
      if (!scrollToElement()) {
        const timer = setTimeout(scrollToElement, 100)
        return () => clearTimeout(timer)
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname, hash])

  if (isWorkspace) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#23192D]">
        <Outlet />
        <FloatingCommunicationsWidget />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#23192D]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingCommunicationsWidget />
    </div>
  )
}

"use client"

import { useEffect } from "react"

type RevealOptions = {
  rootMargin?: string
  threshold?: number | number[]
}

export function useReveal(options: RevealOptions = {}) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"))
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
          }
        }
      },
      {
        root: null,
        rootMargin: options.rootMargin ?? "0px 0px -10% 0px",
        threshold: options.threshold ?? 0.15,
      }
    )

    for (const el of elements) observer.observe(el)

    return () => observer.disconnect()
  }, [options.rootMargin, options.threshold])
}



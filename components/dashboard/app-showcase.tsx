"use client"

import Image from "next/image"

export function AppShowcase() {
  return (
    <section className="relative mb-12">
      <div className="rounded-xl border border-border bg-card p-6 lg:p-10 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-10">
          <div className="flex-1 w-full text-center lg:text-left">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-3 reveal">Available on web and mobile</div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 shine reveal">CareSight—Everywhere You Care</h3>
            <p className="text-muted-foreground text-lg mb-5 max-w-xl mx-auto lg:mx-0 reveal delay-1">
              Hospital-grade analytics for clinicians. Personal guidance for patients. One platform, two experiences.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-3 reveal delay-2">
              <span className="text-sm text-muted-foreground">Swap in your screenshots below</span>
            </div>
          </div>

          <div className="relative flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center reveal">
            {/* Laptop mockup */}
            <div className="relative w-full max-w-xl aspect-[16/10] rounded-lg bg-muted border border-border shadow-sm overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-border rounded-b-xl" />
              <Image
                src="/placeholder.jpg"
                alt="CareSight web dashboard"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Mobile mockup */}
            <div className="relative w-48 sm:w-56 aspect-[9/19] rounded-[2rem] border border-border bg-background shadow-md overflow-hidden">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-border/80 rounded-full" />
              <div className="absolute top-2 right-8 w-8 h-1.5 bg-border/50 rounded-full" />
              <Image
                src="/placeholder.jpg"
                alt="CareSight mobile app"
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
        <div className="mt-6 text-xs text-muted-foreground text-center lg:text-left reveal">Replace images with real screenshots by updating the src.</div>
      </div>
    </section>
  )
}



import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen">
      {/* Background image */}
      <div
        className="absolute top-0 w-full h-full bg-center bg-cover"
        style={{
          backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
        }}
      >
        <span className="w-full h-full absolute opacity-50 bg-black"></span>
      </div>

      {/* Hero content */}
      <div className="container relative mx-auto px-4">
        <div className="items-center flex flex-wrap">
          <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
            <div>
              <h1 className="text-white font-semibold text-5xl mb-6">Innovative Business Solutions</h1>
              <p className="mt-4 text-lg text-white opacity-80">
                We help businesses grow with cutting-edge technology and strategic consulting. Our team of experts is
                dedicated to transforming your vision into reality.
              </p>
              <div className="mt-10">
                <Link href="/contact">
                  <Button size="lg" className="mr-4">
                    Get Started
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg" className="bg-white/10 text-white border-white">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


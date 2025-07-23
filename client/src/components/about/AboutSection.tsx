import Image from 'next/image'

export default function AboutSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-7xl md:px-0">
        <div className="flex flex-col   justify-center md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2">
            <h2 className=" mb-6 !text-[1.9rem] md:!text-[1.9rem]">About OneNumber</h2>
            <p className="mb-4">
              OneNumber is a WebRTC-based VoIP softphone that makes communication possible with ease. It’s a solution built on WebRTC from the stable of Cedarview Communication Limited (CCL), a rising force in the design, planning and implementation of innovative, technological solutions for the myriad of business and social challenges. In a world where communication has become so essential regardless of location, we bring this VoIP solution that makes life easier and puts your business on competitive edge.
            </p>
            <div className="container  md:px-0 mt-10">
              <h2 className=" !text-[1.9rem] md:!text-[1.9rem] mb-8">Our Story</h2>
              <div className="max-w-3xl">
                <p className="mb-4">
                  For traveling professionals looking to bridge the gap between their work and personal life, OneNumber is a business solution to Nigeria where they are distanced. OneNumber ensures you stay reliably connected in today&apos;s work climate, with the experience of having a strong line with your Nigerian contacts, Stay Connected, anywhere.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center"> 
            <div className="relative w-full h-64 md:h-[600px] hidden md:block ">
              <Image
                src="/assets/images/about_us.png"
                alt="Person using OneNumber app on phone"
                layout="fill"
                objectFit="contain"
                priority

              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
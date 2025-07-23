import Link from 'next/link'

export default function Hero({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="hero w-full  py-20 px-4 md:px-0 text-center md:text-left relative max-h-[567px]">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-3xl px-4">
          <h1 className="text-secondary !mb-[48px] !text-[1.9rem] md:!text-[3.375rem] !leading-[2.25rem] md:!leading-[3.75rem]">{title}</h1>
          <p className="text-secondary mb-[64px] md:w-[600px] mt-[48px]">{subtitle}</p>
          <Link href="/vanity-number">
            <span className="bg-primary text-white px-6 py-3 font-medium rounded-md">Get Started Now</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
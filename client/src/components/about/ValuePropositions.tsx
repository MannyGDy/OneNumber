import Image from 'next/image'
import Link from 'next/link'

export default function ValuePropositions() {
  const features = [
    {
      id: 1,
      title: "Separate work and personal",
      description: "Get a business phone number plus all of the features of a second line without purchasing additional devices. That way, your personal number stays private and you always know when business is calling.",
      image: "/assets/images/WorkPersonal.png"
    },
    {
      id: 2,
      title: "Look and sound professional",
      description: "OneNumber lets you know when a call is business related so you can put your best voice forward. Your business will look bigger with features such as custom greetings and hold music that welcome callers and direct them to the right department or employee.",
      image: "/assets/images/soundPro.png"
    },
    {
      id: 3,
      title: "Never miss a call",
      description: "Make and receive business calls and texts from anywhere with our desktop or mobile apps. Take multiple calls at the same time by routing them to your team. Forward to any phone number so customers never hear another busy signal.",
      image: "/assets/images/neverMiss.png"
    },
    {
      id: 4,
      title: "Discover the reliable, flexible and affordable way to make calls to Nigeria with ONENUMBER APP",
      description: "Make calls to any Nigerian phone number as though they never left.",
      benefits: [
        "Make cheaper calls",
        "Send unlimited SMS",
        "Data provided for internet",
        "3-way audio conference",
        "The receiver doesn't need to have OneNumber",
        "The call receiver does not need internet"
      ],
      image: "/assets/images/discover.png"
    }
  ]

  return (
    <section className="bg-white">
      <div
        className="mx-auto md:max-w-7xl px-4 "
        style={{
          gap: '80px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="text-center ">
          <h2 className="text-[1.5rem] md:text-[2rem] font-bold ">
            Why OneNumber
          </h2>
          
        </div>
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}
          >
            <div className="w-full md:w-1/2">
              <h3 className=" text-[1.5rem] md:text-[2rem]">
                {feature.title}
              </h3>
              <p className="mb-4 mt-[2.7rem] ">{feature.description}</p>
              {feature.benefits && (
                <>
                <ul className="list-disc pl-5 space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="space-y-2 ">{benefit}</li>
                  ))}
                </ul>
                <h4 className='mt-10 font-bold'>Download OneNumber APP for Free today</h4>
                </>
              )}

              {feature.id === 4 && (
                <div className="flex space-x-4 mt-6">
                  <Link href="https://apps.apple.com/in/app/onenumberafrica/id6447075957" className="inline-block" target='_blank'>
                    <Image
                      src="/assets/svgs/icons/appleStore.svg"
                      alt="Download on App Store"
                      width={244}
                      height={70.77}
                    />
                  </Link>
                  <Link href="https://play.google.com/store/apps/details?id=onenumber.cedarviewng.com&pcampaignid=web_share" className="inline-block" target='_blank'>
                    <Image
                      src="/assets/svgs/icons/googlePlay.svg"
                      alt="Get it on Google Play"
                      width={244}
                      height={70.77}
                    />
                  </Link>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 h-full flex items-center justify-center">
              {feature.id === 4 ? (
                <div className="relative w-full hidden md:block md:h-[906px]" >
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              ) : (
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={573}
                  height={382}
                  style={{ objectFit: 'contain' }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

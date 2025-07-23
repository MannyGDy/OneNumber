import Image from "next/image";

export const WhyUseVanityNumber: React.FC = () => {
  return (
    <div className="container mx-auto max-w-7xl  px-8 py-16 grid md:grid-cols-2 gap-12 items-center">

      <div>
        <h2 className="!text-xl md:!text-[2rem] font-bold mb-4">Why should I use a vanity number?</h2>
        <ul className=" space-y-2 list-disc list-outsid mt-6 ">
          <li className=" !text-[1rem] md:!text-[1.2rem]">
            Build a business identity that people will not forget so soon.
          </li>
          <li className=" !text-[1rem] md:!text-[1.2rem]">
            Make your business cards, website and brand more recognizable.
          </li>
          <li className=" !text-[1rem] md:!text-[1.2rem]">
            Make your company look bigger and more established.
          </li>
          <li className=" !text-[1rem] md:!text-[1.2rem]">
            Expand your reach with a vanity number for clients nationwide.
          </li>
          <li className=" !text-[1rem] md:!text-[1.2rem]">
            Generate more leads – studies show that vanity numbers drive more traffic.
          </li>
        </ul>
      </div>
      <div>
        <Image
          src="/assets/images/Vanity-Phone-Number.png"
          alt="Vanity Number Example"
          className="rounded-lg shadow-lg"
          width={500}
          height={500}
        />
      </div>

    </div>
  );
};
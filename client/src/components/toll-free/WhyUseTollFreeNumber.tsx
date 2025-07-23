import Image from "next/image";

export const WhyUseTollFreeNumber: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">

      <div>
        <h2 className="!text-xl md:!text-[2rem] !leading-[2.25rem] md:!leading-[3.75rem] font-bold mb-4">Why should I use a toll-free number?</h2>
        <ul className=" space-y-2 list-disc list-outsid mt-6">
          <li className="space-y-2 !text-[1rem] md:!text-[1.2rem]">
            Build a business identity that people will not forget so soon.
          </li>
          <li className="space-y-2 !text-[1rem] md:!text-[1.2rem]">
            Make your business cards, website and brand more recognizable.
          </li>
          <li className="space-y-2 !text-[1rem] md:!text-[1.2rem]">
            Make your company look bigger and more established.
          </li>
          <li className="space-y-2 !text-[1rem] md:!text-[1.2rem]">
            Expand your reach with a toll-free number for clients nationwide.
          </li>
          <li className="space-y-2 !text-[1rem] md:!text-[1.2rem]">
            Generate more leads – studies show that toll-free numbers drive more traffic.
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
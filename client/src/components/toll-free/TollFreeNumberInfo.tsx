import Image from "next/image";

export const TollFreeNumberInfo: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <Image
          src="/assets/images/vanitynumber.png"
          alt="Vanity Number Example"
          className="rounded-lg shadow-lg"
          width={500}
          height={500}
        />
      </div>

      <div>
        <h2 className="!text-xl md:!text-[2rem] !leading-[2.25rem] md:!leading-[3.75rem] font-bold mb-4">What is a toll-free number?</h2>
        <p className="text-gray-600 mb-4  !text-[1rem] md:!text-[1.2rem] mt-6">
          A toll-free number is a phone number that is free to call. They can be used to create an 800 number for a recognizable brand name like 07000-FLOWERS.
        </p>
        <p className="text-gray-600  !text-[1rem] md:!text-[1.2rem]">
          Other companies want an easy-to-remember toll-free number for use in advertising (like 1-800-NAIJdEx). Custom phone numbers are available, with many toll-free prefixes.
        </p>
      </div>
    </div>
  );
};
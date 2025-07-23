const VanityNumbersInfo = () => {
  return (
    <div className=" mx-auto p-6 bg-white text-center ">
      <h3 className="text-3xl font-bold text-center text-gray-800 ">
        Types of Vanity Numbers
      </h3>

      <div className="space-y-12 mt-10">
        {/* Toll-Free Section */}
        <section>
          <h2 className="text-2xl font-semibold text-center mb-4">
            Toll-Free Numbers
          </h2>
          <p className="text-gray-600 mb-4 text-lg leading-relaxed">
            Toll-Free Vanity Numbers begin with 0800 and are free for callers. They often include
            words or acronyms like{' '}
            <span className="font-mono ">0800-FLOWERS</span> or{' '}
            <span className="font-mono ">0800-356-9377</span>. These numbers give your
            business a national presence and make it easier for customers to reach you without cost.
          </p>
        </section>

        {/* Non-Toll-Free Section */}
        <section>
          <h2 className="text-2xl font-semibold  mb-4">
            Non-Toll-Free Numbers
          </h2>
          <p className="text-gray-600 text-lg mb-4 leading-relaxed">
            These numbers begin with 0700 and are usually charged to the caller. While not
            toll-free, they still offer strong branding potential and memorability. An example is{' '}
            <span className="font-mono ">0700-CLEANER</span> or{' '}
            <span className="font-mono ">0700-FASTCAR</span>, perfect for businesses
            that want a local but professional appeal.
          </p>
        </section>
      </div>
    </div>
  );
};

export default VanityNumbersInfo;
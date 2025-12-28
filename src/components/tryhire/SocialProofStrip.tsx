// TODO: Replace placeholder logos with approved employer/partner logos
const logos = [
  { name: 'Company 1', imageSrc: '/placeholder.svg' },
  { name: 'Company 2', imageSrc: '/placeholder.svg' },
  { name: 'Company 3', imageSrc: '/placeholder.svg' },
  { name: 'Company 4', imageSrc: '/placeholder.svg' },
  { name: 'Company 5', imageSrc: '/placeholder.svg' },
  { name: 'Company 6', imageSrc: '/placeholder.svg' },
];

const SocialProofStrip = () => {
  return (
    <div className="text-center">
      <p className="text-sm font-medium text-slate-500 mb-8">
        Trusted by employers across Malaysia
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="w-24 h-12 flex items-center justify-center grayscale opacity-50"
          >
            <img
              src={logo.imageSrc}
              alt={logo.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialProofStrip;

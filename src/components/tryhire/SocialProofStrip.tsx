import hrdcorpLogo from '@/assets/collaborators/hrdcorp.png';
import mediaprimaLogo from '@/assets/collaborators/mediaprima.png';
import pikomLogo from '@/assets/collaborators/pikom.png';
import digitalpenangLogo from '@/assets/collaborators/digitalpenang.png';
import mtdcLogo from '@/assets/collaborators/mtdc.png';
import talentcorpLogo from '@/assets/collaborators/talentcorp.png';

const logos = [
  { name: 'HRD Corp', imageSrc: hrdcorpLogo },
  { name: 'Media Prima', imageSrc: mediaprimaLogo },
  { name: 'PIKOM', imageSrc: pikomLogo },
  { name: 'Digital Penang', imageSrc: digitalpenangLogo },
  { name: 'MTDC', imageSrc: mtdcLogo },
  { name: 'TalentCorp', imageSrc: talentcorpLogo },
];

const SocialProofStrip = () => {
  return (
    <div className="text-center">
      <p className="text-sm font-medium text-slate-500 mb-8">
        AIHQ's past collaborators across industries
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="w-24 h-24 flex items-center justify-center grayscale opacity-60 hover:opacity-80 transition-opacity"
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

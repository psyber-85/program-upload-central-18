import { cn } from '@/lib/utils';
import digitalpenang from '@/assets/collaborators/digitalpenang.png';
import hrdcorp from '@/assets/collaborators/hrdcorp.png';
import mediaprima from '@/assets/collaborators/mediaprima.png';
import mtdc from '@/assets/collaborators/mtdc.png';
import pikom from '@/assets/collaborators/pikom.png';
import talentcorp from '@/assets/collaborators/talentcorp.png';

const logos = [
  { src: digitalpenang, alt: 'Digital Penang' },
  { src: hrdcorp, alt: 'HRD Corp' },
  { src: mediaprima, alt: 'Media Prima' },
  { src: mtdc, alt: 'MTDC' },
  { src: pikom, alt: 'PIKOM' },
  { src: talentcorp, alt: 'TalentCorp' },
];

const CompaniesWorkedWith = () => {
  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10">
        Companies We Worked With
      </h2>
      <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
        {logos.map((logo, index) => (
          <div 
            key={index}
            className={cn(
              "group p-4 sm:p-5 rounded-xl",
              "bg-white/80 backdrop-blur-sm",
              "border border-slate-100",
              "shadow-sm hover:shadow-lg hover:shadow-tryhire-coral/10",
              "transform transition-all duration-300 hover:scale-105 hover:border-tryhire-coral/20"
            )}
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-8 sm:h-10 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompaniesWorkedWith;

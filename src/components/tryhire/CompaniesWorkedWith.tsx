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
      <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
        {logos.map((logo, index) => (
          <img
            key={index}
            src={logo.src}
            alt={logo.alt}
            className="h-10 sm:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
          />
        ))}
      </div>
    </div>
  );
};

export default CompaniesWorkedWith;

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Do we have to pay to use TryHire?',
    answer: 'No. There is no upfront cost to employers to participate.',
  },
  {
    question: 'So how does this work without fees?',
    answer: 'TryHire is supported through training and placement programmes. Employers are not charged.',
  },
  {
    question: 'Are we required to hire anyone?',
    answer: 'No. Hiring is fully at your discretion.',
  },
  {
    question: 'What roles does this work best for?',
    answer: 'Bulk or repeated hiring for junior or entry-level roles.',
  },
  {
    question: 'Is this an internship or contract role?',
    answer: 'No. This is a training-linked placement phase before employment.',
  },
];

const TryHireFAQ = () => {
  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {faqs.map((faq, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="bg-white rounded-xl border border-slate-200 px-6 shadow-sm hover:shadow-md transition-shadow duration-300 data-[state=open]:shadow-md data-[state=open]:border-tryhire-coral/30"
        >
          <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 hover:no-underline hover:text-tryhire-coral transition-colors py-5">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 text-base pb-5">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default TryHireFAQ;

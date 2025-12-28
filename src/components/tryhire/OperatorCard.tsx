const OperatorCard = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Who operates TryHire?
        </h3>
        <p className="text-slate-600">
          TryHire is operated by AIHQ, a workforce training and assessment provider supporting employers and jobseekers in Malaysia.
        </p>
        <p className="text-sm text-slate-500 mt-3">
          AIHQ works with companies, institutions, and workforce programmes nationwide.
        </p>
      </div>
      
      {/* Light credibility metric */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Supported employer hiring and workforce training initiatives.
      </p>
    </div>
  );
};

export default OperatorCard;

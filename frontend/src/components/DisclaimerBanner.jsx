import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-y border-amber-200 text-amber-900 px-4 py-3 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center space-x-3">
        <div className="flex-shrink-0 mt-0.5 sm:mt-0">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
        </div>
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-semibold text-amber-800 uppercase tracking-wide mr-1.5 inline-block">
            Medical & Research Disclaimer:
          </span>
          This web application is an educational and research prototype developed to demonstrate machine-learning pattern recognition.
          It is <strong>not intended for medical diagnosis, treatment decisions, or clinical advice</strong>. Model predictions are purely probabilistic
          and should not be interpreted as medical recommendations. Always consult a qualified physician or allergist for allergy management.
        </div>
      </div>
    </div>
  );
}

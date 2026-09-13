import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';

export default function SectionAbout({ onExploreModel }) {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Hero Header without badge */}
      <div className="text-center space-y-3 pt-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Understanding Antihistamine Resistance
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          An educational guide examining why certain individuals experience reduced therapeutic response
          to standard antihistamines, and how predictive machine learning models can help detect high-risk patterns.
        </p>
      </div>

      {/* Grid of Key Concepts without decorative top icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: What is Drug Resistance? */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-xs space-y-3 hover:border-blue-200 transition">
          <h2 className="text-lg font-bold text-slate-900">1. What Drug & Tablet Resistance Means</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            In pharmacology, <strong>drug resistance</strong> or <strong>reduced responsiveness</strong> occurs when a medication
            that previously relieved symptoms becomes less effective over time, requiring higher doses or failing to produce
            the expected therapeutic benefit.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1 border border-slate-100">
            <span className="font-semibold text-slate-700 block">Antimicrobial vs Pharmacodynamic Resistance:</span>
            While <em>antimicrobial resistance</em> involves bacteria or viruses mutating to survive antibiotics,
            <em>antihistamine resistance</em> in human patients typically stems from receptor regulation, altered drug metabolism,
            or tolerance (tachyphylaxis).
          </div>
        </div>

        {/* Card 2: What are Antihistamines? */}
        <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100 shadow-xs space-y-3 hover:border-cyan-200 transition">
          <h2 className="text-lg font-bold text-slate-900">2. What are Antihistamines?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Antihistamines are pharmacological agents that counteract <strong>histamine</strong>, an inflammatory amine released
            by mast cells during allergic reactions (causing sneezing, itching, hives, and nasal congestion).
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-0.5">1st Generation</span>
              Cross the blood-brain barrier (e.g., diphenhydramine, chlorpheniramine). Cause sedation; higher rate of tachyphylaxis.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-0.5">2nd Generation</span>
              Peripherally selective (e.g., cetirizine, loratadine, fexofenadine). Minimal sedation and longer duration of action.
            </div>
          </div>
        </div>

        {/* Card 3: Antihistamine Resistance in this Project */}
        <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 shadow-xs space-y-3 hover:border-teal-200 transition">
          <h2 className="text-lg font-bold text-slate-900">3. Resistance in the Context of this Project</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            In our dataset and machine-learning model, <strong>Resistance (Response = 1)</strong> designates patients whose allergy
            symptoms persist or fail to achieve adequate control despite ongoing standard antihistamine therapy.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Conversely, <strong>Responsive (Response = 0)</strong> denotes individuals who achieve effective symptomatic relief
            under standard dosages without therapy failure.
          </p>
        </div>

        {/* Card 4: Clinical Significance */}
        <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 shadow-xs space-y-3 hover:border-violet-200 transition">
          <h2 className="text-lg font-bold text-slate-900">4. Why Reduced Response is Important</h2>
          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
            <li><strong>Impaired Quality of Life:</strong> Persistent allergic rhinitis disrupts sleep, work productivity, and cognitive focus.</li>
            <li><strong>Risk of Exacerbations:</strong> In patients with concomitant asthma or eczema, uncontrolled allergies can trigger severe flare-ups.</li>
            <li><strong>Inappropriate Self-Medication:</strong> Patients might arbitrarily double dosages without medical supervision, risking adverse side effects.</li>
          </ul>
        </div>
      </div>

      {/* Factors Contributing to Resistance Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Factors Contributing to Reduced Response & Resistance
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Corroborated by immunological literature and validated within our machine-learning dataset:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-slate-200/80 rounded-xl p-4 bg-gradient-to-b from-slate-50 to-white">
            <div className="text-sky-600 font-semibold text-xs tracking-wider uppercase">Factor 1</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Antihistamine Class</div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              First-generation compounds exhibit faster rates of tolerance and shorter half-lives compared to second-generation H1 receptor antagonists.
            </p>
          </div>

          <div className="border border-slate-200/80 rounded-xl p-4 bg-gradient-to-b from-slate-50 to-white">
            <div className="text-sky-600 font-semibold text-xs tracking-wider uppercase">Factor 2</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Exposure Duration</div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Longer allergy duration (measured in days/months) creates persistent mucosal inflammation that single-pathway antihistamines alone cannot suppress.
            </p>
          </div>

          <div className="border border-slate-200/80 rounded-xl p-4 bg-gradient-to-b from-slate-50 to-white">
            <div className="text-sky-600 font-semibold text-xs tracking-wider uppercase">Factor 3</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Previous Chronic Use</div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Long-term continuous administration may trigger pharmacological tachyphylaxis and compensatory up-regulation of secondary inflammatory pathways.
            </p>
          </div>

          <div className="border border-slate-200/80 rounded-xl p-4 bg-gradient-to-b from-slate-50 to-white">
            <div className="text-sky-600 font-semibold text-xs tracking-wider uppercase">Factor 4</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Co-Morbidities</div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Co-existing conditions such as asthma or atopic eczema reflect multi-organ allergic diathesis involving leukotrienes and cytokines beyond histamine.
            </p>
          </div>
        </div>
      </div>

      {/* Role of Machine Learning & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/70 border border-emerald-200 p-6 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Why Machine Learning is Used</span>
          </div>
          <p className="text-sm text-emerald-950 leading-relaxed">
            Allergic responsiveness is non-linear and multi-factorial. Traditional linear scorecards often miss subtle interactions
            between age, duration, prior medication history, and allergen type.
          </p>
          <p className="text-sm text-emerald-900 leading-relaxed">
            Ensemble machine learning (combining <strong>Logistic Regression</strong>, <strong>Random Forest</strong>, and <strong>XGBoost</strong>)
            learns both linear bounds and complex tree-based interactions, enabling accurate early detection of patients likely to require treatment adjustments.
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-6 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Limitations of the ML Approach</span>
          </div>
          <p className="text-sm text-amber-950 leading-relaxed">
            Machine learning models predict based strictly on correlations present in the training cohort.
          </p>
          <ul className="text-xs sm:text-sm text-amber-900 space-y-1.5 list-disc list-inside">
            <li>Cannot verify patient genetic polymorphism (e.g., CYP2D6 metabolizer status).</li>
            <li>Cannot assess allergen exposure intensity variations.</li>
            <li>Cannot replace comprehensive allergy skin-prick or serum IgE testing.</li>
            <li>Predictions must be treated as research aids, not clinical prescriptions.</li>
          </ul>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4">
        <button
          onClick={onExploreModel}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02]"
        >
          <span>Explore Pipeline Architecture & Performance Metrics</span>
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

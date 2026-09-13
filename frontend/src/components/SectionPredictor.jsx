import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { predictResistance } from '../services/api';

export default function SectionPredictor({ sampleCases }) {
  const [formData, setFormData] = useState({
    Age: 30,
    Gender: 'Female',
    Allergy_Type: 'Dust',
    Duration_Allergy: 60,
    Antihistamine_Type: '2nd_gen',
    Co_morbidities: 'None',
    Previous_Use: 'short_term'
  });

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeStage, setActiveStage] = useState('ready');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLoadSample = (sample) => {
    setFormData({
      ...sample.patient_data
    });
    setPredictionResult(null);
    setError(null);
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setActiveStage('validating');

    try {
      // Small simulated delay for pipeline stage visualization animation
      setTimeout(() => setActiveStage('preprocessing'), 200);
      setTimeout(() => setActiveStage('inferring'), 400);

      const result = await predictResistance(formData);
      setTimeout(() => {
        setPredictionResult(result);
        setActiveStage('complete');
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to generate a prediction. Please check the entered values and try again.");
      setActiveStage('ready');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Title */}
      <div className="text-center space-y-3 pt-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Antihistamine Resistance Predictor
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Input patient parameters or load verified test cases to evaluate
          resistance probability across the soft-voting ensemble.
        </p>
      </div>

      {/* Preset Patient Case Badges */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Try Examples for Prediction
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">Click to pre-fill form</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sampleCases && sampleCases.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 transition group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700 flex items-center justify-between">
                <span>{sample.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  sample.expected_class === 1
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {sample.expected_class === 1 ? 'Resistant' : 'Responsive'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form on Left, Output & Pipeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Patient Clinical Profile</h2>
            <p className="text-xs text-slate-500">Configure parameters within validated training boundaries</p>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            {/* Age */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <label>Age (Years)</label>
                <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded">{formData.Age} yrs</span>
              </div>
              <input
                type="range"
                min="18"
                max="85"
                value={formData.Age}
                onChange={(e) => handleChange('Age', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>18 yrs (Adult)</span>
                <span>85 yrs</span>
              </div>
            </div>

            {/* Gender & Antihistamine Class */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.Gender}
                  onChange={(e) => handleChange('Gender', e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Antihistamine Type</label>
                <select
                  value={formData.Antihistamine_Type}
                  onChange={(e) => handleChange('Antihistamine_Type', e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="2nd_gen">2nd Gen (Non-sedating, Cetirizine/Loratadine)</option>
                  <option value="1st_gen">1st Gen (Sedating, Diphenhydramine)</option>
                </select>
              </div>
            </div>

            {/* Allergy Type & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Allergy Trigger Type</label>
                <select
                  value={formData.Allergy_Type}
                  onChange={(e) => handleChange('Allergy_Type', e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="Dust">Dust</option>
                  <option value="Seasonal">Seasonal / Pollen</option>
                  <option value="Food">Food</option>
                  <option value="Drug">Drug</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                  <label>Duration (Days)</label>
                  <span className="text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded">{formData.Duration_Allergy} d</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="250"
                  value={formData.Duration_Allergy}
                  onChange={(e) => handleChange('Duration_Allergy', Math.max(1, Math.min(250, parseInt(e.target.value) || 1)))}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            {/* Co-morbidities & Previous Use */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Co-Morbidities</label>
                <select
                  value={formData.Co_morbidities}
                  onChange={(e) => handleChange('Co_morbidities', e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="None">None / None Reported</option>
                  <option value="asthma">Asthma</option>
                  <option value="eczema">Eczema (Atopic Dermatitis)</option>
                  <option value="multiple">Multiple Co-Morbidities</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Antihistamine Use</label>
                <select
                  value={formData.Previous_Use}
                  onChange={(e) => handleChange('Previous_Use', e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="short_term">Short Term (&lt; 30 days)</option>
                  <option value="long_term">Long Term (Chronic &gt; 30 days)</option>
                </select>
              </div>
            </div>

            {/* Predict Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-sky-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Voting Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Predict Resistance Probability</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Dynamic Pipeline Status & Inference Card */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Step Progress Indicator */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-700 mb-3 flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-sky-600" />
              <span>Pipeline Execution Visualizer</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold">
              <div className={`p-2 rounded-lg border ${
                activeStage !== 'ready'
                  ? 'bg-sky-100 border-sky-300 text-sky-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                1. Input Validated
              </div>
              <div className={`p-2 rounded-lg border ${
                activeStage === 'preprocessing' || activeStage === 'inferring' || activeStage === 'complete'
                  ? 'bg-sky-100 border-sky-300 text-sky-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                2. StandardScaler & OHE
              </div>
              <div className={`p-2 rounded-lg border ${
                activeStage === 'inferring' || activeStage === 'complete'
                  ? 'bg-sky-100 border-sky-300 text-sky-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                3. Base Estimators
              </div>
              <div className={`p-2 rounded-lg border ${
                activeStage === 'complete'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                4. Soft Voting
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div>
                <span className="font-bold">Error:</span> {error}
              </div>
            </div>
          )}

          {/* Prediction Result Display */}
          {predictionResult ? (
            <div className={`p-6 sm:p-7 rounded-3xl border shadow-md space-y-6 ${
              predictionResult.prediction === 1
                ? 'bg-gradient-to-b from-amber-50/70 to-white border-amber-300'
                : 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-300'
            }`}>
              {/* Header Status */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ensemble Classification Result
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    {predictionResult.prediction === 1 ? (
                      <span className="text-2xl font-black text-amber-900">
                        Resistant (Reduced Response)
                      </span>
                    ) : (
                      <span className="text-2xl font-black text-emerald-900">
                        Responsive (Effective Response)
                      </span>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  predictionResult.prediction === 1
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {predictionResult.risk_level}
                </div>
              </div>

              {/* Probabilities Gauge Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">
                    Responsive: {(predictionResult.probability_responsive * 100).toFixed(1)}%
                  </span>
                  <span className={predictionResult.prediction === 1 ? 'text-amber-800' : 'text-slate-600'}>
                    Resistant: {(predictionResult.probability_resistant * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${predictionResult.probability_responsive * 100}%` }}
                  />
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: `${predictionResult.probability_resistant * 100}%` }}
                  />
                </div>
              </div>

              {/* Individual Model Votes */}
              <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Individual Estimator Votes inside Soft Voting:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {predictionResult.base_model_votes.map((vote, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block truncate font-medium">{vote.model_name}</span>
                      <span className={`text-xs font-bold block mt-0.5 ${
                        vote.prediction === 1 ? 'text-amber-800' : 'text-emerald-800'
                      }`}>
                        {vote.prediction_label}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {(vote.probability_resistant * 100).toFixed(1)}% res.
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Factors list */}
              {predictionResult.key_contributing_factors.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Key Contributing Characteristics:</span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {predictionResult.key_contributing_factors.map((factor, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-sky-600 font-bold">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mini Disclaimer */}
              <div className="text-[11px] text-slate-400 border-t border-slate-200/60 pt-3 italic">
                * Predictive simulation only. Not a medical diagnosis.
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-dashed border-slate-300 bg-white text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Awaiting Patient Parameters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a verified sample case above or fill out the clinical form and click
                <strong> "Predict Resistance Probability"</strong> to execute the full ML pipeline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import SectionAbout from './components/SectionAbout';
import SectionPipeline from './components/SectionPipeline';
import SectionPredictor from './components/SectionPredictor';
import {
  checkBackendHealth,
  fetchMetrics,
  fetchPipelineInfo,
  fetchSampleCases
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [backendOnline, setBackendOnline] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [pipelineInfo, setPipelineInfo] = useState(null);
  const [sampleCases, setSampleCases] = useState([]);

  useEffect(() => {
    const initApp = async () => {
      // 1. Health check
      const health = await checkBackendHealth();
      setBackendOnline(health.online);

      // 2. Load metrics & info
      const [metricsData, infoData, samplesData] = await Promise.all([
        fetchMetrics(),
        fetchPipelineInfo(),
        fetchSampleCases()
      ]);

      setMetrics(metricsData);
      setPipelineInfo(infoData);
      setSampleCases(samplesData);
    };

    initApp();

    // Periodic heartbeat every 15 seconds
    const interval = setInterval(async () => {
      const health = await checkBackendHealth();
      setBackendOnline(health.online);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
      />

      {/* Prominent Medical & Research Disclaimer */}
      <DisclaimerBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'about' && (
          <SectionAbout onExploreModel={() => setActiveTab('pipeline')} />
        )}
        {activeTab === 'pipeline' && (
          <SectionPipeline
            metrics={metrics}
            pipelineInfo={pipelineInfo}
          />
        )}
        {activeTab === 'predictor' && (
          <SectionPredictor sampleCases={sampleCases} />
        )}
      </main>
    </div>
  );
}

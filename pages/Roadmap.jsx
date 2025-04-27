import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Roadmap.css'; // Optional styling

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const RoadmapPage = () => {
  const [formData, setFormData] = useState({
    qualification: '',
    skills: '',
    interests: '',
    jobProfile: '',
    timeCommitment: ''
  });
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const estimateTime = (item) => {
    const url = item.link.toLowerCase();
    const snippetLength = (item.snippet || '').length;
    if (url.includes('youtube') || url.includes('coursera') || url.includes('udemy')) {
      return 20;
    } else if (url.includes('reddit') || url.includes('stackoverflow')) {
      return 5;
    } else if (snippetLength > 200) {
      return 15;
    }
    return 10;
  };

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    const { qualification, skills, interests, jobProfile, timeCommitment } = formData;
    const searchTerms = [jobProfile, qualification, skills, interests]
      .filter(term => term && term.trim() !== '')
      .join(' ');

    try {
      const response = await fetch(`/api/roadmap?q=${encodeURIComponent(searchTerms)}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        setError('No resources found. Please refine your inputs.');
        setLoading(false);
        return;
      }

      const adjustedRoadmap = data.map((step, index) => ({
        ...step,
        title: `Step ${index + 1}: ${step.title.substring(0, 50)}`,
        estimatedTime: estimateTime(step),
        weeksToComplete: Math.ceil(estimateTime(step) / (parseInt(timeCommitment.split('-')[0]) || 5))
      }));

      // Save to Supabase instead of Firebase
      const { error: supabaseError } = await supabase
        .from('user_roadmaps')
        .insert({
          user_input: formData,
          roadmap: adjustedRoadmap,
          timestamp: new Date().toISOString()
        });

      if (supabaseError) {
        throw supabaseError;
      }

      setRoadmap(adjustedRoadmap);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error.message}. Please check your internet connection or server status.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="roadmap-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#6B46C1' }}>Generate Your Refined Roadmap</h1>
      <p>Provide your details to get a personalized roadmap with tailored online resources.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ fontWeight: 'bold' }}>Qualification:</label>
        <select name="qualification" value={formData.qualification} onChange={handleChange} style={{ padding: '8px' }}>
          <option value="">Select</option>
          <option value="High School">High School</option>
          <option value="Bachelor's Degree">Bachelor's Degree</option>
          <option value="Master's Degree">Master's Degree</option>
        </select>

        <label style={{ fontWeight: 'bold' }}>Skills (comma-separated):</label>
        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="e.g., JavaScript, React"
          style={{ padding: '8px', minHeight: '60px' }}
        />

        <label style={{ fontWeight: 'bold' }}>Interests (comma-separated):</label>
        <textarea
          name="interests"
          value={formData.interests}
          onChange={handleChange}
          placeholder="e.g., Technology, Education"
          style={{ padding: '8px', minHeight: '60px' }}
        />

        <label style={{ fontWeight: 'bold' }}>Desired Job Profile:</label>
        <input
          type="text"
          name="jobProfile"
          value={formData.jobProfile}
          onChange={handleChange}
          placeholder="e.g., Software Developer"
          style={{ padding: '8px' }}
        />

        <label style={{ fontWeight: 'bold' }}>Time Commitment per Week:</label>
        <select name="timeCommitment" value={formData.timeCommitment} onChange={handleChange} style={{ padding: '8px' }}>
          <option value="">Select</option>
          <option value="Less than 5 hours">Less than 5 hours</option>
          <option value="5-10 hours">5-10 hours</option>
          <option value="10-20 hours">10-20 hours</option>
        </select>

        <button
          onClick={handleGenerateRoadmap}
          disabled={loading}
          style={{
            backgroundColor: '#6B46C1',
            color: 'white',
            padding: '10px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Generating...' : 'Generate Refined Roadmap'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'red', marginTop: '20px' }}>{error} <button onClick={() => setError(null)} style={{ marginLeft: '10px', padding: '5px 10px' }}>Try Again</button></p>
      )}

      {roadmap && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ color: '#6B46C1' }}>Your Personalized Roadmap</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {roadmap.map((step, index) => (
              <li
                key={index}
                style={{
                  marginBottom: '20px',
                  border: '2px solid #6B46C1',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#F9F5FF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#6B46C1',
                    color: 'white',
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '30px',
                    fontWeight: 'bold'
                  }}
                >
                  {index + 1}
                </span>
                <div>
                  <strong>{step.title}</strong>: {step.description} <br />
                  <a href={step.link} target="_blank" rel="noopener noreferrer" style={{ color: '#6B46C1' }}>
                    Visit Resource
                  </a> <br />
                  Estimated Time: {step.weeksToComplete} week{step.weeksToComplete !== 1 ? 's' : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
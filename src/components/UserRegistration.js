import React, { useState } from 'react';

const UserRegistration = ({ onComplete }) => {  // Added component function wrapper
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    acceptedTerms: false
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          // Store user data in localStorage
          localStorage.setItem('dailyWrapped_user', JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            isRegistered: true
          }));
          onComplete();
        } else {
          const data = await response.json();
          setErrors({ submit: data.message || 'Registration failed' });
        }
      } catch (error) {
        setErrors({ submit: 'Registration failed. Please try again.' });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white/10 rounded-lg backdrop-blur-md">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Get Your DailyWrapped</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded bg-white/20 text-white placeholder-white/70 border border-white/30"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 rounded bg-white/20 text-white placeholder-white/70 border border-white/30"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-3 rounded bg-white/20 text-white placeholder-white/70 border border-white/30"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            className="mr-2"
            checked={formData.acceptedTerms}
            onChange={(e) => setFormData({...formData, acceptedTerms: e.target.checked})}
          />
          <label htmlFor="terms" className="text-white text-sm">
            I accept the terms and conditions
          </label>
        </div>
        {errors.terms && <p className="text-red-400 text-sm">{errors.terms}</p>}
        
        <button
          type="submit"
          className="w-full p-3 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity"
        >
          Continue to Spotify Login
        </button>
        
        {errors.submit && <p className="text-red-400 text-sm text-center">{errors.submit}</p>}
      </form>
    </div>
  );
};

export default UserRegistration;
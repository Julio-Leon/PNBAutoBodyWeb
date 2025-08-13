import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, Award, Star } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      icon: <Shield size={24} />,
      title: "Insurance Approved",
      description: "Work with all major insurance companies"
    },
    {
      icon: <Clock size={24} />,
      title: "Quick Turnaround",
      description: "Most repairs completed in 3-5 days"
    },
    {
      icon: <Award size={24} />,
      title: "Lifetime Warranty",
      description: "Guaranteed quality on all repairs"
    }
  ];

  const stats = [
    { number: "29+", label: "Years Experience" },
    { number: "10,000+", label: "Cars Repaired" },
    { number: "5.0", label: "Star Rating" },
    { number: "100%", label: "Satisfaction" }
  ];

  return (
    <section className="hero-section" id="hero">
      <div className="hero-background">
        <div className="bg-overlay"></div>
        <div className="bg-image"></div>
      </div>

      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Star size={16} fill="currentColor" />
              <span>Trusted by 10,000+ Customers</span>
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Professional Auto Body Repair 
              <span className="title-accent"> You Can Trust</span>
            </motion.h1>

            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Get your vehicle back to perfect condition with our expert collision repair, 
              paintless dent removal, and precision paint matching. Quality work backed by 
              our lifetime warranty.
            </motion.p>

            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <button 
                className="btn-primary"
                onClick={() => scrollToSection('appointment')}
              >
                <span>Get Free Estimate</span>
                <ArrowRight size={20} />
              </button>
              <button 
                className="btn-secondary"
                onClick={() => scrollToSection('gallery')}
              >
                View Our Work
              </button>
            </motion.div>

            <motion.div
              className="hero-features"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="feature-item"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <div className="feature-text">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="hero-visual">
            <motion.div
              className="hero-image-container"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="hero-image">
                <img 
                  src="https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80" 
                  alt="Professional auto body repair"
                />
                <div className="image-overlay">
                  <div className="overlay-content">
                    <h3>State-of-the-Art Facility</h3>
                    <p>Latest equipment & certified technicians</p>
                  </div>
                </div>
              </div>
              
              <motion.div
                className="floating-card"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="card-content">
                  <div className="card-icon">
                    <Award size={28} />
                  </div>
                  <div className="card-text">
                    <h4>Quality Guaranteed</h4>
                    <p>Lifetime warranty on all structural repairs</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="stats-grid"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="stat-item"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3>{stat.number}</h3>
                  <p>{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        onClick={() => scrollToSection('services')}
      >
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
        <p>Scroll to explore</p>
      </motion.div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <motion.div
          className="floating-shape shape-1"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-shape shape-2"
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-shape shape-3"
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </section>
  );
};

export default Hero;

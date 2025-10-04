import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Shield, 
  Award, 
  Clock, 
  CheckCircle, 
  Star,
  Phone,
  MapPin,
  Users,
  Wrench,
  Palette,
  Zap
} from 'lucide-react';
import './Services.css';

const Services = () => {
  const [activeTab, setActiveTab] = useState('services');

  const services = [
    {
      id: 1,
      icon: <Car size={32} />,
      title: "Collision Repair",
      description: "Complete collision repair services with state-of-the-art equipment and certified technicians.",
      features: ["Frame alignment", "Structural repair", "Safety inspection", "Quality guarantee"],
      duration: "3-7 days",
      warranty: "Lifetime"
    },
    {
      id: 2,
      icon: <Palette size={32} />,
      title: "Paint & Refinishing",
      description: "Professional automotive painting with computerized color matching and premium finishes.",
      features: ["Color matching", "Multi-stage paint", "Clear coat protection", "UV resistance"],
      duration: "2-4 days",
      warranty: "5 years"
    },
    {
      id: 3,
      icon: <Wrench size={32} />,
      title: "Dent Repair (PDR)",
      description: "Paintless dent repair that maintains your vehicle's original factory finish.",
      features: ["No repainting", "Factory finish preserved", "Eco-friendly", "Cost effective"],
      duration: "Same day",
      warranty: "2 years"
    },
    {
      id: 4,
      icon: <Shield size={32} />,
      title: "Insurance Claims",
      description: "We work directly with all major insurance companies to streamline your claim process.",
      features: ["Direct billing", "Claim assistance", "Rental coordination", "Documentation"],
      duration: "Varies",
      warranty: "Full coverage"
    }
  ];

  const insurancePartners = [
    "State Farm", "Geico", "Progressive", "Allstate", "USAA", 
    "Farmers", "Liberty Mutual", "Nationwide", "AAA", "Travelers"
  ];

  const warranties = [
    {
      title: "Lifetime Warranty",
      description: "Structural and collision repairs",
      coverage: "As long as you own the vehicle",
      includes: ["Frame work", "Structural components", "Safety-related repairs"]
    },
    {
      title: "5-Year Paint Warranty",
      description: "Paint and refinishing work",
      coverage: "5 years from completion date",
      includes: ["Color match", "Finish quality", "Adhesion", "Durability"]
    },
    {
      title: "2-Year PDR Warranty",
      description: "Paintless dent repair",
      coverage: "2 years from completion date",
      includes: ["Dent return", "Finish integrity", "Workmanship"]
    }
  ];

  const shopInfo = {
    established: "1995",
    experience: "29+ years",
    technicians: "12 certified",
    location: "Downtown Auto District",
    certifications: ["I-CAR Gold Class", "ASE Certified", "OEM Approved"],
    awards: ["Best Auto Body Shop 2023", "Customer Choice Award", "Excellence in Service"]
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="services-section" id="services">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2>Expertise</h2>
          <p>Professional auto body repair with unmatched quality and service</p>
        </motion.div>

        <motion.div 
          className="tab-navigation"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button 
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Wrench size={20} />
            Services
          </button>
          <button 
            className={`tab-btn ${activeTab === 'partners' ? 'active' : ''}`}
            onClick={() => setActiveTab('partners')}
          >
            <Shield size={20} />
            Insurance Partners
          </button>
          <button 
            className={`tab-btn ${activeTab === 'warranty' ? 'active' : ''}`}
            onClick={() => setActiveTab('warranty')}
          >
            <Award size={20} />
            Warranty
          </button>
          <button 
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Users size={20} />
            About Us
          </button>
        </motion.div>

        <div className="tab-content">
          {activeTab === 'services' && (
            <motion.div 
              className="services-grid"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
            >
              {services.map((service, index) => (
                <motion.div 
                  key={service.id}
                  className="service-card"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="service-icon">
                    {service.icon}
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  
                  <div className="service-features">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="feature">
                        <CheckCircle size={16} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="service-details">
                    <div className="detail">
                      <Clock size={16} />
                      <span>{service.duration}</span>
                    </div>
                    <div className="detail">
                      <Award size={16} />
                      <span>{service.warranty}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'partners' && (
            <motion.div 
              className="partners-content"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="partners-intro">
                <h3>Trusted by Major Insurance Companies</h3>
                <p>We work directly with your insurance company to make the repair process seamless and stress-free.</p>
              </div>
              
              <div className="partners-grid">
                {insurancePartners.map((partner, index) => (
                  <motion.div 
                    key={partner}
                    className="partner-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Shield size={24} />
                    <span>{partner}</span>
                  </motion.div>
                ))}
              </div>

              <div className="benefits">
                <h4>Insurance Benefits</h4>
                <div className="benefits-list">
                  <div className="benefit">
                    <CheckCircle size={20} />
                    <span>Direct billing to insurance</span>
                  </div>
                  <div className="benefit">
                    <CheckCircle size={20} />
                    <span>Claim assistance and documentation</span>
                  </div>
                  <div className="benefit">
                    <CheckCircle size={20} />
                    <span>Rental car coordination</span>
                  </div>
                  <div className="benefit">
                    <CheckCircle size={20} />
                    <span>Deductible assistance programs</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'warranty' && (
            <motion.div 
              className="warranty-content"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="warranty-intro">
                <h3>Comprehensive Warranty Coverage</h3>
                <p>We stand behind our work with industry-leading warranty coverage on all repairs.</p>
              </div>

              <div className="warranty-grid">
                {warranties.map((warranty, index) => (
                  <motion.div 
                    key={warranty.title}
                    className="warranty-card"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <div className="warranty-header">
                      <Award size={28} />
                      <div>
                        <h4>{warranty.title}</h4>
                        <p>{warranty.description}</p>
                      </div>
                    </div>
                    
                    <div className="warranty-coverage">
                      <strong>Coverage: {warranty.coverage}</strong>
                    </div>
                    
                    <div className="warranty-includes">
                      <h5>Includes:</h5>
                      <ul>
                        {warranty.includes.map((item, idx) => (
                          <li key={idx}>
                            <CheckCircle size={14} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div 
              className="about-content"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="about-hero">
                <h3>PNJ Auto Body - Excellence Since {shopInfo.established}</h3>
                <p>With over {shopInfo.experience} of experience, we've built our reputation on quality craftsmanship, exceptional customer service, and cutting-edge technology.</p>
              </div>

              <div className="about-stats">
                <motion.div 
                  className="stat"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="stat-icon">
                    <Clock size={32} />
                  </div>
                  <div className="stat-info">
                    <h4>{shopInfo.experience}</h4>
                    <p>In Business</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="stat"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="stat-icon">
                    <Users size={32} />
                  </div>
                  <div className="stat-info">
                    <h4>{shopInfo.technicians}</h4>
                    <p>Expert Technicians</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="stat"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="stat-icon">
                    <MapPin size={32} />
                  </div>
                  <div className="stat-info">
                    <h4>{shopInfo.location}</h4>
                    <p>Prime Location</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="stat"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="stat-icon">
                    <Star size={32} />
                  </div>
                  <div className="stat-info">
                    <h4>5.0 Rating</h4>
                    <p>Customer Reviews</p>
                  </div>
                </motion.div>
              </div>

              <div className="certifications-awards">
                <div className="certifications">
                  <h4>Certifications</h4>
                  <ul>
                    {shopInfo.certifications.map((cert, index) => (
                      <li key={index}>
                        <Award size={16} />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="awards">
                  <h4>Awards & Recognition</h4>
                  <ul>
                    {shopInfo.awards.map((award, index) => (
                      <li key={index}>
                        <Star size={16} />
                        {award}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Services;

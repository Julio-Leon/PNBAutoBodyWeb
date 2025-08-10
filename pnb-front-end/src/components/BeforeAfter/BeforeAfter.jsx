import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Clock, Wrench } from 'lucide-react';
import './BeforeAfter.css';

const BeforeAfter = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const repairs = [
    {
      id: 1,
      title: "Rear End Collision Repair",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Before+Repair",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=After+Repair",
      description: "Complete rear bumper replacement and paint matching with precision color calibration",
      repairType: "Collision Repair",
      duration: "5 days",
      category: "Collision"
    },
    {
      id: 2,
      title: "Door Dent Removal",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Dented+Door",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Perfect+Door",
      description: "Paintless dent repair with color matching using advanced PDR techniques",
      repairType: "Dent Repair",
      duration: "2 days",
      category: "Dent"
    },
    {
      id: 3,
      title: "Scratch Repair & Paint",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Deep+Scratches",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Flawless+Paint",
      description: "Deep scratch repair with full panel repaint and clear coat protection",
      repairType: "Paint & Body",
      duration: "3 days",
      category: "Paint"
    },
    {
      id: 4,
      title: "Front Bumper Restoration",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Damaged+Bumper",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=New+Bumper",
      description: "Complete front bumper replacement and alignment with OEM specifications",
      repairType: "Collision Repair",
      duration: "4 days",
      category: "Collision"
    },
    {
      id: 5,
      title: "Hail Damage Repair",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Hail+Damage",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Like+New",
      description: "Comprehensive hail damage repair across entire vehicle using PDR methods",
      repairType: "Dent Repair",
      duration: "7 days",
      category: "Dent"
    },
    {
      id: 6,
      title: "Side Panel Restoration",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Panel+Damage",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Perfect+Panel",
      description: "Side panel replacement with precision paint matching and blend work",
      repairType: "Paint & Body",
      duration: "6 days",
      category: "Paint"
    }
  ];

  const categories = ['All', 'Collision', 'Dent', 'Paint'];
  
  const filteredRepairs = selectedCategory === 'All' 
    ? repairs 
    : repairs.filter(repair => repair.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="before-after-section" id="gallery">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2>Our Work Gallery</h2>
          <p>See the quality and precision that goes into every repair</p>
        </motion.div>

        <motion.div 
          className="category-filters"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </motion.div>
        
        <motion.div 
          className="repairs-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <AnimatePresence mode="wait">
            {filteredRepairs.map((repair) => (
              <motion.div 
                key={repair.id}
                className="repair-card"
                variants={cardVariants}
                whileHover="hover"
                layout
              >
                <div className="image-comparison">
                  <div className="before-image">
                    <img src={repair.beforeImage} alt="Before repair" />
                    <span className="image-label before-label">BEFORE</span>
                  </div>
                  <div className="after-image">
                    <img src={repair.afterImage} alt="After repair" />
                    <span className="image-label after-label">AFTER</span>
                  </div>
                  <div className="view-overlay">
                    <Eye size={24} />
                    <span>View Details</span>
                  </div>
                </div>
                
                <div className="repair-info">
                  <h3>{repair.title}</h3>
                  <p className="description">{repair.description}</p>
                  <div className="repair-details">
                    <div className="detail-item">
                      <Wrench size={16} />
                      <span className="repair-type">{repair.repairType}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span className="duration">{repair.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfter;

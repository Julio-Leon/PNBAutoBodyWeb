import React from 'react';
import './BeforeAfter.css';

const BeforeAfter = () => {
  const repairs = [
    {
      id: 1,
      title: "Rear End Collision Repair",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Before+Repair",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=After+Repair",
      description: "Complete rear bumper replacement and paint matching",
      repairType: "Collision Repair",
      duration: "5 days"
    },
    {
      id: 2,
      title: "Door Dent Removal",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Dented+Door",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Perfect+Door",
      description: "Paintless dent repair with color matching",
      repairType: "Dent Repair",
      duration: "2 days"
    },
    {
      id: 3,
      title: "Scratch Repair & Paint",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Deep+Scratches",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Flawless+Paint",
      description: "Deep scratch repair with full panel repaint",
      repairType: "Paint & Body",
      duration: "3 days"
    },
    {
      id: 4,
      title: "Front Bumper Restoration",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Damaged+Bumper",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=New+Bumper",
      description: "Complete front bumper replacement and alignment",
      repairType: "Collision Repair",
      duration: "4 days"
    },
    {
      id: 5,
      title: "Hail Damage Repair",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Hail+Damage",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Like+New",
      description: "Comprehensive hail damage repair across entire vehicle",
      repairType: "Dent Repair",
      duration: "7 days"
    },
    {
      id: 6,
      title: "Side Panel Restoration",
      beforeImage: "https://via.placeholder.com/400x300/808080/FFFFFF?text=Panel+Damage",
      afterImage: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Perfect+Panel",
      description: "Side panel replacement with precision paint matching",
      repairType: "Paint & Body",
      duration: "6 days"
    }
  ];

  return (
    <section className="before-after-section">
      <div className="container">
        <div className="section-header">
          <h2>Our Work Gallery</h2>
          <p>See the quality and precision that goes into every repair</p>
        </div>
        
        <div className="repairs-grid">
          {repairs.map((repair) => (
            <div key={repair.id} className="repair-card">
              <div className="image-comparison">
                <div className="before-image">
                  <img src={repair.beforeImage} alt="Before repair" />
                  <span className="image-label before-label">BEFORE</span>
                </div>
                <div className="after-image">
                  <img src={repair.afterImage} alt="After repair" />
                  <span className="image-label after-label">AFTER</span>
                </div>
              </div>
              
              <div className="repair-info">
                <h3>{repair.title}</h3>
                <p className="description">{repair.description}</p>
                <div className="repair-details">
                  <span className="repair-type">{repair.repairType}</span>
                  <span className="duration">{repair.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;

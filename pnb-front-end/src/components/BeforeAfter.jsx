import React from 'react';
import './BeforeAfter.css';

const BeforeAfter = () => {
  const repairs = [
    {
      id: 1,
      title: "Rear End Collision Repair",
      beforeImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      afterImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      description: "Complete rear bumper replacement and paint matching",
      repairType: "Collision Repair",
      duration: "5 days"
    },
    {
      id: 2,
      title: "Door Dent Removal",
      beforeImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      afterImage: "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      description: "Paintless dent repair with color matching",
      repairType: "Dent Repair",
      duration: "2 days"
    },
    {
      id: 3,
      title: "Scratch Repair & Paint",
      beforeImage: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      afterImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      description: "Deep scratch repair with full panel repaint",
      repairType: "Paint & Body",
      duration: "3 days"
    },
    {
      id: 4,
      title: "Front Bumper Restoration",
      beforeImage: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      afterImage: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      description: "Complete front bumper replacement and alignment",
      repairType: "Collision Repair",
      duration: "4 days"
    },
    {
      id: 5,
      title: "Hail Damage Repair",
      beforeImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      afterImage: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      description: "Comprehensive hail damage repair across entire vehicle",
      repairType: "Dent Repair",
      duration: "7 days"
    },
    {
      id: 6,
      title: "Side Panel Restoration",
      beforeImage: "https://images.unsplash.com/photo-1517524206127-6d22cf9a4d02?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      afterImage: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
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

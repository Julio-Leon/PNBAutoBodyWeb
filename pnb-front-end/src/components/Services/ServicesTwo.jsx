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
import ServiceDetailsModal from './ServiceDetailsModal';
import './Services.css';

const ServicesTwo = () => {
  const [activeTab, setActiveTab] = useState('mechanic');
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedService(null), 300);
  };

  const mechanic = [
    {
      id: 1,
      icon: <Car size={32} />,
      title: "Computer Scan • Diagnostic • Road-Test & Safety Check",
      description: "Complete check to find the real cause and prioritize repairs.",
      features: ["OBD-II scan & live data", "Road test for symptoms", "30-point safety check", "Written report & estimate"],
      included: ["Code scan + freeze-frame", "Written findings", "Maintenance-light reset", "30-point safety inspection", "Road test (noise, shift, brake, steering feel)", "Bi-directional tests", "Smoke/EVAP test (as needed)", "Charging/starting test"],
      goodFor: ["Check-engine/ABS/airbag lights", "Rough Idle", "Hard Start", "New Noises", "Overheating", "New Noises"],
      duration: "2-3 days",
      warranty: "1 month"
    },
    {
      id: 2,
      icon: <Palette size={32} />,
      title: "Tune-Up & Diagnostics",
      description: "Restore power, MPG, and a smooth idle.",
      features: ["Ignition & fuel checks", "Spark plugs/filters as needed", "Throttle body cleaning", "Maintenance-light reset"],
      included: ["OBD-II & live-data diagnostics", "Ignition/fuel system checks", "Throttle body/intake cleaning (as needed)", "Spark plugs/coils (if required)", "Air/cabin/fuel filter check", "Fluid top-offs", "Road test"],
      goodFor: ["Missfires", "Poor MPG", "Rough Idle", "Lack Of Power"],
      addon: ["Injector Service", "Carbon Cleaning", "Battery Replacement"],
      duration: "1-2 days",
      warranty: "5 years"
    },
    {
      id: 3,
      icon: <Wrench size={32} />,
      title: "Oil Change & Fluid Services",
      description: "Fresh fluids protect engines, transmissions, and cooling systems.",
      features: ["Full-synthetic options", "New oil filter + top-offs", "25-point courtesy check", "Reminder reset"],
      included: ["Oil & filter", "Top-offs (brake/coolant/washer/PS)", "25-point courtesy inspection", "Service reminder reset"],
      addon: ["Transmission Service", "Coolant Flush", "Brake Fluid Exchange", "Wiper blades"],
      duration: "Same day",
      warranty: "2 years"
    },
    {
      id: 4,
      icon: <Shield size={32} />,
      title: "Brake Repair & Replacement",
      description: "Quiet, confident stopping—no warnings or vibration.",
      features: ["Pads & rotors", "Caliper service", "Brake fluid exchange", "Road-test verification"],
      included: ["Complete brake inspection", "Pad & rotor replacement", "Caliper service/replacement", "Hardware & lubrication", "Brake fluid bleed/exchange", "Parking-brake adjust", "Road test"],
      addon: ["Ceramic/low-dust pads", "Coated/performance rotors"],
      goodFor: ["Squeal or grinding", "Vibration", "Soft/low pedal", "ABS light", "Pulling"],
      duration: "1-2 days",
      warranty: "5 years"
    },
    {
      id: 5,
      icon: <Shield size={32} />,
      title: "Wheel Alignment",
      description: "Set camber/caster/toe to factory specs for straight tracking and tire life.",
      features: ["4-wheel alignment", "Steering centered", "Spec printout", "Angle sensor reset"],
      included: ["Tire/suspension pre-check", "Camber/caster/toe adjustments (where adjustable)", "Steering-angle sensor reset when required", "Before/after spec printout"],
      goodFor: ["Pulling", "Crooked steering wheel", "Uneven tire wear", "After new tires/suspension"],
      duration: "1-2 days",
      warranty: "5 years"
    },
    {
      id: 6,
      icon: <Shield size={32} />,
      title: "Suspension & Steering",
      description: "Fix clunks, shakes, and poor ride with quality parts and setup.",
      features: ["Shocks/struts", "Control arms/ball joints", "Tie-rods & bushings", "Ride/handling restored"],
      included: ["Noise & ride diagnostics", "Component inspection/replacement", "Torque to spec", "Alignment recommended after repair"],
      goodFor: ["Clunks", "Wandering", "Vibration", "Nose-Diving", "Uneven Tire Wear"],
      duration: "1-2 days",
      warranty: "5 years"
    },
    {
      id: 7,
      icon: <Shield size={32} />,
      title: "Electrical System Repairs",
      description: "From no-starts to mystery drains—diagnosed and repaired correctly.",
      features: ["Battery/alternator/starter", "Wiring & draw testing", "Module/sensor programming", "Lights & accessories"],
      included: ["Electrical diagnostics", "Battery/alternator/starter testing & replacement", "Fuse/relay/ground repairs", "Harness repair & circuit tracing", "Lighting (headlamps/LEDs)", "Power windows/locks/mirrors", "Sensor & module replacements", "Programming/coding (when applicable)"],
      goodFor: ["No-start", "Intermittent stall", "Battery drain", "Inoperative lights/windows", "Warning lights"],
      duration: "1-2 days",
      warranty: "5 years"
    },
    {
      id: 8,
      icon: <Shield size={32} />,
      title: "Engine & Transmission Repair",
      description: "From leaks and overheating to hard shifts—fixed right.",
      features: ["Timing/water pump", "Gaskets & seals", "Radiators/hoses", "Clutch or full replacement"],
      included: ["Engine: Timing belt/chain • water pump • oil leaks (valve cover/oil pan) • intake/exhaust gaskets • sensors • mounts • tune-ups", "Transmission: Fluid & filter • external leaks/sensors • valve-body/solenoids • clutches/flywheels • full replacement."],
      goodFor: ["Overheating", "Coolant/oil leaks", "Misfires", "Harsh/erratic shifts"],
      duration: "1-2 days",
      warranty: "5 years"
    },
  ];

  const bodywork = [
    {
      id: 1,
      icon: <Car size={32} />,
      title: "Collision Repair & Painting",
      description: "OEM procedures from structure to color-matched refinish.",
      features: ["Frame/unibody measuring", "Panel repair/replacement", "Controlled-booth refinish", "Color-match blend"],
      included: ["Frame/unibody measurement & straightening", "Panel repair/replacement", "Prep/prime/base/clear in controlled booth", "Blending & color-match", "Reassembly & safety checks", "Post-repair wash"],
      duration: "Varies by damage",
      warranty: "Lifetime"
    },
    {
      id: 2,
      icon: <Palette size={32} />,
      title: "Bumper Repair & Replacement",
      description: "Cosmetic and safety-system-ready bumper solutions.",
      features: ["Plastic repair or new bumper", "Sensor/camera transfer", "Paint to match", "Fast turnaround"],
      included: ["Crack/scuff repair • tab repairs", "Reinforcement/absorber check", "ADAS/parking sensor transfer & calibration", "Refinish & blend"],
      duration: "1-3 days",
      warranty: "Lifetime"
    },
    {
      id: 3,
      icon: <Wrench size={32} />,
      title: "Panel Repair (Fender/Door/Quarter/Hood)",
      description: "Factory-fit metal work with protection and clean finish.",
      features: ["Metal shaping", "Corrosion protection", "OEM gaps/fitment", "Clean blend & polish"],
      included: ["Dent/crease repair", "Skin or full panel replacement", "Factory-spec welds", "Seam sealer & cavity wax", "Refinish & blend"],
      duration: "1-4 days",
      warranty: "2 years"
    },
    {
      id: 4,
      icon: <Shield size={32} />,
      title: "Paintless Dent Repair (PDR)",
      description: "Paintless dent repair that maintains your vehicle’s original factory finish.",
      features: ["No repainting", "Factory finish preserved", "Eco-friendly", "Cost-effective"],
      included: ["Access from behind panel", "Controlled pushes/pulls/massage", "Precision tools & lighting", "Finish check"],
      goodFor: ["Hail", "Door Dings", "Small/Medium Dents without Paint Damage"],
      duration: "Same-Day Service",
      warranty: "1 year"
    },
    {
      id: 5,
      icon: <Shield size={32} />,
      title: "Frame/Unibody Straightening",
      description: "Return structural dimensions to spec.",
      features: ["Electronic measuring", "Pulled to spec", "Safety-first process", "Before/after reports"],
      included: ["Pre/mid/post measurements", "Controlled pulls", "Weld repairs (as needed)", "Alignment check"],
      duration: "Damage-Dependent",
      warranty: "5 years"
    },
    {
      id: 6,
      icon: <Shield size={32} />,
      title: "Auto Glass (Windshield/Side/Rear)",
      description: "Clean installs with calibration when required.",
      features: ["OE-quality glass", "ADAS calibration", "Leak test"],
      included: ["Remove/replace glass & mouldings", "Camera/radar calibration (when required)", "Leak test"],
      duration: "Same-Day Service",
      warranty: "5 years"
    },
    {
      id: 7,
      icon: <Shield size={32} />,
      title: "Rust Repair & Welding",
      description: "Comprehensive undercarriage protection services to shield your vehicle from rust and corrosion.",
      features: ["Cut & patch", "Weld to spec", "Prime & seal", "Paint match"],
      included: ["Cut out rusted metal", "Fabricate patches & weld", "Epoxy-prime & seam-seal", "Undercoat", "Refinish/paint match"],
      duration: "Varies By Area",
      warranty: "2 years"
    },
    {
      id: 8,
      icon: <Shield size={32} />,
      title: "Undercoating & Rust Protection",
      description: "Seal the underbody against salt, moisture, and abrasion.",
      features: ["Degrease & prep underside", "Rust converter (as needed)", "Rubberized coating", "Wheel wells & frame rails"],
      included: ["Undercarriage wash/degrease", "Loose-rust removal", "Rust-converter (as needed)", "Mask exhaust/brakes/driveline", "Rubberized undercoating on floors, frame rails, wheel wells and seams", "Cure & inspection"],
      addon:["Cavity wax inside doors/rails", "Seasonal Checkups"],
      duration: "1-2 days",
      warranty: "2 years"
    },
  ];

    const wheelsAndTires = [
    {
      id: 1,
      icon: <Car size={32} />,
      title: "Tire Replacement & Rotation",
      description: "Proper mounting and rotations for even wear and safe handling.",
      features: ["Mount & balance", "TPMS Reset", "Torque To Spec", "Rotation Schedule Guidance"],
      included: ["Size Match & Rating Check", "Mount/Balance/Torque", "Road Test"],
      duration: "45-90 minutes",
      warranty: "1 day"
    },
    {
      id: 2,
      icon: <Palette size={32} />,
      title: "Wheel Balancing",
      description: "Remove steering-wheel shake and seat vibration.",
      features: ["Dynamic spin balance", "Road-force option", "Alloy-safe weights", "Vibration recheck"],
      included: ["Inspect wheel/tire", "Remove old weights", "Precision mount", "Dynamic balance to spec", "Install clip-on/adhesive weights", "• Recheck vibration (TPMS-safe)"],
      goodFor: ["Vibration at 40-70 mph", "After new tires or wheel repair", "Every 6-10k miles"],
      duration: "45-60 minutes",
      warranty: "1 day"
    },
    {
      id: 3,
      icon: <Wrench size={32} />,
      title: "Flat Repair (Patch/Plug)",
      description: "Safe, permanent tread-area repairs.",
      features: ["Inspect & demount", "Patch/plug combo", "Rebalance", "TPMS check"],
      duration: "45 minutes",
      warranty: "1 day"
    },
    {
      id: 4,
      icon: <Shield size={32} />,
      title: "TPMS Service",
      description: "Restore correct tire-pressure monitoring.",
      features: ["Sensor replace/program", "Vehicle relearn", "New seals/stems", "Dash light off"],
      included: ["Replace sensors", "Program IDs", "Torque stems", "Relearn to vehicle"],
      duration: "30-60 minutes",
      warranty: "1 day"
    },
    {
      id: 5,
      icon: <Shield size={32} />,
      title: "Wheel Repair/Refinish",
      description: "Make damaged wheels safe and presentable again.",
      features: ["Bend straightening", "Cosmetic refinish", "Color match"],
      included: ["Safety inspection", "Straighten bends", "Weld minor cracks (where safe)", "Sand/prime/paint/clear for curb rash"],
      duration: "30-60 minutes",
      warranty: "1 day"
    },
  ];

  const carWash = [
    {
      id: 1,
      icon: <Car size={32} />,
      title: "Basic Hand Wash",
      description: "Gentle wash to keep the interior clean and fresh.",
      features: ["Hand wash", "Microfiber towel drying", "Tire Shine", "Exterior window cleaning", "PH Balanced Soap"],
      duration: "30-45 minutes",
      warranty: "1 day"
    },
    {
      id: 2,
      icon: <Palette size={32} />,
      title: "Deluxe Wash",
      description: "Adds a quick interior refresh to the Basic wash.",
      features: ["Exterior Hand Wash", "Interior Vacuum", "Interior Wipe-Down", "Door Jams Cleaned", "Interior Glass", "Trunk Vacuumed", "UV Protection Applied"],
      duration: "60-75 minutes",
      warranty: "1 day"
    },
    {
      id: 3,
      icon: <Wrench size={32} />,
      title: "Premium Wash & Wax",
      description: "Wash plus gloss and short-term protection.",
      features: ["Deluxe Wash", "Clay Bar Treatment", "Wax Application", "Trim Dressing", "Tire Shine"],
      addon: ['Ceramic Spray Sealant'],
      duration: "90-120 minutes",
      warranty: "1 day"
    },
    {
      id: 4,
      icon: <Shield size={32} />,
      title: "Machine Compound & Polish",
      description: "Paint correction to improve shine and reduce visible defects—no repaint.",
      features: ["Dual-action correction", "Reduces swirls/oxidation", "Deep gloss & clarity", "Sealant/wax included"],
      included: ["Foam pre-wash", "Iron remover", "Clay bar", "Test spot", "1-2 machine stages (compound then polish)", "IPA wipe-down", "Sealant/wax"],
      goodFor: ["Light/medium swirls", "Haze", "Water Spots", "Oxidation", "Minor clear-coat scratches"],
      addon: ['Ceramic Coating', "Headlight Restoration", "Touch-up (select colors)"],
      duration: "2-6 hours (heavily oxidized vehicles may require a full day)",
      warranty: "1 week"
    },
    {
      id: 5,
      icon: <Shield size={32} />,
      title: "Headlight Polish / Restoration",
      description: "Restore lens clarity by leveling oxidation, polishing, and sealing.",
      features: ["Remove Yellow Haze", "Improve Night Visibility", "UV sealant applied", "Same-day Service"],
      included: ["Mask & Clean", "Decontaminate", "Wet-Sand(as needed)", "Machine Compound & Polish", "UV Sealant/Clear Application", "Cure & Inspection"],
      addon: ['Aim Check/Adjust', "Upgraded Bulbs", "Ceramic Topcoat"],
      duration: "45-90 minutes(per pair) plus curing time",
      warranty: "1 week"
    },
    {
      id: 6,
      icon: <Shield size={32} />,
      title: "Fleet Vehicle Hand Wash (Size-Based)",
      description: "Keep your company vehicles clean with flexible scheduling.",
      features: ["Size-Tiered Pricing", "Fast Turnaround", "Volume Discounts", "After-Hours Service"],
      included: ["Sedan/Coupe: Wash & dry • windows • tire shine (~20–30 min)", "Small SUV/Crossover: + wheel faces (~25-35 min)", "Large SUV/Pickup: + wheel wells & steps (~30-40 min)", "Cargo Van: Body wash • mirrors • step/bumper • wheel wells (~35-45 min)", "Step Van/EDV: Body & cab wash • accessible roof areas • door-track rinse (~45-60 min)", "Box Truck 12-16: Cab + box panels • rear door/bumper (~45-75 min)", "Box Truck 20-26: Cab + box panels • rear door/deck/bumper (~60-90 min)"],
      addon: ['Interior vacuum & wipe-down', "Bug/tar Removal", "Wheel Decontamination", "Engine bay wipe (by request)", "Ceramic spray sealant"],
      duration: "Varies by vehicle size and add-ons",
      warranty: "1 week"
    },
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
    <section className="services-section" id="services-two">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2>Services</h2>
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
            className={`tab-btn ${activeTab === 'mechanic' ? 'active' : ''}`}
            onClick={() => setActiveTab('mechanic')}
          >
            <Wrench size={20} />
            Mechanic
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bodywork' ? 'active' : ''}`}
            onClick={() => setActiveTab('bodywork')}
          >
            <Shield size={20} />
            Body Work
          </button>
          <button 
            className={`tab-btn ${activeTab === 'wheelsAndTires' ? 'active' : ''}`}
            onClick={() => setActiveTab('wheelsAndTires')}
          >
            <Award size={20} />
            Wheels & Tires
          </button>
          <button 
            className={`tab-btn ${activeTab === 'carWash' ? 'active' : ''}`}
            onClick={() => setActiveTab('carWash')}
          >
            <Users size={20} />
            Hand Wash & Detailing
          </button>
        </motion.div>

        <div className="tab-content">
          {activeTab === 'mechanic' && (
            <motion.div 
              className="services-grid"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
            >
              {mechanic.map((service, index) => (
                <motion.div 
                  key={service.id}
                  className="service-card clickable"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => handleCardClick(service)}
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
                  
                  <button className="view-details-btn">
                    View Full Details
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'bodywork' && (
            <motion.div 
              className="services-grid"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
            >
              {bodywork.map((service, index) => (
                <motion.div 
                  key={service.id}
                  className="service-card clickable"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => handleCardClick(service)}
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
                  
                  <button className="view-details-btn">
                    View Full Details
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'carWash' && (
            <motion.div 
              className="services-grid"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
            >
              {carWash.map((service, index) => (
                <motion.div 
                  key={service.id}
                  className="service-card clickable"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => handleCardClick(service)}
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
                  
                  <button className="view-details-btn">
                    View Full Details
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

         {activeTab === 'wheelsAndTires' && (
            <motion.div 
              className="services-grid"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
            >
              {wheelsAndTires.map((service, index) => (
                <motion.div 
                  key={service.id}
                  className="service-card clickable"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => handleCardClick(service)}
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
                  
                  <button className="view-details-btn">
                    View Full Details
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
          
        </div>
      </div>
      
      {/* Service Details Modal */}
      <ServiceDetailsModal 
        service={selectedService}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default ServicesTwo;

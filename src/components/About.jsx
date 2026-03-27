// components/About.jsx
import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>About KilimoSTAT</h1>
            <p className="about-subtitle">
              Kenya's Agricultural Open Data Platform
            </p>
            <p className="about-description">
              Empowering food security and agricultural transformation through 
              accessible, reliable, and actionable data.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-mission-vision">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mission-card">
              <div className="card-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Our Mission</h3>
              <p>
                To provide comprehensive, high-quality agricultural data that empowers 
                policymakers, researchers, farmers, and stakeholders to make informed 
                decisions for sustainable agricultural development in Kenya.
              </p>
            </div>
            <div className="vision-card">
              <div className="card-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Our Vision</h3>
              <p>
                A food-secure Kenya where data-driven insights drive agricultural 
                innovation, resilience, and prosperity for all citizens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="about-overview">
        <div className="container">
          <div className="overview-content">
            <div className="overview-text">
              <h2>What is KilimoSTAT?</h2>
              <p>
                KilimoSTAT is the official open data platform of Kenya's Ministry of 
                Agriculture and Livestock Development. Launched to democratize access 
                to agricultural data, KilimoSTAT serves as a centralized hub for 
                comprehensive statistics, real-time market information, and analytical 
                tools covering Kenya's agricultural sector.
              </p>
              <p>
                By adhering to FAIR data principles (Findable, Accessible, Interoperable, 
                and Reusable), KilimoSTAT ensures that all datasets are easily discoverable, 
                accessible through modern APIs, and ready for integration with other 
                systems and applications.
              </p>
            </div>
            <div className="overview-stats">
              <div className="stat-badge">
                <i className="fas fa-database"></i>
                <div>
                  <h4>480+</h4>
                  <p>Datasets</p>
                </div>
              </div>
              <div className="stat-badge">
                <i className="fas fa-chart-line"></i>
                <div>
                  <h4>100,000+</h4>
                  <p>Data Points</p>
                </div>
              </div>
              <div className="stat-badge">
                <i className="fas fa-globe"></i>
                <div>
                  <h4>100%</h4>
                  <p>Open Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAIR Principles Section */}
      <section className="about-fair">
        <div className="container">
          <div className="section-header">
            <h2>FAIR Data Principles</h2>
            <p className="section-subhead">
              Our commitment to making agricultural data truly valuable
            </p>
          </div>
          <div className="fair-grid-detailed">
            <div className="fair-principle">
              <div className="principle-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Findable</h3>
              <p>All datasets have persistent DOIs and rich metadata for easy discovery</p>
            </div>
            <div className="fair-principle">
              <div className="principle-icon">
                <i className="fas fa-unlock-alt"></i>
              </div>
              <h3>Accessible</h3>
              <p>Open APIs with standard protocols (HTTPS, OAuth) for seamless integration</p>
            </div>
            <div className="fair-principle">
              <div className="principle-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <h3>Interoperable</h3>
              <p>Multiple formats including CSV, JSON, GeoJSON, and RDF</p>
            </div>
            <div className="fair-principle">
              <div className="principle-icon">
                <i className="fas fa-recycle"></i>
              </div>
              <h3>Reusable</h3>
              <p>CC BY 4.0 licensing with clear provenance and documentation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="about-features">
        <div className="container">
          <div className="section-header">
            <h2>Key Features</h2>
            <p className="section-subhead">
              What makes KilimoSTAT your go-to agricultural data platform
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-chart-simple"></i>
              <h3>Interactive Dashboards</h3>
              <p>Real-time visualizations and analytics for key agricultural indicators</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-download"></i>
              <h3>Bulk Data Export</h3>
              <p>Download complete datasets in multiple formats for offline analysis</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-code"></i>
              <h3>Developer API</h3>
              <p>RESTful API for programmatic access to all agricultural data</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-map-marked-alt"></i>
              <h3>Geospatial Data</h3>
              <p>County-level mapping and spatial analysis tools</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-chart-line"></i>
              <h3>Market Intelligence</h3>
              <p>Daily price monitoring and market trend analysis</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-bell"></i>
              <h3>Real-time Alerts</h3>
              <p>Subscribe to notifications for data updates and market changes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="about-sources">
        <div className="container">
          <div className="sources-content">
            <div className="sources-text">
              <h2>Our Data Sources</h2>
              <p>
                KilimoSTAT aggregates data from multiple trusted sources across Kenya's 
                agricultural sector:
              </p>
              <ul className="sources-list">
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Ministry of Agriculture and Livestock Development</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Kenya National Bureau of Statistics (KNBS)</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>County Governments Agricultural Departments</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Ministry of Helath</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Ministry of Education</span>
                </li>             
               
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Agriculture and Food Authority (AFA)</span>
                </li>               
                
              </ul>
            </div>
            <div className="sources-image">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="container">
          <div className="section-header">
            <h2>Our Team</h2>
            <p className="section-subhead">
              Dedicated professionals committed to agricultural data excellence
            </p>
          </div>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <h4>Ministry</h4>
              <p>Policy and Strategy</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">
                <i className="fas fa-chart-line"></i>
              </div>
              <h4>Data Analytics Team</h4>
              <p>Data Processing & Visualization</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">
                <i className="fas fa-code"></i>
              </div>
              <h4>Development Team</h4>
              <p>Platform Engineering & API Development</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
              <h4>Stakeholder Engagement</h4>
              <p>User Support & Capacity Building</p>
            </div>
          </div>
        </div>
      </section>


       {/* Partners Section */}
      <section className="about-partners">
        <div className="container">
          <div className="section-header">
            <h2>Our Partners</h2>
            <p className="section-subhead">
              Collaborating for agricultural transformation
            </p>
          </div>
          <div className="partners-grid">
            <div className="partner-logo">
              <img src='/img/knbs.png' />
             
            </div>
            <div className="partner-logo">
              <img src='/img/kalro.png' />
              
            </div>
            
            <div className="partner-logo">
              <img src='/img/gain.jpg' />
             
            </div>
            <div className="partner-logo">
              <img src='/img/kcsap.png' />
              
            </div>
            <div className="partner-logo">
              <i className="fas fa-globe"></i>
              <span>More</span>
            </div>
          </div>
        </div>
      </section>

   

      {/* Contact Section */}
      <section className="about-contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-text">
              <h2>Get in Touch</h2>
              <p>
                Have questions about KilimoSTAT or need assistance with our data?
                We're here to help!
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>info@kilimostat.go.ke</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>+254 20 123 4567</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Ministry of Agriculture, Kilimo House, Nairobi, Kenya</span>
                </div>
              </div>
            </div>
            <div className="contact-cta">
              <button className="btn btn-primary" onClick={() => window.open('mailto:info@kilimostat.go.ke')}>
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
              <button className="btn-outline" onClick={() => window.open('/api/swagger/', '_blank')}>
                <i className="fas fa-code"></i> Explore API
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
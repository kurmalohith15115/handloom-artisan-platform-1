import React from 'react';

const AboutUs = () => {
  return (
    <div className="main-content container" style={{ marginTop: '50px' }}>
      <h1 className="section-title">Our Heritage & Mission</h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="review-card" style={{ borderLeftColor: 'var(--primary)' }}>
          <h2 style={{ color: 'var(--secondary)', marginBottom: '10px' }}>Our Mission</h2>
          <p>
            To bridge the gap between Indian handloom weavers and modern patrons. By removing intermediaries and middlemen, we ensure that artisans receive the rightful value for their painstaking craftsmanship, while customers gain access to verified, authenticated handloom garments directly.
          </p>
        </div>

        <div className="review-card" style={{ borderLeftColor: 'var(--accent)' }}>
          <h2 style={{ color: 'var(--secondary)', marginBottom: '10px' }}>Our Vision</h2>
          <p>
            To create a digitally empowered rural community where traditional weaving forms (like Pochampally, Kanjeevaram, and Banarasi Silk) thrive, offering sustainable livelihood opportunities for future generations of artisans.
          </p>
        </div>

        <div className="review-card" style={{ borderLeftColor: 'var(--secondary)' }}>
          <h2 style={{ color: 'var(--secondary)', marginBottom: '10px' }}>Community Impact</h2>
          <p>
            Every purchase made on the platform goes directly to the weaver's bank account. This provides them with the immediate financial liquidity to procure high-quality yarn, pay their weavers and spinners, and support their families. Over 500 weaving families have seen an average increase of 45% in their monthly earnings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

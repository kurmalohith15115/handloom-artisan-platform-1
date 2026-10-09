import React from 'react';
import { useLanguage } from '../translations/translate';

const ArtisanCard = ({ artisan }) => {
  const { t } = useLanguage();

  return (
    <div className="artisan-card">
      <img 
        src={artisan.profile_image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'} 
        alt={artisan.artisan_name || artisan.name} 
        className="artisan-card-image"
      />
      <div className="artisan-card-info">
        <h3 className="artisan-card-name">{artisan.artisan_name || artisan.name}</h3>
        <span className="artisan-card-craft">{artisan.craft_type}</span>
        <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', marginBottom: '8px' }}>
          💼 {artisan.experience} {t('home.experience')}
        </span>
        <p className="artisan-card-desc">{artisan.description}</p>
        
        {artisan.address && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            📍 <span>{artisan.address}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanCard;

import React from 'react';
import HorizontalGallery from './HorizontalGallery';

const Gallery: React.FC = () => {
  return (
    <section id="gallery"> {/* Keep ID for navigation */}
      <HorizontalGallery />
    </section>
  );
};

export default Gallery;

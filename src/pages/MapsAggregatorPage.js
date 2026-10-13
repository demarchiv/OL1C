import React from 'react';

/*
 * Maps Aggregator (reachable only via #/mapsaggregator, not linked from the menu).
 * The tool itself is a self-contained page in public/maps-aggregator/index.html;
 * this route shows it full-screen.
 */
function MapsAggregatorPage() {
  return (
    <iframe
      title="OL-in-One Compass · Maps Aggregator"
      src={`${process.env.PUBLIC_URL}/maps-aggregator/index.html`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 0,
        background: '#f4f8fb',
        zIndex: 10,
      }}
    />
  );
}

export default MapsAggregatorPage;

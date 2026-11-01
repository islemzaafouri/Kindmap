(async function () {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  const map = L.map('map').setView([36.8, 10.2], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Heart-shaped marker (uses Font Awesome, styled in style.css)
  const heartIcon = L.divIcon({
    className: 'heart-marker',
    html: '<i class="fas fa-heart"></i>',
    iconSize: [32, 32],
    iconAnchor: [16, 30],   // the point of the heart touches the location
    popupAnchor: [0, -28]   // the popup opens above the heart
  });

  const { data: pins, error } = await db
    .from('pins')
    .select('id, title, description, location_name, lat, lng, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Could not load pins:', error.message);
    return;
  }

  pins.forEach((pin) => {
    L.marker([pin.lat, pin.lng], { icon: heartIcon })
      .addTo(map)
      .bindPopup(`
        <strong>${escapeHtml(pin.title)}</strong><br>
        <small>${escapeHtml(pin.location_name || '')}</small><br>
        <p>${escapeHtml(pin.description)}</p>
        <small>${formatDate(pin.created_at)}</small>
      `);
  });
})();
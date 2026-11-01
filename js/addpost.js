(async function () {
  const form = document.getElementById('post-form');
  if (!form) return;

  const session = await requireAuth();
  if (!session) return;

  const msg = document.getElementById('post-msg');
  const locationInput = document.getElementById('post-location');
  const findBtn = document.getElementById('find-location');

  // Map used to pick the location
  const map = L.map('pick-map').setView([36.8, 10.2], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let marker = null;
  function setMarker(latlng) {
    if (marker) marker.setLatLng(latlng);
    else marker = L.marker(latlng).addTo(map);
  }

  map.on('click', (e) => setMarker(e.latlng));

  // Optional: type a place name and jump to it (OpenStreetMap Nominatim)
  findBtn.addEventListener('click', async () => {
    const q = locationInput.value.trim();
    if (!q) return;
    msg.textContent = '';
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      );
      const results = await res.json();
      if (!results.length) {
        msg.textContent = 'Place not found. Click on the map instead.';
        return;
      }
      const latlng = L.latLng(Number(results[0].lat), Number(results[0].lon));
      map.setView(latlng, 13);
      setMarker(latlng);
    } catch {
      msg.textContent = 'Search failed. Click on the map instead.';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    const title = document.getElementById('post-title').value.trim();
    const description = document.getElementById('post-description').value.trim();
    const location_name = locationInput.value.trim();

    if (!title || !description) {
      msg.textContent = 'Please fill in the title and the description.';
      return;
    }
    if (!marker) {
      msg.textContent = 'Click on the map to choose where it happened.';
      return;
    }

    const { lat, lng } = marker.getLatLng();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    const { error } = await db.from('pins').insert({
      user_id: session.user.id,
      title,
      description,
      location_name,
      lat,
      lng
    });

    if (error) {
      msg.textContent = error.message;
      submitBtn.disabled = false;
      return;
    }

    window.location.href = 'profile.html';
  });
})();

const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authForm = document.getElementById('auth-form');
const authSubmit = document.getElementById('auth-submit');
const switchText = document.getElementById('switch-text');
const switchLink = document.getElementById('switch-link');
const authMsg = document.getElementById('auth-msg');
const authNameGroup = document.querySelectorAll('.input-group.hidden');

let isSignIn = true;

if (switchLink) {
    switchLink.addEventListener('click', () => {
        isSignIn = !isSignIn;

        if (isSignIn) {
            authTitle.textContent = 'Sign in';
            authSubtitle.textContent = 'Enter your credentials to access your account';
            authSubmit.textContent = 'Sign In';
            switchText.textContent = 'Don’t have an account?';
            switchLink.textContent = 'Sign Up';
            authNameGroup.forEach(group => group.classList.add('hidden'));
        } else {
            authTitle.textContent = 'Sign up';
            authSubtitle.textContent = 'Create an account to start your kindness journey';
            authSubmit.textContent = 'Sign Up';
            switchText.textContent = 'Already have an account?';
            switchLink.textContent = 'Sign In';
            authNameGroup.forEach(group => group.classList.remove('hidden'));
        }

        authMsg.textContent = '';
    });
}

// Form validation and messaging
if (authForm) {
    authForm.addEventListener('submit', (event) => {
        event.preventDefault();
        authMsg.textContent = '';

        const name = document.getElementById('auth-name').value.trim();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const confirmPassword = document.getElementById('auth-confirm-password').value;

        if (!email) {
            authMsg.textContent = 'Please enter your email address.';
            return;
        }

        // Basic email format check
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            authMsg.textContent = 'Please enter a valid email address.';
            return;
        }

        if (!password) {
            authMsg.textContent = 'Please enter your password.';
            return;
        }

        if (password.length < 6) {
            authMsg.textContent = 'Password must be at least 6 characters long.';
            return;
        }

        if (!isSignIn) {
            if (!name) {
                authMsg.textContent = 'Please enter your full name.';
                return;
            }

            if (!confirmPassword) {
                authMsg.textContent = 'Please confirm your password.';
                return;
            }

            if (password !== confirmPassword) {
                authMsg.textContent = 'Passwords do not match.';
                return;
            }

            authMsg.textContent = 'Account created! (Demo only, no backend connected.)';
            return;
        }

        // Sign in flow (demo only)
        authMsg.textContent = 'Signed in! (Demo only, no backend connected.)';
    });
}

const form = document.getElementById('post-form');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('post-title').value.trim();
        const description = document.getElementById('post-description').value.trim();
        const locationInput = document.getElementById('post-location');
        const location = locationInput ? locationInput.value.trim() : '';

        if (!title || !description) return;

        // Generate a random slight location variation around [36.8, 10.2]
        const lat = 36.8 + (Math.random() - 0.5) * 5;
        const lng = 10.2 + (Math.random() - 0.5) * 5;

        const post = { title, description, location, lat, lng };

        // Get old posts
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        posts.push(post);
        localStorage.setItem('posts', JSON.stringify(posts));

        // Redirect to the home page so they see it on the map immediately!
        window.location.href = '../index.html';
    });
}

const mapContainer = document.getElementById('map');
if (mapContainer) {
    const map = L.map('map').setView([36.8, 10.2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([36.8, 10.2]).addTo(map)
        .bindPopup('Someone helped a starry dog today 💛', { autoClose: false, closeOnClick: false })
        .openPopup();

    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.forEach(post => {
        // Use random coordinates for older posts that didn't have them
        const lat = post.lat || (36.8 + (Math.random() - 0.5) * 5);
        const lng = post.lng || (10.2 + (Math.random() - 0.5) * 5);

        L.marker([lat, lng]).addTo(map)
            .bindPopup(`<strong>${post.title}</strong><br><small>${post.location || ''}</small>`, { autoClose: false, closeOnClick: false })
            .openPopup();
    });
}



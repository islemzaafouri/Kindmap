/// Works from index.html (root) and from pages/*.html
const IN_PAGES = window.location.pathname.includes('/pages/');
const PAGES = IN_PAGES ? '' : 'pages/';
const HOME = IN_PAGES ? '../index.html' : 'index.html';

async function getSession() {
  const { data } = await db.auth.getSession();
  return data.session;
}

// Call on protected pages: redirects to login if nobody is logged in
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = PAGES + 'login.html';
    return null;
  }
  return session;
}

// Navbar: "Login" becomes "Profile" + "Logout" when logged in
async function updateNavbar() {
  const session = await getSession();
  if (!session) return;

  const loginLink = document.querySelector('.login-btn');
  if (loginLink) {
    loginLink.textContent = 'Profile';
    loginLink.href = PAGES + 'profile.html';

    const li = document.createElement('li');
    const logout = document.createElement('a');
    logout.href = '#';
    logout.textContent = 'Logout';
    logout.className = 'logout-btn';
    logout.addEventListener('click', async (e) => {
      e.preventDefault();
      await db.auth.signOut();
      window.location.href = HOME;
    });
    li.appendChild(logout);
    loginLink.closest('li').after(li);
  }

  // "Be kind" buttons that point to login should go to addpost when logged in
  document.querySelectorAll('a.btn-primary[href$="login.html"]').forEach((a) => {
    a.href = PAGES + 'addpost.html';
  });
}

// Turns Supabase error messages into friendly ones
function friendlyAuthError(error) {
  const m = (error.message || '').toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'Incorrect email or password, or this account doesn’t exist. Try signing up.';
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email first (check your inbox).';
  }
  if (m.includes('already registered')) {
    return 'An account with this email already exists. Try signing in.';
  }
  if (m.includes('rate limit')) {
    return 'Too many attempts. Please wait a while and try again.';
  }
  return error.message;
}

// Login / signup form (only runs on login.html)
(function initAuthForm() {
  const authForm = document.getElementById('auth-form');
  if (!authForm) return;

  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const authSubmit = document.getElementById('auth-submit');
  const switchText = document.getElementById('switch-text');
  const switchLink = document.getElementById('switch-link');
  const authMsg = document.getElementById('auth-msg');
  const authNameGroup = document.querySelectorAll('.input-group.hidden');

  let isSignIn = true;

  switchLink.addEventListener('click', () => {
    isSignIn = !isSignIn;

    if (isSignIn) {
      authTitle.textContent = 'Sign in';
      authSubtitle.textContent = 'Enter your credentials to access your account';
      authSubmit.textContent = 'Sign In';
      switchText.textContent = 'Don’t have an account?';
      switchLink.textContent = 'Sign Up';
      authNameGroup.forEach((g) => g.classList.add('hidden'));
    } else {
      authTitle.textContent = 'Sign up';
      authSubtitle.textContent = 'Create an account to start your kindness journey';
      authSubmit.textContent = 'Sign Up';
      switchText.textContent = 'Already have an account?';
      switchLink.textContent = 'Sign In';
      authNameGroup.forEach((g) => g.classList.remove('hidden'));
    }
    authMsg.textContent = '';
  });

  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    authMsg.textContent = '';
    authMsg.style.color = '';

    const name = document.getElementById('auth-name').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const confirmPassword = document.getElementById('auth-confirm-password').value;

    if (!email) { authMsg.textContent = 'Please enter your email address.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      authMsg.textContent = 'Please enter a valid email address.'; return;
    }
    if (!password) { authMsg.textContent = 'Please enter your password.'; return; }
    if (password.length < 6) {
      authMsg.textContent = 'Password must be at least 6 characters long.'; return;
    }
    if (!isSignIn) {
      if (!name) { authMsg.textContent = 'Please enter your full name.'; return; }
      if (!confirmPassword) { authMsg.textContent = 'Please confirm your password.'; return; }
      if (password !== confirmPassword) { authMsg.textContent = 'Passwords do not match.'; return; }
    }

    authSubmit.disabled = true;
    try {
      if (isSignIn) {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) { authMsg.textContent = friendlyAuthError(error); return; }
        window.location.href = HOME;
      } else {
        const { data, error } = await db.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) { authMsg.textContent = friendlyAuthError(error); return; }

        if (data.session) {
          window.location.href = HOME;        // email confirmation disabled
        } else {
          authMsg.style.color = '#2e7d32';    // email confirmation enabled
          authMsg.textContent = 'Account created! Check your email to confirm your account.';
        }
      }
    } finally {
      authSubmit.disabled = false;
    }
  });
})();

updateNavbar();
<script lang="ts">
  import { Router, Route, Link, navigate } from 'svelte-routing';
  import { authStore } from './stores/auth';
  import Navigation from './components/Navigation.svelte';
  import Login from './routes/login/+page.svelte';
  import Register from './routes/register/+page.svelte';
  import Home from './routes/+page.svelte';
  import Artists from './routes/artists/+page.svelte';
  import Albums from './routes/albums/+page.svelte';
  import Locations from './routes/locations/+page.svelte';
  import Genres from './routes/genres/+page.svelte';
  import CompactDiscs from './routes/compact-discs/+page.svelte';
  import { onMount } from 'svelte';
  import { authService } from './services/auth';

  let isInitialized = false;

  onMount(async () => {
    console.log('Router mounted, initializing auth...');
    // Initialize auth state from localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      authStore.setTokens(accessToken, refreshToken);
      // Fetch user data after setting tokens
      try {
        await authService.getCurrentUser();
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        authStore.logout();
      }
    }
    isInitialized = true;
    console.log('Auth initialized:', $authStore.isAuthenticated);
  });

  // Check authentication on route change, but only after initialization
  $: {
    console.log('Auth state changed:', {
      isInitialized,
      isAuthenticated: $authStore.isAuthenticated,
      currentPath: window.location.pathname
    });
    if (isInitialized && !$authStore.isAuthenticated && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      console.log('Redirecting to login...');
      navigate('/login');
    }
  }
</script>

<Router>
  <Navigation />
  <div class="min-h-screen bg-gray-100">
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    {#if $authStore.isAuthenticated || !isInitialized}
      <Route path="/" component={Home} />
      <Route path="/artists" component={Artists} />
      <Route path="/albums" component={Albums} />
      <Route path="/locations" component={Locations} />
      <Route path="/genres" component={Genres} />
      <Route path="/compact-discs" component={CompactDiscs} />
    {/if}
  </div>
</Router>
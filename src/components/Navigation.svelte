<script lang="ts">
  import { Link, navigate } from 'svelte-routing';
  import { authStore } from '../stores/auth';
  import { authService } from '../services/auth';
  import { onMount } from 'svelte';

  let isUserMenuOpen = false;

  function handleLogout() {
    console.log('Logging out...');
    authService.logout();
    navigate('/login');
  }

  function toggleUserMenu() {
    console.log('Toggling user menu:', !isUserMenuOpen);
    isUserMenuOpen = !isUserMenuOpen;
  }

  function getUserInitial(): string {
    const email = $authStore.user?.email;
    return email ? email[0].toUpperCase() : 'U';
  }

  // Close menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#user-menu-button') && !target.closest('#user-menu')) {
      isUserMenuOpen = false;
    }
  }

  // Add click outside listener
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <span class="text-xl font-bold text-indigo-600">Music Archive</span>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
          {#if $authStore.isAuthenticated}
            <div class="flex items-center space-x-8">
              <Link
                to="/"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                let:active
              >
                <span class:border-b-2={active} class:border-indigo-500={active} class:text-gray-900={active} class:text-gray-500={!active}>
                  Compact Discs
                </span>
              </Link>
              <Link
                to="/artists"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                let:active
              >
                <span class:border-b-2={active} class:border-indigo-500={active} class:text-gray-900={active} class:text-gray-500={!active}>
                  Artists
                </span>
              </Link>
              <Link
                to="/albums"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                let:active
              >
                <span class:border-b-2={active} class:border-indigo-500={active} class:text-gray-900={active} class:text-gray-500={!active}>
                  Albums
                </span>
              </Link>
              <Link
                to="/locations"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                let:active
              >
                <span class:border-b-2={active} class:border-indigo-500={active} class:text-gray-900={active} class:text-gray-500={!active}>
                  Locations
                </span>
              </Link>
              <Link
                to="/genres"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                let:active
              >
                <span class:border-b-2={active} class:border-indigo-500={active} class:text-gray-900={active} class:text-gray-500={!active}>
                  Genres
                </span>
              </Link>
            </div>
          {/if}
        </div>
      </div>

      {#if $authStore.isAuthenticated}
        <div class="flex items-center">
          <div class="relative ml-3" id="user-menu-container">
            <button
              type="button"
              id="user-menu-button"
              class="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              on:click={toggleUserMenu}
            >
              <span class="sr-only">Open user menu</span>
              <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                {getUserInitial()}
              </div>
            </button>

            {#if isUserMenuOpen}
              <div
                id="user-menu"
                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
              >
                <div class="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  Hi, {$authStore.user?.email}
                </div>
                <button
                  class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  on:click={handleLogout}
                >
                  Sign out
                </button>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</nav>
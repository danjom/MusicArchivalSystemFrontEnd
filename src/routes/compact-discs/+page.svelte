<script lang="ts">
  import { compactDiscsService } from '../../services/compactDiscs';
  import { artistsService } from '../../services/artists';
  import { albumsService } from '../../services/albums';
  import { genresService } from '../../services/genres';
  import { locationsService } from '../../services/locations';
  import type { CompactDiscData, CompactDiscCreate, SearchResponse, SearchResult } from '../../services/compactDiscs';
  import type { Artist } from '../../models/types';
  import type { Album } from '../../models/types';
  import type { GenreData } from '../../services/genres';
  import type { LocationData } from '../../services/locations';
  import { onMount } from 'svelte';
  import { authStore } from '../../stores/auth';
  import DataTable from '../../components/DataTable.svelte';
  import Modal from '../../components/Modal.svelte';

  let compactDiscs: CompactDiscData[] = [];
  let artists: Artist[] = [];
  let albums: Album[] = [];
  let genres: GenreData[] = [];
  let locations: LocationData[] = [];
  let loading = true;
  let error: string | null = null;
  let showCreateModal = false;
  let showDeleteModal = false;
  let showViewModal = false;
  let compactDiscToDelete: CompactDiscData | null = null;
  let compactDiscToView: CompactDiscData | null = null;
  let currentStep = 1;
  let searchQuery = '';
  let searchResults: SearchResult[] = [];
  let showSearchResults = false;
  let searchTimeout: ReturnType<typeof setTimeout>;
  let newCompactDisc: CompactDiscCreate = {
    name: '',
    description: '',
    notes: '',
    is_favorite: false,
    artist_ids: [],
    album_id: null,
    genre_id: null,
    location_id: null
  };

  let currentPage = 1;
  let pageSize = 10;
  let totalItems = 0;
  let totalPages = 0;

  $: {
    totalItems = compactDiscs.length;
    totalPages = Math.ceil(totalItems / pageSize);
  }

  function getPaginatedItems(items: CompactDiscData[]) {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  function resetForm() {
    currentStep = 1;
    newCompactDisc = {
      name: '',
      description: '',
      notes: '',
      is_favorite: false,
      artist_ids: [],
      album_id: null,
      genre_id: null,
      location_id: null
    };
    error = null;
  }

  function openCreateModal() {
    resetForm();
    showCreateModal = true;
  }

  async function loadCompactDiscs() {
    try {
      console.log('Loading compact discs...');
      const response = await compactDiscsService.getAll();
      console.log('Compact discs response:', response);
      compactDiscs = Array.isArray(response) ? response : response.items || [];
      console.log('First compact disc:', compactDiscs[0]);
      totalItems = compactDiscs.length;
      totalPages = Math.ceil(totalItems / pageSize);
    } catch (err) {
      console.error('Error loading compact discs:', err);
      if (err instanceof Error) {
        if (err.message === 'Authentication required') {
          error = 'Please login to view compact discs.';
        } else {
          error = err.message;
        }
      } else {
        error = 'Failed to load compact discs. Please try again later.';
      }
    }
  }

  async function loadArtists() {
    try {
      console.log('Loading artists...');
      const response = await artistsService.getAll();
      console.log('Artists response:', response);
      artists = response;
      console.log('Processed artists:', artists);
    } catch (e) {
      console.error('Error loading artists:', e);
      error = 'Failed to load artists. Please try again later.';
    }
  }

  async function loadAlbums() {
    try {
      console.log('Loading albums...');
      const response = await albumsService.getAll();
      console.log('Albums response:', response);
      albums = response;
      console.log('Processed albums:', albums);
    } catch (e) {
      console.error('Error loading albums:', e);
      error = 'Failed to load albums. Please try again later.';
    }
  }

  async function loadGenres() {
    try {
      console.log('Loading genres...');
      const response = await genresService.getAll();
      console.log('Genres response:', response);
      genres = response;
      console.log('Processed genres:', genres);
    } catch (e) {
      console.error('Error loading genres:', e);
      error = 'Failed to load genres. Please try again later.';
    }
  }

  async function loadLocations() {
    try {
      console.log('Loading locations...');
      const response = await locationsService.getAll();
      console.log('Locations response:', response);
      locations = response;
      console.log('Processed locations:', locations);
    } catch (e) {
      console.error('Error loading locations:', e);
      error = 'Failed to load locations. Please try again later.';
    }
  }

  function nextStep() {
    if (!newCompactDisc.name) {
      error = 'Name is required';
      return;
    }

    if (!/^[A-Z]/.test(newCompactDisc.name)) {
      error = 'Name must start with a capital letter';
      return;
    }

    error = null;
    currentStep = 2;
  }

  function prevStep() {
    currentStep = 1;
  }

  async function handleSubmit() {
    try {
      if (newCompactDisc.artist_ids.length === 0) {
        error = 'At least one artist must be selected';
        return;
      }

      if (!newCompactDisc.location_id) {
        error = 'Location is required';
        return;
      }

      error = null;
      const createdCompactDisc = await compactDiscsService.create(newCompactDisc);
      compactDiscs = [...compactDiscs, createdCompactDisc];
      showCreateModal = false;
      currentStep = 1;
      newCompactDisc = {
        name: '',
        description: '',
        notes: '',
        is_favorite: false,
        artist_ids: [],
        album_id: null,
        genre_id: null,
        location_id: null
      };
    } catch (e) {
      console.error('Error creating compact disc:', e);
      error = 'Failed to create compact disc. Please try again later.';
    }
  }

  function confirmDelete(compactDisc: CompactDiscData) {
    compactDiscToDelete = compactDisc;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!compactDiscToDelete) return;

    try {
      await compactDiscsService.deleteCompactDisc(compactDiscToDelete.id);
      compactDiscs = compactDiscs.filter((cd) => cd.id !== compactDiscToDelete?.id);
      showDeleteModal = false;
      compactDiscToDelete = null;
    } catch (e) {
      console.error('Error deleting compact disc:', e);
      error = 'Failed to delete compact disc. Please try again later.';
    }
  }

  function viewCompactDisc(item: any) {
    const fullCompactDisc = compactDiscs.find(cd => cd.id === item.id);
    if (fullCompactDisc) {
      compactDiscToView = fullCompactDisc;
      showViewModal = true;
    }
  }

  function handleSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    searchQuery = input.value;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchQuery.length >= 3) {
      searchTimeout = setTimeout(async () => {
        try {
          const response = await compactDiscsService.search(searchQuery);
          searchResults = response.results;
          showSearchResults = true;
        } catch (e) {
          console.error('Error searching compact discs:', e);
          error = 'Failed to search compact discs. Please try again later.';
        }
      }, 300);
    } else {
      showSearchResults = false;
      searchResults = [];
    }
  }

  async function handleSearchResultClick(result: SearchResult) {
    try {
      loading = true;
      error = null;
      // Get compact discs by entity type and ID
      const response = await compactDiscsService.getByEntity(result.entity_type, result.entity_id);
      if (!response || response.length === 0) {
        error = `No compact discs found for ${result.name}`;
        compactDiscs = [];
      } else {
        compactDiscs = response;
        // Reset to first page when showing new results
        currentPage = 1;
        totalItems = compactDiscs.length;
        totalPages = Math.ceil(totalItems / pageSize);
      }
      // Clear all search-related state
      searchQuery = '';
      showSearchResults = false;
      searchResults = [];
    } catch (e) {
      console.error('Error loading compact discs:', e);
      error = 'Failed to load compact discs. Please try again later.';
    } finally {
      loading = false;
    }
  }

  function resetSearch() {
    searchQuery = '';
    showSearchResults = false;
    searchResults = [];
    currentPage = 1; // Reset to first page when clearing search
    loadCompactDiscs();
  }

  onMount(async () => {
    try {
      loading = true;
      error = null;
      authStore.initialize();
      await Promise.all([
        loadCompactDiscs(),
        loadArtists(),
        loadAlbums(),
        loadGenres(),
        loadLocations()
      ]);
    } catch (e) {
      console.error('Error loading data:', e);
      error = 'Failed to load data. Please try again later.';
    } finally {
      loading = false;
    }
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Compact Discs</h1>
    <div class="flex items-center space-x-4">
      <div class="relative">
        <input
          type="text"
          bind:value={searchQuery}
          on:input={handleSearchInput}
          class="shadow appearance-none border rounded w-64 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Search compact discs..."
        />
        {#if showSearchResults && searchResults.length > 0}
          <div class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
            {#each searchResults as result}
              <div
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                on:click={() => handleSearchResultClick(result)}
                on:keydown={(e) => e.key === 'Enter' && handleSearchResultClick(result)}
                role="button"
                tabindex="0"
              >
                <div class="font-medium">{result.name}</div>
                <div class="text-sm text-gray-500">
                  {result.entity_type.replace(/_/g, ' ').charAt(0).toUpperCase() + result.entity_type.replace(/_/g, ' ').slice(1)}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
      <button
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        on:click={resetSearch}
      >
        Clear
      </button>
      <button
        class="bg-[rgb(79_70_229)] hover:bg-[rgb(79_70_229)]/90 text-white px-4 py-2 rounded"
        on:click={openCreateModal}
      >
        Add Compact Disc
      </button>
    </div>
  </div>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <span class="block sm:inline">{error}</span>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  {:else if compactDiscs.length === 0}
    <div class="text-center py-12">
      <h3 class="text-lg font-medium text-gray-900">No compact discs found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by adding a new compact disc.</p>
      <button
        class="mt-4 bg-[rgb(79_70_229)] hover:bg-[rgb(79_70_229)]/90 text-white px-4 py-2 rounded"
        on:click={openCreateModal}
      >
        Add Compact Disc
      </button>
    </div>
  {:else}
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <DataTable
        headers={['Name', 'Location', 'Artists']}
        data={getPaginatedItems(compactDiscs).map(cd => ({
          name: cd.name || '',
          location: cd.location ? cd.location.name : '',
          artists: cd.artists ? cd.artists.map(artist => artist.name).join(', ') : '',
          id: cd.id,
          is_favorite: cd.is_favorite
        }))}
        loading={loading}
        emptyMessage="No compact discs found"
        emptyActionMessage="Get started by adding a new compact disc."
        onAddClick={() => (showCreateModal = true)}
        onDeleteClick={confirmDelete}
        onViewClick={viewCompactDisc}
        showDeleteButton={true}
        showViewButton={true}
        showFavoriteStar={true}
      />
      {#if totalPages > 1}
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              on:click={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              on:click={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to <span class="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of <span class="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  on:click={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                {#each Array(totalPages) as _, i}
                  {#if i + 1 === currentPage || i + 1 === currentPage - 1 || i + 1 === currentPage + 1 || i + 1 === 1 || i + 1 === totalPages}
                    <button
                      class={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        i + 1 === currentPage
                          ? 'z-10 bg-[rgb(79_70_229)] border-[rgb(79_70_229)] text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      on:click={() => goToPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  {:else if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) && i + 1 !== 1 && i + 1 !== totalPages}
                    <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  {/if}
                {/each}
                <button
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  on:click={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<Modal
  show={showCreateModal}
  title="Add New Compact Disc"
  onClose={() => {
    showCreateModal = false;
    resetForm();
  }}
  onSubmit={currentStep === 1 ? nextStep : handleSubmit}
  submitText={currentStep === 1 ? "Next" : "Add"}
  {error}
>
  <form on:submit|preventDefault={currentStep === 1 ? nextStep : handleSubmit}>
    {#if currentStep === 1}
      <div class="mb-4">
        <label for="name" class="block text-gray-700 text-sm font-bold mb-2">
          Name *
        </label>
        <input
          type="text"
          id="name"
          bind:value={newCompactDisc.name}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter compact disc name"
          required
        />
      </div>

      <div class="mb-4">
        <label for="description" class="block text-gray-700 text-sm font-bold mb-2">
          Description
        </label>
        <textarea
          id="description"
          bind:value={newCompactDisc.description}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="3"
          placeholder="Enter compact disc description"
        ></textarea>
      </div>

      <div class="mb-4">
        <label for="notes" class="block text-gray-700 text-sm font-bold mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          bind:value={newCompactDisc.notes}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="3"
          placeholder="Enter compact disc notes"
        ></textarea>
      </div>
    {:else}
      <div class="mb-4">
        <label for="location" class="block text-gray-700 text-sm font-bold mb-2">
          Location *
        </label>
        <select
          id="location"
          bind:value={newCompactDisc.location_id}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value={null}>Select a location</option>
          {#each locations as location}
            <option value={location.id}>{location.name}</option>
          {/each}
        </select>
      </div>

      <div class="mb-4">
        <label for="artists" class="block text-gray-700 text-sm font-bold mb-2">
          Artists *
        </label>
        <select
          id="artists"
          bind:value={newCompactDisc.artist_ids}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          multiple
          required
        >
          {#each artists as artist}
            <option value={artist.id}>{artist.name}</option>
          {/each}
        </select>
      </div>

      <div class="mb-4">
        <label for="album" class="block text-gray-700 text-sm font-bold mb-2">
          Album
        </label>
        <select
          id="album"
          bind:value={newCompactDisc.album_id}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value={null}>Select an album</option>
          {#each albums as album}
            <option value={album.id}>{album.name}</option>
          {/each}
        </select>
      </div>

      <div class="mb-4">
        <label for="genre" class="block text-gray-700 text-sm font-bold mb-2">
          Genre
        </label>
        <select
          id="genre"
          bind:value={newCompactDisc.genre_id}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value={null}>Select a genre</option>
          {#each genres as genre}
            <option value={genre.id}>{genre.name}</option>
          {/each}
        </select>
      </div>

      <div class="mb-4">
        <label class="flex items-center">
          <input
            type="checkbox"
            bind:checked={newCompactDisc.is_favorite}
            class="form-checkbox h-4 w-4 text-blue-500"
          />
          <span class="ml-2 text-gray-700 text-sm font-bold">Favorite</span>
        </label>
      </div>
    {/if}

    {#if currentStep === 2}
      <div class="flex justify-between mt-4">
        <button
          type="button"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          on:click={prevStep}
        >
          Back
        </button>
      </div>
    {/if}
  </form>
</Modal>

<Modal
  show={showDeleteModal}
  title="Confirm Delete"
  onClose={() => {
    showDeleteModal = false;
    compactDiscToDelete = null;
  }}
  onSubmit={handleDelete}
  submitText="Delete"
  submitButtonClass="bg-red-500 hover:bg-red-600 text-white"
>
  <p class="mb-4">Are you sure you want to delete the compact disc "{compactDiscToDelete?.name}"? This action cannot be undone.</p>
</Modal>

<Modal
  show={showViewModal}
  title="Compact Disc Details"
  onClose={() => {
    showViewModal = false;
    compactDiscToView = null;
  }}
  submitText="Close"
  onSubmit={() => {
    showViewModal = false;
    compactDiscToView = null;
  }}
>
  {#if compactDiscToView}
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Name</h3>
          <p class="mt-1 text-sm text-gray-500">{compactDiscToView.name}</p>
        </div>

        <div>
          <h3 class="text-lg font-medium text-gray-900">Description</h3>
          <p class="mt-1 text-sm text-gray-500 whitespace-pre-wrap">
            {compactDiscToView.description || 'No description available'}
          </p>
        </div>

        {#if compactDiscToView.notes}
          <div>
            <h3 class="text-lg font-medium text-gray-900">Notes</h3>
            <p class="mt-1 text-sm text-gray-500 whitespace-pre-wrap">{compactDiscToView.notes}</p>
          </div>
        {/if}

        <div>
          <h3 class="text-lg font-medium text-gray-900">Artists</h3>
          {#if compactDiscToView.artists && compactDiscToView.artists.length > 0}
            <ul class="mt-1 text-sm text-gray-500">
              {#each compactDiscToView.artists as artist}
                <li>{artist.name}</li>
              {/each}
            </ul>
          {:else}
            <p class="mt-1 text-sm text-gray-500">No artists assigned</p>
          {/if}
        </div>
      </div>

      <div class="space-y-4">
        {#if compactDiscToView.album}
          <div>
            <h3 class="text-lg font-medium text-gray-900">Album</h3>
            <p class="mt-1 text-sm text-gray-500">{compactDiscToView.album.name}</p>
          </div>
        {/if}

        {#if compactDiscToView.genre}
          <div>
            <h3 class="text-lg font-medium text-gray-900">Genre</h3>
            <p class="mt-1 text-sm text-gray-500">{compactDiscToView.genre.name}</p>
          </div>
        {/if}

        {#if compactDiscToView.location}
          <div>
            <h3 class="text-lg font-medium text-gray-900">Location</h3>
            <p class="mt-1 text-sm text-gray-500">{compactDiscToView.location.name}</p>
          </div>
        {/if}

        <div>
          <h3 class="text-lg font-medium text-gray-900">Favorite</h3>
          <p class="mt-1 text-sm text-gray-500">
            {compactDiscToView.is_favorite ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  {/if}
</Modal>
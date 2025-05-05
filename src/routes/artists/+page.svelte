<!-- Artists Management Page -->
<script lang="ts">
  import { artistsService } from '../../services/artists';
  import type { Artist } from '../../models/types';
  import { onMount } from 'svelte';
  import DataTable from '../../components/DataTable.svelte';
  import Modal from '../../components/Modal.svelte';

  let artists: Artist[] = [];
  let loading = true;
  let error: string | null = null;
  let showCreateModal = false;
  let showDeleteModal = false;
  let artistToDelete: Artist | null = null;
  let newArtist: Omit<Artist, 'id' | 'created_at' | 'updated_at'> = {
    name: '',
    description: '',
    is_favorite: false,
  };

  async function loadArtists() {
    try {
      loading = true;
      error = null;
      artists = await artistsService.getAll();
    } catch (e) {
      console.error('Error loading artists:', e);
      error = 'Failed to load artists. Please try again later.';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    try {
      if (!newArtist.name) {
        error = 'Name is required';
        return;
      }

      // Ensure name starts with capital letter
      if (!/^[A-Z]/.test(newArtist.name)) {
        error = 'Name must start with a capital letter';
        return;
      }

      error = null;
      const createdArtist = await artistsService.create(newArtist);
      artists = [...artists, createdArtist];
      showCreateModal = false;
      newArtist = {
        name: '',
        description: '',
        is_favorite: false,
      };
    } catch (e) {
      console.error('Error creating artist:', e);
      error = 'Failed to create artist. Please try again later.';
    }
  }

  function confirmDelete(artist: Artist) {
    artistToDelete = artist;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!artistToDelete) return;

    try {
      await artistsService.deleteArtist(artistToDelete.id);
      artists = artists.filter((artist) => artist.id !== artistToDelete?.id);
      showDeleteModal = false;
      artistToDelete = null;
    } catch (e) {
      console.error('Error deleting artist:', e);
      error = 'Failed to delete artist. Please try again later.';
    }
  }

  onMount(loadArtists);
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Artists</h1>
    <button
      class="bg-[rgb(79_70_229)] hover:bg-[rgb(79_70_229)]/90 text-white px-4 py-2 rounded"
      on:click={() => (showCreateModal = true)}
    >
      Add Artist
    </button>
  </div>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <span class="block sm:inline">{error}</span>
    </div>
  {/if}

  <DataTable
    headers={['Name', 'Description', 'Favorite']}
    data={artists}
    {loading}
    emptyMessage="No artists found"
    emptyActionMessage="Get started by adding a new artist."
    onAddClick={() => (showCreateModal = true)}
    onDeleteClick={confirmDelete}
    onViewClick={() => {}}
    showDeleteButton={true}
    showFavoriteStar={true}
  />
</div>

<Modal
  show={showCreateModal}
  title="Add New Artist"
  onClose={() => {
    showCreateModal = false;
    newArtist = {
      name: '',
      description: '',
      is_favorite: false,
    };
  }}
  onSubmit={handleSubmit}
  submitText="Add"
  {error}
>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-4">
      <label for="name" class="block text-gray-700 text-sm font-bold mb-2">
        Artist Name *
      </label>
      <input
        type="text"
        id="name"
        bind:value={newArtist.name}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter artist name"
        required
      />
    </div>

    <div class="mb-4">
      <label for="description" class="block text-gray-700 text-sm font-bold mb-2">
        Description
      </label>
      <textarea
        id="description"
        bind:value={newArtist.description}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        rows="3"
        placeholder="Enter artist description"
      ></textarea>
    </div>

    <div class="mb-4">
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={newArtist.is_favorite}
          class="form-checkbox h-4 w-4 text-blue-500"
        />
        <span class="ml-2 text-gray-700 text-sm font-bold">Favorite</span>
      </label>
    </div>
  </form>
</Modal>

<Modal
  show={showDeleteModal}
  title="Confirm Delete"
  onClose={() => {
    showDeleteModal = false;
    artistToDelete = null;
  }}
  onSubmit={handleDelete}
  submitText="Delete"
  submitButtonClass="bg-red-500 hover:bg-red-600 text-white"
>
  <p class="mb-4">Are you sure you want to delete the artist "{artistToDelete?.name}"? This action cannot be undone.</p>
</Modal>
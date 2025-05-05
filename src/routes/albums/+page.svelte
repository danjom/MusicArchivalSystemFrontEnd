<!-- Albums Management Page -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { albumsService, artistsService } from '../../services';
  import type { Album, Artist } from '../../models/types';
  import DataTable from '../../components/DataTable.svelte';
  import Modal from '../../components/Modal.svelte';

  let albums: Album[] = [];
  let artists: Artist[] = [];
  let loading = true;
  let error: string | null = null;
  let showCreateModal = false;
  let showDeleteModal = false;
  let albumToDelete: Album | null = null;
  let newAlbum: Omit<Album, 'id' | 'created_at' | 'updated_at'> = {
    name: '',
    artist_id: 0,
    is_favorite: false,
  };

  async function loadAlbums() {
    try {
      loading = true;
      error = null;
      const response = await albumsService.getAll();
      // Ensure all albums have a valid artist_id
      albums = response.map(album => ({
        ...album,
        artist_id: album.artist_id || 0,
      }));
    } catch (e) {
      if (e instanceof Error && e.message.includes('validation error')) {
        error = 'There was an issue with the album data. Please contact the administrator.';
      } else {
        error = e instanceof Error ? e.message : 'An error occurred while loading albums';
      }
      albums = [];
    } finally {
      loading = false;
    }
  }

  async function loadArtists() {
    try {
      artists = await artistsService.getAll();
    } catch (e) {
      console.error('Failed to load artists:', e);
      artists = [];
    }
  }

  async function handleSubmit() {
    try {
      if (!newAlbum.name) {
        error = 'Name is required';
        return;
      }

      if (!newAlbum.artist_id) {
        error = 'Please select an artist';
        return;
      }

      // Ensure the name starts with a capital letter
      const formattedName = newAlbum.name.charAt(0).toUpperCase() + newAlbum.name.slice(1);

      error = null;
      const createdAlbum = await albumsService.create({
        ...newAlbum,
        name: formattedName,
      });
      albums = [...albums, createdAlbum];
      showCreateModal = false;
      newAlbum = {
        name: '',
        artist_id: 0,
        is_favorite: false,
      };
    } catch (e) {
      console.error('Error creating album:', e);
      error = 'Failed to create album. Please try again later.';
    }
  }

  function confirmDelete(album: Album) {
    albumToDelete = album;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!albumToDelete) return;

    try {
      await albumsService.deleteAlbum(albumToDelete.id);
      albums = albums.filter((album) => album.id !== albumToDelete?.id);
      showDeleteModal = false;
      albumToDelete = null;
    } catch (e) {
      console.error('Error deleting album:', e);
      error = 'Failed to delete album. Please try again later.';
    }
  }

  onMount(async () => {
    console.log('Component mounted, loading data...');
    await Promise.all([loadAlbums(), loadArtists()]);
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Albums</h1>
    <button
      class="bg-[rgb(79_70_229)] hover:bg-[rgb(79_70_229)]/90 text-white px-4 py-2 rounded"
      on:click={() => (showCreateModal = true)}
    >
      Add Album
    </button>
  </div>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <span class="block sm:inline">{error}</span>
    </div>
  {/if}

  <DataTable
    headers={['Name', 'Main Artist', 'Favorite']}
    data={albums}
    {loading}
    emptyMessage="No albums found"
    emptyActionMessage="Get started by adding a new album."
    onAddClick={() => (showCreateModal = true)}
    onDeleteClick={confirmDelete}
    onViewClick={() => {}}
    showDeleteButton={true}
    showFavoriteStar={true}
  />
</div>

<Modal
  show={showCreateModal}
  title="Add New Album"
  onClose={() => {
    showCreateModal = false;
    newAlbum = {
      name: '',
      artist_id: 0,
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
        Album Name *
      </label>
      <input
        type="text"
        id="name"
        bind:value={newAlbum.name}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter album name"
        required
      />
    </div>

    <div class="mb-4">
      <label for="artist" class="block text-gray-700 text-sm font-bold mb-2">
        Main Artist *
      </label>
      <select
        id="artist"
        bind:value={newAlbum.artist_id}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      >
        <option value="">Select an artist</option>
        {#each artists as artist}
          <option value={artist.id}>{artist.name}</option>
        {/each}
      </select>
    </div>

    <div class="mb-4">
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={newAlbum.is_favorite}
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
    albumToDelete = null;
  }}
  onSubmit={handleDelete}
  submitText="Delete"
  submitButtonClass="bg-red-500 hover:bg-red-600 text-white"
>
  <p class="mb-4">Are you sure you want to delete the album "{albumToDelete?.name}"? This action cannot be undone.</p>
</Modal>
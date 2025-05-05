<script lang="ts">
  import { genresService } from '../../services/genres';
  import type { GenreData, GenreCreate } from '../../services/genres';
  import { onMount } from 'svelte';
  import DataTable from '../../components/DataTable.svelte';
  import Modal from '../../components/Modal.svelte';

  let genres: GenreData[] = [];
  let loading = true;
  let error: string | null = null;
  let showCreateModal = false;
  let showDeleteModal = false;
  let genreToDelete: GenreData | null = null;
  let newGenre: GenreCreate = {
    name: '',
    description: '',
    is_favorite: false,
  };

  async function loadGenres() {
    try {
      loading = true;
      error = null;
      genres = await genresService.getAll();
    } catch (e) {
      console.error('Error loading genres:', e);
      error = 'Failed to load genres. Please try again later.';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    try {
      if (!newGenre.name) {
        error = 'Name is required';
        return;
      }

      // Ensure name starts with capital letter
      if (!/^[A-Z]/.test(newGenre.name)) {
        error = 'Name must start with a capital letter';
        return;
      }

      error = null;
      const createdGenre = await genresService.create(newGenre);
      genres = [...genres, createdGenre];
      showCreateModal = false;
      newGenre = {
        name: '',
        description: '',
        is_favorite: false,
      };
    } catch (e) {
      console.error('Error creating genre:', e);
      error = 'Failed to create genre. Please try again later.';
    }
  }

  function confirmDelete(genre: GenreData) {
    genreToDelete = genre;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!genreToDelete) return;

    try {
      await genresService.deleteGenre(genreToDelete.id);
      genres = genres.filter((genre) => genre.id !== genreToDelete?.id);
      showDeleteModal = false;
      genreToDelete = null;
    } catch (e) {
      console.error('Error deleting genre:', e);
      error = 'Failed to delete genre. Please try again later.';
    }
  }

  onMount(loadGenres);
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Genres</h1>
    <button
      class="bg-[rgb(79_70_229)] hover:bg-[rgb(79_70_229)]/90 text-white px-4 py-2 rounded"
      on:click={() => (showCreateModal = true)}
    >
      Add Genre
    </button>
  </div>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <span class="block sm:inline">{error}</span>
    </div>
  {/if}

  <DataTable
    headers={['Name', 'Description', 'Favorite']}
    data={genres}
    {loading}
    emptyMessage="No genres found"
    emptyActionMessage="Get started by adding a new genre."
    onAddClick={() => (showCreateModal = true)}
    onDeleteClick={confirmDelete}
    onViewClick={() => {}}
    showDeleteButton={true}
    showFavoriteStar={true}
  />
</div>

<Modal
  show={showCreateModal}
  title="Add New Genre"
  onClose={() => {
    showCreateModal = false;
    newGenre = {
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
        Name *
      </label>
      <input
        type="text"
        id="name"
        bind:value={newGenre.name}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter genre name"
        required
      />
    </div>

    <div class="mb-4">
      <label for="description" class="block text-gray-700 text-sm font-bold mb-2">
        Description
      </label>
      <textarea
        id="description"
        bind:value={newGenre.description}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        rows="3"
        placeholder="Enter genre description"
      ></textarea>
    </div>

    <div class="mb-4">
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={newGenre.is_favorite}
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
    genreToDelete = null;
  }}
  onSubmit={handleDelete}
  submitText="Delete"
  submitButtonClass="bg-red-500 hover:bg-red-600 text-white"
>
  <p class="mb-4">Are you sure you want to delete the genre "{genreToDelete?.name}"? This action cannot be undone.</p>
</Modal>
<!-- Locations Management Page -->
<script lang="ts">
  import { locationsService } from '../../services/locations';
  import type { LocationData, LocationCreate } from '../../services/locations';
  import { onMount } from 'svelte';
  import DataTable from '../../components/DataTable.svelte';
  import Modal from '../../components/Modal.svelte';

  let locations: LocationData[] = [];
  let loading = true;
  let error: string | null = null;
  let showCreateModal = false;
  let showDeleteModal = false;
  let locationToDelete: LocationData | null = null;
  let newLocation: LocationCreate = {
    name: '',
    description: '',
  };

  async function loadLocations() {
    try {
      loading = true;
      error = null;
      locations = await locationsService.getAll();
    } catch (e) {
      console.error('Error loading locations:', e);
      error = 'Failed to load locations. Please try again later.';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    try {
      if (!newLocation.name) {
        error = 'Name is required';
        return;
      }

      // Ensure name starts with capital letter
      if (!/^[A-Z]/.test(newLocation.name)) {
        error = 'Name must start with a capital letter';
        return;
      }

      error = null;
      const createdLocation = await locationsService.create(newLocation);
      locations = [...locations, createdLocation];
      showCreateModal = false;
      newLocation = {
        name: '',
        description: '',
      };
    } catch (e) {
      console.error('Error creating location:', e);
      error = 'Failed to create location. Please try again later.';
    }
  }

  function confirmDelete(location: LocationData) {
    locationToDelete = location;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!locationToDelete) return;

    try {
      await locationsService.deleteLocation(locationToDelete.id);
      locations = locations.filter((location) => location.id !== locationToDelete?.id);
      showDeleteModal = false;
      locationToDelete = null;
    } catch (e) {
      console.error('Error deleting location:', e);
      error = 'Failed to delete location. Please try again later.';
    }
  }

  onMount(loadLocations);
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Locations</h1>
    <button
      class="bg-[rgb(79_70_229)] hover:bg-[rgb(79_70_229)]/90 text-white px-4 py-2 rounded"
      on:click={() => (showCreateModal = true)}
    >
      Add Location
    </button>
  </div>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <span class="block sm:inline">{error}</span>
    </div>
  {/if}

  <DataTable
    headers={['Name', 'Description']}
    data={locations}
    {loading}
    emptyMessage="No locations found"
    emptyActionMessage="Get started by adding a new location."
    onAddClick={() => (showCreateModal = true)}
    onDeleteClick={confirmDelete}
    onViewClick={() => {}}
    showDeleteButton={true}
  />
</div>

<Modal
  show={showCreateModal}
  title="Add New Location"
  onClose={() => {
    showCreateModal = false;
    newLocation = {
      name: '',
      description: '',
    };
  }}
  onSubmit={handleSubmit}
  submitText="Add"
  {error}
>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-4">
      <label for="name" class="block text-gray-700 text-sm font-bold mb-2">
        Location Name *
      </label>
      <input
        type="text"
        id="name"
        bind:value={newLocation.name}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter location name"
        required
      />
    </div>

    <div class="mb-4">
      <label for="description" class="block text-gray-700 text-sm font-bold mb-2">
        Description
      </label>
      <textarea
        id="description"
        bind:value={newLocation.description}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        rows="3"
        placeholder="Enter location description"
      ></textarea>
    </div>
  </form>
</Modal>

<Modal
  show={showDeleteModal}
  title="Confirm Delete"
  onClose={() => {
    showDeleteModal = false;
    locationToDelete = null;
  }}
  onSubmit={handleDelete}
  submitText="Delete"
  submitButtonClass="bg-red-500 hover:bg-red-600 text-white"
>
  <p class="mb-4">Are you sure you want to delete the location "{locationToDelete?.name}"? This action cannot be undone.</p>
</Modal>
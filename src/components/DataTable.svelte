<script lang="ts">
  import type { SvelteComponentTyped } from 'svelte';

  export let headers: string[];
  export let data: any[];
  export let loading = false;
  export let emptyMessage = 'No items found';
  export let emptyActionMessage = 'Get started by adding a new item.';
  export let onAddClick: () => void;
  export let onDeleteClick: (item: any) => void;
  export let onViewClick: (item: any) => void;
  export let onRowClick: ((item: any) => void) | null = null;
  export let showDeleteButton = true;
  export let showViewButton = false;
  export let showFavoriteStar = false;
  export let showActions = true;

  let sortKey: string | null = null;
  let sortDirection: 'asc' | 'desc' = 'asc';

  function handleSort(key: string) {
    if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDirection = 'asc';
    }
  }

  function handleRowClick(item: any) {
    if (onRowClick) {
      onRowClick(item);
    }
  }
</script>

{#if loading}
  <div class="flex justify-center items-center h-64">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
{:else if data.length === 0}
  <div class="text-center py-12">
    <h3 class="text-lg font-medium text-gray-900">{emptyMessage}</h3>
    <p class="mt-1 text-sm text-gray-500">{emptyActionMessage}</p>
    <button
      class="mt-4 bg-[rgb(79_70_229)] hover:bg-[rgb(79_70_229)]/90 text-white px-4 py-2 rounded"
      on:click={onAddClick}
    >
      Add New
    </button>
  </div>
{:else}
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          {#each headers as header}
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {header}
            </th>
          {/each}
          {#if showActions && (showDeleteButton || showFavoriteStar || showViewButton)}
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          {/if}
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each data as item}
          <tr class={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} on:click={() => handleRowClick(item)}>
            {#each Object.values(item) as value, i}
              {#if i < headers.length}
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {#if typeof value === 'boolean' && showFavoriteStar}
                    {#if value}
                      <span class="text-yellow-500">★</span>
                    {:else}
                      <span class="text-gray-400">☆</span>
                    {/if}
                  {:else}
                    {value || '-'}
                  {/if}
                </td>
              {/if}
            {/each}
            {#if showActions && (showDeleteButton || showFavoriteStar || showViewButton)}
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-2">
                  {#if showViewButton}
                    <button
                      class="text-blue-600 hover:text-blue-900"
                      on:click|stopPropagation={() => onViewClick(item)}
                    >
                      View
                    </button>
                  {/if}
                  {#if showDeleteButton}
                    <button
                      class="text-red-600 hover:text-red-900"
                      on:click|stopPropagation={() => onDeleteClick(item)}
                    >
                      Delete
                    </button>
                  {/if}
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .sortable {
    cursor: pointer;
  }
</style>
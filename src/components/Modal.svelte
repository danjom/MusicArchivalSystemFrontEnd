<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let show = false;
  export let title: string;
  export let onClose: () => void;
  export let onSubmit: () => void;
  export let submitText = 'Submit';
  export let cancelText = 'Cancel';
  export let submitButtonClass = 'bg-[rgb(79_70_229)] hover:bg-[rgb(79_70_229)]/90 text-white';
  export let error: string | null = null;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  // Close modal on Escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">{title}</h2>

      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      {/if}

      <slot />

      <div class="flex justify-end space-x-2 mt-4">
        <button
          type="button"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          on:click={onClose}
        >
          {cancelText}
        </button>
        <button
          type="button"
          class="{submitButtonClass} px-4 py-2 rounded"
          on:click={onSubmit}
        >
          {submitText}
        </button>
      </div>
    </div>
  </div>
{/if}
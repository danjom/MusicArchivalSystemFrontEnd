<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    window.location.href = '/compact-discs';
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-center items-center h-64">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
</div>
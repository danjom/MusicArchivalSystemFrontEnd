<script lang="ts">
  import Router from './Router.svelte';
  import './global.css';
</script>

<Router />

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
  :global(html) {
    background-color: #f3f4f6;
  }
</style>

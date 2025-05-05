<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let color: 'indigo' | 'white' | 'gray' = 'indigo';
  export let fullScreen = false;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    indigo: 'border-indigo-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };
</script>

<div
  class="flex items-center justify-center {fullScreen ? 'fixed inset-0 bg-gray-900 bg-opacity-50' : ''}"
  role="status"
>
  <div
    class="animate-spin rounded-full border-4 border-t-transparent {sizeClasses[size]} {colorClasses[color]}"
    aria-hidden="true"
  ></div>
  <span class="sr-only">Loading...</span>
</div>
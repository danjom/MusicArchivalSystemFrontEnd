<script lang="ts">
  import type { SvelteComponentTyped } from 'svelte';

  export let fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'checkbox';
    required?: boolean;
    placeholder?: string;
  }[];
  export let values: Record<string, any>;
  export let onChange: (name: string, value: any) => void;
  export let errors: Record<string, string> = {};
  export let loading = false;
  export let onSubmit: (values: Record<string, string>) => void;
  export let submitLabel = 'Submit';
  export let submitIcon: typeof SvelteComponentTyped | null = null;

  function handleSubmit() {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach((field) => {
      if (field.required && !values[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      onSubmit(values);
    }
  }
</script>

<div class="space-y-4">
  {#each fields as field}
    <div class="mb-4">
      <label for={field.name} class="block text-gray-700 text-sm font-bold mb-2">
        {field.label} {#if field.required}*{/if}
      </label>
      {#if field.type === 'textarea'}
        <textarea
          id={field.name}
          bind:value={values[field.name]}
          on:input={(e) => onChange(field.name, e.target.value)}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="3"
          placeholder={field.placeholder}
          required={field.required}
        ></textarea>
      {:else if field.type === 'checkbox'}
        <label class="flex items-center">
          <input
            type="checkbox"
            id={field.name}
            bind:checked={values[field.name]}
            on:change={(e) => onChange(field.name, e.target.checked)}
            class="form-checkbox h-4 w-4 text-blue-500"
          />
          <span class="ml-2 text-gray-700 text-sm font-bold">{field.label}</span>
        </label>
      {:else}
        <input
          type={field.type}
          id={field.name}
          bind:value={values[field.name]}
          on:input={(e) => onChange(field.name, e.target.value)}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder={field.placeholder}
          required={field.required}
        />
      {/if}
    </div>
  {/each}
</div>

<div>
  <button
    type="submit"
    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    disabled={loading}
  >
    {#if loading}
      <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
    {:else}
      {#if submitIcon}
        <svelte:component this={submitIcon} class="h-5 w-5 mr-2" />
      {/if}
      {submitLabel}
    {/if}
  </button>
</div>

<script context="module" lang="ts">
  export default Form;
</script>
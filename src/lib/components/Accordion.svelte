<script>
  export let open = false
  import { slide } from 'svelte/transition'
  const handleClick = () => (open = !open)
</script>

<div class="flex">
  <div class="flex 1 mr-2">
    <slot name="head" />
  </div>
  <button class="text-gray-500 text-xs font-medium" on:click={handleClick}>(...)</button>
</div>

{#if open}
  <div transition:slide>
    <slot name="details" />
  </div>
{/if}

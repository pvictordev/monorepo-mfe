<script lang="ts">
  let { initialCount = 0 } = $props<{ initialCount?: number }>();

  let count = $state(0);

  $effect(() => {
    count = initialCount;
  });
</script>

<button type="button" onclick={() => (count += 1)}>
  Svelte remote count: {count}
</button>

<script>
	import { useMachine } from '@xstate/svelte'
	import { assign } from 'xstate'
	import SlicedImage from './SlicedImage.svelte'
	import { slicingMachine } from './slicing.machine'

	const { send, state } = useMachine(slicingMachine, {
		actions: {
			setSlice: assign({
				selectedSlice: (_context, event) => event.key,
			}),
		},
	})

	$: console.log($state)

	let images = [
		{
			key: '1',
			src: {
				url: 'https://picsum.photos/seed/picsum/400',
				width: 400,
				height: 400,
			},
			width: 600,
			height: 600,
			x: 0,
			y: 0,
		},
		{
			key: '2',
			src: {
				url: 'https://picsum.photos/seed/picsum/400',
				width: 400,
				height: 400,
			},
			width: 400,
			height: 400,
			x: 0,
			y: 600,
			points: [
				[0, 0],
				[1, 0],
				// [1, 1],
				[0, 1],
			],
		},
		{
			key: '3',
			src: {
				url: 'https://picsum.photos/seed/picsum/400',
				width: 400,
				height: 400,
			},
			width: 150,
			height: 150,
			x: 650,
			y: 400,
			points: [
				[1, 1],
				[0.5, 0.5],
				[0, 1],
			],
		},
	]
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.key.toUpperCase() === 'ESCAPE') {
			send('DESELECT')
		}
	}}
/>

<main>
	<pre>{JSON.stringify({ value: $state.value, context: $state.context })}</pre>
	{#if $state.matches('selected')}
		<button on:click={() => send('SLICING_TOOL')}>Slice</button>
		<button on:click={() => send('MOVING_TOOL')}>Move</button>
	{/if}
	<div class="container">
		{#each images as image}
			<SlicedImage {image} {send} {state} />
		{/each}
	</div>
</main>

<style>
	* {
		box-sizing: border-box;
	}
	main {
		background-color: aliceblue;
		height: 100vh;
		position: relative;
	}

	.container {
		border: 2px solid #999;
	}

	.container {
		position: relative;
		/* left: 0;
		top: 0; */
	}
</style>

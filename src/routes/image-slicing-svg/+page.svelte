<script>
	import { browser } from '$app/environment'
	import { useMachine } from '@xstate/svelte'
	import { assign } from 'xstate'
	import SlicedImage from './SlicedImage.svelte'
	import { slicingMachine } from './slicing.machine'

	let containerEl
	let images = {
		'1': {
			order: 0,
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
		'2': {
			order: 1,
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
		'3': {
			order: 3,
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
	}

	const { send, state } = useMachine(slicingMachine, {
		guards: {
			pointerIsDown: (context) =>
				typeof context.pointerDownOrigin?.x === 'number',
		},
		actions: {
			setPointer: assign({
				pointerDownOrigin: (_context, { event }) => ({
					x: event.screenX,
					y: event.screenY,
				}),
			}),
			releasePointer: assign({
				pointerDownOrigin: undefined,
			}),
			setSlice: assign({
				selectedSlice: (_context, event) => {
					return event.key
				},
			}),
			addPathToSlicing: assign({
				slicingPath: (context, { event }) => {
					const containerRect = containerEl.getBoundingClientRect()
					const newPoint = [
						(event.clientX - containerRect.x) / containerRect.width,
						(event.clientY - containerRect.y) / containerRect.height,
					]
					return [...context.slicingPath, newPoint]
				},
			}),
			moveSlice: (context, { event }) => {
				const slice = images[context.selectedSlice]
				if (!slice) {
					return
				}
				images = {
					...images,
					[context.selectedSlice]: {
						...slice,
						x: slice.x + event.movementX,
						y: slice.y + event.movementY,
					},
				}
			},
		},
	})

	// $: if (browser) console.log($state)
	// $: if (browser) console.log(images)
</script>

<svelte:window
	on:keydown={(event) => {
		if (event.key.toUpperCase() === 'ESCAPE') {
			send('DESELECT')
		}
	}}
	on:mousemove={(event) => {
		send({ type: 'MOVE_POINTER', event })
	}}
	on:mousedown={(event) => send({ type: 'PRESS_POINTER', event })}
	on:mouseup={() => send('RELEASE_POINTER')}
/>

<main>
	<pre>{JSON.stringify({ value: $state.value, context: $state.context })}</pre>
	{#if $state.matches('selected')}
		<button
			on:click|stopPropagation={() => send('SLICING_TOOL')}
			disabled={$state.matches('selected.slicingTool')}>Slice</button
		>
		<button
			on:click|stopPropagation={() => send('MOVING_TOOL')}
			disabled={$state.matches('selected.movingTool')}>Move</button
		>
	{/if}
	<div class="container" bind:this={containerEl}>
		{#each Object.entries(images) as [key, image]}
			<SlicedImage {key} {image} {send} {state} />
		{/each}
		{#if $state.context.slicingPath.length > 0}
			{@const containerRect = containerEl?.getBoundingClientRect()}
			{@const pointToAbs = (point) => [
				point[0] * containerRect?.width || 1,
				point[1] * containerRect?.height || 1,
			]}
			<svg
				viewBox="0 0 {containerRect?.width || 100} {containerRect?.height ||
					100}"
			>
				<path
					fill="none"
					stroke="red"
					stroke-width="3"
					d={`
				M ${pointToAbs($state.context.slicingPath[0])}
				${$state.context.slicingPath
					.map((point) => `L ${pointToAbs(point)}`)
					.join('\n')}
				`}
				/>
			</svg>
		{/if}
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
		overflow: hidden;
		height: 100%;
	}

	svg {
		position: absolute;
		left: 0;
		top: 0;
		z-index: 150;
	}
</style>

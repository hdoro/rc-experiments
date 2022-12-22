<script>
	import { browser } from '$app/environment'
	import { useMachine } from '@xstate/svelte'
	import { actions, assign } from 'xstate'
	import { INITIAL_IMAGES } from './initialData'
	import { parseSlicingPoint } from './parseSlicingPoint'
	import SlicedImage from './SlicedImage.svelte'
	import { slicingMachine } from './slicing.machine'

	let containerEl
	let images = INITIAL_IMAGES

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
			finishSlicing: actions.pure((context, { completePolygons }) => {
				const selectedSlice = images[context.selectedSlice]
				const newSlices = completePolygons.map((polygon) => [
					Math.random().toString(),
					{
						...selectedSlice,
						points: polygon,
						order: -1,
					},
				])

				images = Object.assign({}, images, Object.fromEntries(newSlices))

				// @TODO add current mouse position to currentCutPath to prevent throttling from leading to unfinished line at the edge

				/**
				 * @TODO go through each shape and see if it should be cut
				 * 1. see if there's any complete shape with currentCutPath and the edges of the current shape
				 * 2. if not, the shape wasn't sliced
				 * 	- @TODO perhaps we want to keep the slice marked, similarly to paper?
				 * 		- If so, each slice should carry information on its cuts and those should be considered edges for the purpose of 1.
				 * 3. if there are complete shapes, create new slices
				 * 	- each complete shape will compose a new slice
				 * 	- there could be more than one in a path - example of closed circles in the path
				 * 	- the existing slice will be broken down as shapes are removed
				 * 4. add the new slices and remove the existing one to imageObj
				 */
				return [
					assign({
						pointerDownOrigin: undefined,
						slicingPath: [],
						selectedSlice: newSlices[0][0],
					}),
				]
			}),
			addSlicingPoint: actions.pure((context, { event }) => {
				const containerRect = containerEl.getBoundingClientRect()
				const { newPoint, completePolygons, incompleteCurves } =
					parseSlicingPoint({
						slicingPath: context.slicingPath,
						containerRect,
						event,
					})

				if (completePolygons?.length) {
					return actions.send({
						type: 'FINISH_SLICING',
						completePolygons,
						incompleteCurves,
					})
				}

				if (newPoint) {
					return assign({ slicingPath: [...context.slicingPath, newPoint] })
				}
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
	$: if (browser) console.log({ images })
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
		{#if $state.matches('selected.slicingTool') && $state.context.slicingPath.length > 0}
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

<script>
	import { browser } from '$app/environment'
	import { useMachine } from '@xstate/svelte'
	import { actions, assign } from 'xstate'
	import { INITIAL_IMAGES, UNCUT_POINTS } from './initialData'
	import { parseSlicingPoint } from './parseSlicingPoint'
	// import SlicedImage from './SlicedImageSVG.svelte'
	import SlicedImage from './SlicedImageClipPath.svelte'
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
			finishSlicing: actions.pure((context, { completePolygon }) => {
				const selectedSlice = images[context.selectedSlice]
				if (!selectedSlice) {
					return
				}
				const newSlice = {
					...selectedSlice,
					points: completePolygon,
					order: -1,
				}
				const newSliceKey = Math.random().toString()

				images = {
					...images,
					[context.selectedSlice]: {
						...selectedSlice,
						points: [
							...(selectedSlice.points || UNCUT_POINTS),
							'M',
							...newSlice.points,
						],
					},
					[newSliceKey]: newSlice,
				}

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
						selectedSlice: newSliceKey,
					}),
				]
			}),
			addSlicingPoint: actions.pure((context, { event }) => {
				const sliceRect = document
					.getElementById(`slice-${context.selectedSlice}`)
					?.getBoundingClientRect()
				const { newPoint, completePolygon, incompleteCurves } =
					parseSlicingPoint({
						slicingPath: context.slicingPath,
						sliceRect,
						event,
					})

				if (completePolygon?.length) {
					return actions.send({
						type: 'FINISH_SLICING',
						completePolygon,
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

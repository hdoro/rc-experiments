<script>
	import { getPolygonClosingPoint } from './geometry'
	import { throttle } from './throttle'

	let containerEl
	let previousTouch
	let selection
	let pointerDown = false
	let currentCutPath = []

	let imageObj = {
		src: {
			url: 'https://picsum.photos/seed/picsum/400',
			width: 400,
			height: 400,
		},
		x: 0,
		y: 0,
		width: 600,
		height: 600,
		slices: [
			{
				key: '1',
				points: [
					[0, 0],
					[1, 0],
					[0, 1],
				],
				x: 0,
				y: 0,
			},
			{
				key: '2',
				points: [
					[1, 1],
					[1, 0],
					[0.5, 0.5],
				],
				x: 0,
				y: 0,
			},
			{
				key: '3',
				points: [
					[1, 1],
					[0.5, 0.5],
					[0, 1],
				],
				x: 0,
				y: 0,
			},
		],
	}

	function buildSliceStyle(imageObj, slice) {
		const polygonPathPercentages = slice.points.map(
			(point) => `${point[0] * 100}% ${point[1] * 100}%`,
		)
		// const sortedCoordinates = slice.points
		// 	.reduce(
		// 		(coordinates, point) => {
		// 			return [
		// 				[...coordinates[0], point[0]],
		// 				[...coordinates[1], point[1]],
		// 			]
		// 		},
		// 		[[], []],
		// 	)
		// 	.map((coordinates) => coordinates.sort((a, b) => a - b))

		return `clip-path: polygon(${polygonPathPercentages.join(
			',',
		)}); transform: translate(${slice.x}px, ${slice.y}px); width: ${
			imageObj.width
		}px; height: ${imageObj.height}px; z-index: ${
			imageObj.slices.indexOf(slice) + 5
		};`
	}

	const handleSlicingMovement = throttle(
		({ clientX, clientY }) => {
			if (selection || !containerEl) return false

			// @TODO: make points relative to the container, not absolute positioned
			const containerRect = containerEl.getBoundingClientRect()
			const newPoint = [
				(clientX - containerRect.x) / containerRect.width,
				(clientY - containerRect.y) / containerRect.height,
			]
			const lastPoint = currentCutPath.slice(-1)[0]
			const { intersection, pointBeforeIntersectionIdx } =
				getPolygonClosingPoint(newPoint, currentCutPath) || {}

			if (intersection) {
				// @TODO: disconsider whitespace from the container when cutting images
				// @TODO: split completed polygons according to existing slices' borders
				// @TODO: get information on which "host" slice is being sliced with each complete polygon
				// @TODO: from this information, add the proper offset to these polygons
				// @TODO: create "cut-outs" from host slices - follow Clippy's "Frame" example for how to do it https://bennettfeely.com/clippy/
				const completePolygons = [
					// starts & ends at the intersection
					{
						x: 0,
						y: 0,
						key: Math.random().toString(),
						points: [
							intersection,
							...currentCutPath.slice(pointBeforeIntersectionIdx + 1),
							intersection,
						],
					},
				]
				const incompleteCurves = [
					// Start of the line before completed polygon
					[
						...currentCutPath.slice(0, pointBeforeIntersectionIdx),
						intersection,
					],
					// End of the line
					[intersection, newPoint],
				]
				finishSlicing({ completePolygons, incompleteCurves })
				return
			}

			// Prevent point duplication
			if (
				!lastPoint ||
				(newPoint[0] !== lastPoint[0] && newPoint[1] !== lastPoint[1])
			) {
				currentCutPath = [...currentCutPath, newPoint]
			}

			// @TODO: check if shape was closed -if so, finishSlicing()
		},
		20,
		true,
	)

	/**
	 * @IDEA from https://github.com/ardov/Image-Cutter/blob/6c241f7f28d5cf24185ff366a3369190a7c4b4aa/code.ts#L52
	 * Create paths from users' slices and just apply the images to them.
	 * The code above is from a Figma plugin, essentially it gets shapes over an image and applies the image to them
	 *
	 * Closest I got: Inkscape's division merger - https://inkscape.org/forums/questions/splitting-an-image-into-segments/
	 * Source code here: https://gitlab.com/inkscape/inkscape
	 *
	 * Possible prompt: image slicer
	 * */
	function finishSlicing({ completePolygons, incompleteCurves } = {}) {
		if (completePolygons?.length) {
			imageObj = {
				...imageObj,
				slices: [...imageObj.slices, ...completePolygons],
			}
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
		currentCutPath = []
	}

	function handleSliceMove({ movementX, movementY }) {
		if (!selection) return false

		const slice = imageObj.slices.find((s) => s.key === selection)
		if (!slice) return false

		const sliceIndex = imageObj.slices.indexOf(slice)
		imageObj = {
			...imageObj,
			slices: [
				...imageObj.slices.slice(0, sliceIndex),
				{
					...slice,
					x: slice.x + movementX,
					y: slice.y + movementY,
				},
				...imageObj.slices.slice(sliceIndex + 1),
			],
		}
		return true
	}

	$: console.log({ currentCutPath })
</script>

<main>
	<div
		class="container"
		style="transform: translate({imageObj.x}px, {imageObj.y}px); width: {imageObj.width}px; height: {imageObj.height}px;"
		bind:this={containerEl}
		on:touchmove={(event) => {
			if (selection) event.preventDefault()
			const touch = event.touches[0]

			if (selection && previousTouch) {
				handleSliceMove({
					movementX: touch.pageX - previousTouch.pageX,
					movementY: touch.pageY - previousTouch.pageY,
				})
			}

			previousTouch = touch
		}}
		on:mousemove={(event) => {
			if (selection) {
				handleSliceMove(event)
			} else if (pointerDown) {
				handleSlicingMovement(event)
			}
		}}
		on:mousedown={() => (pointerDown = true)}
		on:touchstart={() => (pointerDown = true)}
		on:mouseup={() => {
			pointerDown = false
			finishSlicing()
		}}
		on:touchend={() => {
			pointerDown = false
			finishSlicing()
		}}
		on:mouseleave={finishSlicing}
	>
		{#each imageObj.slices as slice, index}
			<!-- @TODO: consider refactoring into SVG with clipPath et. al - https://stackoverflow.com/a/37930426 -->
			<button
				class="slice"
				type="button"
				on:mousedown|stopPropagation={(event) => {
					event.stopPropagation()
					selection = selection === slice.key ? undefined : slice.key
				}}
				on:mouseup={() => (selection = undefined)}
				on:touchstart={(e) => {
					selection = selection === slice.key ? undefined : slice.key
					previousTouch = e.touches[0]
				}}
				on:touchend={() => (selection = undefined)}
				data-selected={selection === slice.key}
				style={buildSliceStyle(imageObj, slice)}
				draggable="false"
			>
				<img src={imageObj.src.url} alt="slice {index}" draggable="false" />
			</button>
		{/each}
		{#if currentCutPath.length > 0}
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
				M ${pointToAbs(currentCutPath[0])}
				${currentCutPath.map((point) => `L ${pointToAbs(point)}`).join('\n')}
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

	.container,
	.slice,
	svg {
		position: absolute;
		left: 0;
		top: 0;
	}

	svg {
		z-index: 50;
	}

	.slice {
		border: none;
		background-color: transparent;
		display: block;
		padding: 0;
	}

	.slice[data-selected='true'] {
		opacity: 0.85;
	}

	img {
		clip-path: inherit;
		display: block;
		width: 100%;
		height: 100%;
	}
</style>

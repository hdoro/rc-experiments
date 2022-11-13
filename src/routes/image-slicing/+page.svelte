<script>
	let containerEl
	let previousTouch
	let selection
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
				// @TODO: Percentage-based (current) or absolute with matrix transforms?
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
		const sortedCoordinates = slice.points
			.reduce(
				(coordinates, point) => {
					return [
						[...coordinates[0], point[0]],
						[...coordinates[1], point[1]],
					]
				},
				[[], []],
			)
			.map((coordinates) => coordinates.sort((a, b) => a - b))

		return `clip-path: polygon(${polygonPathPercentages.join(
			',',
		)}); transform: translate(${slice.x}px, ${slice.y}px); width: ${
			imageObj.width
		}px; height: ${imageObj.height}px`
	}

	function handleMove({ movementX, movementY }) {
		if (!selection || !containerEl) return false

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
</script>

<main>
	<div
		class="container"
		style="transform: translate({imageObj.x}px, {imageObj.y}px); width: {imageObj.width}px; height: {imageObj.height}px;"
		bind:this={containerEl}
		on:touchmove={(event) => {
			if (selection) event.preventDefault()
			const touch = event.touches[0]

			if (previousTouch) {
				const moved = handleMove({
					movementX: touch.pageX - previousTouch.pageX,
					movementY: touch.pageY - previousTouch.pageY,
				})
				console.log({ moved })
			}

			previousTouch = touch
		}}
		on:mousemove={handleMove}
	>
		{#each imageObj.slices as slice, index}
			<!-- @TODO: consider refactoring into SVG with clipPath et. al - https://stackoverflow.com/a/37930426 -->
			<button
				class="slice"
				type="button"
				on:mousedown={() =>
					(selection = selection === slice.key ? undefined : slice.key)}
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
	.slice {
		position: absolute;
		left: 0;
		top: 0;
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

<script>
	let canvasHeight = 0
	let canvasWidth = 0
	let lassoPoints = [
		// [30, 20],
		// [85, 20],
		// [105, 40],
		// [75, 80],
		// [35, 60],
	]

	let mode = 'editing'

	let canvas
	$: console.log(canvas)

	function addPoint(event) {
		const canvasRect = canvas?.getBoundingClientRect()
		lassoPoints = [
			...lassoPoints,
			[event.x - canvasRect.x, event.y - canvasRect.y],
		]
	}

	$: polygonPathPercentages = lassoPoints.map(
		(point) =>
			`${(point[0] / canvasWidth) * 100}% ${(point[1] / canvasHeight) * 100}%`,
	)

	$: sortedCoordinates = lassoPoints
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
</script>

<button on:click={() => (mode = mode === 'editing' ? 'moving' : 'editing')}
	>{mode === 'editing' ? 'Editing' : 'Moving'}</button
>

<div
	class="canvas"
	on:mousedown={addPoint}
	bind:offsetHeight={canvasHeight}
	bind:offsetWidth={canvasWidth}
	bind:this={canvas}
>
	<div
		class="bounds"
		style="--x-min: {sortedCoordinates[0][0]}; --x-max: {sortedCoordinates[0].slice(
			-1,
		)[0]}; --y-min: {sortedCoordinates[1][0]}; --y-max: {sortedCoordinates[1].slice(
			-1,
		)[0]}; "
	/>
	<img
		src="https://picsum.photos/seed/picsum/400"
		alt="imagea"
		style={lassoPoints.length > 2
			? `clip-path: polygon(${polygonPathPercentages.join(',')})`
			: undefined}
	/>
</div>

<details>
	<summary>Data debug</summary>
	<pre>
    <code>
      {JSON.stringify({ lassoPoints, sortedCoordinates }, null, 2)}
  
    </code>
  </pre>
</details>

<style>
	.canvas {
		position: relative;
		display: inline-block;
		background-color: antiquewhite;
	}

	img {
		display: block;
	}

	.bounds {
		display: block;
		position: absolute;
		left: calc(var(--x-min) * 1px);
		top: calc(var(--y-min) * 1px);
		width: calc(calc(var(--x-max) - var(--x-min)) * 1px);
		height: calc(calc(var(--y-max) - var(--y-min)) * 1px);
		border: 3px solid red;
	}
</style>

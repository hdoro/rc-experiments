<script>
	export let key
	export let image
	export let send
	export let state

	$: patternId = `sliced-image--${key}`
</script>

<!-- @TODO: proper viewbox for slices -->
<svg
	data-selected={$state.context.selectedSlice === key}
	style="transform: translate({image.x}px, {image.y}px); width: {image.width}px; height: {image.height}px; z-index: {100 -
		image.order}"
	viewBox="0 0 {image.width} {image.height}"
	on:click|stopPropagation={() => send({ type: 'SELECT_SLICE', key })}
	on:mousedown={() => send({ type: 'SELECT_SLICE', key })}
>
	<defs>
		<pattern
			xlink:href="#{patternId}-source"
			id={patternId}
			patternTransform="scale({image.width / image.src.width}, {image.height /
				image.src.height})"
		/>
		<pattern
			id="{patternId}-source"
			patternUnits="userSpaceOnUse"
			width={image.src.width}
			height={image.src.height}
		>
			<image
				width={image.src.width}
				height={image.src.height}
				preserveAspectRatio="none"
				style="image-rendering: optimizeSpeed"
				xlink:href={image.src.url}
				x={0}
				y={0}
			/>
		</pattern>
	</defs>
	{#if image.points}
		{@const pointToAbs = (point) => [
			point[0] * image?.width || 1,
			point[1] * image?.height || 1,
		]}
		<path
			style="fill: url(#{patternId})"
			d={`
						M ${pointToAbs(image.points[0])}
						${image.points.map((point) => `L ${pointToAbs(point)}`).join('\n')}
						`}
		/>
	{:else}
		<rect
			x={0}
			y={0}
			style="fill: url(#{patternId})"
			width={image.width}
			height={image.height}
		/>
	{/if}
</svg>

<style>
	svg {
		position: absolute;
		left: 0;
		top: 0;
	}

	svg[data-selected='true'] {
		box-shadow: 0px 0px 0px 3px hsl(240, 70%, 60%);
	}
</style>

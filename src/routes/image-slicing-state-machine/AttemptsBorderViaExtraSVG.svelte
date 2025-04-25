<script>
	import { buildPathDefinition } from './buildPathDefinition'

	export let key
	export let image
	export let send
	export let state

	function getPolygonCenter(points) {
		const x = points.reduce((acc, point) => acc + point[0], 0) / points.length
		const y = points.reduce((acc, point) => acc + point[1], 0) / points.length
		return [x, y]
	}

	$: selected =
		$state.matches('selected') && $state.context.selectedSlice === key

	$: style = [
		`transform: translate(${image.x}px, ${image.y}px)`,
		`width: ${image.width}px`,
		`height: ${image.height}px`,
		`z-index: ${100 - image.order}`,
		image.points?.length > 0 &&
			`--center: ${getPolygonCenter(image.points)
				.map((n) => n * 100)
				.join('% ')}%`,

		image.points?.length > 0 &&
			`--path: '${buildPathDefinition(
				image.points,
				image?.width,
				image?.height,
				true,
			)}'`,
	]
		.filter(Boolean)
		.join(';')
</script>

{#if selected}
	{#if image.points?.length > 0}
		<svg
			viewBox="0 0 {image?.width || 100} {image?.height || 100}"
			class="highlighter"
			{style}
			draggable="false"
			aria-hidden
		>
			<path
				fill="none"
				stroke="blue"
				stroke-width="3"
				d={buildPathDefinition(image.points, image?.width, image?.height)}
			/>
		</svg>
	{/if}
{/if}

<button
	data-selected={selected}
	data-clipped={image.points?.length > 0}
	on:click|stopPropagation={() => send({ type: 'SELECT_SLICE', key })}
	on:mousedown={() => send({ type: 'SELECT_SLICE', key })}
	{style}
>
	<!-- {#if selected}
	<div
		class="highlighter"
	/>
{/if} -->

	<img src={image.src.url} alt=" " draggable="false" />

	{#if $state.matches('selected.slicingTool') && $state.context.slicingPath.length > 0}
		<svg viewBox="0 0 {image?.width || 100} {image?.height || 100}">
			<path
				fill="none"
				stroke="red"
				stroke-width="3"
				d={buildPathDefinition(
					$state.context.slicingPath,
					image?.width,
					image?.height,
				)}
			/>
		</svg>
	{/if}
</button>

<style>
	button,
	.highlighter,
	img {
		position: absolute;
		left: 0;
		top: 0;
		border: none;
		background-color: transparent;
	}
	button[data-clipped='true'] {
		clip-path: path(var(--path));
	}

	.highlighter {
		user-select: none;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		clip-path: inherit;
	}
</style>

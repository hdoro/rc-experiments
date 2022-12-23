<script>
	import { buildPathDefinition } from './buildPathDefinition'
	import { UNCUT_POINTS } from './initialData'

	export let key
	export let image
	export let send
	export let state

	$: selected =
		$state.matches('selected') && $state.context.selectedSlice === key

	$: style = [
		`transform: translate(${image.x}px, ${image.y}px)`,
		`width: ${image.width}px`,
		`height: ${image.height}px`,
		`z-index: ${100 - image.order}`,

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

<button
	data-selected={selected}
	data-clipped={image.points?.length > 0}
	on:click|stopPropagation={() => send({ type: 'SELECT_SLICE', key })}
	on:mousedown={() => send({ type: 'SELECT_SLICE', key })}
	{style}
	id={`slice-${key}`}
>
	<img src={image.src.url} alt=" " draggable="false" />

	<!-- Draw slicing from the image's origin -->
	{#if selected && $state.matches('selected.slicingTool') && $state.context.slicingPath.length > 0}
		<svg
			viewBox="0 0 {image?.width || 100} {image?.height || 100}"
			class="slicing-path"
		>
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

{#if selected}
	{@const points = image.points || UNCUT_POINTS}
	<svg
		viewBox="0 0 {image?.width || 100} {image?.height || 100}"
		class="highlighter"
		draggable="false"
		aria-hidden
		{style}
	>
		<path
			fill="none"
			stroke="blue"
			stroke-width="2"
			d={buildPathDefinition(points, image?.width, image?.height, true)}
		/>
	</svg>
{/if}

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

	.slicing-path {
		position: relative;
		z-index: 1000;
	}

	.highlighter {
		pointer-events: none;
		user-select: none;
		overflow: visible;
		stroke-linecap: square;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		clip-path: inherit;
	}
</style>

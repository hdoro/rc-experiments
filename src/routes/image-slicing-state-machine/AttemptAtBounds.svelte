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

<!-- {#if selected}
	<div
		class="highlighter"
		style={style
			.replace(`${image.width}px`, `${image.width + 20}px`)
			.replace(`${image.height}px`, `${image.height + 20}px`)}
	/>
{/if} -->
{#if selected}
	<div class="highlighter" {style} />

	<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
		<filter id="erode">
			<feMorphology operator="erode" radius="10" />
		</filter>
		<filter id="dilate">
			<feMorphology operator="dilate" radius="20" />
		</filter>
	</svg>
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
		background-color: hsl(240, 70%, 60%);
		/* transform: translate(80px, 36px) scale(1.15) !important; */
		transform-origin: var(--center);
		clip-path: path(var(--path));
		filter: url(#dilate);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		clip-path: inherit;
		/* transform: scale(0.995);
		transform-origin: var(--center); */
		/* box-shadow: 0px 0px 0px 3px hsl(240, 70%, 60%); */
	}

	button[data-selected='true'] {
		/* box-shadow: 0px 0px 0px 3px hsl(240, 70%, 60%); */
		background-color: hsl(240, 70%, 60%);
		/* filter: url(#dilate); */
	}

	/* button[data-selected='true'] > img {
		filter: url(#erode);
	} */
	/* button[data-selected='true'] > img {
		--border: 2px;
		left: calc(var(--border) * 0.5);
		top: calc(var(--border) * 0.5);
		width: calc(100% - var(--border));
		height: calc(100% - var(--border));
	} */
</style>

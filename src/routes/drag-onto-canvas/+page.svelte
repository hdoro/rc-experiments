<script>
	/**
	 * Current state - images can be dragged and manipulated, but:
	 * - Fabric JS doesn't work well with responsive canvases
	 * - Some images, some times, are cropped seemingly randomly (perhaps that comes from me limiting width & height)
	 * - no TS definitions, buggy import leading to broken initialization, etc.
	 *
	 * Conclusion: wait on Fabric@6. If I build my own in the meantime, move into WebGL to reap its performance and flexibility benefits (perhaps with Pixi.js?)
	 */
	import { onMount } from 'svelte'
	import { UNSPLASH_DATA } from './unsplashData'

	let canvasDimensions = {
		w: 300,
		h: 300,
	}
	let fabric
	let canvas

	$: console.log({ fabric, canvas })

	let pictures = UNSPLASH_DATA

	function useFabric() {
		if (window.fabric) {
			fabric = window.fabric
		} else {
			setTimeout(useFabric, 50)
		}
	}
	onMount(() => {
		useFabric()
	})

	$: if (fabric?.Canvas && !canvas) {
		canvas = new fabric.Canvas('canvas')
	}

	function handleDrop({ e }) {
		const imageData = JSON.parse(
			e?.dataTransfer?.getData('application/canvas/img') || 'null',
		)
		const imageEl = imageData?.id
			? document.getElementById(`picture-${imageData.id}`)
			: undefined

		console.info({ event, imageData })
		if (!imageData || !imageEl) return

		const elRect = imageEl.getBoundingClientRect()
		const aspectRatio = elRect.height / elRect.width
		let width = elRect.width
		let height = elRect.height
		// Horizontal images: limit by canvas' width
		if (aspectRatio > 1) {
			// Occupy at most 80% of the canvas
			width = Math.min(elRect.width, canvas.width * 0.8)
			height = width / (elRect.width / elRect.height)
		} else {
			// Vertical images: limit by height
			height = Math.min(elRect.height, canvas.height * 0.8)
			console.log('here', height)
			width = height / (elRect.height / elRect.width)
		}
		console.log({
			elRect,
			canvasW: canvas.width,
			width,
			height,
			aspectRatio,
		})
		const imageEntity = new fabric.Image(imageEl, {
			left: e?.clientX - canvas?._offset?.left - width / 2,
			top: e?.clientY - canvas?._offset?.top - height / 2,
			width,
			height,
		})
		canvas.add(imageEntity)
	}

	$: if (canvas) {
		setTimeout(() => {
			canvas.on('drop', handleDrop)
			var rect = new fabric.Rect({
				top: 100,
				left: 100,
				width: 60,
				height: 70,
				fill: 'red',
			})
			canvas.add(rect)
		}, 50)
	}

	$: if (canvas) {
		try {
			let canvasSize = {
				width: 1200,
				height: 700,
			}
			let scaleRatio = Math.min(
				canvasDimensions.w / canvasSize.width,
				canvasDimensions.h / canvasSize.height,
			)
			canvas.setWidth(canvasDimensions.w)
			canvas.setHeight(canvasDimensions.h)
			canvas.setZoom(scaleRatio)
			// canvas.setDimensions({
			// 	width: canvasDimensions.w,
			// 	height: canvasDimensions.h,
			// })
			canvas.renderAll()
		} catch (error) {
			console.error(error)
		}
	}
</script>

<svelte:head>
	{@html `<script src="https://unpkg.com/fabric@5.2.4/dist/fabric.min.js" preload></script>`}
</svelte:head>

<main>
	<div class="sidebar">
		{#each pictures as picture}
			<figure>
				<img
					src={picture?.urls?.small}
					alt={picture.alt_description}
					id="picture-{picture.id}"
					draggable="true"
					on:dragstart={(event) => {
						event.dataTransfer?.setData(
							'application/canvas/img',
							JSON.stringify(picture),
						)
					}}
				/>
				<cite
					>By {picture.user?.name} (<a
						href={picture.links?.html}
						target="_blank"
						rel="noopener noreferrer">source</a
					>)</cite
				>
				<figcaption>{picture.description}</figcaption>
			</figure>
		{/each}
	</div>
	<div
		class="container"
		bind:offsetWidth={canvasDimensions.w}
		bind:offsetHeight={canvasDimensions.h}
	>
		<canvas
			id="canvas"
			width={canvasDimensions.w}
			height={canvasDimensions.h}
		/>
	</div>
</main>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
	main {
		display: grid;
		grid-template-columns: 1fr 3fr;
	}
	.sidebar {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		grid-column: 1;
		background-color: #f2f2f2;
	}

	figure,
	img {
		display: block;
		max-width: 100%;
		padding: 0;
		margin: 0;
	}
</style>

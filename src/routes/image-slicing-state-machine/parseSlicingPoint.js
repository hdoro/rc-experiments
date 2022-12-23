import { getPolygonClosingPoint } from '../image-slicing/geometry'

export function parseSlicingPoint({ slicingPath, containerRect, event }) {
	const newPoint = [
		(event.clientX - containerRect.x) / containerRect.width,
		(event.clientY - containerRect.y) / containerRect.height,
	]

	const { intersection, pointBeforeIntersectionIdx } =
		getPolygonClosingPoint(newPoint, slicingPath) || {}

	if (intersection) {
		// @TODO: disconsider whitespace from the container when cutting images
		// @TODO: split completed polygons according to existing slices' borders
		// @TODO: get information on which "host" slice is being sliced with each complete polygon
		// @TODO: from this information, add the proper offset to these polygons
		// @TODO: create "cut-outs" from host slices
		// 		opt. 1 (w/ css clip-path): follow Clippy's "Frame" example for how to do it https://bennettfeely.com/clippy/
		// 		opt. 2 (w/ SVG paths): follow Inkscape's example (see image-with-hole-in-middle.svg) of drawing the sliced path, then using an M path command to jump to the edge of the original slice and draw it from there
		// 			visualize with: https://svg-path-visualizer.netlify.app
		const completePolygon =
			// starts & ends at the intersection
			[
				intersection,
				...slicingPath.slice(pointBeforeIntersectionIdx + 1),
				intersection,
			]

		const incompleteCurves = [
			// Start of the line before completed polygon
			[...slicingPath.slice(0, pointBeforeIntersectionIdx), intersection],
			// End of the line
			[intersection, newPoint],
		]
		return { completePolygon, incompleteCurves }
	}

	const lastPoint = slicingPath.slice(-1)[0]
	// Prevent point duplication
	if (
		!lastPoint ||
		(newPoint[0] !== lastPoint[0] && newPoint[1] !== lastPoint[1])
	) {
		return {
			newPoint,
		}
	}

	return {}
}

/**
 *
 * @typedef {[x: number, y: number]} Point
 * @param {Point} A
 * @param {Point} B
 * @param {Point} C
 *
 * @returns boolean
 */
function ccw(A, B, C) {
	return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0])
}

/**
 * More memory-efficient intersection check. Doesn't return intersection point.
 *
 * @param {[Point, Point]} AB
 * @param {[Point, Point]} CD
 *
 * @returns boolean
 *
 * Credits: Bryce Boe at https://bryceboe.com/2006/10/23/line-segment-intersection-algorithm/
 */
function segmentsIntersect([A, B], [C, D]) {
	return ccw(A, C, D) != ccw(B, C, D) && ccw(A, B, C) != ccw(A, B, D)
}

/**
 * @param {Point} A
 * @param {Point} B
 */
function determinant(A, B) {
	return A[0] * B[1] - A[1] * B[0]
}

/**
 * @param {[Point, Point]} AB
 * @param {[Point, Point]} CD
 *
 * @returns {Point}
 *
 * Credits: Paul Draper at https://stackoverflow.com/a/20677983/10433647
 */
function getIntersectionPoint([A, B], [C, D]) {
	const xDiff = [A[0] - B[0], C[0] - D[0]]
	const yDiff = [A[1] - B[1], C[1] - D[1]]

	const div = determinant(xDiff, yDiff)

	const d = [determinant(A, B), determinant(C, D)]
	const x = determinant(d, xDiff) / div
	const y = determinant(d, yDiff) / div

	return [x, y]
}

/**
 * @param {Point} newPoint
 * @param {Point[]} polygon
 */
export function getPolygonClosingPoint(newPoint, polygon) {
	const lastPoint = polygon.slice(-1)[0]
	const currentEdge = lastPoint ? [lastPoint, newPoint] : undefined

	const pointBeforeIntersection =
		currentEdge &&
		polygon.length > 2 &&
		polygon.find((point, idx) => {
			const nextPoint = polygon[idx + 1]

			const edgeToCompare = [point, nextPoint]
			if (
				// Skip un-ended segments
				!nextPoint ||
				// Skip last point
				(nextPoint[0] === lastPoint[0] && nextPoint[1] === lastPoint[1])
			)
				return false

			return segmentsIntersect(currentEdge, edgeToCompare)
		})

	if (!pointBeforeIntersection) return

	const pointBeforeIntersectionIdx = polygon.indexOf(pointBeforeIntersection)
	const intersection = getIntersectionPoint(currentEdge, [
		pointBeforeIntersection,
		polygon[pointBeforeIntersectionIdx + 1],
	])

	if (!intersection) return

	return {
		intersection,
		pointBeforeIntersectionIdx,
	}
}

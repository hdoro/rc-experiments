export function getPolygonBounds(points) {
	const xValues = points.map((point) => point[0])
	const yValues = points.map((point) => point[1])
	const xMin = Math.min(...xValues)
	const xMax = Math.max(...xValues)
	const yMin = Math.min(...yValues)
	const yMax = Math.max(...yValues)
	return { xMin, xMax, yMin, yMax }
}

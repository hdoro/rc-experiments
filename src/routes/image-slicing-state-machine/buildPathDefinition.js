/**
 * Returns a string that can be used as the `d` attribute of an SVG path element.
 *
 * @param {(number[] | "M")[]} points
 * @param {number} containerWidth
 * @param {number} containerHeight
 */
export function buildPathDefinition(
	points = [],
	containerWidth,
	containerHeight,
	closePath = false,
) {
	const [firstPoint, ...restPoints] = points

	return [
		`M ${pointToAbs(firstPoint)}`,
		...restPoints.map((point, idx) => {
			if (point === 'M') {
				const nextPoint = restPoints[idx + 1]
				return nextPoint ? `M ${pointToAbs(nextPoint)}` : ''
			}
			return `L ${pointToAbs(point)}`
		}),
		closePath ? 'Z' : '',
	].join(' ')

	function pointToAbs(point) {
		return [point[0] * containerWidth || 1, point[1] * containerHeight || 1]
	}
}

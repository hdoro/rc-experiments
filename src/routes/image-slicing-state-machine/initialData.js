export const UNCUT_POINTS = [
	[0, 0],
	[1, 0],
	[1, 1],
	[0, 1],
	[0, 0],
]

// ARRAY: [ x, y ] (python's list)
// OBJECT: { x: 10, y: 30 } (dictionary in python)

export const INITIAL_IMAGES = {
	1: {
		order: 0,
		src: {
			url: 'https://picsum.photos/seed/picsum/400',
			width: 400,
			height: 400,
		},
		width: 600,
		height: 600,
		x: 0,
		y: 0,
		points: [
			[1, 1],
			[0, 1],
			[0, 0],
			[1, 0],
		],
	},
	2: {
		order: 1,
		src: {
			url: 'https://picsum.photos/seed/picsum/400',
			width: 400,
			height: 400,
		},
		width: 400,
		height: 400,
		x: 0,
		y: 600,
		points: [
			[0, 0],
			[1, 0],
			// [1, 1],
			[0, 1],
		],
	},
	3: {
		order: 3,
		src: {
			url: 'https://picsum.photos/seed/picsum/400',
			width: 400,
			height: 400,
		},
		width: 150,
		height: 150,
		x: 650,
		y: 400,
		points: [
			[1, 1],
			[0.5, 0.5],
			[0, 1],
		],
	},
}

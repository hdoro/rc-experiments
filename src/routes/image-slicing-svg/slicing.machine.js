import { createMachine } from 'xstate'

export const slicingMachine = createMachine({
	id: 'Machine Name',
	initial: 'idle',
	context: {
		selectedSlice: undefined, // key
	},
	states: {
		idle: {
			on: {
				SELECT_SLICE: {
					target: 'selected',
					actions: 'setSlice',
				},
			},
		},
		selected: {
			initial: 'movingTool',
			states: {
				movingTool: {
					on: {
						SLICING_TOOL: {
							target: 'slicingTool',
						},
					},
				},
				slicingTool: {
					on: {
						MOVING_TOOL: {
							target: 'movingTool',
						},
					},
					states: {
						pointerUp: {
							on: {
								PRESS_POINTER: {
									target: 'pointerDown',
								},
							},
						},
						pointerDown: {
							on: {
								MOVE_POINTER: {
									actions: 'drawPath',
								},
								RELEASE_POINTER: {
									target: 'pointerUp',
								},
							},
						},
					},
				},
			},
			on: {
				DESELECT: {
					target: 'idle',
					actions: 'setSlice',
				},
			},
		},
	},
	predictableActionArguments: true,
	preserveActionOrder: true,
})

import { createMachine } from 'xstate'

export const slicingMachine = createMachine({
	id: 'Machine Name',
	initial: 'idle',
	context: {
		selectedSlice: undefined, // key
		slicingPath: [],
		pointerDownOrigin: undefined,
	},
	on: {
		RELEASE_POINTER: {
			actions: 'releasePointer',
		},
		PRESS_POINTER: {
			actions: 'setPointer',
		},
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
						MOVE_POINTER: {
							actions: 'moveSlice',
							cond: 'pointerIsDown',
						},
					},
				},
				slicingTool: {
					on: {
						FINISH_SLICING: {
							target: 'movingTool',
							actions: 'finishSlicing',
						},
						MOVING_TOOL: {
							target: 'movingTool',
						},
						MOVE_POINTER: {
							actions: 'addPathToSlicing',
							cond: 'pointerIsDown',
						},
					},
				},
			},
			on: {
				SELECT_SLICE: {
					actions: 'setSlice',
				},
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

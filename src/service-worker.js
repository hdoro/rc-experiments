self.addEventListener('install', (event) => {
	console.log('sw:installed')
})

self.addEventListener('activate', (event) => {
	console.log('sw:activated')
	event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
	console.log('sw:fetching', event)
})

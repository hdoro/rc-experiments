import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

const config: UserConfig = {
	plugins: [sveltekit(), mkcert()],
	// Expose over the network to use on mobile
	server: { host: '0.0.0.0', https: true },
}

export default config

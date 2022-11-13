<script>
	import { createApi } from 'unsplash-js'
	import { PUBLIC_UNSPLASH_ACCESS_KEY } from '$env/static/public'

	const unsplash = createApi({
		accessKey: PUBLIC_UNSPLASH_ACCESS_KEY,
	})

	let searchQuery = ''

	let pictures = []

	async function runSearch() {
		const res = await unsplash.search.getPhotos({ query: searchQuery })
		console.log({ res })
		if (res.response?.results) {
			pictures = res.response?.results
		}
	}
</script>

<form on:submit|preventDefault={runSearch}>
	<input bind:value={searchQuery} type="search" />

	<button type="submit">Search</button>
</form>

<div class="grid">
	{#each pictures as picture}
		<figure>
			<img src={picture?.urls?.small} alt={picture.alt_description} />
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

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	figure,
	img {
		display: block;
		max-width: 100%;
		padding: 0;
		margin: 0;
	}
</style>

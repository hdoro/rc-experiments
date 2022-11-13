<div>
	<img src="https://picsum.photos/seed/lemuel/400" alt="pic" />
</div>

<style>
	div {
		position: relative;
		display: inline-block;
	}

	img {
		display: block;
	}

	div::after {
		content: '';
		display: block;
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		width: 100%;
		background-size: 10px 10px;
		background-image: radial-gradient(
			circle,
			rgba(50, 50, 50, 1) 2.5px,
			rgba(0, 0, 0, 0) 3px
		);
		mix-blend-mode: difference;
		opacity: 0.55;
	}
</style>

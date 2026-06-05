<script lang="ts">
	import { asset } from '$app/paths';
</script>

<div class="splash">
	<img src={asset('/app-icon.svg')} alt="PAS" />

	<h1>Loading POS...</h1>
</div>

<style>
	.splash {
		height: 100vh;
		display: grid;
		align-items: center;
		justify-content: center;
		background: #111;
		color: white;
		font-family: sans-serif;
	}
</style>

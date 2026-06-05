<script lang="ts">
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import Button from '../ui/button/button.svelte';

	import { page } from '$app/state';

	import { ButtonGroup } from '../ui/button-group';
	import { X, Square, Minus, BookOpenText, SunIcon, MoonIcon, Music4, Settings, Monitor } from 'lucide-svelte';
	import { ask as confirm } from '@tauri-apps/plugin-dialog';

	import { toastedgoto } from './toasted-navigation.svelte';
	import { toggleMode } from 'mode-watcher';
	// import { asset } from '$app/paths';

	async function minimize() {
		await getCurrentWindow().minimize();
	}

	async function maximize() {
		await getCurrentWindow().toggleMaximize();
	}

	async function close() {
		const confirmation = await confirm('Want to Close application?', {
			kind: 'warning'
		});
		if (confirmation) await getCurrentWindow().close();
	}
</script>

<header
	data-tauri-drag-region
	class=" bg-base-300 flex w-full cursor-grab items-center justify-between border bg-background px-3 py-2.5 select-none"
>
	<div class="flex items-center space-x-3">
		<!-- <img src={asset('/favicon.ico')} alt="PAS" class=" size-12" /> -->
		<ButtonGroup>
			<Button
				onclick={() => toastedgoto('/')}
				size="lg"
				class="hover:cursor-pointer"
				variant={page.url.pathname == '/' ? 'default' : 'link'}
			>
				<BookOpenText />
				Bible
			</Button>
			<Button
				onclick={() => toastedgoto('/presentation')}
				size="lg"
				class="hover:cursor-pointer"
				variant={page.url.pathname == '/presentation' ? 'default' : 'link'}
			>
				<Monitor />
				Presentations
			</Button>
			<Button
				onclick={() => toastedgoto('/songs')}
				size="lg"
				class="hover:cursor-pointer"
				variant={page.url.pathname == '/songs' ? 'default' : 'link'}
			>
				<Music4 />
				Lyrics
			</Button>
			<Button
				onclick={() => toastedgoto('/settings')}
				size="lg"
				class="hover:cursor-pointer"
				variant={page.url.pathname == '/settings' ? 'default' : 'link'}
			>
				<Settings />
				Settings
			</Button>
			<Button
				onclick={() => toastedgoto('/reader')}
				size="lg"
				class="hover:cursor-pointer"
				variant={page.url.pathname == '/reader' ? 'default' : 'link'}
			>
				<Settings />
				Settings
			</Button>
		</ButtonGroup>
	</div>

	<div class="flex items-center gap-2">
		<Button variant="ghost" onclick={toggleMode}>
			<SunIcon
				class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
			/>
			<MoonIcon
				class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
			/>

			<span class="sr-only">Toggle theme</span>
		</Button>
		<Button onclick={minimize} size="icon-lg" class="cursor-pointer " variant="link"
			><Minus /></Button
		>

		<Button onclick={maximize} size="icon-lg" class="cursor-pointer " variant="link"
			><Square class="size-3.5" /></Button
		>

		<Button onclick={close} variant="destructive" size="icon-lg" class="cursor-pointer "
			><X /></Button
		>
	</div>
</header>

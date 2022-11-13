<script lang="ts">
	/**
	 * Conclusion:
	 * - Only runs on Chromium, but Brave requires a flag
	 * - Poor UX, need to always allow editing before start working
	 * - But surprisingly fast!
	 * - In production, I'd rather use IndexDB and, when users are beyond storage limit, show warning to download Electron/Tauri-based app that then has native access to the filesystem
	 * - Also, I can use <a download> to save .zip when users want to do the backup themselves and get their data transparently (indexDB is super opaque)
	 */

	let fileHandle
	let dirHandle

	let textValue = ''
	let mediaFiles: FileList

	$: jsonFile = JSON.stringify({ textValue })
	$: console.log({ files: mediaFiles, jsonFile, fileHandle, dirHandle })
	$: if (textValue && fileHandle) {
		writeFile(fileHandle, textValue)
	}
	$: if (jsonFile && dirHandle) {
		console.log({ mediaFiles })
		writeToDir(dirHandle)
	}

	async function getNewFileHandle() {
		console.log(window.showSaveFilePicker)
		if (window.showSaveFilePicker === undefined) return

		const options = {
			types: [
				{
					description: 'Text Files',
					accept: {
						'text/plain': ['.txt'],
					},
				},
			],
		}

		try {
			const handle = await window.showSaveFilePicker(options)
			return handle
		} catch (error) {
			return
		}
	}

	async function getNewDirHandle() {
		console.log(window.showDirectoryPicker)
		if (window.showDirectoryPicker === undefined) return

		try {
			const handle = await window.showDirectoryPicker({
				mode: 'readwrite',
			})
			return handle
		} catch (error) {
			return
		}
	}

	async function writeFile(handle, contents) {
		// Create a FileSystemWritableFileStream to write to.
		const writable = await handle.createWritable()
		// Write the contents of the file to the stream.
		await writable.write(contents)
		// Close the file and write the contents to disk.
		await writable.close()
	}

	async function writeToDir(dirHandle) {
		const assetsDirHandle = await dirHandle.getDirectoryHandle('assets', {
			create: true,
		})
		const jsonDataHandle = await dirHandle.getFileHandle('data.json', {
			create: true,
		})
		// Create a FileSystemWritableFileStream to write to.
		const writable = await jsonDataHandle.createWritable()
		// Write the contents of the file to the stream.
		await writable.write(jsonFile)
		// Close the file and write the contents to disk.
		await writable.close()

		for (const mediaFile of mediaFiles || []) {
			console.log({ mediaFile, name: mediaFile.name })
			// How to save a media file?
			const mediaFileHandle = await assetsDirHandle.getFileHandle(
				mediaFile.name,
				{
					create: true,
				},
			)
			// Create a FileSystemWritableFileStream to write to.
			const writable = await mediaFileHandle.createWritable()
			// Write the contents of the file to the stream.
			await writable.write(mediaFile)
			// Close the file and write the contents to disk.
			await writable.close()
		}
	}
</script>

<h1>Filesystem API</h1>

<div>
	<h2>Text</h2>
	<input bind:value={textValue} type="text" />
</div>

<div>
	<h2>Files</h2>
	<input type="file" multiple bind:files={mediaFiles} accept="image/*" />

	{#each mediaFiles || [] as file}
		<div>
			<h3>{file.name}</h3>
			<img src={URL.createObjectURL(file)} alt={file.name} />
		</div>
	{/each}
</div>

<button
	on:click={async () => {
		// if (!fileHandle) {
		// 	fileHandle = await getNewFileHandle()
		// }
		if (!dirHandle) {
			dirHandle = await getNewDirHandle()
		}
	}}>Save to directory</button
>

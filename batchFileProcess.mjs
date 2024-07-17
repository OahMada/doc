import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function handleBatchFiles(directory) {
	try {
		let files = await readdir(directory);
		for (let file of files) {
			let filePath = path.join(directory, file);
			let fileStat = await stat(filePath);
			if (fileStat.isDirectory()) {
				handleBatchFiles(filePath); // Recursively handle directories
			} else {
				if(path.extname(filePath) === '.html') { 
					try {
						let fileData = await readFile(filePath, { encoding: 'utf8' });

						// hide two unnecessary elements
						fileData = fileData.replace('</style>', `button[aria-label="Search"] {
							display: none;
						}
						div.flex.flex-col.items-start.gap-2.mt-2 {
							display: none;
						}</style>`);

						// fix link navigation
						fileData = fileData.replaceAll(/("href\\":\\")((?!http|#).*?)(\/?\\")/g, (_, p1, p2, p3) => {
							return p1 + '/areas/gitbook' + p2 + '.html' + p3;
						});	

						try {
							await writeFile(filePath, fileData);
						} catch (error) {
							console.error(error);
						}
					} catch (error) {
						console.error(error);
					}
				}
			}
		}
	} catch (err) {
		console.error(err);
	}
}

// Call the function with the root directory to start the recursive process
handleBatchFiles('.');

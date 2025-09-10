import type { RequestHandler } from '@sveltejs/kit';
import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const videoFile = formData.get('video') as File;

	if (!videoFile || videoFile.size === 0) {
		return new Response(JSON.stringify({ error: 'Nenhum arquivo de vídeo foi enviado.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const uniqueId = randomUUID();
	// Use a generic extension that won't be misinterpreted by the OS
	const tempInputFileName = `${uniqueId}.tmp`;
	const tempInputFilePath = join(tmpdir(), tempInputFileName);
	const tempOutputFilePath = join(tmpdir(), `${uniqueId}-compressed.mp4`);

	try {
		// 1. Save file to a temporary location
		await writeFile(tempInputFilePath, Buffer.from(await videoFile.arrayBuffer()));

		// 2. Run ffprobe to get duration
		const { stdout: ffprobeOutput } = await execPromise(
			`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempInputFilePath}"`
		);
		const duration = parseFloat(ffprobeOutput);
		if (isNaN(duration) || duration <= 0) {
			throw new Error('Não foi possível determinar a duração do vídeo.');
		}

		// 3. Calculate target bitrate
		const targetSizeMB = 171;
		const targetSizeBytes = targetSizeMB * 1024 * 1024;
		const audioBitrateKbps = 128;
		const targetVideoBitrateKbps = Math.floor(
			(targetSizeBytes * 8) / duration / 1000 - audioBitrateKbps
		);

		if (targetVideoBitrateKbps <= 0) {
			throw new Error('O vídeo é muito curto ou o tamanho alvo é muito pequeno para comprimir.');
		}

		// 4. Run ffmpeg (2-pass)
		const ffmpegLogFile = join(tmpdir(), `ffmpeg2pass-${uniqueId}.log`);
		const ffmpegPass1 = `ffmpeg -y -i "${tempInputFilePath}" -c:v libx264 -b:v ${targetVideoBitrateKbps}k -pass 1 -passlogfile "${ffmpegLogFile}" -an -f null /dev/null`;
		const ffmpegPass2 = `ffmpeg -i "${tempInputFilePath}" -c:v libx264 -b:v ${targetVideoBitrateKbps}k -pass 2 -passlogfile "${ffmpegLogFile}" -c:a aac -b:a ${audioBitrateKbps}k "${tempOutputFilePath}"`;

		await execPromise(ffmpegPass1);
		await execPromise(ffmpegPass2);

		// 5. Stream the result
		const compressedVideoBuffer = await readFile(tempOutputFilePath);

		const sanitizedFilename = (videoFile.name || 'video.mp4').replace(/[^\x00-\x7F]/g, "");
		return new Response(compressedVideoBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'video/mp4',
				'Content-Disposition': `attachment; filename="compressed-${sanitizedFilename}`,
				'Content-Length': compressedVideoBuffer.length.toString()
			}
		});
	} catch (err: any) {
		console.error('Error processing file:', err);
		return new Response(
			JSON.stringify({ error: err.message || 'Falha ao processar o arquivo de vídeo. Verifique se o ffmpeg está instalado no servidor.' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	} finally {
		// 6. Clean up temp files
		try {
			await unlink(tempInputFilePath);
			await unlink(tempOutputFilePath);
			// Clean up ffmpeg log files
			await unlink(join(tmpdir(), `ffmpeg2pass-${uniqueId}.log`));
			await unlink(join(tmpdir(), `ffmpeg2pass-${uniqueId}.log.mbtree`));
		} catch (err) {
			// Do nothing, they will be cleaned up eventually
		}
	}
};
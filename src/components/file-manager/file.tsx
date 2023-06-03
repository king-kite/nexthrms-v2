import { IconType } from 'react-icons';
import { AiFillFileZip } from 'react-icons/ai';
import {
	FaFile,
	FaFileAudio,
	FaFileCsv,
	FaFileExcel,
	FaFilePdf,
	FaFilePowerpoint,
	FaFileVideo,
	FaFileWord,
	FaImage,
} from 'react-icons/fa';

import { ManagedFileType } from '../../types';

type NameKey =
	| 'audio'
	| 'image'
	| 'word'
	| 'excel'
	| 'pdf'
	| 'csv'
	| 'video'
	| 'powerpoint'
	| 'zip';

function getName(name: string, max = 26) {
	return name.length > max ? `${name.slice(0, max)}...` : name;
}

function getExtension(name: string) {
	const _split = name.toLowerCase().split('.');
	const extension = _split[_split.length - 1];
	return extension;
}

function getTypeFromName(name: string) {
	const extension = getExtension(name);

	const types = {
		audio: {
			extensions: ['mp3', 'm4a', 'wav', 'wma', 'aac', 'flac', 'ogg'],
		},
		image: {
			extensions: [
				'jpg',
				'jpeg',
				'png',
				'ico',
				'gif',
				'tiff',
				'webp',
				'bmp',
				'svg',
			],
		},
		csv: {
			extensions: ['csv'],
		},
		excel: {
			extensions: ['xls', 'xlsm', 'xlsb', 'xltx', 'xlsx'],
		},
		pdf: {
			extensions: ['pdf'],
		},
		powerpoint: {
			extensions: ['ppt', 'pptx', 'ppsx', 'odp'],
		},
		video: {
			extensions: [
				'3gp',
				'mp4',
				'mov',
				'mkv',
				'webm',
				'flv',
				'swf',
				'f4v',
				'avi',
				'wmv',
			],
		},
		word: {
			extensions: ['doc', 'docx', 'dot', 'dotx'],
		},
		zip: {
			extensions: ['zip'],
		},
	};

	const keys = Object.keys(types) as NameKey[];

	const key: NameKey | null = keys.reduce((acc: NameKey | null, value) => {
		if (acc) return acc;
		if (types[value].extensions.includes(extension)) return value;
		return null;
	}, null);

	return key;
}

function getType(_type: string): NameKey | 'file' {
	const type = _type.toLowerCase();

	if (type.includes('image')) return 'image';
	if (type.includes('video')) return 'video';
	if (type.includes('audio')) return 'audio';
	if (type.includes('zip')) return 'zip';
	if (type.includes('csv')) return 'csv';
	if (type.includes('pdf')) return 'pdf';
	if (type.includes('word')) return 'word';
	if (type.includes('powerpoint')) return 'powerpoint';
	if (type.includes('excel')) return 'excel';

	return 'file';
}

function getIcon(_type: string, url: string, name: string): IconType {
	const type = getTypeFromName(url) || getTypeFromName(name) || getType(_type);

	switch (type) {
		case 'audio':
			return FaFileAudio;
		case 'csv':
			return FaFileCsv;
		case 'excel':
			return FaFileExcel;
		case 'image':
			return FaImage;
		case 'pdf':
			return FaFilePdf;
		case 'powerpoint':
			return FaFilePowerpoint;
		case 'video':
			return FaFileVideo;
		case 'word':
			return FaFileWord;
		case 'zip':
			return AiFillFileZip;
		default:
			return FaFile;
	}
}

function FileComponent({ name, type, url }: ManagedFileType) {
	const Icon = getIcon(type, url, name);

	return (
		<abbr
			title={name}
			className="cursor-pointer flex flex-col items-center no-underline transition-all hover:scale-105"
		>
			<span className="text-gray-700">
				<Icon className="h-[50px] text-gray-700 w-[50px]" />
			</span>
			<span className="font-light mt-1 text-center text-gray-500 text-sm md:text-base">
				{getName(name)}
			</span>
		</abbr>
	);
}

export default FileComponent;

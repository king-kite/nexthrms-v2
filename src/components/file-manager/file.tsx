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

import { BoxGridItem } from './box-items';
import { MEDIA_HIDDEN_FILE_NAME } from '../../config';
import { ManagedFileType } from '../../types';

export type NameKey =
	| 'audio'
	| 'image'
	| 'word'
	| 'excel'
	| 'pdf'
	| 'csv'
	| 'video'
	| 'powerpoint'
	| 'zip';

function getName(name: string, max = 22) {
	return name.length > max ? `${name.slice(0, max)}...` : name;
}

export function getExtension(name: string) {
	const _split = name.toLowerCase().split('.');
	if (_split.length <= 1) return null;
	const extension = _split[_split.length - 1];
	return extension;
}

export function getTypeFromLocation(name: string) {
	const extension = getExtension(name);

	if (!extension) return null;

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

export function getFileType(type: string, url: string, name: string) {
	return getTypeFromLocation(url) || getTypeFromLocation(name) || getType(type);
}

export function getIcon(_type: string, url: string, name: string): IconType {
	const type = getFileType(_type, name, url);

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
	if (
		name.includes(MEDIA_HIDDEN_FILE_NAME) ||
		url.includes(MEDIA_HIDDEN_FILE_NAME)
	)
		return null;

	const icon = getIcon(type, url, name);
	const fileType = getFileType(type, url, name);

	const bg =
		fileType === 'image'
			? 'bg-blue-500'
			: fileType === 'audio'
			? 'bg-purple-500'
			: fileType === 'video'
			? 'bg-green-500'
			: fileType === 'word'
			? 'bg-blue-600'
			: fileType === 'excel'
			? 'bg-green-600'
			: fileType === 'zip'
			? 'bg-yellow-700'
			: fileType === 'pdf'
			? 'bg-red-500'
			: 'bg-gray-500';

	// getName(name)
	return <BoxGridItem bg={bg} caps={false} icon={icon} title={name} />;
}

export function FileAction({
	border = 'border-gray-400',
	color = 'text-gray-400',
	icon: Icon,
	title,
}: {
	border?: string;
	color?: string;
	icon: IconType;
	title: string;
}) {
	return (
		<abbr
			className="cursor-pointer flex flex-col items-center no-underline"
			title={title}
		>
			<span
				className={`bg-gray-50 border ${border} ${color} duration-500 flex h-[30px] items-center justify-center rounded-md transform transition-all w-[30px] hover:scale-105`}
			>
				<Icon className="h-[13px] w-[13px]" />
			</span>
			<p className="mt-[0.1rem] text-gray-400 text-xs md:text-sm">{title}</p>
		</abbr>
	);
}

export default FileComponent;

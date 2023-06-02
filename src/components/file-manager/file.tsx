import { IconType } from 'react-icons';
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

function getName(name: string, max = 15) {
	return name.length > max ? `${name.slice(0, max)}...` : name;
}

function getTypeFromURL(url: string) {
	const extension = url.toLowerCase();

	const types = {
		audio: {
			name: 'audio',
			extensions: ['mp3', 'm4a', 'wav', 'wma', 'aac', 'flac', 'ogg'],
			type: 'audio',
		},
		image: {
			name: 'image',
			extensions: ['jpg', 'jpeg', 'png', 'ico', 'gif', 'tiff', 'webp', 'bmp', 'svg'],
			type: 'image',
		},
		csv: {
			name: 'csv',
			extensions: ['csv'],
			type: 'csv',
		},
		excel: {
			name: 'excel',
			extensions: ['xls', 'xlsm', 'xlsb', 'xltx', 'xlsx'],
			type: 'excel',
		},
		pdf: {
			name: 'pdf',
			extensions: ['pdf'],
			type: 'pdf',
		},
		powerpoint: {
			name: 'powerpoint',
			extensions: ['ppt', 'pptx', 'ppsx', 'odp'],
			type: 'powerpoint',
		},
		video: {
			name: 'video',
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
			type: 'video',
		},
		word: {
			name: 'word',
			extensions: ['doc', 'docx', 'dot', 'dotx'],
			type: 'word',
		},
		zip: {
			name: 'zip',
			extensions: ['zip'],
			type: 'zip',
		},
	};  

  const keys = Object.keys(types) as NameKey[];

  const key: NameKey | null = keys.reduce((acc: NameKey | null, value) => {
    if (acc) return acc;
    if (types[value].extensions.includes(extension)) return value
    return null;
  }, null)

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

function getIcon(_type: string, url: string): IconType {
	const type = getTypeFromURL(url) || getType(_type);

  switch(type) {
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
    default:
      return FaFile;
  }
}

function FileComponent({ name, type, url }: ManagedFileType) {
	const Icon = getIcon(type, url);

	return (
		<div className="cursor-pointer flex flex-col items-center transition-all hover:scale-105">
			<span className="text-gray-700">
				<Icon className="h-[50px] text-gray-700 w-[50px]" />
			</span>
			<span className="font-light mt-1 text-gray-500 text-sm md:text-base">
				{getName(name)}
			</span>
		</div>
	);
}

export default FileComponent;

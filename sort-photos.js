#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const exiftool = require('node-exiftool')

const ep = new exiftool.ExiftoolProcess()

const getFilenameParts = name => {
  const match = /(.*)\.([^.]+)/.exec(name)
  if (! match) {
    console.warn(`Unable to parse filename from extension: ${name}`);
    return { name, ext: '' };
  }
  return {
    name: match[1],
    ext: match[2],
  }
};

const checkIfHdr = async (file) => {
  const { data, error } = await ep.readMetadata(file, ['-File:all']);
  if (error) {
    console.error(`Error getting EXIF data for file ${file}`, error)
    return false;
  }
  console.log(`EXIF data for ${file}`, data[0]);
  return data[0].HDRImageType === 'HDR Image';
}

const filenameFromDate = async (file) => {
  const { name, ext } = getFilenameParts(file);
  if (!(
    /IMG_.*/.test(file)
    || /DSC.*/.test(file))
  ) {
    return {
      file,
      folder: '.',
      filename: name,
      ext,
      rename: false,
    };
  }

  const stat = await fs.stat(file)
  const fileDate = stat.mtime;
  [datePart, timePart] = fileDate.toISOString().split(/[T.]/)
  const folder = datePart.slice(0, 7)
  const isHdr = await checkIfHdr(file)
  const hdrFlag = isHdr ? ' HDR' : ''
  const filename = `${datePart} ${timePart.replace(/:/g, '.')}${hdrFlag}`;
  return {
    file,
    folder,
    filename,
    ext,
    rename: true,
    isHdr,
  };
}

// ./2016-01/2016-01-30 17.11.52 HDR-2.jpg
// ./2016-01/2016-01-30 17.11.52-1.jpg
const getFilename = ({ folder, filename, seq, ext}) => {
  if (seq) {
    return path.join(folder, `${filename}-${seq}.${ext}`);
  }
  return path.join(folder, `${filename}.${ext}`);
}

const moveFile = async ({ file, ...props }) => {
  const toFile = getFilename(props)
  // acquire lock
  try {
    if (toFile.exists) {
      const { seq = 0 } = props;
      await moveFile({ file, ...props, seq: seq + 1 })
    } else {
      await move(file, toFile);
    }
  } finally {
    // release lock
  }
}

const main = async () => {
  try {
    await ep.open();
    const filenames = await fs.readdir('.');
    const files = await Promise.all(filenames.map(filenameFromDate)).catch(err => console.error('Error getting new paths', err))
    const filesToRename = files.filter(({ rename }) => rename);
    const directories = new Set(filesToRename.map(({ folder }) => folder))
    // console.log('new Directories:', directories);
    // await Promise.all(directories.map(name => fs.mkdir(name)))
    // console.log('Moving files');
    // await Promise.all(filesToRename.map(moveFile));
    console.log('Done.');
  } finally {
    await ep.close();
  }
};

if (module === require.main) {
  main();
}

module.exports = {
  filenameFromDate,
  getFilename,
  getFilenameParts,
  checkIfHdr,
}
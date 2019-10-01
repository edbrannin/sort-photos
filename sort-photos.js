#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const getFilenameParts = name => {
  const match = /(.*)\.([^.]+)/.exec(name)
  return {
    name: match[1],
    ext: match[2],
  }
};

const filenameFromDate = async (file) => {
  const { name, ext } = getFilenameParts(file);
  if (!(
    /IMG_.*/.test(oldFilename)
    || /DSC.*/.test(oldFilename))
  ) {
    return {
      file,
      folder: '.',
      filename: name,
      ext,
      rename: false,
    };
  }

  const stat = await fs.stat(oldFilename)
  const fileDate = stat.mtime;
  [datePart, timePart] = fileDate.toISOString().split(/[T.]/)
  const folder = datePart.slice(0, 7)
  const filename = `${datePart} ${timePart.replace(/:/g, '.')}`;
  return {
    file,
    folder,
    filename,
    ext,
    rename: true,
  };
}

const moveFile = ({ file, foler, filename, ext, })

const main = async () => {
  const filenames = await fs.readdir('.');
  const files = await Promise.all(files.map(filenameFromDate)).catch(err => console.error('Error getting new paths', err))
  const filesToRename = files.filter(({ rename }) => rename);
  const directories = new Set(files.map(({ folder }) => folder))

  const [destinations, duplicates] = oldPathNewPaths.reduce(
    ([destinations, duplicates], [oldPath, newPath, willMove]) => {
      if (willMove) {
        if (destinations.has(newPath)) {
          duplicates.add(newPath);
        } else {
          destinations.add(newPath);
        }
      }
      return [destinations, duplicates];
    }, [new Set(), new Set()])
  duplicates.forEach(name => console.warn(`DUPLICATE destination: ${name}`));
  return;
  const directories = oldPathNewPaths.reduce((result, [oldPath, newPath, willMove]) => {
    if (willMove) {
      result.add(newPath.split('/')[0]);
    }
    return result;
  }, new Set())
  console.log('new Directories:', directories);
  await Promise.all(directories.map(name => fs.mkdir(name)))
  oldPathNewPaths.forEach(async ([oldPath, newPath]) => {
    if (oldPath === newPath) {
      console.log(`NOT moving ${oldPath}`);
    } else {
      console.log(`Will move ${oldPath} to ${newPath}`);
      if (await fs.access(newPath)) {
        console.error(`SKIPPING, already exists: ${oldPath} -> ${newPath}`)
        return;
      }
      await fs.rename(oldPath, newPath)
    }
  });
};


if (module === require.main) {
  main();
}

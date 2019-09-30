#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const getExtension = name => /\.[^.]+/.exec(name)[0];

const filenameFromDate = async (oldFilename) => {
  if (!(
    /IMG_.*/.test(oldFilename)
    || /DSC.*/.test(oldFilename))
  ) {
    return [oldFilename, false];
  }
  const stat = await fs.stat(oldFilename)
  const fileDate = stat.mtime;
  const ext = getExtension(oldFilename);
  [datePart, timePart] = fileDate.toISOString().split(/[T.]/)
  folderName = datePart.slice(0, 7)
  const newName = `${folderName}/${datePart} ${timePart.replace(/:/g, '.')}${ext}`;
  return [newName, true];
}

const main = async () => {
  const files = await fs.readdir('.');
  oldPathNewPaths = await Promise.all(files.map(async file => [
    file,
    ...(await filenameFromDate(file))
  ])).catch(err => console.error('Error getting new paths', err))
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

const {
  filenameFromDate,
  getFilename,
  getFilenameParts,
  checkIfHdr,
} = require('../sort-photos');

describe('getFilename()', () => {
  it('should make a filename without sequence', () => {
    const answer = getFilename({
      folder: '2016-01',
      filename: '2016-01-30 17.11.52',
      ext: 'jpg'
    })
    expect(answer).toBe('2016-01/2016-01-30 17.11.52.jpg')
  })

  it('should make a filename with sequence', () => {
    const answer = getFilename({
      folder: '2016-01',
      filename: '2016-01-30 17.11.52',
      seq: 3,
      ext: 'jpg'
    })
    expect(answer).toBe('2016-01/2016-01-30 17.11.52-3.jpg')
  })
})

describe('getFilenameParts()', () => {
  it('should split a file into name and extension', () => {
    expect(getFilenameParts('IMG_12345.jpg')).toStrictEqual({
      name: 'IMG_12345',
      ext: 'jpg',
    });
  })
})

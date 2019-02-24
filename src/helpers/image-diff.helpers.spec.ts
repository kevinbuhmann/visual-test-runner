import * as fs from 'fs';

import { ensureDirectoryExists } from './fs.helpers';
import { compareImages, generateDiffImage } from './image-diff.helpers';

const referenceImageFilePath = './test-fixtures/chalkboard-reference.png';
const identicalImageFilePath = './test-fixtures/chalkboard-reference.png';
const differentImageFilePath = './test-fixtures/chalkboard-different.png';
const invalidImageFilePath = './test-fixtures/chalkboard-invalid.png';

describe('image diff helpers', () => {
  describe('compareImages', () => {
    it('should return true if images are the same', async () => {
      expect(await compareImages(referenceImageFilePath, identicalImageFilePath)).toBe(true);
    });

    it('should return false if images are not the same', async () => {
      expect(await compareImages(referenceImageFilePath, differentImageFilePath)).toBe(false);
    });

    it('should throw if image is invalid', async () => {
      await expectAsync(compareImages(referenceImageFilePath, invalidImageFilePath)).toBeRejected();
    });
  });

  describe('generateDiffImage', () => {
    it('should generate the expected diff if images are the same', async () => {
      const tmpDiffFilePath = './tmp/chalkboard-identical-diff.png';
      ensureDirectoryExists(tmpDiffFilePath);
      await generateDiffImage(referenceImageFilePath, identicalImageFilePath, tmpDiffFilePath);
      const diffImageBuffer = fs.readFileSync(tmpDiffFilePath);

      const expectedDiffFilePath = './test-fixtures/chalkboard-identical-diff.png';
      const exepectedDiffImageBuffer = fs.readFileSync(expectedDiffFilePath);

      expect(diffImageBuffer).toEqual(exepectedDiffImageBuffer);
    });

    it('should generate the expected diff if images are different', async () => {
      const tmpDiffFilePath = './tmp/chalkboard-different-diff.png';
      ensureDirectoryExists(tmpDiffFilePath);
      await generateDiffImage(referenceImageFilePath, differentImageFilePath, tmpDiffFilePath);
      const diffImageBuffer = fs.readFileSync(tmpDiffFilePath);

      const expectedDiffFilePath = './test-fixtures/chalkboard-different-diff.png';
      const exepectedDiffImageBuffer = fs.readFileSync(expectedDiffFilePath);

      expect(diffImageBuffer).toEqual(exepectedDiffImageBuffer);
    });
  });
});

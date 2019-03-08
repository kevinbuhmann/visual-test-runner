import * as looksSame from 'looks-same';

export function compareImages(referenceImageFilePath: string, testImageFilePath: string) {
  return new Promise<boolean>((resolve, reject) => {
    looksSame(referenceImageFilePath, testImageFilePath, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.equal);
      }
    });
  });
}

export function generateDiffImage(referenceImageFilePath: string, testImageFilePath: string, diffFilePath: string) {
  return new Promise<void>((resolve, reject) => {
    looksSame.createDiff(
      {
        reference: referenceImageFilePath,
        current: testImageFilePath,
        diff: diffFilePath,
        highlightColor: '#ff00ff'
      },
      error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
}

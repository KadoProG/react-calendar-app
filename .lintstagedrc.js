import { ESLint } from 'eslint';

export default {
  '*.{ts,tsx}': async (absolutePaths) => {
    const removeIgnoredFiles = async (files) => {
      const eslint = new ESLint();
      const isIgnored = await Promise.all(
        files.map((file) => {
          return eslint.isPathIgnored(file);
        })
      );
      const filteredFiles = files.filter((_, i) => !isIgnored[i]);
      return filteredFiles.join(' ');
    };

    const filesToLint = await removeIgnoredFiles(absolutePaths);
    return [`eslint --max-warnings=0 ${filesToLint}`];
  },
};

import packageName from './package-name';
import { join, relative, dirname } from 'path';

function maybeRelativize(specifier, sourceFileName, opts) {
  let name = packageName(specifier);
  if (name && name === opts.ownName) {
    let fullPath = specifier.replace(name, opts.basedir || '.');
    let relativePath = relative(dirname(sourceFileName), fullPath);
    if (relativePath[0] !== '.') {
      relativePath = `./${relativePath}`;
    }
    return relativePath;
  } else {
    return specifier;
  }
}

function makeHBSExplicit(specifier, _) {
  // this is gross, but unforunately we can't get enough information to locate
  // the original file on disk in order to go check whether it's really
  // referring to a template. To fix this, we would need to modify
  // broccoli-babel-transpiler, but a typical app has many many copies of that
  // library at various different verisons (a symptom of the very problem
  // ember-cli-vanilla exists to solve).
  if (/\btemplates\b/.test(specifier) && !/\.hbs$/.test(specifier)) {
    return specifier + '.hbs';
  }
  return specifier;
}

export default function main(){
  return {
    visitor: {
      'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration'(path, { opts }) {
        const {source} = path.node;
        if (source === null) {
          return;
        }
        let sourceFileName = path.hub.file.opts.filename;
        let specifier = maybeRelativize(source.value, sourceFileName, opts);
        source.value = makeHBSExplicit(specifier, sourceFileName);
      },
    }
  };
}

(main as any).baseDir = function() {
  return join(__dirname, '..');
};

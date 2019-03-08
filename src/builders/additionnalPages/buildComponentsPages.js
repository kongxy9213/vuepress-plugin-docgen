const { parse } = require('vue-docgen-api');
const fs = require('fs');

const { getCompiledTemplateWithHbs } = require('../handlebars');
const VueParser = require('../../parser/vue');

const {getFileNameFromAbsolutePath} = require("../../extractors/pathReader")
const {dropVueExtension} = require("../../extractors/name")

const buildIndexPageComponent = finalContext => {
  const contentTemplate = finalContext.options.globalIndexComponentTemplate
  return {
    path: `/${finalContext.options.sideBarName}`,
    content: getCompiledTemplateWithHbs(finalContext, contentTemplate)
  }
};

const buildComponentPage = (absolutePath, parentPath, finalContext) => {
  let preview = '';

  const componentInfo = parse(absolutePath);
  const componentPreviewCompiled = getCompiledTemplateWithHbs(
        componentInfo, 
        finalContext.options.componentsDocsTemplate);

  const readedComponent = fs.readFileSync(absolutePath, { encoding: 'utf-8'});

  let componentName = getFileNameFromAbsolutePath(absolutePath)
  componentName = dropVueExtension(componentName);

  const vueParser = new VueParser({
    source: readedComponent,
    fileName: componentName,
  });

  const docsBlock = vueParser.getCustomBlock('docs');

  if (docsBlock) preview = finalContext.options.docsBlockTemplate(docsBlock);

  let content = componentPreviewCompiled;
  content += preview;

  return {
    path: `${parentPath + componentName}.html`,
    content,
  };
};

module.exports = (finalContext) => {
  const ctx = finalContext.componentsPathContext;
  const { rootDir } = finalContext.options;
  const componentsPages = [];
  const prefix = finalContext.options.sideBarName

  Object.keys(ctx).forEach((k) => {
    if (k === 'children') {
      ctx[k].forEach((componentRelativePath) => {
        componentsPages.push(
          buildComponentPage(
            `${rootDir}/${componentRelativePath}`,
            `/${prefix}/`,
            finalContext
          ),
        );
      });
    } else {
      ctx[k].children.forEach((componentRelativePath) => {
        componentsPages.push(
          buildComponentPage(
            `${rootDir}/${k}/${componentRelativePath}`,
            `/${prefix}/${k}/`,
            finalContext
          ),
        );
      });
    }
  });

  return [
    buildIndexPageComponent(finalContext),
    ...componentsPages,
  ];
};
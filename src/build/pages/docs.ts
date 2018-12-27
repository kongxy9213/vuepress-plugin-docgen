import { parse } from 'vue-docgen-api'
import { readFile } from '../../utils/file'
import { IComponentContext, IVuePressPage } from '../../types'
import { DocsParser, VueParser } from '../../parse'

export default async ({
  context,
}: {
  context: IComponentContext
}): Promise<IVuePressPage> => {
  const componentInfo = parse(context.absolutePathname)
  let content = DocsParser(componentInfo)

  const source = readFile(context.absolutePathname)
  const vueParser = new VueParser({ source, fileName: context.fileName })

  const docsBlock = vueParser.getCustomBlock('docs')
  context.existDocs = docsBlock !== null
  content += docsBlock === null ? '' : docsBlock.content

  return {
    path: context.link,
    content,
  }
}

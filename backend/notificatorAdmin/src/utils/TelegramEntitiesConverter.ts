import { JSDOM } from 'jsdom';

function TelegramEntitiesConverter(html: string): { text: string; entities: Array<any> } {
  const entities: Array<any> = [];
  let plainText = '';
  const tagStack: Array<{ tag: string; offset: number; href?: string }> = [];
  let index = 0;

  const tagMap: { [key: string]: string } = {
    b: 'textEntityTypeBold',
    strong: 'textEntityTypeBold',
    i: 'textEntityTypeItalic',
    em: 'textEntityTypeItalic',
    u: 'textEntityTypeUnderline',
    code: 'textEntityTypeCode',
    a: 'textEntityTypeTextUrl',
  };

  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const parseNode = (node: Node) => {
    // Проверка текста узла
    if (node.nodeType === 3) { // 3 обозначает TEXT_NODE
      plainText += node.textContent || '';
      index += (node.textContent || '').length;
    } else if (node.nodeType === 1) { // 1 обозначает ELEMENT_NODE
      const element = node as HTMLElement;
      const tagType = tagMap[element.tagName.toLowerCase()];

      if (tagType) {
        const offset = index;
        tagStack.push({ tag: tagType, offset });
      }

      if (element.tagName.toLowerCase() === 'a') {
        const href = element.getAttribute('href');
        if (href) {
          tagStack[tagStack.length - 1].href = href;
        }
      }

      element.childNodes.forEach(parseNode);

      const tagInfo = tagStack.pop();
      if (tagInfo) {
        const length = index - tagInfo.offset;

        const entity: any = {
          _: 'textEntity',
          offset: tagInfo.offset,
          length: length,
          type: { _: tagInfo.tag },
        };

        if (tagInfo.tag === 'textEntityTypeTextUrl' && tagInfo.href) {
          entity.type.url = tagInfo.href;
        }

        entities.push(entity);
      }
    }
  };

  doc.body.childNodes.forEach(parseNode);

  return { text: plainText, entities };
}

export default TelegramEntitiesConverter;

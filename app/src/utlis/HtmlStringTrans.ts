export class HTMLStringTransfer{

  parseClassname: null | string;

  constructor() {
    this.parseClassname = null;    
  }
  
  setSecret() {
    const _parseClassname = Math.random().toString(36).substr(2);
    this.parseClassname = _parseClassname;
    return _parseClassname;
  }

  getString(HtmlNode: HTMLElement){
    HtmlNode.setAttribute('id', this.setSecret());
    return HtmlNode.outerHTML;
  }
  
  getHtmlNode(HtmlStr: string) {
    if(this.parseClassname) {
      const _node = document.getElementById(this.parseClassname);
      _node && _node.removeAttribute('id');
      return _node
    }
    return null
  }

}
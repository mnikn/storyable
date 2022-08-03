import { generateUUID } from 'renderer/utils/uuid';

// link
export interface LinkData {
  [key: string]: any;
}

export interface NodeLinkJsonData {
  sourceId: string;
  targetId: string;
  data: LinkData;
}

export class Link {
  public source: Node<any>;
  public target: Node<any>;
  public data: LinkData = {};

  constructor(source: Node<any>, target: Node<any>) {
    this.source = source;
    this.target = target;
  }

  toJson(): NodeLinkJsonData {
    const sourceId = this.source.id;
    const targetId = this.target.id;
    return {
      sourceId: sourceId,
      targetId: targetId,
      data: this.data,
    };
  }
}

// node
export interface NodeJsonData {
  id?: string;
  parentId?: string;
  type: string;
  children: NodeJsonData[];
  links: NodeLinkJsonData[];
  data: {
    [key: string]: any;
  };
}

class Node<T> {
  public id = generateUUID();

  public data: T | null = null;

  protected _links: Link[] = [];

  constructor(data?: T, id?: string) {
    if (data) {
      this.data = data;
    }
    if (id) {
      this.id = id;
    }
  }

  get parent() {
    // return this._parent;
    return null;
  }

  set parent(val: Node<T> | null) {
    // this._parent = val;
    return;
  }

  get children() {
    // return this._children;
    return [];
  }

  set children(val: Node<any>[]) {
    console.log(val);
    // remove origin children parent and assign new one

    // this._children.forEach((item) => {
    //   item.parent = null;
    // });

    // this._children = val.map((item) => {
    //   item.parent = this;
    //   return item;
    // });

    // this._links = val.map((item) => {
    //   const matchLink = this._links.find(
    //     (l) => l.source === this && l.target === item
    //   );
    //   if (matchLink) {
    //     return matchLink;
    //   }
    //   const instance = this.createLink(item);
    //   return instance;
    // });
  }

  get links(): Link[] {
    return this._links;
  }

  set links(val: Link[]) {
    this._links = val;
  }

  public toRenderJson(): any {
    return {
      id: this.id,
      children: this.children.map((item) => {
        return item.toRenderJson();
      }),
      parentId: this.parent?.id || null,
      data: this.data,
      links: this.links.map((item) => item.toJson()),
    };
  }

  findChildNode(id: string): Node<any> | null {
    return this.doFindChildNode(this, id);
  }

  private doFindChildNode(node: Node<any> | null, id: string) {
    if (!node) {
      return null;
    }
    if (node.id === id) {
      return node;
    }

    let res: any = null;
    node.children.forEach((item) => {
      res = res || this.doFindChildNode(item, id);
    });

    return res;
  }

  protected createLink(target: Node<any>): Link {
    const instance = new Link(this, target);
    return instance;
  }

  iterate(callback: (node: Node<any>) => void) {
    this.doIterate(this, callback);
  }

  private doIterate(node: Node<any>, callback: (val: Node<any>) => void) {
    if (!node) {
      return;
    }
    callback(node);
    node.children.forEach((item) => {
      callback(item);
      this.doIterate(item, callback);
    });
  }

  // deleteChildNode(id: string) {
  //   this.iterate((item) => {
  //     if (item.id === id && item.parent) {
  //       item.parent.children = item.parent.children.filter(
  //         (n) => n.id !== item.id
  //       );
  //     }
  //   });
  // }

  // addChildNode(node: Node<any>, index: number | null = null) {
  //   node.parent = this;
  //   if (index === null) {
  //     this._children.push(node);
  //   } else {
  //     this._children.splice(index, 0, node);
  //   }

  //   this.createLink(node);
  // }

  findLink(targetId: string): Link | null {
    return (
      this.links.find((l) => l.source === this && l.target === targetId) || null
    );
  }
}

export default Node;

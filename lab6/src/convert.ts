export interface AbstractSyntaxTree {
  type: string
  children: any
}
export class AbstractSyntaxTreeNode {
  private readonly type: string
  private readonly children: any

  constructor (type: string, children: any) {
    this.type = type
    this.children = children
  }
}

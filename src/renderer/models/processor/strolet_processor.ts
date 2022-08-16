import { Storylet, StoryletBranchNode, StoryletNode } from '../storylet';
import {
  ConditionType,
  NumberCondition,
  NumberComapreType,
  StringCondition,
  StringComapreType,
  BooleanCondition,
  BooleanCompareType,
} from '../condition';

export class StoryletProcessor {
  public currentNode: StoryletNode<any> | null = null;
  public currentStorylet: Storylet | null = null;
  public params: any = {};

  public init(storylet: Storylet, params: any = {}) {
    this.currentStorylet = storylet;
    this.params = params;
    const hierarchy = storylet.toHierarchyJson();
    if (hierarchy.length === 0 || !this.currentStorylet) {
      return;
    }
    const rootNode = hierarchy[0];
    this.currentNode = this.currentStorylet.nodes[rootNode.id];
  }

  public next() {
    if (!this.currentNode || !this.currentStorylet) {
      return;
    }

    if (this.currentNode instanceof StoryletBranchNode) {
      return;
    }

    let children = this.currentStorylet
      .getNodeChildren(this.currentNode.id)
      .filter((item) => {
        return item.data.enableConditions.reduce((res, c) => {
          if (!res) {
            return res;
          }
          if (c.conditionType === ConditionType.Number) {
            const con = c as NumberCondition;
            const matchParam = this.params.find(
              (p: any) => p.name === con.sourceParam
            );
            if (matchParam) {
              if (con.compareType === NumberComapreType.Equal) {
                return con.targetValue === matchParam.value;
              }
              if (con.compareType === NumberComapreType.NotEqual) {
                return con.targetValue !== matchParam.value;
              }
              if (con.compareType === NumberComapreType.Greater) {
                return matchParam.value > con.targetValue;
              }
              if (con.compareType === NumberComapreType.GreaterThan) {
                return matchParam.value >= con.targetValue;
              }
              if (con.compareType === NumberComapreType.Less) {
                return matchParam.value < con.targetValue;
              }
              if (con.compareType === NumberComapreType.LessThan) {
                return matchParam.value <= con.targetValue;
              }
            }
          }
          if (c.conditionType === ConditionType.String) {
            const con = c as StringCondition;
            const matchParam = this.params.find(
              (p: any) => p.name === con.sourceParam
            );
            if (matchParam) {
              if (con.compareType === StringComapreType.Equal) {
                return con.targetValue === matchParam.value;
              }
              if (con.compareType === StringComapreType.NotEqual) {
                return con.targetValue !== matchParam.value;
              }
              if (con.compareType === StringComapreType.Includes) {
                return matchParam.value.includes(con.targetValue);
              }
              if (con.compareType === StringComapreType.NotIncludes) {
                return !matchParam.value.includes(con.targetValue);
              }
            }
          }
          if (c.conditionType === ConditionType.Boolean) {
            const con = c as BooleanCondition;
            const matchParam = this.params.find(
              (p: any) => p.name === con.sourceParam
            );
            console.log('ff: ', con, matchParam);
            if (matchParam) {
              if (con.compareType === BooleanCompareType.Equal) {
                return con.targetValue === matchParam.value;
              }
            }
          }
          return false;
        }, true);
      });
    children = children.sort(
      (a, b) => b.data.enableConditions.length - a.data.enableConditions.length
    );
    console.log(children, this.params);
    const nextTransferNode = children[0] || null;
    this.currentNode = nextTransferNode;
    return nextTransferNode;
  }

  private transfer(id: string) {
    if (!this.currentStorylet) {
      return;
    }
    const node = this.currentStorylet.nodes[id];
    this.currentNode = node;
  }

  public chooseOption(optionId: string) {
    if (!this.currentNode || !this.currentStorylet) {
      return;
    }
    const links = this.currentStorylet.getNodeChildrenLinks(
      this.currentNode.id
    );
    const match = links.find((l) => l.data.optionId === optionId);
    console.log(links, match);
    if (!match) {
      return;
    }

    this.transfer(match.target.id);
  }
}

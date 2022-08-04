import { generateUUID } from '../utils/uuid';
import { Tree } from './base/tree';
import { Storylet } from './storylet';

export class StoryletGroup {
  public id: string = `group_${generateUUID()}`;
  public name: string = '';
  public parent: StoryletGroup | null = null;
  public children: StoryletGroup[] = [];

  public addChild(child: StoryletGroup) {
    child.parent = this;
    this.children.push(child);
  }

  public removeChild(id: string) {
    this.children = this.children.filter((item) => item.id !== id);
  }

  public getRootPartent(): StoryletGroup | null {
    if (!this.parent) {
      return null;
    }
    if (!this.parent.parent) {
      return this.parent;
    }
    return this.parent.getRootPartent();
  }

  public findChildRecursive(id: string): StoryletGroup | null {
    let match = this.children.find((item) => item.id === id) || null;
    if (match) {
      return match;
    }
    if (this.children.length <= 0) {
      return null;
    }
    this.children.forEach((item) => {
      const item2 = item.findChildRecursive(id);
      if (item2) {
        match = item2;
      }
    });
    return match;
  }

  public toJson(): any {
    return {
      id: this.id,
      name: this.name,
      parentId: this.parent?.id || null,
      children: this.children.map((item) => item.toJson()),
    };
  }

  public static fromJson(
    json: any,
    parent: StoryletGroup | null = null
  ): StoryletGroup {
    const intsance = new StoryletGroup();
    intsance.id = json.id;
    intsance.name = json.name;
    intsance.parent = parent;
    intsance.children = json.children.map((item: any) => {
      return StoryletGroup.fromJson(item, intsance);
    });
    return intsance;
  }

  public iterRecursive(fn: (group: StoryletGroup) => void) {
    fn(this);
    this.children.forEach((c) => {
      c.iterRecursive(fn);
    });
  }
}

export class Story {
  public storylets: {
    group: StoryletGroup;
    data: Storylet;
  }[] = [];
  public storyletGroups: StoryletGroup[] = [];

  public addStoryGroup(group: StoryletGroup) {
    this.storyletGroups.push(group);
  }

  public addStorylet(storylet: Storylet, group: StoryletGroup) {
    this.storylets.push({
      group,
      data: storylet,
    });
  }

  public toJson(): any {
    return {
      storyletGroups: this.storyletGroups.map((item) => item.toJson()),
      storylets: this.storylets.map((item) => {
        return {
          groupId: item.group.id,
          data: item.data.toJson(),
        };
      }),
    };
  }

  public static fromJson(json: any): Story {
    const instance = new Story();

    instance.storyletGroups = json.storyletGroups.map((item: any) => {
      return StoryletGroup.fromJson(item);
    });

    instance.storylets = json.storylets.map((item: any) => {
      return {
        group: instance.storyletGroups.find(
          (item2) => item2.id === item.groupId
        ),
        data: Tree.fromJson(item.data),
      };
    });
    return instance;
  }
}

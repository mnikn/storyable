import { generateUUID } from '../utils/uuid';
import { Storylet } from './storylet';

export class StoryletGroup {
  public id: string = `group_${generateUUID()}`;
  public name: string = '';
  public parent: StoryletGroup | null = null;
  public children: StoryletGroup[] = [];
}

export class Story {
  public storylets: {
    group: StoryletGroup;
    data: Storylet;
  }[] = [];
  public storyletGroups: StoryletGroup[] = [];
}

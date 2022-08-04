import EventEmitter from 'eventemitter3';
import { Story, StoryletGroup } from '../models/story';
import { Storylet } from '../models/storylet';

class StoryProvider {
  public story: Story = new Story();
  public currentStorylet: Storylet | null = null;

  public event: EventEmitter = new EventEmitter();

  constructor() {
    const uncategorizedGroup = new StoryletGroup();
    uncategorizedGroup.name = 'uncategorized';
    this.story.addStoryGroup(uncategorizedGroup);

    const uncategorizedGroup2 = new StoryletGroup();
    uncategorizedGroup2.name = 'uncategorized2';
    uncategorizedGroup.children.push(uncategorizedGroup2);

    const mockStorylet1 = new Storylet();
    mockStorylet1.name = 'storylet1';
    this.story.addStorylet(mockStorylet1, uncategorizedGroup);

    const mockStorylet2 = new Storylet();
    mockStorylet2.name = 'storylet2';
    const mockStorylet3 = new Storylet();
    mockStorylet3.name = 'storylet3';
    this.story.addStorylet(mockStorylet2, uncategorizedGroup2);
    this.story.addStorylet(mockStorylet3, uncategorizedGroup2);
  }

  get storyletGroups(): StoryletGroup[] {
    return this.story.storyletGroups;
  }

  get storylets(): { group: StoryletGroup; data: Storylet }[] {
    return this.story.storylets;
  }

  public createStoryletGroup(parent: StoryletGroup | null = null) {
    const group = new StoryletGroup();
    if (!parent) {
      group.name = `Group${this.story.storyletGroups.length + 1}`;
      this.story.addStoryGroup(group);
    } else {
      group.name = `Group${parent.children.length + 1}`;
      parent.children.push(group);
    }
    this.event.emit('change:storyletGroups', [...this.storyletGroups]);
  }
}

export default new StoryProvider();

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

    const mockStorylet1 = new Storylet();
    mockStorylet1.name = 'storylet1';
    this.story.addStorylet(mockStorylet1, uncategorizedGroup);
  }

  get storyletGroups(): StoryletGroup[] {
    return this.story.storyletGroups;
  }

  get storylets(): { group: StoryletGroup; data: Storylet }[] {
    return this.story.storylets;
  }

  public getStolryletsInGroup(groupId: string): Storylet[] {
    return this.storylets
      .filter((item) => item.group.id === groupId)
      .map((item) => item.data);
  }

  public createStoryletGroup(parent: StoryletGroup | null = null) {
    const group = new StoryletGroup();
    if (!parent) {
      group.name = `group${this.story.storyletGroups.length + 1}`;
      this.story.addStoryGroup(group);
    } else {
      group.name = `group${parent.children.length + 1}`;
      parent.children.push(group);
    }
    this.event.emit('change:storyletGroups', [...this.storyletGroups]);
  }

  public createStorylet(parent: StoryletGroup | null = null) {
    const group = parent || this.storyletGroups[0];
    const storylet = new Storylet();
    storylet.name = `storylet${this.getStolryletsInGroup(group.id).length + 1}`;
    this.story.storylets.push({
      group,
      data: storylet,
    });
    this.event.emit('change:storylets', [...this.storylets]);
  }

  public updateStorylet(data: Storylet) {
    const match = this.storylets.find((item) => item.data.id === data.id);
    if (match) {
      match.data = data;
      this.event.emit('change:storylets', [...this.storylets]);
    }
  }

  public updateStoryletGroup(data: StoryletGroup) {
    const matchIndex = this.storyletGroups.findIndex(
      (item: StoryletGroup) => item.id === data.id
    );
    if (matchIndex !== -1) {
      this.storyletGroups[matchIndex] = data;
      this.event.emit('change:storyletGroups', [...this.storyletGroups]);
    }
  }

  public removeStorylet(id: string) {
    this.story.storylets = this.storylets.filter((item) => item.data.id !== id);
    this.event.emit('change:storylets', [...this.storylets]);
  }

  public removeStoryletGroup(id: string) {
    this.story.storylets = this.storylets.filter(
      (item) => item.group.id !== id
    );
    this.story.storyletGroups = this.storyletGroups.filter(
      (item) => item.id !== id
    );
    this.event.emit('change:storylets', [...this.storylets]);
    this.event.emit('change:storyletGroups', [...this.storyletGroups]);
  }

  public changeCurrentStorylet(id: string) {
    this.currentStorylet =
      this.storylets.find((item) => item.data.id === id)?.data || null;
    this.event.emit(
      'change:currentStorylet',
      this.currentStorylet?.clone() || null
    );
  }
}

export default new StoryProvider();

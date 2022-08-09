import EventEmitter from 'eventemitter3';
import { generateUUID } from 'renderer/utils/uuid';
import { formatNodeLinkId, NodeLink } from '../models/base/tree';
import { Story, StoryletGroup } from '../models/story';
import { Storylet, StoryletBranchNode, StoryletNode } from '../models/storylet';

class StoryProvider {
  public story: Story = new Story();
  public currentStorylet: Storylet | null = null;

  public event: EventEmitter = new EventEmitter();

  public projectSettings: any = {
    i18n: ['en'],
  };

  public translations: { [key: string]: { [key: string]: string } } = {};

  public currentLang: string = 'en';

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

  public addStoryletNode(
    newNode: StoryletNode<any>,
    parent: StoryletNode<any>
  ) {
    if (!this.currentStorylet) {
      return;
    }
    this.currentStorylet.nodes[newNode.id] = newNode;
    const link = new NodeLink(parent, newNode);
    this.currentStorylet.links[formatNodeLinkId(parent.id, newNode.id)] = link;
    if (parent instanceof StoryletBranchNode) {
      link.data = {
        optionName: 'option_' + generateUUID(),
        optionId: '',
      };
    }
    this.event.emit('change:currentStorylet', this.currentStorylet.clone());
  }

  public updateStoryletNode(data: StoryletNode<any>) {
    if (!this.currentStorylet) {
      return;
    }
    this.currentStorylet.nodes[data.id] = data;
    this.event.emit('change:currentStorylet', this.currentStorylet.clone());
  }

  public updateStoryletNodeLink(data: NodeLink) {
    if (!this.currentStorylet) {
      return;
    }
    this.currentStorylet.links[
      formatNodeLinkId(data.source.id, data.target.id)
    ] = data;
    this.event.emit('change:currentStorylet', this.currentStorylet.clone());
  }

  public deleteStoryletNode(id: string) {
    if (!this.currentStorylet) {
      return;
    }
    const currentNode = this.currentStorylet.nodes[id];
    if (!currentNode) {
      return;
    }
    this.currentStorylet.getNodeChildren(id).forEach((child) => {
      this.deleteStoryletNode(child.id);
      if (this.currentStorylet) {
        delete this.currentStorylet.nodes[child.id];
      }
    });

    Object.keys(this.currentStorylet.links).forEach((item) => {
      if (item.includes(id) && this.currentStorylet) {
        delete this.currentStorylet.links[item];
      }
    });
    delete this.currentStorylet.nodes[id];
    this.event.emit('change:currentStorylet', this.currentStorylet.clone());
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

  public updateProjectSettings(val: any) {
    this.projectSettings = val;
    this.event.emit('change:projectSettings', { ...this.projectSettings });
    if (!val.i18n.includes(this.currentLang)) {
      this.changeLang('en');
    }
    const translations: any = {};
    Object.keys(this.translations).forEach((key) => {
      val.i18n.forEach((lang: any) => {
        if (!translations[key]) {
          translations[key] = {
            [lang]: this.translations[key][lang] || '',
          };
        }
        translations[key][lang] = this.translations[key][lang] || '';
      });
    });
    this.updateTranslations(translations);
  }

  public updateTranslations(val: any) {
    this.translations = val;
    this.event.emit('change:translations', { ...val });
  }

  public changeLang(lang: string) {
    this.currentLang = lang;
    this.event.emit('change:currentLang', lang);
  }

  public async save() {
    window.electron.ipcRenderer.call('saveFile', {
      data: JSON.stringify(this.story.toJson(), null, 2),
      extensions: ['st'],
    });
  }
}

export default new StoryProvider();

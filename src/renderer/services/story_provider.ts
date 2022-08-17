import EventEmitter from 'eventemitter3';
import {
  LAST_OPEN_STORYLET,
  PROJECT_PATH,
} from 'renderer/constatnts/storage_key';
import { concatPath, getBaseUrl } from 'renderer/utils/file';
import { generateUUID } from 'renderer/utils/uuid';
import { formatNodeLinkId, NodeLink } from '../models/base/tree';
import { Story, StoryletGroup } from '../models/story';
import {
  Storylet,
  StoryletActionNode,
  StoryletBranchNode,
  StoryletInitNode,
  StoryletNode,
  StoryletSentenceNode,
} from '../models/storylet';
import { parse as jsonParseCsv } from 'json2csv';
import csv from 'csvtojson';
import {
  DEFAULT_CONFIG,
  SchemaField,
  SchemaFieldObject,
  validateValue,
} from 'renderer/models/schema/schema';
import { buildSchema } from 'renderer/models/schema/factory';

const OBJ_JSON = {
  type: 'object',
  fields: {},
  config: DEFAULT_CONFIG.OBJECT_CONFIG_DEFAULT,
};

class StoryProvider {
  public story: Story = new Story();
  public currentStorylet: Storylet | null = null;

  public event: EventEmitter = new EventEmitter();

  public projectSettings: {
    i18n: string[];
    actors: {
      id: string;
      name: string;
      portraits: any[];
    }[];
    extraDataConfig: {
      root: any;
      sentence: any;
      branch: any;
      action: any;
    };
  } = {
    i18n: ['en'],
    actors: [],
    extraDataConfig: {
      root: OBJ_JSON,
      sentence: OBJ_JSON,
      branch: OBJ_JSON,
      action: OBJ_JSON,
    },
  };

  public translations: { [key: string]: { [key: string]: string } } = {};

  public currentLang: string = 'en';

  constructor() {
    if (localStorage.getItem(PROJECT_PATH)) {
      this.loadCacheStory();
    } else {
      const uncategorizedGroup = new StoryletGroup();
      uncategorizedGroup.name = 'uncategorized';
      this.story.addStoryGroup(uncategorizedGroup);

      const mockStorylet1 = new Storylet();
      mockStorylet1.name = 'storylet1';
      this.story.addStorylet(mockStorylet1, uncategorizedGroup);
    }
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

  public async loadCacheStory() {
    const path = localStorage.getItem(PROJECT_PATH);
    if (!path) {
      return;
    }

    try {
      const res = await window.electron.ipcRenderer.call('readFile', {
        path,
      });
      const resJson = JSON.parse(res.res);
      this.story = Story.fromJson(resJson.story);
      this.projectSettings = {
        ...this.projectSettings,
        ...resJson.projectSettings,
      };

      const translationPath = concatPath(getBaseUrl(path), 'translation.csv');
      const res2 = await window.electron.ipcRenderer.call('readFile', {
        path: translationPath,
      });

      const translations: any = {};
      if (res2.res) {
        const str = await csv({
          output: 'csv',
        }).fromString(res2.res);
        str.forEach((s, i) => {
          s.forEach((s2, j) => {
            if (j === 0) {
              translations[s2] = {};
            } else {
              translations[s[0]][this.projectSettings.i18n[j - 1]] = s2;
            }
          });
        });
        this.translations = translations;
      }

      const rootSchema = buildSchema(
        this.projectSettings.extraDataConfig.root || OBJ_JSON
      );
      const sentenceSchema = buildSchema(
        this.projectSettings.extraDataConfig.sentence
      );
      const branchSchema = buildSchema(
        this.projectSettings.extraDataConfig.branch
      );
      const actionSchema = buildSchema(
        this.projectSettings.extraDataConfig.action
      );
      this.story.storylets.forEach((item) => {
        Object.values(item.data.nodes).forEach((node) => {
          let schema: SchemaField = new SchemaFieldObject();
          let schemaConfig: any = OBJ_JSON;
          if (node instanceof StoryletSentenceNode) {
            schema = sentenceSchema;
            schemaConfig = this.projectSettings.extraDataConfig.sentence;
          }
          if (node instanceof StoryletBranchNode) {
            schema = branchSchema;
            schemaConfig = this.projectSettings.extraDataConfig.branch;
          }
          if (node instanceof StoryletActionNode) {
            schema = actionSchema;
            schemaConfig = this.projectSettings.extraDataConfig.action;
          }
          if (node instanceof StoryletInitNode) {
            schema = rootSchema;
            schemaConfig = this.projectSettings.extraDataConfig.root;
          }
          node.data.extraData = validateValue(
            node.data.extraData,
            node.data.extraData,
            schema,
            schemaConfig
          );
        });
      });

      console.log(this.story);
      this.event.emit('change:storyletGroups', [...this.storyletGroups]);
      this.event.emit('change:storylets', [...this.storylets]);
      this.event.emit('change:translations', { ...this.translations });
      this.event.emit('change:projectSettings', { ...this.projectSettings });

      const cacheStorylet = localStorage.getItem(LAST_OPEN_STORYLET);
      if (cacheStorylet) {
        this.changeCurrentStorylet(cacheStorylet);
      }
      this.changeLang(this.projectSettings.i18n[0]);
    } catch (err) {
      console.error(err);
    }
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

  public moveStoryletNode(sourceId: string, newParentId: string) {
    if (!this.currentStorylet) {
      return;
    }
    Object.values(this.currentStorylet.links).forEach((item) => {
      if (item.target.id === sourceId) {
        if (this.currentStorylet) {
          delete this.currentStorylet.links[
            formatNodeLinkId(item.source.id, item.target.id)
          ];
        }
      }
    });

    const child = this.currentStorylet.nodes[sourceId];
    const parnet = this.currentStorylet.nodes[newParentId];
    const newLinkItem = new NodeLink(parnet, child);
    if (parnet instanceof StoryletBranchNode) {
      newLinkItem.data = {
        optionName: 'option_' + generateUUID(),
        optionId: '',
      };
    }
    this.currentStorylet.links[formatNodeLinkId(newParentId, sourceId)] =
      newLinkItem;
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
    localStorage.setItem(LAST_OPEN_STORYLET, id);
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

  public updateTranslateKey(key: string, val: string) {
    const newTranslations = { ...this.translations };
    newTranslations[key] = {
      ...newTranslations[key],
      [this.currentLang]: val,
    };
    this.projectSettings.i18n.forEach((lang) => {
      if (lang !== this.currentLang) {
        newTranslations[key][lang] = newTranslations[key][lang] || '';
      }
    });
    this.updateTranslations(newTranslations);
  }

  public changeLang(lang: string) {
    this.currentLang = lang;
    this.event.emit('change:currentLang', lang);
  }

  public moveStorylet(storyletId: string, targetGroup: string) {
    if (!storyletId || !targetGroup || !this.story) {
      return;
    }

    const storyletWithGroup = this.story.storylets.find(
      (s) => s.data.id === storyletId
    );
    if (storyletWithGroup) {
      const group = this.story.getStoryletGroup(targetGroup);
      if (group) {
        storyletWithGroup.group = group;
      }
    }

    console.log('after: ', this.storylets);
    this.event.emit('change:storylets', [...this.storylets]);
  }

  public async save() {
    try {
      const res = await window.electron.ipcRenderer.call('saveFile', {
        data: JSON.stringify(
          {
            story: this.story.toJson(),
            projectSettings: this.projectSettings,
          },
          null,
          2
        ),
        extensions: ['st'],
        path: localStorage.getItem(PROJECT_PATH),
      });
      localStorage.setItem(PROJECT_PATH, res.res.filePath);

      const translationPath = concatPath(
        getBaseUrl(res.res.filePath),
        'translation.csv'
      );
      const options = { fields: ['keys', ...this.projectSettings.i18n] };

      const data: any[] = [];
      Object.keys(this.translations).forEach((key) => {
        data.push({
          keys: key,
          ...this.translations[key],
        });
      });
      const translationData = jsonParseCsv(data, options);
      await window.electron.ipcRenderer.call('saveFile', {
        data: translationData,
        extensions: ['st'],
        path: translationPath,
      });
    } catch (err) {
      console.error(err);
    }
  }
}

export default new StoryProvider();

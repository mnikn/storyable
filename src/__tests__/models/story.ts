import { Storylet, StoryletSentenceNode } from '../../renderer/models/storylet';
import { Story, StoryletGroup } from '../../renderer/models/story';

describe('model story', () => {
  it('should handle storylet group correct', () => {
    const stage1 = new StoryletGroup();
    stage1.name = 'Stage1';

    const child1 = new StoryletGroup();
    child1.name = 'Branch1';
    stage1.addChild(child1);
    expect(stage1.children[0]).toBe(child1);
    expect(child1.parent).toBe(stage1);

    const child11 = new StoryletGroup();
    const child12 = new StoryletGroup();
    child1.addChild(child11);
    child1.addChild(child12);
    expect(child11.getRootPartent()).toBe(stage1);
    expect(stage1.findChildRecursive(child12.id)?.id).toBe(child12.id);
  });

  it('should handle story correct', () => {
    const story = new Story();

    const stage1Group = new StoryletGroup();
    const talkToBoss = new StoryletGroup();
    const talkToCustomer = new StoryletGroup();
    const talkToDealer = new StoryletGroup();

    stage1Group.addChild(talkToBoss);
    stage1Group.addChild(talkToCustomer);
    stage1Group.addChild(talkToDealer);

    story.addStoryGroup(stage1Group);

    const storylet1 = new Storylet();
    const sentence1 = new StoryletSentenceNode();
    sentence1.data.content = 'I decide to kill the boss';
    const sentence2 = new StoryletSentenceNode();
    sentence2.data.content = 'Well, good luck';
    storylet1.upsertNode(sentence1);
    storylet1.upsertNode(sentence2);
    storylet1.upsertLink(sentence1.id, sentence2.id);

    story.addStorylet(storylet1, stage1Group);
    expect(story.storylets[0].data).toBe(storylet1);
  });

  it('should create story correct', () => {
    const json = {
      storyletGroups: [
        {
          id: 'group_09fec0ea87df420ab5e0d869d00c977a',
          name: 'boss',
          parentId: null,
          children: [
            {
              id: 'group_45fec0ea87df420ab5e0d869d00c9vfd',
              name: 'talk_to_boss',
              parentId: 'group_09fec0ea87df420ab5e0d869d00c977a',
              children: [],
            },
            {
              id: 'group_gfffec0ea87df420ab5e0d869d00c9vcvc',
              name: 'kill_boss',
              parentId: 'group_09fec0ea87df420ab5e0d869d00c977a',
              children: [],
            },
          ],
        },
      ],
      storylets: [
        {
          groupId: 'group_09fec0ea87df420ab5e0d869d00c977a',
          data: {
            nodes: {
              node_754968ecf4d24fe8ac5f2453b43e2c8c: {
                id: 'node_754968ecf4d24fe8ac5f2453b43e2c8c',
                data: [
                  {
                    type: 'sentence',
                    content: 'I decide to kill the boss',
                  },
                ],
              },
              node_8c7da970fd6d4259b6170a11b7948ae3: {
                id: 'node_8c7da970fd6d4259b6170a11b7948ae3',
                data: [
                  {
                    type: 'sentence',
                    content: 'Well, good luck',
                  },
                ],
              },
            },
            links: {
              'node_754968ecf4d24fe8ac5f2453b43e2c8c-node_8c7da970fd6d4259b6170a11b7948ae3':
                {
                  sourceId: 'node_754968ecf4d24fe8ac5f2453b43e2c8c',
                  targetId: 'node_8c7da970fd6d4259b6170a11b7948ae3',
                  data: {},
                },
            },
          },
        },
      ],
    };

    const story = Story.fromJson(json);
    expect(JSON.stringify(story.toJson())).toEqual(JSON.stringify(json));
  });
});

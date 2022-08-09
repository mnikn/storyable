import { StoryletSentenceNode } from '../../renderer/models/storylet';
import StoryProvider from '../../renderer/services/story_provider';

describe('service story provider', () => {
  it('should delete node correctly', () => {
    StoryProvider.changeCurrentStorylet(
      StoryProvider.story.storylets[0].data.id
    );

    const rootNode1 = Object.values(
      StoryProvider.story.storylets[0].data.nodes
    )[0];
    const s1 = new StoryletSentenceNode();
    const ss1 = new StoryletSentenceNode();
    const sss1 = new StoryletSentenceNode();
    StoryProvider.addStoryletNode(s1, rootNode1);
    StoryProvider.addStoryletNode(ss1, s1);
    StoryProvider.addStoryletNode(sss1, ss1);

    StoryProvider.deleteStoryletNode(s1.id);

    expect(
      Object.values(StoryProvider.currentStorylet?.nodes || []).length
    ).toBe(1);
    expect(
      Object.values(StoryProvider.currentStorylet?.links || []).length
    ).toBe(0);
  });
});

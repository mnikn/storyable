import { Storylet } from '../storylet';
import { StoryTracker } from './story_tracker';
import { StoryletProcessor } from './strolet_processor';

class StoryProcessor {
  public tracker = new StoryTracker();
  public storyletProcessor = new StoryletProcessor();
  public params: any = {};

  public init(initialStorylet: Storylet, params: any = {}) {
    this.params = params;
    this.tracker.reset();
    this.storyletProcessor.init(initialStorylet, params);
    this.tracker.recordStorylet(this.storyletProcessor.currentStorylet);
    this.tracker.recordNode(this.storyletProcessor.currentNode);
  }

  public next() {
    if (!this.storyletProcessor.currentStorylet) {
      return;
    }

    const newTransferNode = this.storyletProcessor.next();
    if (newTransferNode) {
      this.tracker.recordNode(newTransferNode);
    }
  }

  public chooseOption(optionId: string) {
    this.tracker.updateRecordNode(this.storyletProcessor.currentNode.id, {
      optionId,
    });
    this.storyletProcessor.chooseOption(optionId);
    if (this.storyletProcessor.currentNode) {
      this.tracker.recordNode(this.storyletProcessor.currentNode);
    }
  }
}

export default StoryProcessor;

import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';

import { Tasks } from './tasks';
import { Random } from 'meteor/random';
import '/api/tasks/tasks.publications';

function mockLoggedUserId(userId) {
  Meteor.userId = () => userId;
}

describe('Tasks', function() {
  describe('publications', () => {
    const userId = Random.id();
    const originalTask = {
      description: 'Groceries',
      createdAt: new Date(),
      userId,
    };

    beforeEach(async function() {
      mockLoggedUserId(userId);
      await Tasks.removeAsync({});
      await Tasks.insertAsync(originalTask);
    });

    it('should return tasks from the authenticated user', async () => {
      const publication = Meteor.server.publish_handlers.tasksByLoggedUser.apply();
      const tasks = await publication.fetchAsync();

      expect(tasks.length).to.be.equal(1);
      expect(tasks[0].description).to.be.equal(originalTask.description);
    });

    it('should not return any task to the user who does not have any', async () => {
      mockLoggedUserId(Random.id());
      const publication = Meteor.server.publish_handlers.tasksByLoggedUser.apply();
      const tasks = await publication.fetchAsync();

      expect(tasks.length).to.be.equal(0);
    });
  });
});

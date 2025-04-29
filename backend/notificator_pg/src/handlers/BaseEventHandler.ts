export class BaseEventHandler<TController> {
  private controller: TController;

  constructor(controller: TController) {
    this.controller = controller;
  }

  async handle(event: { topic: string; action: string; data: any }) {
    switch (event.action) {
      case 'CREATE':
        return (this.controller as any).create(event.data);
      case 'FIND_OR_CREATE':
        return (this.controller as any).findOrCreate(event.data);
      case 'UPDATE':
        return (this.controller as any).update({ id: event.data.id }, event.data);
      case 'DELETE':
        return (this.controller as any).delete(event.data.id);
      case 'GET':
        if (!event.data.id || typeof event.data.id !== 'number') {
          throw new Error(`Order ID is missing in request: ${JSON.stringify(event.data, null, 2)}`);
        }
        return (this.controller as any).getById(event.data.id);
      case 'FIND':
        if (!event.data.id || typeof event.data.id !== 'number') {
          throw new Error(`Order ID is missing in request: ${JSON.stringify(event.data, null, 2)}`);
        }
        return (this.controller as any).find({ id: event.data.id, ...event.data });
      default:
        throw new Error(`Invalid action: ${event.action} for topic ${event.topic}`);
    }
  }
}

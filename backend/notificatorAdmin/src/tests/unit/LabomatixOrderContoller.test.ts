import { LabomatixOrderController } from "../../database/controllers/LabomatixOrderController";
import { rabbitInitializationPromise } from "../../RabbitMQ"
import { LabomatixOrderCreationAttributes, LabomatixOrderStatusType } from "../../shared/interfaces/database/LabomatixOrderAttributes";
import Logger from "../../shared/utils/Logger";

describe('Labomatix order controller test with connection to db service', () => {
  const deleteItem = async () => {
    try{
      await LabomatixOrderController.find({messageId: creationAttributes.messageId})
        .then(order => LabomatixOrderController.delete(order.id))
    } catch (err) {
      Logger.warn('Error in before each, ignoring')
    }
  }

  beforeAll(async () => {
    await rabbitInitializationPromise;
    await deleteItem()
  })

  const creationAttributes = {
    messageId: 352212,
    mongoUpdateId: 'testUpdateId',
  } as LabomatixOrderCreationAttributes;

  

  // beforeEach(async() => )

  it('Should create an item', async () => {
    const item = await LabomatixOrderController.create(creationAttributes.messageId, creationAttributes.mongoUpdateId);
    expect(item.id).toBeDefined()
    expect(item.messageId).toBe(creationAttributes.messageId)
    expect(item.mongoUpdateId).toBe(creationAttributes.mongoUpdateId)
    expect(item.status).toBe('CREATED' as LabomatixOrderStatusType)
    expect(item.shopId).toBeNull()
    await deleteItem()
  })

  it('Should create and update an item', async () => {
    const item = await LabomatixOrderController.create(creationAttributes.messageId, creationAttributes.mongoUpdateId);
    item.status = 'FINISHED'
    const updatedItem = await LabomatixOrderController.update(item);

    expect(item.id).toBe(updatedItem.id)
    expect(item.status).toBe('FINISHED')
    await deleteItem()
  })
  afterAll(async() => await deleteItem())
}) 
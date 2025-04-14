import { where } from "sequelize";
import { databaseInitializationPromise } from "../../database"
import LabomatixOrderController from "../../database/controllers/LabomatixOrderController";
import { LabomatixOrder } from "../../database/models/LabomatixOrder";
import { LabomatixOrderCreationAttributes } from "../../shared/interfaces/database/LabomatixOrderAttributes";

describe('Labomatix order controller test', () => {

  let testData = {
    messageId: 12345677,
    packetNumber: 12345,
    status: 'CREATED',
    mongoUpdateId: 'mongoTestId',
  } as LabomatixOrderCreationAttributes;

  beforeEach(async () => {
    await databaseInitializationPromise;
    await LabomatixOrder.destroy({ where: { messageId: testData.messageId } });
  });


  it('Should create an order', async () => {
    const order = await LabomatixOrderController.create(testData)
    console.log(order.toJSON())
    console.log(order)
    expect(order.id).toBeDefined();
    expect(order.messageId).toBe(testData.messageId);
    expect(order.packetNumber).toBe(testData.packetNumber);
    expect(order.status).toBe(testData.status);
    expect(order.mongoUpdateId).toBe(testData.mongoUpdateId);
  });

  it('Should find or Create an order', async () => {
    let [order, isNew] = await LabomatixOrderController.findOrCreate(testData)
    console.log(order.toJSON())
    expect(order.id).toBeDefined();
    expect(order.messageId).toBe(testData.messageId);
    expect(order.packetNumber).toBe(testData.packetNumber);
    expect(order.status).toBe(testData.status);
    expect(order.mongoUpdateId).toBe(testData.mongoUpdateId);
    expect(isNew).toBe(true);

    ([order, isNew] = await LabomatixOrderController.findOrCreate(testData));
    expect(isNew).toBe(false)
  });

  it('should delete a user', async () => {
    const order = await LabomatixOrderController.create(testData);
    let deletedOrder = await LabomatixOrderController.delete(order.id);
    expect(deletedOrder?.id).toBeDefined();
    expect(deletedOrder?.messageId).toBe(testData.messageId);
    expect(deletedOrder?.packetNumber).toBe(testData.packetNumber);
    expect(deletedOrder?.status).toBe(testData.status);
    expect(deletedOrder?.mongoUpdateId).toBe(testData.mongoUpdateId);

    deletedOrder = await LabomatixOrderController.delete(order.id)

    expect(deletedOrder).toBeNull();
  });

  it('should delete a user', async () => {
    const order = await LabomatixOrderController.create(testData);
    let deletedOrder = await LabomatixOrderController.delete(order.id);
    expect(deletedOrder?.id).toBeDefined();
    expect(deletedOrder?.messageId).toBe(testData.messageId);
    expect(deletedOrder?.packetNumber).toBe(testData.packetNumber);
    expect(deletedOrder?.status).toBe(testData.status);
    expect(deletedOrder?.mongoUpdateId).toBe(testData.mongoUpdateId);

    deletedOrder = await LabomatixOrderController.delete(order.id)

    expect(deletedOrder).toBeNull();
  });

  it('Should find order by id', async () => {
    const order = await LabomatixOrderController.create(testData);
    let foundOrder = await LabomatixOrderController.getById(order.id);

    expect(order.id).toBeDefined();
    expect(order.messageId).toBe(testData.messageId);
    expect(order.packetNumber).toBe(testData.packetNumber);
    expect(order.status).toBe(testData.status);
    expect(order.mongoUpdateId).toBe(testData.mongoUpdateId);

    await LabomatixOrderController.delete(order.id)

    foundOrder = await LabomatixOrderController.getById(order.id);
    expect (foundOrder).toBeNull()
  })

  it('Should update order by id', async () => {
    const order = await LabomatixOrderController.create(testData);

    const updateOrder = () => {
      return LabomatixOrderController.update(
        {id: order.id },// invalid value id: 295, why?
        {
          mongoUpdateId: 'testMongoUpdateID'
        }
      )
    }

    let updatedOrder = await updateOrder()

    expect(order.id).toBe(updatedOrder?.id);
    expect(order.mongoUpdateId).not.toBe(updatedOrder?.mongoUpdateId);

    await LabomatixOrderController.delete(order.id)

    updatedOrder = await updateOrder()
    expect(updatedOrder).toBeNull()
  })

  it('Should find order by attributes', async () => {
    const order = await LabomatixOrderController.create(testData);
    let foundOrder = await LabomatixOrderController.find({
      messageId: order.messageId,
      packetNumber: order.packetNumber
    });

    expect(order.id).toBeDefined();
    expect(order.messageId).toBe(testData.messageId);
    expect(order.packetNumber).toBe(testData.packetNumber);
    expect(order.status).toBe(testData.status);
    expect(order.mongoUpdateId).toBe(testData.mongoUpdateId);

    await LabomatixOrderController.delete(order.id)

    foundOrder = await LabomatixOrderController.find({
      messageId: order.messageId,
      packetNumber: order.packetNumber
    });
    expect (foundOrder).toBeNull()
  })

  it('Should find all order by attributes', async () => {
    let offset = 0
    const createOrder = () => {
      const messageId = testData.messageId + offset++;
      return LabomatixOrderController.create({
        ...testData,
        messageId
      })
    }

    const orders = await Promise.all([
      createOrder(),
      createOrder(),
      createOrder(),
      createOrder(),
      createOrder(),
    ]);
  

    const foundOrders = await LabomatixOrderController.findAll({
      mongoUpdateId: testData.mongoUpdateId
    })
  
    expect(orders?.length).toBe(foundOrders?.length);
    
    for (const order of orders) {
      await order.destroy()
    }
  })
})


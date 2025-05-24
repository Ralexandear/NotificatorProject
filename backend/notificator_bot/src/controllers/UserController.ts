

class UserControllerClass {
  async findOrCreate(telegramId: string, fullName: string, username: string) {
    return UserModel.findOrCreate({where: {telegramId}, defaults: {telegramId, fullName, username}}).then(([e]) =>User.init(e))
  }
  
  async create( telegramId: number | string, fullName: string, username: string){
    return UserModel.create({ telegramId: telegramId.toString(), fullName, username}).then(User.init)
  }

  async find( telegramId: number | string, username?: string ){
    const user = await UserModel.findOne( { where: { telegramId: telegramId.toString() }} ).then(e => e && User.init(e))
    
    if (! user) {
      throw AuthError.userNotFound(telegramId, username)
    }

    return user
  }

  async getById( id: number ){
    const user = await UserModel.findByPk( id ).then(e => e && User.init(e))
    if (! user) throw new FatalError(`User with id ${id} not found!`)
    return user      
  }

  async getByIds( ...ids: number[]){
    const users = await UserModel.findAll({
      where: {
        id: {
          [Op.in] : ids
        }
      }
    })

    if (ids.length === users.length) return users.map(User.init)
    throw new FatalError('The number of users does not match the requested user id array')
  }
}


export const UserController = new UserControllerClass()
export default UserController
const IDataBase = require("./../IDataBase.js")
const Sequelize = require('sequelize')

class Postgres extends IDataBase {
    constructor(connection , schema) {
        super()
        this._connection = connection
        this._schema = schema
    }
    async create(item){
        const datavalues = await this._schema.create(item)
        return datavalues.id
    }
    async read(query, skip =0 , limit=10){
        return await this._schema.findAll({where: query , raw: true})
    }
    async update(id,item){
        return await this._schema.update( item,{ where:{id: id} })
    }
    async delete(id){
        return await this._schema.destroy({ where: {id} })
    }
    async isConnected(){
        try{
            await this._connection.authenticade()
            return true
        }
        catch(error){
            console.log("Ocorreu um erro : ", error)
            return false
        }
    }
    static async connect(){
        const connection = await new Sequelize(process.env.POSTGRES_URL,{
            quoteIdentifers: false, //não alterar as configurações padroes do banco
            logging: false,
            ssl: process.env.SSL_DB
        }, )
        try{
            await connection.authenticate()
            return connection
        }
        catch(error){
            console.log("Ocorreu um erro : ", error)
            throw error
        }
    }
}
module.exports = Postgres
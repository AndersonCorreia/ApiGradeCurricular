const IDataBase = require("./../IDataBase.js")
const Sequelize = require('sequelize')
String.prototype.to
class Postgres extends IDataBase {
    constructor(connection, schema) {
        super()
        this._connection = connection
        this._schema = schema
    }
    async create(item) {
        const datavalues = await this._schema.create(item)
        return datavalues.id
    }
    async read(query, skip = 0, limit = 10) {
        var list = await this._schema.findAll({ where: {}, raw: true })
        if (query.name) {
            list = list.filter((item) => {//mapear os itens que tem parte do nome procurado, não é case sensitive
                if (item.name.toLocaleLowerCase().includes(query.name.toLocaleLowerCase())) {
                    return true
                }
                return false
            })
        }
        var array = []
        limit = skip + limit
        for (let i = skip; i < limit; i++) {
            if (!list[i]) {
                break
            }
            array[i - skip] = list[i]
        }
        return array
    }
    async update(id, item) {
        return await this._schema.update(item, { where: { id: id } })
    }
    async delete(id) {
        return await this._schema.destroy({ where: { id } })
    }
    async isConnected() {
        try {
            await this._connection.authenticade()
            return true
        }
        catch (error) {
            console.log("Ocorreu um erro : ", error)
            return false
        }
    }
    static async connect() {
        const connection = await new Sequelize(process.env.POSTGRES_URL, {
            quoteIdentifers: false, //não alterar as configurações padroes do banco
            logging: false,
            ssl: process.env.SSL_DB
        })
        try {
            await connection.authenticate()
            return connection
        }
        catch (error) {
            console.log("Ocorreu um erro : ", error)
            throw error
        }
    }
}
module.exports = Postgres
const IDataBase = require("./../IDataBase.js")
const Sequelize = require('sequelize')

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
    async read(query, skip = 0, limit = 10, pagination = true) {
        var find = {}
        if (query.Type) {
            find.Type = query.Type
        }
        var list = await this._schema.findAll({ where: find, raw: true })
        if (query.Name) {
            list = list.filter((item) => {//filtrar os itens que tem parte do nome procurado, não é case sensitive
                return item.Name.toLowerCase().includes(query.Name.toLowerCase())
            })
        }
        if (pagination) {
            var array = []
            limit = skip + limit
            for (let i = skip; i < limit; i++) {//realizando a paginação dos resultados
                if (!list[i]) {
                    break
                }
                array[i - skip] = list[i]
            }
        }
        else {
            return list
        }
        return array
    }
    async update(query, item) {
        return await this._schema.update(item, { where: query })
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
            quoteIdentifers: false, //não alterar as configurações padrões do banco
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
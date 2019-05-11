const baseRoute = require("./base/baseRoute")
const joi = require("joi")
const failAction = (request, headers, error) => {
    throw error
}
var result = {}
class HeroRoute extends baseRoute {
    constructor(db) {
        super()
        this._Db = db
    }

    list() {
        return {
            path: "/heroes",
            method: "GET",
            config: {
                tags: ["api"],
                description: " Lista os herois",
                //notes: " suporte a paginação dos resultados e filtro por nome",
                validate: {
                    failAction: failAction,
                    query: {
                        //skip: joi.number().integer().default(0).description("resultados que são ignorados/pulados inicialmente"),
                        //limit: joi.number().integer().default(10).description("limite de itens por resultado"),
                        nome: joi.string().max(100).description("string utilizada na busca pelo heroi(atráves do nome")
                    }
                }
            },
            handler: async (request, head) => {//metodo que é executado ao acessar o endereço do path
                try {
                    const {
                        skip,
                        limit,
                        nome
                    } = request.query

                    var query = {}
                    if (nome) {//se o nome foi enviado a busca é feita com ele, se não vai a query vazia
                        query = {
                            //name: { $regex: ".*" + nome + "*." }//comando do mongoDb basicamente um contains 
                            name: nome
                        }
                    }
                    return await this._Db.read(query, skip, limit)
                }
                catch (error) {
                    console.log("error: ", error)
                    return {
                        message: "error interno no servidor, verifique a URL",
                        error: error
                    }
                }
            }
        }
    }

    create() {
        return {
            path: "/heroes",
            method: "POST",
            config: {
                tags: ["api"],
                description: " cadastra herois",
                notes: " necessario nome e poder do heroi",
                validate: {
                    failAction: failAction,
                    payload: {
                        nome: joi.string().required().min(3).max(100),
                        poder: joi.string().required().min(3).max(100)
                    }
                }
            },
            handler: async (request) => {//metodo que é executado ao acessar o endereço do path
                var id
                try {
                    const {
                        poder,
                        nome
                    } = request.payload

                    id = await this._Db.create({ name:nome, power:poder })
                    return {
                        message: "heroi cadastrado com sucesso",
                        _id: id
                    }
                }
                catch (error) {
                    console.log("error: ", error)
                    return {
                        message: "error interno no servidor",
                        error: error,
                        status_code:200
                    }
                }
            }
        }
    }

    update() {
        return {
            path: "/heroes/{id}",
            method: "PATCH",
            config: {
                tags: ["api"],
                description: " atualiza um heroi",
                notes: " pode atualizar qualquer campo",
                validate: {
                    params: {
                        id: joi.string().required()
                    },
                    payload: {
                        nome: joi.string().min(3).max(100),
                        poder: joi.string().min(3).max(100)
                    }
                }
            },
            handler: async (request) => {//metodo que é executado ao acessar o endereço do path
                try {
                    const {
                        poder,
                        nome
                    } = request.payload
                    const update = {}
                    if (nome) {
                        update.name = nome
                    }
                    if (poder) {
                        update.power = poder
                    }

                    result = await this._Db.update(request.params.id, update)
                    if(result==0){
                        throw new Error("Heroi não encontrado")
                    }
                    return "heroi atualizado com sucesso"
                }
                catch (error) {
                    console.log("error: ", error)
                    return {
                        message: "error interno no servidor",
                        error: error,
                        status_code:200
                    }
                }
            }
        }
    }

    fullUpdate() {
        return {
            path: "/heroes/{id}",
            method: "PUT",
            config: {
                tags: ["api"],
                description: " atualiza todos os dados de um heroi",
                validate: {
                    params: {
                        id: joi.string().required()
                    },
                    payload: {
                        nome: joi.string().required().min(3).max(100),
                        poder: joi.string().required().min(3).max(100)
                    }
                }
            },
            handler: async (request) => {//metodo que é executado ao acessar o endereço do path
                try {
                    const {
                        poder,
                        nome
                    } = request.payload
                    result = await this._Db.update(request.params.id, { name:nome, power:poder })
                    if(result==0){
                        throw new Error("Heroi não encontrado")
                    }
                    return "heroi atualizado com sucesso"
                }
                catch (error) {
                    console.log("error: ", error)
                    return {
                        message: "error interno no servidor",
                        error: error,
                        status_code:200
                    }
                }
            }
        }
    }

    delete() {
        return {
            path: "/heroes/{id}",
            method: "DELETE",
            config: {
                tags: ["api"],
                description: " remover um heroi",
                notes: " o id tem que ser valido",
                validate: {
                    params: {
                        id: joi.string().required()
                    }
                }
            },
            handler: async (request) => {//metodo que é executado ao acessar o endereço do path
                try {
                    result = await this._Db.delete(request.params.id)
                    if(result==0){
                        throw new Error("Heroi não encontrado")
                    }
                    return "heroi deletado com sucesso com sucesso"
                }
                catch (error) {
                    console.log("error: ", error)
                    return {
                        message: "error interno no servidor",
                        error: error.message,
                        status_code:200
                    }
                }
            }
        }
    }
}
module.exports = HeroRoute
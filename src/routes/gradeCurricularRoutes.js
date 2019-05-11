const baseRoute = require("./base/baseRoute")
const joi = require("joi")
const failAction = (request, headers, error) => {
    throw error
}

var result

class gradeCurricularRoutes extends baseRoute {
    constructor(db) {
        super()
        this._Db = db
    }

    list() {
        return {
            path: "/disciplinas/{Type}",
            method: "GET",
            config: {
                tags: ["api"],
                description: " Lista todas as diciplinas",
                notes: "suporte a paginação dos resultados e filtro por nome," +
                    " alêm de poder limitar o resultado a disciplinas do tipo especificado",
                validate: {
                    failAction,
                    params: {
                        Type: joi.number()
                    },
                    query: {
                        skip: joi.number().integer().default(0).description("resultados que são ignorados/pulados inicialmente"),
                        limit: joi.number().integer().default(10).description("limite de itens por resultado"),
                        name: joi.string().max(100).description("nome da disciplina")
                    }
                }
            },
            handler: async (request) => {
                try {
                    const { skip, limit, name } = request.query
                    const type = request.params.Type
                    const query = {}
                    if (name) {
                        query.name = name
                    }
                    var list = this._Db.read(query, skip, limit)
                    if (type) {
                        list = list.filter((item) => {
                            if (item.Type == type)
                                return true
                            return false
                        })
                    }
                    return list
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
            path: "/disciplinas",
            method: "CREATE",
            config: {
                tags: ["api"],
                description: " cadastra uma disciplina",
                validate: {
                    failAction,
                    payload: {
                        Cod: joi.string().required().min(6).max(7).description("codigo da disciplina"),
                        Name: joi.string().required().max(100).description("nome da disciplina"),
                        Ch: joi.number().integer().required().description("Carga horaria"),
                        Type: joi.number().integer().required().max(9).description("tipo da disciplina"),
                        Pre: joi.array().description("pre-requisitos da diciplina"),
                        Pos: joi.array().description("posrequisitos da diciplina"),
                        Co: joi.array().description("co-requisitos da diciplina"),
                        Ementa: joi.string().description("ementa da disciplina")
                    }
                }
            },
            handler: async (request) => {
                try {
                    const item = { Cod, Name, Ch, Type, Pre, Pos, Co, Ementa } = request.payload
                    var id = this._Db.create(item)
                    return {
                        message: "heroi cadastrado com sucesso",
                        _id: id
                    }
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
}
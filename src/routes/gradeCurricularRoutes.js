const baseRoute = require("./base/baseRoute")
const joi = require("joi")
const failAction = (request, headers, error) =>{
    throw error
}

var result

class gradeCurricularRoutes extends baseRoute {
    constructor(db){
        super()
        this._Db = db
    }

    list() {
        return {
            path: "/disciplinas",
            method: "GET",
            config: {
                tags: ["api"],
                description: " Lista todas as diciplinas",
                notes: "suporte a paginação dos resultados"
            }
        }
    }
}